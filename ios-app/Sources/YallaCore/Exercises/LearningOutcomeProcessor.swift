import Foundation

public struct LearningUpdate: Equatable, Sendable {
    public let mastery: ExpressionMastery
    public let review: ReviewState
    public let mistake: ExerciseMistake?
    public let needsReinforcement: Bool

    public init(
        mastery: ExpressionMastery,
        review: ReviewState,
        mistake: ExerciseMistake?,
        needsReinforcement: Bool
    ) {
        self.mastery = mastery
        self.review = review
        self.mistake = mistake
        self.needsReinforcement = needsReinforcement
    }
}

public struct LearningOutcomeProcessor: Sendable {
    private let masteryUpdater: MasteryUpdater
    private let reviewScheduler: ReviewScheduler

    public init(
        masteryUpdater: MasteryUpdater = MasteryUpdater(),
        reviewScheduler: ReviewScheduler = ReviewScheduler()
    ) {
        self.masteryUpdater = masteryUpdater
        self.reviewScheduler = reviewScheduler
    }

    public func process(
        resolution: ExerciseResolution,
        mastery currentMastery: ExpressionMastery,
        review currentReview: ReviewState,
        now: Date
    ) -> LearningUpdate {
        guard resolution.completed, let attempt = resolution.attempt else {
            return LearningUpdate(
                mastery: currentMastery,
                review: currentReview,
                mistake: resolution.mistake,
                needsReinforcement: resolution.mistake != nil
            )
        }

        let mastery = masteryUpdater.record(
            currentMastery,
            skills: Set([attempt.skill]),
            correct: attempt.firstTryCorrect,
            hinted: attempt.usedHint,
            at: now
        )
        let review = reviewScheduler.record(
            currentReview,
            correct: attempt.firstTryCorrect,
            hinted: attempt.usedHint,
            at: now
        )

        return LearningUpdate(
            mastery: mastery,
            review: review,
            mistake: resolution.mistake,
            needsReinforcement: !attempt.firstTryCorrect || attempt.usedHint
        )
    }
}
