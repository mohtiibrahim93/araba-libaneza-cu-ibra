import Foundation
import Testing
@testable import YallaCore

@Suite("Native orientation session")
struct OrientationSessionTests {
    private func bank() -> [OrientationPilotItem] {
        (1...24).map { number in
            OrientationPilotItem(
                id: "p\(number)", ordinal: number,
                internalBand: number <= 8 ? .a1 : number <= 16 ? .a2 : .b1,
                prompt: ["ro": "Întrebarea \(number)"],
                answer: "answer\(number)", variants: ["variant\(number)"],
                choices: [], source: "test"
            )
        }
    }

    @Test("Incomplete orientation gives no result; stale taps cannot consume another question")
    func singleResponsePerQuestion() throws {
        var session = try OrientationSession(items: bank())
        #expect(try session.result() == nil)
        let current = try session.current(locale: "ro")
        let step = try #require(current)
        #expect(step.question.questionNumber == 1)
        #expect(step.question.totalQuestions == 24)
        let accepted = session.record(questionID: "p1", answer: "wrong")
        let repeated = session.record(questionID: "p1", answer: "answer1")
        #expect(accepted)
        #expect(!repeated)
        #expect(try session.current(locale: "ro")?.id == "p2")
        #expect(try session.result() == nil)
        for number in 2...24 { session.record(questionID: "p\(number)", answer: nil) }
        let scored = try session.result()
        let result = try #require(scored)
        #expect(result.startingPoint == .a1Foundation)
        #expect(result.bandScores[.a1] == 0)
        #expect(!result.isCEFRCertification)
        #expect(session.isFinished)
    }

    @Test("Authored variants and blind responses feed the existing native orientation scorer")
    func usesNativeScorer() throws {
        var session = try OrientationSession(items: bank())
        for number in 1...24 {
            let answer: String? = (number <= 14 || number == 17 || number == 18) ? "variant\(number)" : nil
            session.record(questionID: "p\(number)", answer: answer)
        }
        let scored = try session.result()
        let result = try #require(scored)
        #expect(result.bandScores[.a1] == 8)
        #expect(result.bandScores[.a2] == 6)
        #expect(result.bandScores[.b1] == 2)
        #expect(result.startingPoint == .b1AvailableMaterial)
        #expect(result.unassessedSkills == [.listening, .speaking])
        let units = [
            JourneyUnit(id: "a1-welcome", level: .a1, expressionIDs: [], localizations: ["ro": .init(title: "A1", description: "")]),
            JourneyUnit(id: "a2-roots", level: .a2, expressionIDs: [], localizations: ["ro": .init(title: "A2", description: "")]),
            JourneyUnit(id: "b1-experiences", level: .b1, expressionIDs: [], localizations: ["ro": .init(title: "B1", description: "")]),
            JourneyUnit(id: "b1-conversation", level: .b1, expressionIDs: [], localizations: ["ro": .init(title: "B1 review", description: "")])
        ]
        #expect(result.startingJourneyUnitID == "b1-experiences")
        #expect(result.startingJourneyUnit(in: units)?.id == "b1-experiences")
        #expect(result.startingJourneyUnit(in: Array(units.prefix(2))) == nil)
    }

    @Test("Production pilot bank decodes and supports choices without exposing answer correctness")
    func bundledPilotIsUsable() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
        let items = try JSONDecoder().decode([OrientationPilotItem].self,
            from: Data(contentsOf: root.appendingPathComponent("App/Resources/orientation-pilot.json")))
        #expect(items.count == 24)
        var session = try OrientationSession(items: items)
        let current = try session.current(locale: "ro")
        let step = try #require(current)
        #expect(step.choices.count == 3)
        #expect(step.choices.contains("Cum te cheamă?"))
        let invalid = session.record(questionID: step.id, answer: "not-a-choice")
        #expect(!invalid)
        for item in items { session.record(questionID: item.id, answer: item.answer) }
        let scored = try session.result()
        let result = try #require(scored)
        #expect(result.startingPoint == .reviewAndEnrichment)
        #expect(result.bandScores[.a1] == 8)
        #expect(result.bandScores[.a2] == 8)
        #expect(result.bandScores[.b1] == 8)
    }

    @Test("Invalid ordinals and blank answers are rejected at session creation")
    func validatesPlayableBank() throws {
        var items = bank()
        items[0] = OrientationPilotItem(id: "p1", ordinal: 0, internalBand: .a1,
            prompt: ["ro": "Prompt"], answer: "", variants: [], choices: [], source: "test")
        #expect(throws: OrientationSessionError.self) {
            try OrientationSession(items: items)
        }
    }
}

