import Foundation

public enum LebaneseAnswerNormalizer {
    public static func exact(_ value: String) -> String {
        asciiAlphanumericOnly(fold(value))
    }

    public static func loose(_ value: String) -> String {
        let converted = replaceDigraphs(fold(value))
        let collapsed = collapseRepeatedVowels(converted)
        return asciiAlphanumericOnly(collapsed)
    }

    public static func spelling(_ value: String) -> String {
        var converted = replaceDigraphs(fold(value))
        converted = converted
            .replacingOccurrences(of: "’", with: "")
            .replacingOccurrences(of: "‘", with: "")
            .replacingOccurrences(of: "'", with: "")
            .replacingOccurrences(of: "-", with: "")

        let scalars = converted.unicodeScalars.filter { scalar in
            isASCIIAlphaNumeric(scalar) || CharacterSet.whitespacesAndNewlines.contains(scalar)
        }
        return String(String.UnicodeScalarView(scalars))
            .split(whereSeparator: { $0.isWhitespace })
            .joined(separator: " ")
    }

    private static func fold(_ value: String) -> String {
        value
            .folding(options: [.diacriticInsensitive], locale: Locale(identifier: "en_US_POSIX"))
            .lowercased()
    }

    private static func replaceDigraphs(_ value: String) -> String {
        value
            .replacingOccurrences(of: "kh", with: "5")
            .replacingOccurrences(of: "gh", with: "8")
    }

    private static func collapseRepeatedVowels(_ value: String) -> String {
        var output = ""
        var previous: UnicodeScalar?
        for scalar in value.unicodeScalars {
            if let previous, previous == scalar, "aeiou".unicodeScalars.contains(scalar) {
                continue
            }
            output.unicodeScalars.append(scalar)
            previous = scalar
        }
        return output
    }

    private static func asciiAlphanumericOnly(_ value: String) -> String {
        let scalars = value.unicodeScalars.filter(isASCIIAlphaNumeric)
        return String(String.UnicodeScalarView(scalars))
    }

    private static func isASCIIAlphaNumeric(_ scalar: UnicodeScalar) -> Bool {
        (scalar.value >= 48 && scalar.value <= 57) || (scalar.value >= 97 && scalar.value <= 122)
    }
}

public enum AnswerEvaluationKind: Equatable, Sendable {
    case canonical
    case acceptedVariant
    case endingMismatch
    case incorrect
}

public struct AnswerEvaluation: Equatable, Sendable {
    public let kind: AnswerEvaluationKind
    public let canonicalAnswer: String

    public init(kind: AnswerEvaluationKind, canonicalAnswer: String) {
        self.kind = kind
        self.canonicalAnswer = canonicalAnswer
    }
}

public struct LebaneseAnswerEvaluator: Sendable {
    public init() {}

    public func evaluate(_ answer: String, for expression: Expression) -> AnswerEvaluation {
        let normalizedAnswer = LebaneseAnswerNormalizer.spelling(answer)
        let canonical = LebaneseAnswerNormalizer.spelling(expression.canonicalArabizi)

        if normalizedAnswer == canonical {
            return AnswerEvaluation(kind: .canonical, canonicalAnswer: expression.canonicalArabizi)
        }

        if expression.variants.contains(where: { LebaneseAnswerNormalizer.spelling($0.value) == normalizedAnswer }) {
            return AnswerEvaluation(kind: .acceptedVariant, canonicalAnswer: expression.canonicalArabizi)
        }

        if likelyEndingMismatch(canonical: canonical, answer: normalizedAnswer) {
            return AnswerEvaluation(kind: .endingMismatch, canonicalAnswer: expression.canonicalArabizi)
        }

        return AnswerEvaluation(kind: .incorrect, canonicalAnswer: expression.canonicalArabizi)
    }

    public func accepts(_ answer: String, for expression: Expression) -> Bool {
        let kind = evaluate(answer, for: expression).kind
        return kind == .canonical || kind == .acceptedVariant
    }

    private func likelyEndingMismatch(canonical: String, answer: String) -> Bool {
        let canonicalWords = canonical.split(separator: " ").map(String.init)
        let answerWords = answer.split(separator: " ").map(String.init)
        guard canonicalWords.count == answerWords.count else { return false }

        return zip(canonicalWords, answerWords).contains { expected, actual in
            guard expected != actual, expected.count > 3 else { return false }
            return droppingLastTwo(expected) == droppingLastTwo(actual)
        }
    }

    private func droppingLastTwo(_ value: String) -> String {
        guard value.count >= 2 else { return "" }
        return String(value.dropLast(2))
    }
}
