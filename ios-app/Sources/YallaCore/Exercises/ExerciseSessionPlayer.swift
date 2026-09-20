import Foundation

public enum ExerciseSessionPlayerError: Error, Equatable, Sendable {
    case invalidMatchingExercise(exerciseID: String)
    case unsupportedExerciseType(exerciseID: String, type: ExerciseDefinitionType)
}

public struct ExerciseSessionPlayer: Sendable {
    private let exercises: [ExerciseDefinition]
    private let expressionsByID: [String: Expression]
    private let skillMapper: ExerciseSkillMapper

    private let matchingPairsByIndex: [Int: [MatchingPair]]
    private var matchingRunners: [String: ExerciseRunner] = [:]
    public private(set) var currentMatchingState: MatchingState?

    private var currentIndex: Int
    private var currentRunner: ExerciseRunner?
    private var lastResolution: ExerciseResolution?

    public private(set) var sessionState: LearningSessionState
    public private(set) var attempts: [Attempt]

    public init(
        exercises: [ExerciseDefinition],
        expressions: [Expression],
        locale: String = "ro",
        skillMapper: ExerciseSkillMapper = ExerciseSkillMapper()
    ) throws {
        for exercise in exercises where skillMapper.skill(for: exercise.type) == nil {
            throw ExerciseSessionPlayerError.unsupportedExerciseType(
                exerciseID: exercise.id,
                type: exercise.type
            )
        }

        var matchingPairs: [Int: [MatchingPair]] = [:]
        for (index, exercise) in exercises.enumerated() where exercise.type == .matching {
            guard let pairs = MatchingExerciseBuilder().pairs(for: exercise, expressions: expressions, locale: locale) else {
                throw ExerciseSessionPlayerError.invalidMatchingExercise(exerciseID: exercise.id)
            }
            matchingPairs[index] = pairs
        }
        self.matchingPairsByIndex = matchingPairs
        self.currentMatchingState = matchingPairs[0].map { MatchingState(pairs: $0) }
        self.exercises = exercises
        self.expressionsByID = Dictionary(uniqueKeysWithValues: expressions.map { ($0.id, $0) })
        self.skillMapper = skillMapper
        self.currentIndex = 0
        self.currentRunner = nil
        self.lastResolution = nil
        self.sessionState = LearningSessionState(targetCount: exercises.enumerated().reduce(0) { $0 + (matchingPairs[$1.offset]?.count ?? 1) })
        self.attempts = []
    }

    public var currentExercise: ExerciseDefinition? {
        guard currentIndex >= 0, currentIndex < exercises.count else { return nil }
        return exercises[currentIndex]
    }

    public var isCurrentExerciseCompleted: Bool {
        if let currentMatchingState { return currentMatchingState.isComplete }
        return currentExercise != nil && lastResolution?.completed == true
    }

    public var isFinished: Bool {
        currentIndex >= exercises.count
    }

    @discardableResult
    public mutating func useHint() -> Bool {
        guard currentExercise != nil, !isCurrentExerciseCompleted else { return false }
        if let state = currentMatchingState {
            for pair in state.pairs where !state.matchedPairIDs.contains(pair.id) {
                var runner = matchingRunner(for: pair)
                runner.useHint()
                matchingRunners[pair.id] = runner
            }
            return true
        }
        prepareRunnerIfNeeded()
        guard var runner = currentRunner else { return false }
        runner.useHint()
        currentRunner = runner
        return true
    }

    public mutating func submit(_ answer: String, responseTime: Double) -> ExerciseResolution? {
        guard currentExercise != nil, currentMatchingState == nil else { return nil }

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

    /// Each pairing is a separate recognition attempt using its actual expression ID.
    public mutating func submitMatch(leftPairID: String, rightPairID: String, responseTime: Double) -> ExerciseResolution? {
        guard var state = currentMatchingState,
              !state.matchedPairIDs.contains(leftPairID),
              !state.matchedPairIDs.contains(rightPairID),
              let left = state.pairs.first(where: { $0.id == leftPairID }),
              let right = state.pairs.first(where: { $0.id == rightPairID })
        else { return nil }
        var runner = matchingRunner(for: left)
        let resolution = runner.submit(right.right, responseTime: responseTime)
        matchingRunners[left.id] = runner
        lastResolution = resolution
        if resolution.completed {
            _ = state.attempt(leftPairID: leftPairID, rightPairID: rightPairID)
            currentMatchingState = state
            sessionState.record(resolution)
            if let attempt = resolution.attempt { attempts.append(attempt) }
        }
        return resolution
    }

    private func matchingRunner(for pair: MatchingPair) -> ExerciseRunner {
        if let existing = matchingRunners[pair.id] { return existing }
        let exercise = ExerciseDefinition(
            id: currentExercise?.id ?? "",
            type: .matching,
            unitID: currentExercise?.unitID ?? "",
            expressionIDs: [pair.id],
            prompt: currentExercise?.prompt ?? [:],
            answer: pair.right,
            wrongAnswers: []
        )
        return ExerciseRunner(exercise: exercise, expressionID: pair.id, skill: .recognition)
    }

    /// Legacy drill IDs are valid session identifiers, not expression IDs.
    /// Only an explicit, resolvable primary target may update expression progress.
    public func learningAttempt(
        id: String,
        resolution: ExerciseResolution,
        occurredAt: Date
    ) -> LearningAttempt? {
        guard lastResolution == resolution, resolution.completed,
              let expressionID = resolution.attempt?.expressionID,
              expressionsByID[expressionID] != nil else { return nil }
        if let state = currentMatchingState {
            guard state.matchedPairIDs.contains(expressionID) else { return nil }
        } else {
            guard isCurrentExerciseCompleted, currentExercise?.expressionIDs.first == expressionID else { return nil }
        }
        return LearningAttemptFactory().make(
            id: id, resolution: resolution, occurredAt: occurredAt
        )
    }

    @discardableResult
    public mutating func advance() -> Bool {
        guard currentExercise != nil, isCurrentExerciseCompleted else { return false }

        currentIndex += 1
        matchingRunners = [:]
        currentMatchingState = matchingPairsByIndex[currentIndex].map { MatchingState(pairs: $0) }
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
