import Foundation

/// Builds a Journey unit's exercise sequence the way the website mixes a round:
/// choice (Arabizi → meaning), reverse (meaning → Arabizi), write, word order
/// and the unit's authored dialogue/grammar drills, with a matching board
/// closing every lesson.
///
/// Only approved content is reused: canonical Arabizi and stored meanings of
/// the unit's own expressions, and authored drills as they are. Nothing is
/// generated linguistically (no cut-out blanks, no new phrases). The sequence
/// is deterministic, so positional lesson IDs stay stable between launches.
public struct JourneyLessonComposer: Sendable {
    public let lessonSize: Int
    /// Authored drills are placed after this many generated exercises.
    public static let generatedPerAuthored = 4
    /// Word order needs enough words to be a real rearrangement.
    public static let wordOrderRange = 3...12

    private static let rotation: [ExerciseDefinitionType] = [
        .multipleChoiceMeaning, .multipleChoiceProduction, .freeProduction, .wordOrder
    ]

    public init(lessonSize: Int = JourneyLessonPlanner.defaultLessonSize) {
        self.lessonSize = max(2, lessonSize)
    }

    public func exercises(
        for unit: JourneyUnit,
        authored: [ExerciseDefinition],
        expressionsByID: [String: Expression],
        locale: String
    ) -> [ExerciseDefinition] {
        var seen = Set<String>()
        let unitExpressions = unit.expressionIDs
            .filter { seen.insert($0).inserted }
            .compactMap { expressionsByID[$0] }
            .filter { ExpressionRecallBuilder.supportsRecall($0, locale: locale) }
        let covered = ExpressionRecallBuilder.coveredExpressionIDs(authored, locale: locale)
        let pool = unitExpressions.filter { !covered.contains($0.id) }

        let generated = pool.enumerated().map { index, expression in
            exercise(for: expression, rotationIndex: index, unitID: unit.id, candidates: unitExpressions, locale: locale)
        }
        let mixed = interleave(generated: generated, authored: authored)
        return withMatchingBoards(mixed, unitID: unit.id, expressions: unitExpressions, locale: locale)
    }

    // MARK: Generated exercises

    private func exercise(
        for expression: Expression,
        rotationIndex: Int,
        unitID: String,
        candidates: [Expression],
        locale: String
    ) -> ExerciseDefinition {
        let factory = ExerciseFactory()
        let meaning = expression.localizations[locale]?.naturalMeaning ?? ""
        let type = Self.rotation[rotationIndex % Self.rotation.count]

        switch type {
        case .multipleChoiceMeaning, .multipleChoiceProduction:
            let distractors = self.distractors(for: expression, among: candidates, locale: locale)
            if !distractors.isEmpty,
               let made = try? factory.make(type: type, expression: expression, unitID: unitID, locale: locale, distractors: distractors) {
                return made
            }
        case .wordOrder:
            let words = expression.canonicalArabizi.split(whereSeparator: \.isWhitespace).count
            if Self.wordOrderRange.contains(words) {
                return ExerciseDefinition(
                    id: "generated.\(ExerciseDefinitionType.wordOrder.rawValue).\(expression.id)",
                    type: .wordOrder,
                    unitID: unitID,
                    expressionIDs: [expression.id],
                    prompt: [locale: meaning],
                    answer: expression.canonicalArabizi,
                    wrongAnswers: []
                )
            }
        default:
            break
        }
        // Writing the Arabizi works for every recallable expression.
        return ExerciseDefinition(
            id: "generated.\(ExerciseDefinitionType.freeProduction.rawValue).\(expression.id)",
            type: .freeProduction,
            unitID: unitID,
            expressionIDs: [expression.id],
            prompt: [locale: meaning],
            answer: expression.canonicalArabizi,
            wrongAnswers: []
        )
    }

    /// Up to three other expressions of the unit whose form and meaning both
    /// differ from the target, taken in unit order after the target. A
    /// candidate whose meaning shares a content word with the target's (for
    /// example two greetings both glossed "salut") is skipped, so only one
    /// option can be read as correct.
    private func distractors(for expression: Expression, among candidates: [Expression], locale: String) -> [Expression] {
        guard let start = candidates.firstIndex(where: { $0.id == expression.id }) else { return [] }
        let targetForm = AnswerNormalizer.normalize(expression.canonicalArabizi)
        let targetMeaning = AnswerNormalizer.normalize(expression.localizations[locale]?.naturalMeaning ?? "")
        let targetWords = Self.meaningWords(expression.localizations[locale]?.naturalMeaning ?? "")
        var forms: Set<String> = [targetForm]
        var meanings: Set<String> = [targetMeaning]
        var result: [Expression] = []
        for offset in 1..<max(candidates.count, 1) {
            let candidate = candidates[(start + offset) % candidates.count]
            let form = AnswerNormalizer.normalize(candidate.canonicalArabizi)
            let meaning = AnswerNormalizer.normalize(candidate.localizations[locale]?.naturalMeaning ?? "")
            guard !form.isEmpty, !meaning.isEmpty, !forms.contains(form), !meanings.contains(meaning),
                  Self.meaningWords(candidate.localizations[locale]?.naturalMeaning ?? "").isDisjoint(with: targetWords)
            else { continue }
            forms.insert(form)
            meanings.insert(meaning)
            result.append(candidate)
            if result.count == 3 { break }
        }
        return result
    }

    /// Content words of a meaning (three letters or more, accents folded).
    static func meaningWords(_ meaning: String) -> Set<String> {
        let folded = meaning.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: Locale(identifier: "ro_RO"))
        return Set(folded.split { !$0.isLetter }.map(String.init).filter { $0.count >= 3 })
    }

    // MARK: Sequencing

    private func interleave(generated: [ExerciseDefinition], authored: [ExerciseDefinition]) -> [ExerciseDefinition] {
        var result: [ExerciseDefinition] = []
        var generatedIndex = 0
        var authoredIndex = 0
        while generatedIndex < generated.count || authoredIndex < authored.count {
            let end = min(generatedIndex + Self.generatedPerAuthored, generated.count)
            result += generated[generatedIndex..<end]
            generatedIndex = end
            if authoredIndex < authored.count {
                result.append(authored[authoredIndex])
                authoredIndex += 1
            }
        }
        return result
    }

    /// Cuts the sequence into lessons of `lessonSize`, each closed by a matching
    /// board of that lesson's expressions. A lesson without enough distinct
    /// expressions for a board takes one more exercise instead, so lesson
    /// boundaries always fall every `lessonSize` exercises.
    private func withMatchingBoards(
        _ items: [ExerciseDefinition],
        unitID: String,
        expressions: [Expression],
        locale: String
    ) -> [ExerciseDefinition] {
        var result: [ExerciseDefinition] = []
        var index = 0
        var lesson = 0
        while index < items.count {
            lesson += 1
            let end = min(index + lessonSize - 1, items.count)
            let chunk = Array(items[index..<end])
            index = end
            let ids = chunk.compactMap(\.expressionIDs.first)
            if let board = MatchingExerciseBuilder().practice(
                expressionIDs: ids, expressions: expressions, unitID: unitID, locale: locale, limit: 5
            ) {
                result += chunk
                result.append(ExerciseDefinition(
                    id: "generated.matching.\(unitID).\(lesson)",
                    type: .matching,
                    unitID: unitID,
                    expressionIDs: board.expressionIDs,
                    prompt: board.prompt,
                    answer: board.answer,
                    wrongAnswers: board.wrongAnswers
                ))
            } else {
                result += chunk
                if index < items.count {
                    result.append(items[index])
                    index += 1
                }
            }
        }
        return result
    }
}
