import Foundation

/// Controls supported by the native text/choice session. Dedicated media
/// and matching flows must not be presented as a generic text question.
public enum NativeExerciseInput: Equatable, Sendable {
    case text
    case choices([String])
    case wordOrder(WordOrderState)
    case matching(MatchingState)
    case unavailable

    public init(exercise: ExerciseDefinition, expressions: [Expression] = [], locale: String = "ro") {
        if exercise.type == .matching {
            if let pairs = MatchingExerciseBuilder().pairs(for: exercise, expressions: expressions, locale: locale) {
                self = .matching(MatchingState(pairs: pairs))
            } else {
                self = .unavailable
            }
            return
        }
        guard !exercise.answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            self = .unavailable
            return
        }
        var seen = Set<String>()
        let choices = ([exercise.answer] + exercise.wrongAnswers).filter {
            let normalized = AnswerNormalizer.normalize($0)
            return !normalized.isEmpty && seen.insert(normalized).inserted
        }.sorted()
        switch exercise.type {
        case .multipleChoiceProduction, .multipleChoiceMeaning:
            self = choices.count > 1 ? .choices(choices) : .unavailable
        case .grammarDrill, .dialogueResponse, .fillGap, .transformation:
            self = choices.count > 1 ? .choices(choices) : .text
        case .freeProduction, .reverseProduction:
            self = .text
        case .wordOrder:
            let tokens = WordOrderState(canonicalAnswer: exercise.answer).tokens
            self = .wordOrder(WordOrderState(
                canonicalAnswer: exercise.answer,
                presentedTokenOrder: WordOrderState.scrambledOrder(count: tokens.count, seed: exercise.id)
            ))
        default:
            self = .unavailable
        }
    }

    public var isChoice: Bool {
        if case .choices = self { return true }
        return false
    }
}
