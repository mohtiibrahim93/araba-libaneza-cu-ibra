import Foundation
import Testing
@testable import YallaCore

@Suite("Dress-up game")
struct DressUpGameTests {
    private let hat = WardrobeItem(id: "hat", slot: .head, name: "Șapcă", price: 5)
    private let apron = WardrobeItem(id: "apron", slot: .top, name: "Șorț", price: 0, unlockUnitID: "a1-restaurant")

    @Test("Coins: 3 first try, 1 second try, then none; scene bonus once, then replay bonus")
    func rewards() {
        #expect(GameRewards.coins(wrongAttempts: 0) == 3)
        #expect(GameRewards.coins(wrongAttempts: 1) == 1)
        #expect(GameRewards.coins(wrongAttempts: 2) == 0)
        var state = DressUpGameState()
        #expect(state.completeScene(unitID: "u", day: "d") == 10)
        #expect(state.completeScene(unitID: "u", day: "d") == 2)
        #expect(state.coins == 12)
    }

    @Test("Buying needs enough coins, wears the item and cannot happen twice")
    func buying() {
        var state = DressUpGameState(coins: 4)
        #expect(!state.buy(hat))
        state.earn(1, day: "d")
        #expect(state.buy(hat))
        #expect(state.coins == 0)
        #expect(state.equipped[.head] == "hat")
        #expect(!state.buy(hat))
        state.toggleWearing(hat)
        #expect(state.equipped[.head] == nil)
        #expect(!state.spend(1))
        state.earn(2, day: "d")
        #expect(state.spend(1))
        #expect(state.coins == 1)
    }

    @Test("Scene items unlock only after finishing their unit")
    func unlocking() {
        var state = DressUpGameState(coins: 10)
        #expect(!state.isUnlocked(apron))
        #expect(!state.buy(apron))
        state.completeScene(unitID: "a1-restaurant", day: "d")
        #expect(state.buy(apron))
    }

    @Test("Romanian fades with the level")
    func translationPolicy() {
        #expect(GameTranslationPolicy(level: .a1).showsOptionTranslations)
        #expect(GameTranslationPolicy(level: .a1).partnerLine == .shown)
        #expect(!GameTranslationPolicy(level: .a2).showsOptionTranslations)
        #expect(GameTranslationPolicy(level: .b1).partnerLine == .tapToReveal)
        #expect(GameTranslationPolicy(level: .b1).revealCost == 1)
        #expect(GameTranslationPolicy(level: .c2).partnerLine == .hidden)
    }

    @Test("Option Romanian comes from approved dialogue prompts, then expression meanings")
    func gloss() {
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "t", defaultLearnerLocale: "ro"),
            expressions: [Expression(id: "e", canonicalArabizi: "Badde ahwe", levelTags: [.a1], topics: [], localizations: ["ro": .init(naturalMeaning: "Vreau cafea")])],
            units: [],
            exercises: [ExerciseDefinition(id: "x", type: .dialogueResponse, unitID: "u", expressionIDs: [], prompt: ["ro": "Alege replica pentru: „Îmi place humusul.”"], answer: "B7ebb el 7ommos.", wrongAnswers: [])]
        )
        let gloss = RomanianGloss(package: package)
        #expect(gloss.romanian(for: "b7ebb el 7ommos") == "Îmi place humusul.")
        #expect(gloss.romanian(for: "Badde ahwe") == "Vreau cafea")
        #expect(gloss.romanian(for: "necunoscut") == nil)
    }

    @Test("Earning stops at the daily limit and starts again the next day")
    func dailyLimit() {
        var state = DressUpGameState()
        #expect(state.earn(25, day: "d1") == 25)
        #expect(state.earn(10, day: "d1") == 5)
        #expect(state.earn(3, day: "d1") == 0)
        #expect(state.completeScene(unitID: "u", day: "d1") == 0)
        #expect(state.earned(on: "d1") == 30)
        #expect(state.earn(3, day: "d2") == 3)
        #expect(state.coins == 33)
        #expect(state.earned(on: "d2") == 3)
    }

    @Test("Game saved before the daily limit still loads")
    func decodesOldSave() throws {
        let json = #"{"coins":7,"ownedItemIDs":[],"equipped":[],"completions":{}}"#
        let state = try JSONDecoder().decode(DressUpGameState.self, from: Data(json.utf8))
        #expect(state.coins == 7)
        #expect(state.earnedToday == 0)
    }
}
