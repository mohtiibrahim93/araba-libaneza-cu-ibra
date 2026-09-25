import Foundation

/// Outcome of one completed exercise, kept for Progress only. Unlike
/// `LearningAttempt` it does not need a linked expression, so dialogue and
/// grammar drills without one are still counted. It never changes mastery,
/// reviews or mistakes.
public struct ExerciseResult: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let exerciseID: String
    public let unitID: String
    /// `ExerciseDefinitionType` raw value.
    public let exerciseType: String
    public let firstTryCorrect: Bool
    public let occurredAt: Date

    public init(
        id: String,
        exerciseID: String,
        unitID: String,
        exerciseType: String,
        firstTryCorrect: Bool,
        occurredAt: Date
    ) {
        self.id = id
        self.exerciseID = exerciseID
        self.unitID = unitID
        self.exerciseType = exerciseType
        self.firstTryCorrect = firstTryCorrect
        self.occurredAt = occurredAt
    }
}

extension ExerciseSessionPlayer {
    /// The result of the exercise just completed by `resolution`. Nil for
    /// unfinished answers and for matching boards (those record per-pair
    /// attempts on real expressions instead).
    public func exerciseResult(
        id: String,
        resolution: ExerciseResolution,
        occurredAt: Date
    ) -> ExerciseResult? {
        guard resolution.completed,
              currentMatchingState == nil,
              let exercise = currentExercise,
              exercise.type != .matching
        else { return nil }
        let firstTry = resolution.attempt?.firstTryCorrect ?? (resolution.retryCount == 0)
        return ExerciseResult(
            id: id,
            exerciseID: exercise.id,
            unitID: exercise.unitID,
            exerciseType: exercise.type.rawValue,
            firstTryCorrect: firstTry,
            occurredAt: occurredAt
        )
    }
}
