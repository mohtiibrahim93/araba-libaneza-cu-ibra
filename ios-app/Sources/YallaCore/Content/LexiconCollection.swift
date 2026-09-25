public struct LexiconCollectionLocalization: Codable, Equatable, Sendable {
    public let title: String
    public let description: String

    public init(title: String, description: String) {
        self.title = title
        self.description = description
    }
}

public struct LexiconCollection: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let expressionIDs: [String]
    public let localizations: [String: LexiconCollectionLocalization]

    public init(
        id: String,
        expressionIDs: [String],
        localizations: [String: LexiconCollectionLocalization]
    ) {
        self.id = id
        self.expressionIDs = expressionIDs
        self.localizations = localizations
    }

    public func localization(for locale: String) throws -> LexiconCollectionLocalization {
        guard let localization = localizations[locale] else {
            throw LocalizationError.missingLocale(locale)
        }
        return localization
    }

    /// False for the numbered general word lists ("Cuvinte și acțiuni · N",
    /// `v-index-*`), which split one big vocabulary list into parts rather
    /// than grouping words by topic.
    public var isTheme: Bool { !id.hasPrefix("v-index-") }
}
