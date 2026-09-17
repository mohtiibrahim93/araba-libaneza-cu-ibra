public enum ExerciseDefinitionType: String, Codable, Equatable, Sendable {
    case grammarDrill = "grammar-drill"
    case dialogueResponse = "dialogue-response"
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
