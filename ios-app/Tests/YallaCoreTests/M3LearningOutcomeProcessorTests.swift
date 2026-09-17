import Foundation
import Testing
@testable import YallaCore

@Suite("Completed exercise learning consequences")
struct LearningOutcomeProcessorTests {
    let now = Date(timeIntervalSince1970: 1_700_000_000)

    @Test("Clean due answer advances SRS and target mastery")
    func cleanAnswerAdvances() {
        let attempt = Attempt(
            expressionID: "expr.want",
            skill: .production,
            firstTryCorrect: true,
            usedHint: false,
            responseTime: 1
        )
        let resolution = ExerciseResolution(
            evaluation: .exact,
            completed: true,
            needsCorrection: false,
            attempt: attempt,
            mistake: nil
        )
        let currentMastery = ExpressionMastery(expressionID: "expr.want")
        let currentReview = ReviewState(stage: 1, dueAt: now)

        let update = LearningOutcomeProcessor().process(
            resolution: resolution,
            mastery: currentMastery,
            review: currentReview,
            now: now
        )

        #expect(update.mastery.score(for: .production) > 0)
        #expect(update.review.stage == 2)
        #expect(update.mistake == nil)
        #expect(!update.needsReinforcement)
    }

    @Test("Corrected mistake remains a mistake and resets SRS")
    func correctedMistakeStaysWeak() {
        let mistake = ExerciseMistake(
            exerciseID: "drill-1",
            expressionID: "expr.want",
            submittedAnswer: "baddak",
            correctAnswer: "baddé"
        )
        let attempt = Attempt(
            expressionID: "expr.want",
            skill: .production,
            firstTryCorrect: false,
            usedHint: false,
            responseTime: 2
        )
        let resolution = ExerciseResolution(
            evaluation: .exact,
            completed: true,
            needsCorrection: false,
            attempt: attempt,
            mistake: mistake
        )
        let currentMastery = ExpressionMastery(
            expressionID: "expr.want",
            scores: [.production: 0.5]
        )
        let currentReview = ReviewState(stage: 3, dueAt: now)

        let update = LearningOutcomeProcessor().process(
            resolution: resolution,
            mastery: currentMastery,
            review: currentReview,
            now: now
        )

        #expect(update.mastery.score(for: .production) < 0.5)
        #expect(update.review.stage == 0)
        #expect(update.mistake == mistake)
        #expect(update.needsReinforcement)
    }

    @Test("Hinted correct is weak for SRS but is not fabricated as a wrong answer")
    func hintedCorrectNeedsReinforcementWithoutFakeMistake() {
        let attempt = Attempt(
            expressionID: "expr.want",
            skill: .production,
            firstTryCorrect: true,
            usedHint: true,
            responseTime: 2
        )
        let resolution = ExerciseResolution(
            evaluation: .exact,
            completed: true,
            needsCorrection: false,
            attempt: attempt,
            mistake: nil
        )

        let update = LearningOutcomeProcessor().process(
            resolution: resolution,
            mastery: ExpressionMastery(expressionID: "expr.want"),
            review: ReviewState(stage: 2, dueAt: now),
            now: now
        )

        #expect(update.mastery.score(for: .production) > 0)
        #expect(update.review.stage == 0)
        #expect(update.mistake == nil)
        #expect(update.needsReinforcement)
    }
}
