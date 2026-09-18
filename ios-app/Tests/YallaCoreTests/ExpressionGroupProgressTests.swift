import Foundation
import Testing
@testable import YallaCore

@Suite("Expression group learning progress")
struct ExpressionGroupProgressTests {
    private let now = Date(timeIntervalSince1970: 1_700_000_000)

    @Test("Group progress separates practiced, unseen, due, mistake and saved expressions")
    func summarizesExpressionGroup() {
        let attempt = LearningAttempt(
            id: "attempt-1",
            expressionID: "expr.kteb",
            skills: [.production],
            submittedAnswer: "ktab",
            firstTryCorrect: false,
            completedCorrectly: true,
            usedHint: false,
            retryCount: 1,
            responseTimeMilliseconds: 1_200,
            occurredAt: now
        )
        let afterMistake = LearnerProgressUpdater().record(
            attempt,
            in: LearnerProgressSnapshot(
                savedExpressionIDs: ["expr.maktab"]
            )
        )

        let progress = afterMistake.expressionGroupProgress(
            expressionIDs: ["expr.kteb", "expr.keeteb", "expr.maktab"],
            at: now.addingTimeInterval(ReviewScheduler.day)
        )

        #expect(progress.totalCount == 3)
        #expect(progress.practicedCount == 1)
        #expect(progress.unseenCount == 2)
        #expect(progress.dueCount == 1)
        #expect(progress.mistakeCount == 1)
        #expect(progress.savedCount == 1)
    }

    @Test("Empty groups produce zero progress without fabricated state")
    func emptyGroup() {
        let progress = LearnerProgressSnapshot().expressionGroupProgress(
            expressionIDs: [],
            at: now
        )

        #expect(progress == ExpressionGroupProgress())
    }
}
