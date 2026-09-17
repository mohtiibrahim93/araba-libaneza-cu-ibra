public struct ContentPackage: Codable, Equatable, Sendable {
    public let manifest: ContentManifest
    public let expressions: [Expression]
    public let units: [JourneyUnit]

    public init(manifest: ContentManifest, expressions: [Expression], units: [JourneyUnit]) {
        self.manifest = manifest
        self.expressions = expressions
        self.units = units
    }
}
