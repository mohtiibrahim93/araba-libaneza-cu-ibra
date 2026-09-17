public struct OrientationQuestionPresentation: Equatable, Sendable {
    public let questionNumber: Int
    public let totalQuestions: Int
    public let prompt: String

    public init(questionNumber: Int, totalQuestions: Int, prompt: String) {
        self.questionNumber = questionNumber
        self.totalQuestions = totalQuestions
        self.prompt = prompt
    }
}

public struct OrientationQuestion: Equatable, Sendable, Identifiable {
    public let id: String
    public let ordinal: Int
    public let internalBand: LevelBand
    public let prompt: [String: String]
    public let exerciseType: ExerciseDefinitionType

    public init(
        id: String,
        ordinal: Int,
        internalBand: LevelBand,
        prompt: [String: String],
        exerciseType: ExerciseDefinitionType
    ) {
        self.id = id
        self.ordinal = ordinal
        self.internalBand = internalBand
        self.prompt = prompt
        self.exerciseType = exerciseType
    }

    public func presentation(locale: String, totalQuestions: Int) throws -> OrientationQuestionPresentation {
        guard let localizedPrompt = prompt[locale] else {
            throw LocalizationError.missingLocale(locale)
        }
        return OrientationQuestionPresentation(
            questionNumber: ordinal,
            totalQuestions: totalQuestions,
            prompt: localizedPrompt
        )
    }
}

public enum OrientationValidationError: Error, Equatable, Sendable {
    case invalidQuestionCount(expected: Int, actual: Int)
    case invalidBandCount(band: LevelBand, expected: Int, actual: Int)
    case duplicateQuestionID(String)
    case duplicateOrdinal(Int)
}

public struct OrientationQuestionBankValidator: Sendable {
    public init() {}

    public func validate(_ questions: [OrientationQuestion]) throws {
        guard questions.count == 24 else {
            throw OrientationValidationError.invalidQuestionCount(expected: 24, actual: questions.count)
        }

        var ids = Set<String>()
        var ordinals = Set<Int>()
        for question in questions {
            guard ids.insert(question.id).inserted else {
                throw OrientationValidationError.duplicateQuestionID(question.id)
            }
            guard ordinals.insert(question.ordinal).inserted else {
                throw OrientationValidationError.duplicateOrdinal(question.ordinal)
            }
        }

        for band in [LevelBand.a1, .a2, .b1] {
            let count = questions.filter { $0.internalBand == band }.count
            guard count == 8 else {
                throw OrientationValidationError.invalidBandCount(band: band, expected: 8, actual: count)
            }
        }
    }
}

public struct OrientationResponse: Equatable, Sendable {
    public let questionID: String
    public let isCorrect: Bool

    public init(questionID: String, isCorrect: Bool) {
        self.questionID = questionID
        self.isCorrect = isCorrect
    }
}

public enum OrientationStartingPoint: String, Equatable, Sendable {
    case a1Foundation
    case a2Consolidation
    case b1AvailableMaterial
    case reviewAndEnrichment
}

public struct OrientationResult: Equatable, Sendable {
    public let startingPoint: OrientationStartingPoint
    public let gapBands: [LevelBand]
    public let bandScores: [LevelBand: Int]
    public let isCEFRCertification: Bool
    public let unassessedSkills: Set<Skill>

    public init(
        startingPoint: OrientationStartingPoint,
        gapBands: [LevelBand],
        bandScores: [LevelBand: Int],
        isCEFRCertification: Bool = false,
        unassessedSkills: Set<Skill> = [.listening, .speaking]
    ) {
        self.startingPoint = startingPoint
        self.gapBands = gapBands
        self.bandScores = bandScores
        self.isCEFRCertification = isCEFRCertification
        self.unassessedSkills = unassessedSkills
    }
}

public enum OrientationScoringError: Error, Equatable, Sendable {
    case responseCountMismatch(expected: Int, actual: Int)
    case unknownQuestionID(String)
    case duplicateResponse(String)
    case missingResponse(String)
}

public struct OrientationEngine: Sendable {
    public let passThreshold: Int

    public init(passThreshold: Int = 6) {
        self.passThreshold = passThreshold
    }

    public func score(
        questions: [OrientationQuestion],
        responses: [OrientationResponse]
    ) throws -> OrientationResult {
        try OrientationQuestionBankValidator().validate(questions)
        guard responses.count == questions.count else {
            throw OrientationScoringError.responseCountMismatch(
                expected: questions.count,
                actual: responses.count
            )
        }

        let questionByID = Dictionary(uniqueKeysWithValues: questions.map { ($0.id, $0) })
        var responsesByID: [String: OrientationResponse] = [:]
        for response in responses {
            guard questionByID[response.questionID] != nil else {
                throw OrientationScoringError.unknownQuestionID(response.questionID)
            }
            guard responsesByID[response.questionID] == nil else {
                throw OrientationScoringError.duplicateResponse(response.questionID)
            }
            responsesByID[response.questionID] = response
        }

        var scores: [LevelBand: Int] = [.a1: 0, .a2: 0, .b1: 0]
        for question in questions {
            guard let response = responsesByID[question.id] else {
                throw OrientationScoringError.missingResponse(question.id)
            }
            if response.isCorrect {
                scores[question.internalBand, default: 0] += 1
            }
        }

        if scores[.a1, default: 0] < passThreshold {
            return result(.a1Foundation, gaps: [.a1], scores: scores)
        }
        if scores[.a2, default: 0] < passThreshold {
            return result(.a2Consolidation, gaps: [.a2], scores: scores)
        }
        if scores[.b1, default: 0] < passThreshold {
            return result(.b1AvailableMaterial, gaps: [.b1], scores: scores)
        }
        return result(.reviewAndEnrichment, gaps: [], scores: scores)
    }

    private func result(
        _ startingPoint: OrientationStartingPoint,
        gaps: [LevelBand],
        scores: [LevelBand: Int]
    ) -> OrientationResult {
        OrientationResult(
            startingPoint: startingPoint,
            gapBands: gaps,
            bandScores: scores,
            isCEFRCertification: false,
            unassessedSkills: [.listening, .speaking]
        )
    }
}
