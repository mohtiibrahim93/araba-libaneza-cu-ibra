import Foundation

/// A hint that helps without giving the answer away: the first letter and
/// the number of words. Used until the teacher writes hints (a definition
/// or a synonym) for each exercise.
public enum AnswerHint {
    public static func clue(for answer: String) -> String {
        let words = answer
            .components(separatedBy: .whitespacesAndNewlines)
            .filter { word in word.unicodeScalars.contains(where: CharacterSet.alphanumerics.contains) }
        guard let first = words.first?.first(where: { $0.isLetter || $0.isNumber }) else { return "" }
        let count = words.count == 1 ? "1 cuvânt" : "\(words.count) cuvinte"
        return "Începe cu „\(first)” · \(count)"
    }

    /// For matching: one unmatched item and the first letter of its pair.
    public static func matchingClue(left: String, right: String) -> String {
        guard let first = right.first(where: { $0.isLetter || $0.isNumber }) else { return "" }
        return "„\(left)” → începe cu „\(first)”"
    }
}
