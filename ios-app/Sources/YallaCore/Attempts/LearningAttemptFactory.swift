import Foundation

public struct LearningAttemptFactory: Sendable {
    public init() {}

    public func make(
        id: String,
        resolution: ExerciseResolution,
        occurredAt: Date
    ) -> LearningAttempt? {
        guard resolution.completed,
              let attempt = resolution.attempt,
              let submittedAnswer = resolution.submittedAnswer
        else {
            return nil
        }

        return LearningAttempt(
            id: id,
            expressionID: attempt.expressionID,
            skills: [attempt.skill],
            submittedAnswer: submittedAnswer,
            firstTryCorrect: attempt.firstTryCorrect,
            completedCorrectly: true,
            usedHint: attempt.usedHint,
            retryCount: resolution.retryCount,
            responseTimeMilliseconds: max(Int((attempt.responseTime * 1_000).rounded()), 0),
            occurredAt: occurredAt
        )
    }
}
