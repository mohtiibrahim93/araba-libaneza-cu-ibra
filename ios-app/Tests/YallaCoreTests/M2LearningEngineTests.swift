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
    let day: TimeInterval = 86_400

    @Test("Wrong answer returns tomorrow and resets stage")
    func wrongTomorrow() {
        let current = ReviewState(
            seen: 3,
            correct: 2,
            streak: 2,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 3,
            dueAt: now
        )
        let next = ReviewScheduler().record(current, correct: false, hinted: false, at: now)
        #expect(next.reviewStage == 0)
        #expect(next.dueAt == now.addingTimeInterval(day))
    }

    @Test("Hinted correct does not earn clean review")
    func hintedCorrect() {
        let current = ReviewState(
            seen: 2,
            correct: 2,
            streak: 2,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 2,
            dueAt: now
        )
        let next = ReviewScheduler().record(current, correct: true, hinted: true, at: now)
        #expect(next.reviewStage == 0)
        #expect(next.correct == current.correct)
    }

    @Test("Early clean correct preserves schedule")
    func earlyCorrectPreserves() {
        let future = now.addingTimeInterval(3 * day)
        let current = ReviewState(
            seen: 3,
            correct: 3,
            streak: 2,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 2,
            dueAt: future
        )
        let next = ReviewScheduler().record(current, correct: true, hinted: false, at: now)
        #expect(next.reviewStage == current.reviewStage)
        #expect(next.dueAt == future)
    }

    @Test("Due clean correct advances stage and caps at final interval")
    func dueCorrectAdvances() {
        let scheduler = ReviewScheduler()
        let current = ReviewState(
            seen: 2,
            correct: 2,
            streak: 2,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 2,
            dueAt: now
        )
        let next = scheduler.record(current, correct: true, hinted: false, at: now)
        #expect(next.reviewStage == 3)

        let maxed = scheduler.record(
            ReviewState(
                seen: 5,
                correct: 5,
                streak: 3,
                wrong: false,
                lastAttemptAt: now.addingTimeInterval(-day),
                reviewStage: 4,
                dueAt: now
            ),
            correct: true,
            hinted: false,
            at: now
        )
        #expect(maxed.reviewStage == 4)
    }
}

@Suite("Mastery")
struct MasteryTests {
    @Test("Recognition success does not increase speaking mastery")
    func skillIsolation() {
        let mastery = MasteryUpdater().record(
            ExpressionMastery(expressionID: "expr.hello"),
            skills: [.recognition],
            correct: true,
            hinted: false,
            at: Date(timeIntervalSince1970: 1_700_000_000)
        )

        #expect(mastery.progress(for: .recognition).cleanCorrect == 1)
        #expect(mastery.progress(for: .speaking).attempts == 0)
    }

    @Test("Hinted answer records evidence but not clean mastery credit")
    func hintPenalty() {
        let updater = MasteryUpdater()
        let now = Date(timeIntervalSince1970: 1_700_000_000)
        let clean = updater.record(
            ExpressionMastery(expressionID: "expr.hello"),
            skills: [.production],
            correct: true,
            hinted: false,
            at: now
        )
        let hinted = updater.record(
            ExpressionMastery(expressionID: "expr.hello"),
            skills: [.production],
            correct: true,
            hinted: true,
            at: now
        )

        #expect(clean.progress(for: .production).cleanCorrect == 1)
        #expect(hinted.progress(for: .production).cleanCorrect == 0)
        #expect(hinted.progress(for: .production).correctAttempts == 1)
    }
}
