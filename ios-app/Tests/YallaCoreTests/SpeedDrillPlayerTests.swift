import Testing
@testable import YallaCore

@Suite("Interactive speed drill player")
struct SpeedDrillPlayerTests {
    private let cards = [
        SpeedDrillCard(id: "expr.hello", lebanese: "mar7aba", learnerMeaning: "salut"),
        SpeedDrillCard(id: "expr.thanks", lebanese: "merci", learnerMeaning: "mulțumesc")
    ]

    @Test("Learner-language direction presents meaning and expects Lebanese")
    func learnerLanguagePrompt() throws {
        let player = SpeedDrillPlayer(
            cards: cards,
            direction: .learnerLanguageToLebanese
        )

        let prompt = try #require(player.currentPrompt)
        #expect(prompt.expressionID == "expr.hello")
        #expect(prompt.question == "salut")
        #expect(prompt.answer == "mar7aba")
    }

    @Test("Lebanese direction presents Lebanese and expects learner meaning")
    func lebanesePrompt() throws {
        let player = SpeedDrillPlayer(
            cards: cards,
            direction: .lebaneseToLearnerLanguage
        )

        let prompt = try #require(player.currentPrompt)
        #expect(prompt.question == "mar7aba")
        #expect(prompt.answer == "salut")
    }

    @Test("Recording an outcome advances and wraps through the available cards")
    func recordAdvancesAndWraps() throws {
        var player = SpeedDrillPlayer(
            cards: cards,
            direction: .learnerLanguageToLebanese
        )

        #expect(player.currentPrompt?.expressionID == "expr.hello")
        let recordedCorrect = player.record(.correct, responseTime: 1.4)
        #expect(recordedCorrect)
        #expect(player.currentPrompt?.expressionID == "expr.thanks")
        let recordedWrong = player.record(.wrong, responseTime: 2.1)
        #expect(recordedWrong)
        #expect(player.currentPrompt?.expressionID == "expr.hello")

        #expect(player.session.metrics.seen == 2)
        #expect(player.session.metrics.correct == 1)
        #expect(player.session.metrics.wrong == 1)
        #expect(player.session.attempts.first?.responseTime == 1.4)
    }

    @Test("Empty card sets cannot fabricate attempts")
    func emptyCards() {
        var player = SpeedDrillPlayer(
            cards: [],
            direction: .learnerLanguageToLebanese
        )

        #expect(player.currentPrompt == nil)
        let recorded = player.record(.correct, responseTime: 1)
        #expect(!recorded)
        #expect(player.session.attempts.isEmpty)
    }

    @Test("Fluency rate uses actual elapsed time when a drill ends early")
    func actualElapsedRate() {
        var player = SpeedDrillPlayer(
            cards: cards,
            direction: .learnerLanguageToLebanese
        )

        let first = player.record(.correct, responseTime: 1)
        let second = player.record(.correct, responseTime: 1)
        #expect(first)
        #expect(second)

        let metrics = player.session.metrics(elapsedSeconds: 30)
        #expect(metrics.correctPerMinute == 4)
    }

    @Test("Expiry delegates to the two-minute session clock")
    func expiry() {
        let player = SpeedDrillPlayer(
            cards: cards,
            direction: .learnerLanguageToLebanese
        )

        #expect(player.remainingSeconds(atElapsed: 0) == 120)
        #expect(player.remainingSeconds(atElapsed: 119) == 1)
        #expect(player.isExpired(atElapsed: 120))
    }

    @Test("Multiple choice offers four distinct answers, one right, none overlapping in meaning")
    func choices() {
        let deck = [
            SpeedDrillCard(id: "a", lebanese: "Mar7aba", learnerMeaning: "Bună! / Salut!"),
            SpeedDrillCard(id: "b", lebanese: "Mar7abten", learnerMeaning: "Salut! (răspuns)"),
            SpeedDrillCard(id: "c", lebanese: "Beet", learnerMeaning: "casă"),
            SpeedDrillCard(id: "d", lebanese: "Kalb", learnerMeaning: "câine"),
            SpeedDrillCard(id: "e", lebanese: "Khebez", learnerMeaning: "pâine"),
            SpeedDrillCard(id: "f", lebanese: "Sayyara", learnerMeaning: "mașină")
        ]
        let player = SpeedDrillPlayer(cards: deck, direction: .lebaneseToLearnerLanguage)
        let options = player.choices()
        #expect(options.count == 4)
        #expect(options.contains("Bună! / Salut!"))
        #expect(!options.contains("Salut! (răspuns)"))
        #expect(Set(options).count == 4)
    }

    @Test("Current streak and speed rate follow the recorded outcomes")
    func streakAndSpeed() {
        var session = SpeedDrillSession(direction: .learnerLanguageToLebanese, durationSeconds: 120)
        session.record(expressionID: "a", outcome: .correct, responseTime: 1)
        session.record(expressionID: "b", outcome: .wrong, responseTime: 1)
        session.record(expressionID: "c", outcome: .correct, responseTime: 1)
        session.record(expressionID: "d", outcome: .correct, responseTime: 1)
        session.record(expressionID: "e", outcome: .skipped, responseTime: 1)
        session.record(expressionID: "f", outcome: .correct, responseTime: 1)
        let metrics = session.metrics(elapsedSeconds: 60)
        #expect(metrics.currentCorrectStreak == 1)
        #expect(metrics.bestCorrectStreak == 2)
        // Five answered (four correct, one wrong) in one minute; the skip does not count.
        #expect(metrics.answeredPerMinute == 5)
        #expect(metrics.correctPerMinute == 4)
    }
}
