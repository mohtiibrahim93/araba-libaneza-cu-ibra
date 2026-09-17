public struct ExerciseMistake: Equatable, Sendable {
    public let exerciseID: String
    public let expressionID: String
    public let submittedAnswer: String
    public let correctAnswer: String

    public init(exerciseID: String, expressionID: String, submittedAnswer: String, correctAnswer: String) {
        self.exerciseID = exerciseID
        self.expressionID = expressionID
        self.submittedAnswer = submittedAnswer
        self.correctAnswer = correctAnswer
    }
}

public struct ExerciseResolution: Equatable, Sendable {
    public let evaluation: EvaluationResult
    public let completed: Bool
    public let needsCorrection: Bool
    public let attempt: Attempt?
    public let mistake: ExerciseMistake?

    public init(
        evaluation: EvaluationResult,
        completed: Bool,
        needsCorrection: Bool,
        attempt: Attempt?,
        mistake: ExerciseMistake?
    ) {
        self.evaluation = evaluation
        self.completed = completed
        self.needsCorrection = needsCorrection
        self.attempt = attempt
        self.mistake = mistake
    }
}

public struct ExerciseRunner: Sendable {
    private let exercise: ExerciseDefinition
    private let expressionID: String
    private let skill: Skill
    private let spellingVariants: [String]
    private let pronunciationVariants: [String]
    private let evaluator: AnswerEvaluator

    private var usedHint = false
    private var originalMistake: ExerciseMistake?
    private var firstResponseTime: Double?

    public init(
        exercise: ExerciseDefinition,
        expressionID: String? = nil,
        skill: Skill,
        spellingVariants: [String] = [],
        pronunciationVariants: [String] = [],
        evaluator: AnswerEvaluator = AnswerEvaluator()
    ) {
        self.exercise = exercise
        self.expressionID = expressionID ?? exercise.expressionIDs.first ?? exercise.id
        self.skill = skill
        self.spellingVariants = spellingVariants
        self.pronunciationVariants = pronunciationVariants
        self.evaluator = evaluator
    }

    public mutating func useHint() {
        usedHint = true
    }

    public mutating func submit(_ answer: String, responseTime: Double) -> ExerciseResolution {
        let evaluation = evaluator.evaluate(
            answer: answer,
            canonical: exercise.answer,
            spellingVariants: spellingVariants,
            pronunciationVariants: pronunciationVariants
        )

        if firstResponseTime == nil {
            firstResponseTime = responseTime
        }

        if originalMistake == nil {
            if evaluation == .incorrect {
                let mistake = ExerciseMistake(
                    exerciseID: exercise.id,
                    expressionID: expressionID,
                    submittedAnswer: answer,
                    correctAnswer: exercise.answer
                )
                originalMistake = mistake
                return ExerciseResolution(
                    evaluation: evaluation,
                    completed: false,
                    needsCorrection: true,
                    attempt: nil,
                    mistake: mistake
                )
            }

            return ExerciseResolution(
                evaluation: evaluation,
                completed: true,
                needsCorrection: false,
                attempt: makeAttempt(firstTryCorrect: true),
                mistake: nil
            )
        }

        guard evaluation != .incorrect else {
            return ExerciseResolution(
                evaluation: evaluation,
                completed: false,
                needsCorrection: true,
                attempt: nil,
                mistake: originalMistake
            )
        }

        return ExerciseResolution(
            evaluation: evaluation,
            completed: true,
            needsCorrection: false,
            attempt: makeAttempt(firstTryCorrect: false),
            mistake: originalMistake
        )
    }

    private func makeAttempt(firstTryCorrect: Bool) -> Attempt {
        Attempt(
            expressionID: expressionID,
            skill: skill,
            firstTryCorrect: firstTryCorrect,
            usedHint: usedHint,
            responseTime: firstResponseTime ?? 0
        )
    }
}
