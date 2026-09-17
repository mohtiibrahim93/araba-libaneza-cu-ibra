import Foundation

public struct ExpressionLocalization: Codable, Equatable, Sendable {
    public let naturalMeaning: String

    public init(naturalMeaning: String) {
        self.naturalMeaning = naturalMeaning
    }
}

public enum LocalizationError: Error, Equatable, Sendable {
    case missingLocale(String)
}

public struct Expression: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let canonicalArabizi: String
    public let arabicScript: String?
    public let localizations: [String: ExpressionLocalization]

    public init(
        id: String,
        canonicalArabizi: String,
        arabicScript: String? = nil,
        localizations: [String: ExpressionLocalization]
    ) {
        self.id = id
        self.canonicalArabizi = canonicalArabizi
        self.arabicScript = arabicScript
        self.localizations = localizations
    }

    public func localization(for locale: String) throws -> ExpressionLocalization {
        guard let localization = localizations[locale] else {
            throw LocalizationError.missingLocale(locale)
        }
        return localization
    }
}
