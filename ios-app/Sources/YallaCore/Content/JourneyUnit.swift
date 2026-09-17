public enum LevelBand: String, Codable, Equatable, Sendable {
    case a1
    case a2
    case b1Partial = "b1-partial"
}

public struct JourneyUnitLocalization: Codable, Equatable, Sendable {
    public let title: String
    public let description: String

    public init(title: String, description: String) {
        self.title = title
        self.description = description
    }
}

public struct JourneyUnit: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let level: LevelBand
    public let expressionIDs: [String]
    public let localizations: [String: JourneyUnitLocalization]

    public init(
        id: String,
        level: LevelBand,
        expressionIDs: [String],
        localizations: [String: JourneyUnitLocalization]
    ) {
        self.id = id
        self.level = level
        self.expressionIDs = expressionIDs
        self.localizations = localizations
    }

    public func localization(for locale: String) throws -> JourneyUnitLocalization {
        guard let localization = localizations[locale] else {
            throw LocalizationError.missingLocale(locale)
        }
        return localization
    }
}
