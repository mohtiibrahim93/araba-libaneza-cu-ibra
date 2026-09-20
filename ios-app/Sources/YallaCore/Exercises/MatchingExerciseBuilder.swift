import Foundation

/// Builds recognition pairs only from existing, explicitly linked expression meanings.
public struct MatchingExerciseBuilder: Sendable {
    public init() {}

    public func pairs(for exercise: ExerciseDefinition, expressions: [Expression], locale: String) -> [MatchingPair]? {
        guard exercise.type == .matching, exercise.expressionIDs.count >= 2,
              Set(exercise.expressionIDs).count == exercise.expressionIDs.count else { return nil }
        var pairs: [MatchingPair] = []
        var leftLabels = Set<String>()
        var rightLabels = Set<String>()
        for id in exercise.expressionIDs {
            let matches = expressions.filter { $0.id == id }
            guard matches.count == 1, let expression = matches.first,
                  let meaning = expression.localizations[locale]?.naturalMeaning else { return nil }
            let left = AnswerNormalizer.normalize(expression.canonicalArabizi)
            let right = AnswerNormalizer.normalize(meaning)
            guard !left.isEmpty, !right.isEmpty,
                  leftLabels.insert(left).inserted, rightLabels.insert(right).inserted else { return nil }
            pairs.append(MatchingPair(id: id, left: expression.canonicalArabizi, right: meaning))
        }
        return pairs
    }

    /// A small optional Journey board; this never rewrites the underlying content.
    public func practice(
        expressionIDs: [String], expressions: [Expression], unitID: String,
        locale: String, limit: Int = 6
    ) -> ExerciseDefinition? {
        guard limit >= 2 else { return nil }
        var chosen: [String] = []
        var leftLabels = Set<String>()
        var rightLabels = Set<String>()
        for id in expressionIDs {
            guard !chosen.contains(id) else { continue }
            let matches = expressions.filter { $0.id == id }
            guard matches.count == 1, let expression = matches.first,
                  let meaning = expression.localizations[locale]?.naturalMeaning else { continue }
            let left = AnswerNormalizer.normalize(expression.canonicalArabizi)
            let right = AnswerNormalizer.normalize(meaning)
            guard !left.isEmpty, !right.isEmpty,
                  !leftLabels.contains(left), !rightLabels.contains(right) else { continue }
            chosen.append(id)
            leftLabels.insert(left)
            rightLabels.insert(right)
            if chosen.count == limit { break }
        }
        guard chosen.count >= 2 else { return nil }
        return ExerciseDefinition(
            id: "generated.matching." + unitID, type: .matching, unitID: unitID,
            expressionIDs: chosen, prompt: [locale: "Potrivește expresiile cu sensul lor"],
            answer: "", wrongAnswers: []
        )
    }
}
