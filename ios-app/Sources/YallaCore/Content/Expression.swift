import Foundation

public enum ExpressionVariantKind: String, Codable, Equatable, Sendable {
    case spelling
    case pronunciation
}

public struct ExpressionVariant: Codable, Equatable, Sendable {
    public let value: String
    public let kind: ExpressionVariantKind

    public init(value: String, kind: ExpressionVariantKind) {
        self.value = value
        self.kind = kind
    }
}

public struct ExpressionLocalization: Codable, Equatable, Sendable {
    public let naturalMeaning: String
    public let literalMeaning: String?
    public let pragmaticMeaning: String?

    public init(
        naturalMeaning: String,
        literalMeaning: String? = nil,
        pragmaticMeaning: String? = nil
    ) {
        self.naturalMeaning = naturalMeaning
        self.literalMeaning = literalMeaning
        self.pragmaticMeaning = pragmaticMeaning
    }
}

public enum LocalizationError: Error, Equatable, Sendable {
    case missingLocale(String)
}

public struct Expression: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let canonicalArabizi: String
    public let arabicScript: String?
    public let variants: [ExpressionVariant]
    public let levelTags: [LevelBand]
    public let topics: [String]
    public let localizations: [String: ExpressionLocalization]

    public init(
        id: String,
        canonicalArabizi: String,
        arabicScript: String? = nil,
        variants: [ExpressionVariant] = [],
        levelTags: [LevelBand] = [],
        topics: [String] = [],
        localizations: [String: ExpressionLocalization]
    ) {
        self.id = id
        self.canonicalArabizi = canonicalArabizi
        self.arabicScript = arabicScript
        self.variants = variants
        self.levelTags = levelTags
        self.topics = topics
        self.localizations = localizations
    }

    public func localization(for locale: String) throws -> ExpressionLocalization {
        guard let localization = localizations[locale] else {
            throw LocalizationError.missingLocale(locale)
        }
        return localization
    }

    private enum CodingKeys: String, CodingKey {
        case id, canonicalArabizi, arabicScript, variants, levelTags, topics, localizations
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        canonicalArabizi = try container.decode(String.self, forKey: .canonicalArabizi)
        arabicScript = try container.decodeIfPresent(String.self, forKey: .arabicScript)
        variants = try container.decodeIfPresent([ExpressionVariant].self, forKey: .variants) ?? []
        levelTags = try container.decodeIfPresent([LevelBand].self, forKey: .levelTags) ?? []
        topics = try container.decodeIfPresent([String].self, forKey: .topics) ?? []
        localizations = try container.decode([String: ExpressionLocalization].self, forKey: .localizations)
    }
}
