public struct LexiconFilter: Equatable, Sendable {
    public let levels: Set<LevelBand>
    public let topics: Set<String>

    public init(levels: Set<LevelBand> = [], topics: Set<String> = []) {
        self.levels = levels
        self.topics = topics
    }
}

public struct ExpressionUsage: Equatable, Sendable {
    public let journeyUnitIDs: [String]
    public let lexiconCollectionIDs: [String]
    public let exerciseIDs: [String]

    public init(
        journeyUnitIDs: [String],
        lexiconCollectionIDs: [String],
        exerciseIDs: [String]
    ) {
        self.journeyUnitIDs = journeyUnitIDs
        self.lexiconCollectionIDs = lexiconCollectionIDs
        self.exerciseIDs = exerciseIDs
    }
}
