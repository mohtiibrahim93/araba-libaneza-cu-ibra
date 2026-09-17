public struct ContentManifest: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let contentVersion: String
    public let defaultLearnerLocale: String

    public init(schemaVersion: Int, contentVersion: String, defaultLearnerLocale: String) {
        self.schemaVersion = schemaVersion
        self.contentVersion = contentVersion
        self.defaultLearnerLocale = defaultLearnerLocale
    }
}
