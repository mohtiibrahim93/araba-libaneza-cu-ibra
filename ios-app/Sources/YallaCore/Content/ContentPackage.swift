public struct ContentPackage: Codable, Equatable, Sendable {
    public let manifest: ContentManifest
    public let expressions: [Expression]
    public let units: [JourneyUnit]
    public let exercises: [ExerciseDefinition]
    public let lexiconCollections: [LexiconCollection]

    public init(
        manifest: ContentManifest,
        expressions: [Expression],
        units: [JourneyUnit],
        exercises: [ExerciseDefinition] = [],
        lexiconCollections: [LexiconCollection] = []
    ) {
        self.manifest = manifest
        self.expressions = expressions
        self.units = units
        self.exercises = exercises
        self.lexiconCollections = lexiconCollections
    }

    private enum CodingKeys: String, CodingKey {
        case manifest, expressions, units, exercises, lexiconCollections
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        manifest = try container.decode(ContentManifest.self, forKey: .manifest)
        expressions = try container.decode([Expression].self, forKey: .expressions)
        units = try container.decode([JourneyUnit].self, forKey: .units)
        exercises = try container.decodeIfPresent([ExerciseDefinition].self, forKey: .exercises) ?? []
        lexiconCollections = try container.decodeIfPresent([LexiconCollection].self, forKey: .lexiconCollections) ?? []
    }
}
