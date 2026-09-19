import Foundation
import Testing
@testable import YallaCore

@Suite("Review queue")
struct ReviewQueueTests {
    private let now = Date(timeIntervalSince1970: 200_000)

    private func expression(_ id: String) -> YallaCore.Expression {
        .init(id: id, canonicalArabizi: id, localizations: ["ro": .init(naturalMeaning: "sens " + id)])
    }

    private func exercise(_ id: String, _ ids: [String], type: ExerciseDefinitionType = .freeProduction) -> ExerciseDefinition {
        .init(id: id, type: type, unitID: "unit", expressionIDs: ids,
              prompt: ["ro": "Scrie"], answer: ids.first ?? "", wrongAnswers: [])
    }

    private func package(_ ids: [String], exercises: [ExerciseDefinition] = []) -> ContentPackage {
        .init(manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
              expressions: ids.map(expression), units: [], exercises: exercises)
    }

    @Test("Queue resolves meanings, uses legacy due dates, and orders equal dates by stable ID")
    func resolvesAndOrders() throws {
        let progress = LearnerProgressSnapshot(reviewByExpressionID: [
            "b": .init(dueAt: now),
            "a": .init(dueAt: now),
            "legacy": .init(seen: 1, lastAttemptAt: now.addingTimeInterval(-90_000)),
            "later": .init(dueAt: now.addingTimeInterval(60)),
            "unscheduled": .init(),
            "removed": .init(dueAt: now)
        ])
        let queue = try ReviewQueueBuilder().items(
            from: package(["b", "later", "legacy", "a", "unscheduled"]),
            progress: progress, locale: "ro", at: now)
        #expect(queue.map(\.id) == ["legacy", "a", "b", "later"])
        #expect(queue.map(\.isDue) == [true, true, true, false])
        #expect(queue.first?.dueAt == now.addingTimeInterval(-3_600))
        #expect(queue.first?.expression.meaning == "sens legacy")
        #expect(queue.first?.expression.arabizi == "legacy")
    }

    @Test("Review practice targets the expression actually recorded by the player")
    func selectsPrimaryDueTargetsOnly() throws {
        let exercises = [
            exercise("incidental", ["future", "due"]),
            exercise("unsupported", ["due"], type: .discovery),
            exercise("audio", ["due"], type: .listeningWrite),
            exercise("valid", ["due"]),
            exercise("future-only", ["future"])
        ]
        let content = package(["due", "future"], exercises: exercises)
        let progress = LearnerProgressSnapshot(reviewByExpressionID: [
            "due": .init(dueAt: now), "future": .init(dueAt: now.addingTimeInterval(1))
        ])
        let selected = ReviewQueueBuilder().practice(from: content, progress: progress, at: now)
        #expect(selected.map(\.id) == ["valid"])
        let queue = try ReviewQueueBuilder().items(from: content, progress: progress, locale: "ro", at: now)
        #expect(queue.first?.canPractice == true)
        #expect(ReviewQueueBuilder().practice(from: content, progress: progress, at: now, count: 0).isEmpty)
        #expect(ReviewQueueBuilder().practice(from: content, progress: .init(), at: now).isEmpty)
    }

    @Test("A due expression without a playable exercise stays visible without fabricated practice")
    func retainsUnpracticableDueItems() throws {
        let content = package(["due"])
        let progress = LearnerProgressSnapshot(reviewByExpressionID: ["due": .init(dueAt: now)])
        let queue = try ReviewQueueBuilder().items(from: content, progress: progress, locale: "ro", at: now)
        #expect(queue.count == 1)
        #expect(queue.first?.isDue == true)
        #expect(queue.first?.canPractice == false)
        #expect(ReviewQueueBuilder().practice(from: content, progress: progress, at: now).isEmpty)
    }

    @Test("Successful persisted review moves from due to upcoming after repository reload")
    func completedReviewUpdatesQueue() async throws {
        let content = package(["due"], exercises: [exercise("review", ["due"])])
        let store = InMemoryLearnerProgressStore(snapshot: .init(reviewByExpressionID: ["due": .init(dueAt: now)]))
        let repository = LearnerProgressRepository(store: store)
        let before = try await repository.load()
        let selected = ReviewQueueBuilder().practice(from: content, progress: before, at: now)
        var player = try ExerciseSessionPlayer(exercises: selected, expressions: content.expressions)
        let submitted = player.submit("due", responseTime: 1)
        let resolution = try #require(submitted)
        let attempt = try #require(LearningAttemptFactory().make(id: "review-attempt", resolution: resolution, occurredAt: now))
        try await repository.record(attempt)
        let reloaded = try await LearnerProgressRepository(store: store).load()
        let queue = try ReviewQueueBuilder().items(from: content, progress: reloaded, locale: "ro", at: now)
        #expect(queue.first?.isDue == false)
        #expect(queue.first?.dueAt == now.addingTimeInterval(86_400))
        #expect(reloaded.attempts.count == 1)
        #expect(ReviewQueueBuilder().practice(from: content, progress: reloaded, at: now).isEmpty)
    }

    @Test("Missing requested localization is reported rather than silently dropping a review")
    func missingLocalizationThrows() {
        #expect(throws: LocalizationError.missingLocale("en")) {
            try ReviewQueueBuilder().items(from: package(["due"]),
                progress: .init(reviewByExpressionID: ["due": .init(dueAt: now)]), locale: "en", at: now)
        }
    }
}
