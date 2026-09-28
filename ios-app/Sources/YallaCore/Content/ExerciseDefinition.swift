public enum ExerciseDefinitionType: String, Codable, Equatable, Sendable, CaseIterable {
    case multipleChoiceProduction = "multiple-choice-production"
    case multipleChoiceMeaning = "multiple-choice-meaning"
    case freeProduction = "free-production"
    case reverseProduction = "reverse-production"
    case matching
    case wordOrder = "word-order"
    case discovery
    case fillGap = "fill-gap"
    case grammarDrill = "grammar-drill"
    case transformation
    case dialogueResponse = "dialogue-response"
    case listeningChoice = "listening-choice"
    case listeningWrite = "listening-write"
    case speakingCompare = "speaking-compare"
    case transferChallenge = "transfer-challenge"
    case speedRecall = "speed-recall"

    public var defaultMasterySkills: Set<MasterySkill> {
        switch self {
        case .multipleChoiceProduction:
            return [.recall]
        case .multipleChoiceMeaning, .reverseProduction:
            return [.meaning]
        case .freeProduction:
            return [.recall, .production]
        case .matching:
            return [.recognition, .meaning]
        case .wordOrder:
            return [.sentenceBuilding]
        case .discovery:
            return []
        case .fillGap:
            return [.recall, .sentenceBuilding]
        case .grammarDrill:
            return [.sentenceBuilding]
        case .transformation:
            return [.production, .sentenceBuilding]
        case .dialogueResponse:
            return [.production, .transfer]
        case .listeningChoice:
            return [.listening, .meaning]
        case .listeningWrite:
            return [.listening, .production]
        case .speakingCompare:
            return [.speaking, .production]
        case .transferChallenge:
            return [.transfer, .production]
        case .speedRecall:
            return [.retrievalFluency, .recall]
        }
    }
}

public struct ExerciseDefinition: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let type: ExerciseDefinitionType
    public let unitID: String
    public let expressionIDs: [String]
    public let prompt: [String: String]
    public let answer: String
    public let wrongAnswers: [String]
    /// Other replies the teacher accepts as fully correct (e.g. "Shu 3am
    /// ta3mle?" as well as "Mar7aba! Shu 3aamle?!").
    public let acceptedAnswers: [String]?

    public init(
        id: String,
        type: ExerciseDefinitionType,
        unitID: String,
        expressionIDs: [String] = [],
        prompt: [String: String],
        answer: String,
        wrongAnswers: [String],
        acceptedAnswers: [String]? = nil
    ) {
        self.id = id
        self.type = type
        self.unitID = unitID
        self.expressionIDs = expressionIDs
        self.prompt = prompt
        self.answer = answer
        self.wrongAnswers = wrongAnswers
        self.acceptedAnswers = acceptedAnswers
    }

    /// The correct reply the learner gave: the accepted alternative it
    /// matches, or the main answer.
    public func correctAnswer(matching submitted: String) -> String {
        let key = AnswerNormalizer.normalize(submitted)
        return (acceptedAnswers ?? []).first { AnswerNormalizer.normalize($0) == key } ?? answer
    }
}
