public struct ContentPackage: Codable, Equatable, Sendable {
    public let manifest: ContentManifest
    public let expressions: [Expression]
    public let units: [JourneyUnit]
    public let exercises: [ExerciseDefinition]
    public let lexiconCollections: [LexiconCollection]
    public let roots: [Root]
    public let morphologicalPatterns: [MorphologicalPattern]
    public let morphologyLinks: [MorphologyLink]
    public let inflectionRelations: [InflectionRelation]
    public let audioAssets: [AudioAsset]
    public let listeningPrompts: [ListeningPrompt]

    public init(
        manifest: ContentManifest,
        expressions: [Expression],
        units: [JourneyUnit],
        exercises: [ExerciseDefinition] = [],
        lexiconCollections: [LexiconCollection] = [],
        roots: [Root] = [],
        morphologicalPatterns: [MorphologicalPattern] = [],
        morphologyLinks: [MorphologyLink] = [],
        inflectionRelations: [InflectionRelation] = [],
        audioAssets: [AudioAsset] = [],
        listeningPrompts: [ListeningPrompt] = []
    ) {
        self.manifest = manifest
        self.expressions = expressions
        self.units = units
        self.exercises = exercises
        self.lexiconCollections = lexiconCollections
        self.roots = roots
        self.morphologicalPatterns = morphologicalPatterns
        self.morphologyLinks = morphologyLinks
        self.inflectionRelations = inflectionRelations
        self.audioAssets = audioAssets
        self.listeningPrompts = listeningPrompts
    }

    private enum CodingKeys: String, CodingKey {
        case manifest, expressions, units, exercises, lexiconCollections
        case roots, morphologicalPatterns, morphologyLinks, inflectionRelations
        case audioAssets, listeningPrompts
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        manifest = try container.decode(ContentManifest.self, forKey: .manifest)
        expressions = try container.decode([Expression].self, forKey: .expressions)
        units = try container.decode([JourneyUnit].self, forKey: .units)
        exercises = try container.decodeIfPresent([ExerciseDefinition].self, forKey: .exercises) ?? []
        lexiconCollections = try container.decodeIfPresent([LexiconCollection].self, forKey: .lexiconCollections) ?? []
        roots = try container.decodeIfPresent([Root].self, forKey: .roots) ?? []
        morphologicalPatterns = try container.decodeIfPresent([MorphologicalPattern].self, forKey: .morphologicalPatterns) ?? []
        morphologyLinks = try container.decodeIfPresent([MorphologyLink].self, forKey: .morphologyLinks) ?? []
        inflectionRelations = try container.decodeIfPresent([InflectionRelation].self, forKey: .inflectionRelations) ?? []
        audioAssets = try container.decodeIfPresent([AudioAsset].self, forKey: .audioAssets) ?? []
        listeningPrompts = try container.decodeIfPresent([ListeningPrompt].self, forKey: .listeningPrompts) ?? []
    }
}
