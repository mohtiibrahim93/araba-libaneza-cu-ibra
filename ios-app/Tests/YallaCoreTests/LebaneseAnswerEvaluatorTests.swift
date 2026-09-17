import Testing
@testable import YallaCore

@Suite("Lebanese answer normalization")
struct LebaneseAnswerNormalizationTests {
    @Test("Exact normalization strips accents punctuation and casing")
    func exactNormalization() {
        #expect(LebaneseAnswerNormalizer.exact(" Baddé! ") == "badde")
    }

    @Test("Loose normalization maps kh and gh digits and collapses repeated vowels")
    func looseNormalization() {
        #expect(LebaneseAnswerNormalizer.loose("KhaaYYE ghalii") == "5ayye8ali")
    }

    @Test("Spelling normalization preserves word boundaries but removes typography")
    func spellingNormalization() {
        #expect(LebaneseAnswerNormalizer.spelling("  ma'-khallini   ghayr  ") == "ma5allini 8ayr")
    }
}

@Suite("Lebanese answer evaluator")
struct LebaneseAnswerEvaluatorTests {
    private let evaluator = LebaneseAnswerEvaluator()

    @Test("Canonical answer is distinguished from an explicit variant")
    func canonicalAndVariant() {
        let expression = Expression(
            id: "expr.what",
            canonicalArabizi: "shou",
            variants: [ExpressionVariant(value: "shu", kind: .spelling)],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "ce")]
        )

        #expect(evaluator.evaluate("shou", for: expression).kind == .canonical)
        #expect(evaluator.evaluate("shu", for: expression).kind == .acceptedVariant)
    }

    @Test("Nearby typo is not accepted without an explicit variant")
    func noEditDistanceGuessing() {
        let expression = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "salut")]
        )

        #expect(evaluator.evaluate("mar7ab", for: expression).kind == .incorrect)
    }

    @Test("Likely person gender or tense ending mismatch is classified separately")
    func endingMismatch() {
        let expression = Expression(
            id: "expr.want.you.m",
            canonicalArabizi: "baddak",
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "tu vrei")]
        )

        #expect(evaluator.evaluate("baddik", for: expression).kind == .endingMismatch)
    }
}
