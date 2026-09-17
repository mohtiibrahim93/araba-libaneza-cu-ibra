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
    public let localizations: [String: ExpressionLocalization]

    public init(
        id: String,
        canonicalArabizi: String,
        arabicScript: String? = nil,
        variants: [ExpressionVariant] = [],
        localizations: [String: ExpressionLocalization]
    ) {
        self.id = id
        self.canonicalArabizi = canonicalArabizi
        self.arabicScript = arabicScript
        self.variants = variants
        self.localizations = localizations
    }

    public func localization(for locale: String) throws -> ExpressionLocalization {
        guard let localization = localizations[locale] else {
            throw LocalizationError.missingLocale(locale)
        }
        return localization
    }
}
