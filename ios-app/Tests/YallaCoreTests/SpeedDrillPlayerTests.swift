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
}
