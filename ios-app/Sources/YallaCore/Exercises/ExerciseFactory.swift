public enum ExerciseFactoryError: Error, Equatable, Sendable {
    case missingLocalization(expressionID: String, locale: String)
    case unsupportedType(ExerciseDefinitionType)
}

public struct ExerciseFactory: Sendable {
    public init() {}

    public func make(
        type: ExerciseDefinitionType,
        expression: Expression,
        unitID: String,
        locale: String,
        distractors: [Expression] = []
    ) throws -> ExerciseDefinition {
        guard let localization = expression.localizations[locale] else {
            throw ExerciseFactoryError.missingLocalization(
                expressionID: expression.id,
                locale: locale
            )
        }

        let id = "generated.\(type.rawValue).\(expression.id)"

        switch type {
        case .multipleChoiceProduction:
            return ExerciseDefinition(
                id: id,
                type: type,
                unitID: unitID,
                expressionIDs: [expression.id],
                prompt: [locale: localization.naturalMeaning],
                answer: expression.canonicalArabizi,
                wrongAnswers: distractors.map(\.canonicalArabizi)
            )

        case .multipleChoiceMeaning:
            let wrongAnswers = try distractors.map { distractor in
                guard let meaning = distractor.localizations[locale]?.naturalMeaning else {
                    throw ExerciseFactoryError.missingLocalization(
                        expressionID: distractor.id,
                        locale: locale
                    )
                }
                return meaning
            }
            return ExerciseDefinition(
                id: id,
                type: type,
                unitID: unitID,
                expressionIDs: [expression.id],
                prompt: [locale: expression.canonicalArabizi],
                answer: localization.naturalMeaning,
                wrongAnswers: wrongAnswers
            )

        case .freeProduction:
            return ExerciseDefinition(
                id: id,
                type: type,
                unitID: unitID,
                expressionIDs: [expression.id],
                prompt: [locale: localization.naturalMeaning],
                answer: expression.canonicalArabizi,
                wrongAnswers: []
            )

        default:
            throw ExerciseFactoryError.unsupportedType(type)
        }
    }
}
