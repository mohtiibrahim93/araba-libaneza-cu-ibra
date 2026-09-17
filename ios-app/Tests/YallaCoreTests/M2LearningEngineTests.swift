import Foundation
import Testing
@testable import YallaCore

@Suite("Answer normalization")
struct AnswerNormalizationTests {
    @Test("Normalization is case-insensitive and strips punctuation")
    func basicNormalization() {
        #expect(AnswerNormalizer.normalize(" Mar7aba! ") == "mar7aba")
    }

    @Test("kh and gh normalize to Arabizi digits")
    func digraphNormalization() {
        #expect(AnswerNormalizer.normalize("khalas") == AnswerNormalizer.normalize("5alas"))
        #expect(AnswerNormalizer.normalize("ghali") == AnswerNormalizer.normalize("8ali"))
    }

    @Test("Repeated vowels collapse but doubled consonants remain meaningful")
    func vowelCollapseOnly() {
        #expect(AnswerNormalizer.normalize("shouu") == AnswerNormalizer.normalize("shou"))
        #expect(AnswerNormalizer.normalize("mara") != AnswerNormalizer.normalize("marra"))
    }
}

@Suite("Answer evaluation")
struct AnswerEvaluationTests {
    @Test("Canonical answer is exact")
    func exact() {
        let result = AnswerEvaluator().evaluate(
            answer: "mar7aba",
            canonical: "mar7aba",
            spellingVariants: [],
            pronunciationVariants: []
        )
        #expect(result == .exact)
    }

    @Test("Explicit variants are accepted and typed")
    func variants() {
        let evaluator = AnswerEvaluator()
        #expect(evaluator.evaluate(answer: "shu", canonical: "shou", spellingVariants: ["shu"], pronunciationVariants: []) == .acceptedSpellingVariant)
        #expect(evaluator.evaluate(answer: "sho", canonical: "shou", spellingVariants: [], pronunciationVariants: ["sho"]) == .acceptedPronunciationVariant)
    }
}

@Suite("SRS scheduling")
struct SRSTests {
    let now = Date(timeIntervalSince1970: 1_700_000_000)

    @Test("Wrong answer returns tomorrow and resets stage")
    func wrongTomorrow() {
        let current = ReviewState(stage: 3, dueAt: now)
        let next = DefaultReviewScheduler().nextState(current: current, outcome: .incorrect, now: now)
        #expect(next.stage == 0)
        #expect(next.dueAt == Calendar(identifier: .gregorian).date(byAdding: .day, value: 1, to: now))
    }

    @Test("Hinted correct does not earn clean review")
    func hintedCorrect() {
        let current = ReviewState(stage: 2, dueAt: now)
        let next = DefaultReviewScheduler().nextState(current: current, outcome: .correct(usedHint: true), now: now)
        #expect(next.stage == 0)
    }

    @Test("Early clean correct preserves schedule")
    func earlyCorrectPreserves() {
        let future = Calendar(identifier: .gregorian).date(byAdding: .day, value: 3, to: now)!
        let current = ReviewState(stage: 2, dueAt: future)
        let next = DefaultReviewScheduler().nextState(current: current, outcome: .correct(usedHint: false), now: now)
        #expect(next == current)
    }

    @Test("Due clean correct advances stage and caps at final interval")
    func dueCorrectAdvances() {
        let scheduler = DefaultReviewScheduler()
        let current = ReviewState(stage: 2, dueAt: now)
        let next = scheduler.nextState(current: current, outcome: .correct(usedHint: false), now: now)
        #expect(next.stage == 3)

        let maxed = scheduler.nextState(
            current: ReviewState(stage: 4, dueAt: now),
            outcome: .correct(usedHint: false),
            now: now
        )
        #expect(maxed.stage == 4)
    }
}

@Suite("Mastery")
struct MasteryTests {
    @Test("Recognition success does not increase speaking mastery")
    func skillIsolation() {
        var mastery = ExpressionMastery(expressionID: "expr.hello")
        let attempt = Attempt(
            expressionID: "expr.hello",
            skill: .recognition,
            firstTryCorrect: true,
            usedHint: false,
            responseTime: 1.2
        )

        MasteryEngine().apply(attempt: attempt, to: &mastery)

        #expect(mastery.score(for: .recognition) > 0)
        #expect(mastery.score(for: .speaking) == 0)
    }

    @Test("Hinted answer is useful but weaker than clean success")
    func hintPenalty() {
        var clean = ExpressionMastery(expressionID: "expr.hello")
        var hinted = ExpressionMastery(expressionID: "expr.hello")
        let engine = MasteryEngine()

        engine.apply(
            attempt: Attempt(expressionID: "expr.hello", skill: .production, firstTryCorrect: true, usedHint: false, responseTime: 1),
            to: &clean
        )
        engine.apply(
            attempt: Attempt(expressionID: "expr.hello", skill: .production, firstTryCorrect: true, usedHint: true, responseTime: 1),
            to: &hinted
        )

        #expect(clean.score(for: .production) > hinted.score(for: .production))
    }
}
