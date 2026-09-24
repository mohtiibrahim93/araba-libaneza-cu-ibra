import Foundation

/// Supplements authored drills using only stored canonical forms and meanings.
/// It never guesses expression links for existing drills.
public struct ExpressionRecallBuilder: Sendable {
    public init() {}

    public func supplement(
        _ exercises: [ExerciseDefinition],
        from package: ContentPackage,
        expressionIDs: Set<String>? = nil,
        locale: String
    ) -> [ExerciseDefinition] {
        let covered = Self.coveredExpressionIDs(exercises, locale: locale)
        var unitByExpressionID: [String: String] = [:]
        for unit in package.units {
            for id in unit.expressionIDs where unitByExpressionID[id] == nil {
                unitByExpressionID[id] = unit.id
            }
        }
        let factory = ExerciseFactory()
        let recall = package.expressions.compactMap { expression -> ExerciseDefinition? in
            guard !covered.contains(expression.id),
                  expressionIDs?.contains(expression.id) ?? true,
                  let meaning = expression.localizations[locale]?.naturalMeaning,
                  !meaning.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
                  !expression.canonicalArabizi.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            else { return nil }
            return try? factory.make(
                type: .freeProduction,
                expression: expression,
                unitID: unitByExpressionID[expression.id] ?? "review",
                locale: locale
            )
        }
        return exercises + recall
    }

    /// Expressions already practised by an authored exercise, so no recall item is added.
    public static func coveredExpressionIDs(_ exercises: [ExerciseDefinition], locale: String) -> Set<String> {
        Set(exercises.compactMap { exercise -> String? in
            guard exercise.prompt[locale] != nil,
                  !exercise.answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            else { return nil }
            switch exercise.type {
            case .multipleChoiceProduction, .multipleChoiceMeaning, .freeProduction,
                 .reverseProduction, .dialogueResponse, .fillGap, .grammarDrill,
                 .transformation, .wordOrder:
                return exercise.expressionIDs.first
            default:
                return nil
            }
        })
    }

    /// Whether an expression has the stored form and meaning a recall item needs.
    public static func supportsRecall(_ expression: Expression, locale: String) -> Bool {
        guard let meaning = expression.localizations[locale]?.naturalMeaning else { return false }
        return !meaning.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && !expression.canonicalArabizi.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
}
