import Foundation
import Testing
@testable import YallaCore

@Suite("Immutable learning attempts")
struct LearningAttemptTests {
    private let now = Date(timeIntervalSince1970: 2_000_000_000)

    @Test("Successful correction after an initial error does not become clean credit")
    func retryDoesNotEraseMistake() {
        let attempt = LearningAttempt(
            id: "attempt-1",
            expressionID: "expr.water",
            skills: [.production],
            submittedAnswer: "mai",
            firstTryCorrect: false,
            completedCorrectly: true,
            usedHint: false,
            retryCount: 1,
            responseTimeMilliseconds: 1_200,
            occurredAt: now
        )

        #expect(attempt.wasInitialMistake)
        #expect(!attempt.earnedCleanCredit)
    }

    @Test("First-try unhinted correct answer earns clean credit")
    func cleanAttemptEarnsCredit() {
        let attempt = LearningAttempt(
            id: "attempt-2",
            expressionID: "expr.water",
            skills: [.production],
            submittedAnswer: "mayy",
            firstTryCorrect: true,
            completedCorrectly: true,
            usedHint: false,
            retryCount: 0,
            responseTimeMilliseconds: 700,
            occurredAt: now
        )

        #expect(!attempt.wasInitialMistake)
        #expect(attempt.earnedCleanCredit)
    }
}

@Suite("Attempt-driven progress")
struct AttemptProgressUpdaterTests {
    private let updater = AttemptProgressUpdater()
    private let now = Date(timeIntervalSince1970: 2_000_000_000)

    @Test("Wrong first try followed by correction still resets SRS and earns no mastery")
    func retryPreservesInitialFailure() {
        let attempt = LearningAttempt(
            id: "attempt-1",
            expressionID: "expr.water",
            skills: [.production],
            submittedAnswer: "mai",
            firstTryCorrect: false,
            completedCorrectly: true,
            usedHint: false,
            retryCount: 1,
            responseTimeMilliseconds: 1_200,
            occurredAt: now
        )

        let result = updater.apply(
            attempt,
            review: ReviewState(),
            mastery: ExpressionMastery(expressionID: attempt.expressionID)
        )

        #expect(result.review.wrong)
        #expect(result.review.correct == 0)
        #expect(result.mastery.progress(for: .production).attempts == 1)
        #expect(result.mastery.progress(for: .production).cleanCorrect == 0)
    }

    @Test("Clean first try advances both review and explicit mastery skills")
    func cleanAttemptUpdatesBoth() {
        let attempt = LearningAttempt(
            id: "attempt-2",
            expressionID: "expr.hello",
            skills: [.recognition, .meaning],
            submittedAnswer: "salut",
            firstTryCorrect: true,
            completedCorrectly: true,
            usedHint: false,
            retryCount: 0,
            responseTimeMilliseconds: 550,
            occurredAt: now
        )

        let result = updater.apply(
            attempt,
            review: ReviewState(),
            mastery: ExpressionMastery(expressionID: attempt.expressionID)
        )

        #expect(!result.review.wrong)
        #expect(result.review.correct == 1)
        #expect(result.mastery.progress(for: .recognition).cleanCorrect == 1)
        #expect(result.mastery.progress(for: .meaning).cleanCorrect == 1)
        #expect(result.mastery.progress(for: .production).attempts == 0)
    }

    @Test("Hinted first-try correct does not earn review or mastery credit")
    func hintedAttemptNotEarned() {
        let attempt = LearningAttempt(
            id: "attempt-3",
            expressionID: "expr.want",
            skills: [.recall],
            submittedAnswer: "baddé",
            firstTryCorrect: true,
            completedCorrectly: true,
            usedHint: true,
            retryCount: 0,
            responseTimeMilliseconds: 900,
            occurredAt: now
        )

        let result = updater.apply(
            attempt,
            review: ReviewState(),
            mastery: ExpressionMastery(expressionID: attempt.expressionID)
        )

        #expect(result.review.wrong)
        #expect(result.mastery.progress(for: .recall).correctAttempts == 1)
        #expect(result.mastery.progress(for: .recall).cleanCorrect == 0)
    }
}
