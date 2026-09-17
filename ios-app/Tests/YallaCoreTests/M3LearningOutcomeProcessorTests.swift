import Foundation
import Testing
@testable import YallaCore

@Suite("Completed exercise learning consequences")
struct LearningOutcomeProcessorTests {
    let now = Date(timeIntervalSince1970: 1_700_000_000)
    let day: TimeInterval = 86_400

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
        let currentReview = ReviewState(
            seen: 2,
            correct: 2,
            streak: 2,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 1,
            dueAt: now
        )

        let update = LearningOutcomeProcessor().process(
            resolution: resolution,
            mastery: currentMastery,
            review: currentReview,
            now: now
        )

        #expect(update.mastery.progress(for: .production).cleanCorrect == 1)
        #expect(update.review.reviewStage == 2)
        #expect(update.mistake == nil)
        #expect(!update.needsReinforcement)
    }

    @Test("Corrected mistake remains weak evidence and resets SRS")
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
            skillProgress: [
                .production: SkillProgress(
                    attempts: 2,
                    correctAttempts: 2,
                    cleanCorrect: 2,
                    lastAttemptAt: now.addingTimeInterval(-day)
                )
            ]
        )
        let currentReview = ReviewState(
            seen: 3,
            correct: 2,
            streak: 2,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 3,
            dueAt: now
        )

        let update = LearningOutcomeProcessor().process(
            resolution: resolution,
            mastery: currentMastery,
            review: currentReview,
            now: now
        )

        let progress = update.mastery.progress(for: .production)
        #expect(progress.attempts == 3)
        #expect(progress.correctAttempts == 2)
        #expect(progress.cleanCorrect == 2)
        #expect(update.review.reviewStage == 0)
        #expect(update.review.wrong)
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
            review: ReviewState(
                seen: 2,
                correct: 2,
                streak: 2,
                wrong: false,
                lastAttemptAt: now.addingTimeInterval(-day),
                reviewStage: 2,
                dueAt: now
            ),
            now: now
        )

        let progress = update.mastery.progress(for: .production)
        #expect(progress.attempts == 1)
        #expect(progress.correctAttempts == 1)
        #expect(progress.cleanCorrect == 0)
        #expect(update.review.reviewStage == 0)
        #expect(update.mistake == nil)
        #expect(update.needsReinforcement)
    }
}
