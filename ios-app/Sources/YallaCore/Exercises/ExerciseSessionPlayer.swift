import Foundation

public enum ExerciseSessionPlayerError: Error, Equatable, Sendable {
    case unsupportedExerciseType(exerciseID: String, type: ExerciseDefinitionType)
}

public struct ExerciseSessionPlayer: Sendable {
    private let exercises: [ExerciseDefinition]
    private let expressionsByID: [String: Expression]
    private let skillMapper: ExerciseSkillMapper

    private var currentIndex: Int
    private var currentRunner: ExerciseRunner?
    private var lastResolution: ExerciseResolution?

    public private(set) var sessionState: LearningSessionState
    public private(set) var attempts: [Attempt]

    public init(
        exercises: [ExerciseDefinition],
        expressions: [Expression],
        skillMapper: ExerciseSkillMapper = ExerciseSkillMapper()
    ) throws {
        for exercise in exercises where skillMapper.skill(for: exercise.type) == nil {
            throw ExerciseSessionPlayerError.unsupportedExerciseType(
                exerciseID: exercise.id,
                type: exercise.type
            )
        }

        self.exercises = exercises
        self.expressionsByID = Dictionary(uniqueKeysWithValues: expressions.map { ($0.id, $0) })
        self.skillMapper = skillMapper
        self.currentIndex = 0
        self.currentRunner = nil
        self.lastResolution = nil
        self.sessionState = LearningSessionState(targetCount: exercises.count)
        self.attempts = []
    }

    public var currentExercise: ExerciseDefinition? {
        guard currentIndex >= 0, currentIndex < exercises.count else { return nil }
        return exercises[currentIndex]
    }

    public var isCurrentExerciseCompleted: Bool {
        currentExercise != nil && lastResolution?.completed == true
    }

    public var isFinished: Bool {
        currentIndex >= exercises.count
    }

    @discardableResult
    public mutating func useHint() -> Bool {
        guard currentExercise != nil, !isCurrentExerciseCompleted else { return false }
        prepareRunnerIfNeeded()
        guard var runner = currentRunner else { return false }
        runner.useHint()
        currentRunner = runner
        return true
    }

    public mutating func submit(_ answer: String, responseTime: Double) -> ExerciseResolution? {
        guard currentExercise != nil else { return nil }

        if let lastResolution, lastResolution.completed {
            return lastResolution
        }

        prepareRunnerIfNeeded()
        guard var runner = currentRunner else { return nil }

        let resolution = runner.submit(answer, responseTime: responseTime)
        currentRunner = runner
        lastResolution = resolution

        if resolution.completed {
            sessionState.record(resolution)
            if let attempt = resolution.attempt {
                attempts.append(attempt)
            }
        }

        return resolution
    }

    /// Legacy drill IDs are valid session identifiers, not expression IDs.
    /// Only an explicit, resolvable primary target may update expression progress.
    public func learningAttempt(
        id: String,
        resolution: ExerciseResolution,
        occurredAt: Date
    ) -> LearningAttempt? {
        guard isCurrentExerciseCompleted,
              lastResolution == resolution,
              let expressionID = currentExercise?.expressionIDs.first,
              expressionsByID[expressionID] != nil,
              resolution.attempt?.expressionID == expressionID
        else { return nil }
        return LearningAttemptFactory().make(
            id: id, resolution: resolution, occurredAt: occurredAt
        )
    }

    @discardableResult
    public mutating func advance() -> Bool {
        guard currentExercise != nil, isCurrentExerciseCompleted else { return false }

        currentIndex += 1
        currentRunner = nil
        lastResolution = nil
        return true
    }

    private mutating func prepareRunnerIfNeeded() {
        guard currentRunner == nil,
              let exercise = currentExercise,
              let skill = skillMapper.skill(for: exercise.type)
        else {
            return
        }

        let expression = exercise.expressionIDs.first.flatMap { expressionsByID[$0] }
        let usesLebaneseAnswer = expression.map {
            AnswerNormalizer.normalize(exercise.answer) == AnswerNormalizer.normalize($0.canonicalArabizi)
        } ?? false

        let spellingVariants: [String]
        let pronunciationVariants: [String]

        if let expression, usesLebaneseAnswer {
            spellingVariants = expression.variants
                .filter { $0.kind == .spelling }
                .map(\.value)
            pronunciationVariants = expression.variants
                .filter { $0.kind == .pronunciation }
                .map(\.value)
        } else {
            spellingVariants = []
            pronunciationVariants = []
        }

        currentRunner = ExerciseRunner(
            exercise: exercise,
            expressionID: exercise.expressionIDs.first,
            skill: skill,
            spellingVariants: spellingVariants,
            pronunciationVariants: pronunciationVariants
        )
    }
}
