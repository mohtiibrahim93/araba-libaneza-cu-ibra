import Foundation

public enum AnswerNormalizer {
    public static func normalize(_ input: String) -> String {
        let folded = input.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "en_US_POSIX"))
        let mapped = folded
            .replacingOccurrences(of: "kh", with: "5")
            .replacingOccurrences(of: "gh", with: "8")
        let compact = mapped.unicodeScalars
            .filter { CharacterSet.alphanumerics.contains($0) }
            .map(String.init)
            .joined()
            .lowercased()
        return collapseRepeatedVowels(compact)
    }

    private static func collapseRepeatedVowels(_ input: String) -> String {
        let vowels = Set("aeiou")
        var result = ""
        var previous: Character?

        for character in input {
            if character == previous, vowels.contains(character) {
                continue
            }
            result.append(character)
            previous = character
        }
        return result
    }
}
