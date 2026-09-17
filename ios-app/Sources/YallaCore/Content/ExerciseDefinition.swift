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

    public init(
        id: String,
        type: ExerciseDefinitionType,
        unitID: String,
        expressionIDs: [String] = [],
        prompt: [String: String],
        answer: String,
        wrongAnswers: [String]
    ) {
        self.id = id
        self.type = type
        self.unitID = unitID
        self.expressionIDs = expressionIDs
        self.prompt = prompt
        self.answer = answer
        self.wrongAnswers = wrongAnswers
    }
}
