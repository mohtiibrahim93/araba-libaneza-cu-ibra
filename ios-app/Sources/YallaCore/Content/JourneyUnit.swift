public enum LevelBand: String, Codable, Equatable, Sendable {
    case a1
    case a2
    case b1Partial = "b1-partial"
}

public struct JourneyUnit: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let level: LevelBand
    public let expressionIDs: [String]

    public init(id: String, level: LevelBand, expressionIDs: [String]) {
        self.id = id
        self.level = level
        self.expressionIDs = expressionIDs
    }
}
