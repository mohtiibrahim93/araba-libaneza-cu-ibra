public enum EvaluationResult: Equatable, Sendable {
    case exact
    case acceptedSpellingVariant
    case acceptedPronunciationVariant
    case incorrect
}

public struct AnswerEvaluator: Sendable {
    public init() {}

    public func evaluate(
        answer: String,
        canonical: String,
        spellingVariants: [String],
        pronunciationVariants: [String]
    ) -> EvaluationResult {
        let normalized = AnswerNormalizer.normalize(answer)

        if normalized == AnswerNormalizer.normalize(canonical) {
            return .exact
        }
        if spellingVariants.contains(where: { AnswerNormalizer.normalize($0) == normalized }) {
            return .acceptedSpellingVariant
        }
        if pronunciationVariants.contains(where: { AnswerNormalizer.normalize($0) == normalized }) {
            return .acceptedPronunciationVariant
        }
        return .incorrect
    }
}
