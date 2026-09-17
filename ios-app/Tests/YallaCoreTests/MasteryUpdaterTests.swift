import Foundation
import Testing
@testable import YallaCore

@Suite("Skill-separated mastery")
struct MasteryUpdaterTests {
    private let updater = MasteryUpdater()
    private let now = Date(timeIntervalSince1970: 2_000_000_000)

    @Test("Recognition evidence does not imply production mastery")
    func recognitionDoesNotImplyProduction() {
        let initial = ExpressionMastery(expressionID: "expr.water")

        let updated = updater.record(
            initial,
            skills: [.recognition],
            correct: true,
            hinted: false,
            at: now
        )

        #expect(updated.progress(for: .recognition).attempts == 1)
        #expect(updated.progress(for: .recognition).cleanCorrect == 1)
        #expect(updated.progress(for: .production).attempts == 0)
        #expect(updated.progress(for: .production).cleanCorrect == 0)
    }

    @Test("Wrong production attempt is evidence only for production")
    func wrongProductionAttempt() {
        let initial = ExpressionMastery(expressionID: "expr.water")

        let updated = updater.record(
            initial,
            skills: [.production],
            correct: false,
            hinted: false,
            at: now
        )

        #expect(updated.progress(for: .production).attempts == 1)
        #expect(updated.progress(for: .production).cleanCorrect == 0)
        #expect(updated.progress(for: .recognition).attempts == 0)
    }

    @Test("Hinted correct records an attempt but not clean mastery credit")
    func hintedCorrectNotClean() {
        let initial = ExpressionMastery(expressionID: "expr.want")

        let updated = updater.record(
            initial,
            skills: [.recall, .production],
            correct: true,
            hinted: true,
            at: now
        )

        #expect(updated.progress(for: .recall).attempts == 1)
        #expect(updated.progress(for: .recall).cleanCorrect == 0)
        #expect(updated.progress(for: .production).attempts == 1)
        #expect(updated.progress(for: .production).cleanCorrect == 0)
    }

    @Test("One exercise may provide evidence for multiple explicit skills")
    func multipleSkillSignals() {
        let initial = ExpressionMastery(expressionID: "expr.hello")

        let updated = updater.record(
            initial,
            skills: [.listening, .meaning],
            correct: true,
            hinted: false,
            at: now
        )

        #expect(updated.progress(for: .listening).cleanCorrect == 1)
        #expect(updated.progress(for: .meaning).cleanCorrect == 1)
        #expect(updated.progress(for: .speaking).attempts == 0)
    }

    @Test("Mastery remains attached to stable expression ID")
    func stableIdentity() {
        let initial = ExpressionMastery(expressionID: "expr.want.first-person")
        let updated = updater.record(initial, skills: [.production], correct: true, hinted: false, at: now)

        #expect(updated.expressionID == "expr.want.first-person")
    }
}
