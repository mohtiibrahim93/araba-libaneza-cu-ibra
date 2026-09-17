public struct ContentPackage: Codable, Equatable, Sendable {
    public let manifest: ContentManifest
    public let expressions: [Expression]
    public let units: [JourneyUnit]
    public let exercises: [ExerciseDefinition]

    public init(
        manifest: ContentManifest,
        expressions: [Expression],
        units: [JourneyUnit],
        exercises: [ExerciseDefinition] = []
    ) {
        self.manifest = manifest
        self.expressions = expressions
        self.units = units
        self.exercises = exercises
    }
}
