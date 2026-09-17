import Foundation

public struct LearningAttempt: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let expressionID: String
    public let skills: Set<MasterySkill>
    public let submittedAnswer: String
    public let firstTryCorrect: Bool
    public let completedCorrectly: Bool
    public let usedHint: Bool
    public let retryCount: Int
    public let responseTimeMilliseconds: Int
    public let occurredAt: Date

    public init(
        id: String,
        expressionID: String,
        skills: Set<MasterySkill>,
        submittedAnswer: String,
        firstTryCorrect: Bool,
        completedCorrectly: Bool,
        usedHint: Bool,
        retryCount: Int,
        responseTimeMilliseconds: Int,
        occurredAt: Date
    ) {
        self.id = id
        self.expressionID = expressionID
        self.skills = skills
        self.submittedAnswer = submittedAnswer
        self.firstTryCorrect = firstTryCorrect
        self.completedCorrectly = completedCorrectly
        self.usedHint = usedHint
        self.retryCount = retryCount
        self.responseTimeMilliseconds = responseTimeMilliseconds
        self.occurredAt = occurredAt
    }

    public var wasInitialMistake: Bool {
        !firstTryCorrect
    }

    public var earnedCleanCredit: Bool {
        firstTryCorrect && completedCorrectly && !usedHint
    }
}

public struct AttemptProgressUpdate: Equatable, Sendable {
    public let review: ReviewState
    public let mastery: ExpressionMastery

    public init(review: ReviewState, mastery: ExpressionMastery) {
        self.review = review
        self.mastery = mastery
    }
}

public struct AttemptProgressUpdater: Sendable {
    private let reviewScheduler: ReviewScheduler
    private let masteryUpdater: MasteryUpdater

    public init(
        reviewScheduler: ReviewScheduler = ReviewScheduler(),
        masteryUpdater: MasteryUpdater = MasteryUpdater()
    ) {
        self.reviewScheduler = reviewScheduler
        self.masteryUpdater = masteryUpdater
    }

    public func apply(
        _ attempt: LearningAttempt,
        review: ReviewState,
        mastery: ExpressionMastery
    ) -> AttemptProgressUpdate {
        let updatedReview = reviewScheduler.record(
            review,
            correct: attempt.firstTryCorrect,
            hinted: attempt.usedHint,
            at: attempt.occurredAt
        )
        let updatedMastery = masteryUpdater.record(
            mastery,
            skills: attempt.skills,
            correct: attempt.firstTryCorrect,
            hinted: attempt.usedHint,
            at: attempt.occurredAt
        )
        return AttemptProgressUpdate(review: updatedReview, mastery: updatedMastery)
    }
}
