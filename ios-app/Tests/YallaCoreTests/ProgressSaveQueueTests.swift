import Foundation
import Testing
@testable import YallaCore

@Suite("Recoverable progress writes")
@MainActor
struct ProgressSaveQueueTests {
    private func attempt(_ id: String) -> LearningAttempt {
        .init(id: id, expressionID: "word", skills: [.production], submittedAnswer: "word",
              firstTryCorrect: true, completedCorrectly: true, usedHint: false, retryCount: 0,
              responseTimeMilliseconds: 1000, occurredAt: Date(timeIntervalSince1970: 100_000))
    }

    @Test("Failed writes remain queued and retry updates progress only once")
    func retryFailure() async throws {
        let store = RecoverableTestStore()
        let repository = LearnerProgressRepository(store: store)
        let queue = ProgressSaveQueue()
        queue.enqueue(.attempt(attempt("one")))
        await store.failNextSave(afterCommit: false)
        do { try await queue.flush(using: repository); Issue.record("Expected storage error") }
        catch is RecoverableStoreError {}
        #expect(queue.pendingCount == 1)
        #expect(queue.latestSnapshot == nil)
        try await queue.flush(using: repository)
        try await queue.flush(using: repository)
        #expect(queue.pendingCount == 0)
        #expect(queue.latestSnapshot?.attempts.map(\.id) == ["one"])
        #expect(queue.latestSnapshot?.reviewByExpressionID["word"]?.seen == 1)
    }

    @Test("Ambiguous write failure retries the same ID without duplicate learning credit")
    func committedThenFailed() async throws {
        let store = RecoverableTestStore()
        let repository = LearnerProgressRepository(store: store)
        let queue = ProgressSaveQueue()
        queue.enqueue(.attempt(attempt("one")))
        await store.failNextSave(afterCommit: true)
        do { try await queue.flush(using: repository); Issue.record("Expected storage error") }
        catch is RecoverableStoreError {}
        try await queue.flush(using: repository)
        #expect(queue.latestSnapshot?.attempts.count == 1)
        #expect(queue.latestSnapshot?.reviewByExpressionID["word"]?.seen == 1)
    }

    @Test("Queued bookmark intent survives repeated taps and failure in order")
    func orderedIntent() async throws {
        let store = RecoverableTestStore()
        let repository = LearnerProgressRepository(store: store)
        let queue = ProgressSaveQueue()
        queue.enqueue(.savedExpression("word", true))
        #expect(queue.isExpressionSaved("word", in: .init()))
        await store.failNextSave(afterCommit: true)
        do { try await queue.flush(using: repository); Issue.record("Expected storage error") }
        catch is RecoverableStoreError {}
        queue.enqueue(.savedExpression("word", false))
        queue.enqueue(.journeyUnit("unit"))
        #expect(!queue.isExpressionSaved("word", in: .init()))
        try await queue.flush(using: repository)
        #expect(queue.latestSnapshot?.savedExpressionIDs.isEmpty == true)
        #expect(queue.latestSnapshot?.currentJourneyUnitID == "unit")
        #expect(queue.pendingCount == 0)
    }

    @Test("Overlapping UI requests drain through one writer without lost attempts")
    func overlappingWrites() async throws {
        let repository = LearnerProgressRepository(store: RecoverableTestStore())
        let queue = ProgressSaveQueue()
        var tasks: [Task<Void, Error>] = []
        for index in 0..<20 {
            queue.enqueue(.attempt(attempt(String(index))))
            tasks.append(Task { try await queue.flush(using: repository) })
        }
        for task in tasks { try await task.value }
        #expect(queue.pendingCount == 0)
        #expect(queue.latestSnapshot?.attempts.count == 20)
        #expect(queue.latestSnapshot?.reviewByExpressionID["word"]?.seen == 20)
    }
    @Test("Failed write survives queue recreation and applies once after storage recovers")
    func durableRetryAcrossQueueRecreation() async throws {
        let store = RecoverableTestStore()
        let repository = LearnerProgressRepository(store: store)
        let outbox = InMemoryProgressSaveOutbox()
        let firstQueue = ProgressSaveQueue(outbox: outbox)

        firstQueue.enqueue(.attempt(attempt("durable")))
        await store.failNextSave(afterCommit: false)
        do {
            try await firstQueue.flush(using: repository)
            Issue.record("Expected storage error")
        } catch is RecoverableStoreError {}

        #expect(firstQueue.pendingCount == 1)
        let journaled = try await outbox.load()
        #expect(journaled.count == 1)

        let restartedQueue = ProgressSaveQueue(outbox: outbox)
        try await restartedQueue.flush(using: repository)

        let persisted = try await repository.load()
        #expect(restartedQueue.pendingCount == 0)
        #expect(persisted.attempts.map(\.id) == ["durable"])
        #expect(persisted.reviewByExpressionID["word"]?.seen == 1)
        let cleared = try await outbox.load()
        #expect(cleared.isEmpty)
    }

    @Test("Committed write can replay after queue recreation without duplicate credit")
    func durableRetryAfterAmbiguousCommit() async throws {
        let store = RecoverableTestStore()
        let repository = LearnerProgressRepository(store: store)
        let outbox = InMemoryProgressSaveOutbox()
        let firstQueue = ProgressSaveQueue(outbox: outbox)

        firstQueue.enqueue(.attempt(attempt("ambiguous")))
        await store.failNextSave(afterCommit: true)
        do {
            try await firstQueue.flush(using: repository)
            Issue.record("Expected storage error")
        } catch is RecoverableStoreError {}

        let restartedQueue = ProgressSaveQueue(outbox: outbox)
        try await restartedQueue.flush(using: repository)

        let persisted = try await repository.load()
        #expect(persisted.attempts.map(\.id) == ["ambiguous"])
        #expect(persisted.reviewByExpressionID["word"]?.seen == 1)
    }

    @Test("JSON outbox round-trips durable operations and omits reload")
    func jsonOutboxRoundTrip() async throws {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("yalla-progress-outbox-\(UUID().uuidString)", isDirectory: true)
        let fileURL = directory.appendingPathComponent("pending.json")
        defer { try? FileManager.default.removeItem(at: directory) }

        let outbox = JSONFileProgressSaveOutbox(fileURL: fileURL)
        let durableAttempt = attempt("file")
        try await outbox.replace(with: [
            .reload,
            .attempt(durableAttempt),
            .savedExpression("word", true)
        ])

        let recovered = try await outbox.load()
        #expect(recovered == [
            .attempt(durableAttempt),
            .savedExpression("word", true)
        ])

        try await outbox.replace(with: [])
        #expect(!FileManager.default.fileExists(atPath: fileURL.path))
    }

}

private enum RecoverableStoreError: Error { case unavailable }
private actor RecoverableTestStore: LearnerProgressStore {
    private var snapshot = LearnerProgressSnapshot()
    private var failure: Bool?
    func failNextSave(afterCommit: Bool) { failure = afterCommit }
    func load() async throws -> LearnerProgressSnapshot { snapshot }
    func save(_ next: LearnerProgressSnapshot) async throws {
        await Task.yield()
        if let afterCommit = failure {
            failure = nil
            if afterCommit { snapshot = next }
            throw RecoverableStoreError.unavailable
        }
        snapshot = next
    }
}
