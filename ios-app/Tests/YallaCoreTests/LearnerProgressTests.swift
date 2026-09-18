import Foundation
import Testing
@testable import YallaCore

@Suite("Persistent learner progress")
struct LearnerProgressTests {
    private let now = Date(timeIntervalSince1970: 1_700_000_000)

    private func attempt(
        id: String,
        firstTryCorrect: Bool,
        usedHint: Bool = false,
        offset: TimeInterval = 0
    ) -> LearningAttempt {
        LearningAttempt(
            id: id,
            expressionID: "expr.want",
            skills: [.production],
            submittedAnswer: firstTryCorrect ? "badde" : "baddak",
            firstTryCorrect: firstTryCorrect,
            completedCorrectly: true,
            usedHint: usedHint,
            retryCount: firstTryCorrect ? 0 : 1,
            responseTimeMilliseconds: 1_500,
            occurredAt: now.addingTimeInterval(offset)
        )
    }

    @Test("Recording an initial mistake preserves history and updates mastery plus SRS")
    func mistakeUpdatesProgress() {
        let initial = LearnerProgressSnapshot()
        let updated = LearnerProgressUpdater().record(
            attempt(id: "attempt-1", firstTryCorrect: false),
            in: initial
        )

        #expect(updated.attempts.count == 1)
        #expect(updated.attempts.first?.id == "attempt-1")
        #expect(updated.masteryByExpressionID["expr.want"]?.progress(for: .production).attempts == 1)
        #expect(updated.masteryByExpressionID["expr.want"]?.progress(for: .production).cleanCorrect == 0)
        #expect(updated.reviewByExpressionID["expr.want"]?.wrong == true)
        #expect(updated.activeMistakeExpressionIDs == ["expr.want"])
        #expect(updated.reinforcementExpressionIDs == ["expr.want"])
    }

    @Test("A later clean retrieval clears active remediation without erasing the original attempt")
    func cleanRetrievalResolvesActiveRemediation() {
        let updater = LearnerProgressUpdater()
        let afterMistake = updater.record(
            attempt(id: "attempt-1", firstTryCorrect: false),
            in: LearnerProgressSnapshot()
        )
        let recovered = updater.record(
            attempt(id: "attempt-2", firstTryCorrect: true, offset: ReviewScheduler.day),
            in: afterMistake
        )

        #expect(recovered.attempts.map(\.id) == ["attempt-1", "attempt-2"])
        #expect(recovered.activeMistakeExpressionIDs.isEmpty)
        #expect(recovered.reinforcementExpressionIDs.isEmpty)
        #expect(recovered.masteryByExpressionID["expr.want"]?.progress(for: .production).attempts == 2)
        #expect(recovered.masteryByExpressionID["expr.want"]?.progress(for: .production).cleanCorrect == 1)
    }

    @Test("Planner context is derived from real due, mistake, weak and seen learner state")
    func plannerContextReflectsProgress() {
        let updater = LearnerProgressUpdater()
        let first = updater.record(
            attempt(id: "attempt-1", firstTryCorrect: false),
            in: LearnerProgressSnapshot()
        )
        let second = updater.record(
            attempt(id: "attempt-2", firstTryCorrect: false, offset: 60),
            in: first
        )

        let context = second.sessionCandidateContext(
            at: now.addingTimeInterval(ReviewScheduler.day + 60)
        )

        #expect(context.dueExpressionIDs == ["expr.want"])
        #expect(context.mistakeExpressionIDs == ["expr.want"])
        #expect(context.reinforcementExpressionIDs == ["expr.want"])
        #expect(context.seenExpressionIDs == ["expr.want"])
        #expect(context.weakSkills == [.production])
    }

    @Test("Repository persists updates through its store abstraction")
    func repositoryRoundTrip() async throws {
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)

        _ = try await repository.record(
            attempt(id: "attempt-1", firstTryCorrect: false)
        )
        let reloaded = try await repository.load()

        #expect(reloaded.attempts.count == 1)
        #expect(reloaded.activeMistakeExpressionIDs == ["expr.want"])
        #expect(reloaded.reviewByExpressionID["expr.want"]?.seen == 1)
    }
}
