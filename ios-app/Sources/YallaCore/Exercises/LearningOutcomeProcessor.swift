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
    private let masteryEngine: MasteryEngine
    private let reviewScheduler: DefaultReviewScheduler

    public init(
        masteryEngine: MasteryEngine = MasteryEngine(),
        reviewScheduler: DefaultReviewScheduler = DefaultReviewScheduler()
    ) {
        self.masteryEngine = masteryEngine
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

        var mastery = currentMastery
        masteryEngine.apply(attempt: attempt, to: &mastery)

        let reviewOutcome: ReviewOutcome = attempt.firstTryCorrect
            ? .correct(usedHint: attempt.usedHint)
            : .incorrect
        let review = reviewScheduler.nextState(
            current: currentReview,
            outcome: reviewOutcome,
            now: now
        )

        return LearningUpdate(
            mastery: mastery,
            review: review,
            mistake: resolution.mistake,
            needsReinforcement: !attempt.firstTryCorrect || attempt.usedHint
        )
    }
}
