import Foundation

public enum AnswerNormalizer {
    public static func normalize(_ input: String) -> String {
        let folded = input.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "en_US_POSIX"))
        let mapped = folded
            .replacingOccurrences(of: "kh", with: "5")
            .replacingOccurrences(of: "gh", with: "8")
        return mapped.unicodeScalars
            .filter { CharacterSet.alphanumerics.contains($0) }
            .map(String.init)
            .joined()
            .lowercased()
    }
}
