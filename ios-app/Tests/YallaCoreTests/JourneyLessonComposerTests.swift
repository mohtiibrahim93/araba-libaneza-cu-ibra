import Foundation
import Testing
@testable import YallaCore

@Suite("Journey lesson composition")
struct JourneyLessonComposerTests {
    private func expression(_ id: String, _ arabizi: String, _ meaning: String) -> YallaCore.Expression {
        YallaCore.Expression(
            id: id,
            canonicalArabizi: arabizi,
            levelTags: [.a1],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: meaning)]
        )
    }

    private func fixture(count: Int = 30) -> (JourneyUnit, [String: YallaCore.Expression]) {
        let expressions = (0..<count).map { index -> YallaCore.Expression in
            // Every third phrase has three words so it can be reordered.
            let form = index % 3 == 0 ? "ana w enta \(index)" : "kilme\(index)"
            // Distinct words per meaning, so no two meanings overlap.
            let letters = Array("bcdfghjklmnprstvwxyz")
            let word = "sens" + String(letters[index % letters.count]) + String(letters[index / letters.count])
            return expression("e\(index)", form, word)
        }
        let unit = JourneyUnit(
            id: "u", level: .a1,
            expressionIDs: expressions.map(\.id),
            localizations: ["ro": .init(title: "U", description: "")]
        )
        return (unit, Dictionary(uniqueKeysWithValues: expressions.map { ($0.id, $0) }))
    }

    private func drill(_ id: String) -> ExerciseDefinition {
        ExerciseDefinition(id: id, type: .dialogueResponse, unitID: "u", expressionIDs: [],
                           prompt: ["ro": "Răspunde"], answer: "Ahlan", wrongAnswers: ["Merci"])
    }

    @Test("Units get the website mix: choice, reverse, write and word order")
    func mixesTypes() {
        let (unit, byID) = fixture()
        let exercises = JourneyLessonComposer().exercises(for: unit, authored: [], expressionsByID: byID, locale: "ro")
        let types = Set(exercises.map(\.type))
        #expect(types.isSuperset(of: [.multipleChoiceMeaning, .multipleChoiceProduction, .freeProduction, .wordOrder, .matching]))
        // Word order only for phrases with enough words.
        for exercise in exercises where exercise.type == .wordOrder {
            #expect(exercise.answer.split(separator: " ").count >= 3)
        }
    }

    @Test("Choice distractors never repeat the answer's form or meaning")
    func distinctDistractors() {
        let (unit, byID) = fixture()
        let exercises = JourneyLessonComposer().exercises(for: unit, authored: [], expressionsByID: byID, locale: "ro")
        for exercise in exercises where exercise.type == .multipleChoiceMeaning || exercise.type == .multipleChoiceProduction {
            #expect(!exercise.wrongAnswers.isEmpty)
            #expect(!exercise.wrongAnswers.contains(exercise.answer))
            #expect(Set(exercise.wrongAnswers).count == exercise.wrongAnswers.count)
        }
    }

    @Test("Distractors never share a content word with the answer's meaning")
    func distractorsAreUnambiguous() {
        let greetings = [
            expression("g1", "Mar7aba", "Bună! / Salut!"),
            expression("g2", "Mar7abten", "Salut! (răspuns)"),
            expression("g3", "Ahlan", "Salut! / Bun venit!"),
            expression("o1", "Beet", "casă"),
            expression("o2", "Kalb", "câine"),
            expression("o3", "2alam", "pix")
        ]
        let unit = JourneyUnit(id: "u", level: .a1, expressionIDs: greetings.map(\.id),
                               localizations: ["ro": .init(title: "U", description: "")])
        let byID = Dictionary(uniqueKeysWithValues: greetings.map { ($0.id, $0) })
        let exercises = JourneyLessonComposer().exercises(for: unit, authored: [], expressionsByID: byID, locale: "ro")
        let first = exercises.first { $0.expressionIDs == ["g1"] && $0.type == .multipleChoiceMeaning }
        #expect(first?.wrongAnswers.contains("Salut! (răspuns)") == false)
        #expect(first?.wrongAnswers.contains("Salut! / Bun venit!") == false)
        #expect(first?.wrongAnswers.isEmpty == false)
    }

    @Test("Every full lesson ends with a matching board and boundaries stay aligned")
    func lessonsEndWithMatching() {
        let (unit, byID) = fixture()
        let exercises = JourneyLessonComposer().exercises(
            for: unit, authored: [drill("d1"), drill("d2")], expressionsByID: byID, locale: "ro"
        )
        let lessons = JourneyLessonPlanner().lessons(unitID: "u", exercises: exercises)
        for lesson in lessons {
            #expect(lesson.exercises.last?.type == .matching)
            #expect(lesson.exercises.filter { $0.type == .matching }.count == 1)
        }
        #expect(Set(exercises.map(\.id)).count == exercises.count)
        #expect(exercises.contains { $0.id == "d1" } && exercises.contains { $0.id == "d2" })
    }

    @Test("Composition is deterministic")
    func deterministic() {
        let (unit, byID) = fixture()
        let composer = JourneyLessonComposer()
        let first = composer.exercises(for: unit, authored: [drill("d1")], expressionsByID: byID, locale: "ro")
        let second = composer.exercises(for: unit, authored: [drill("d1")], expressionsByID: byID, locale: "ro")
        #expect(first == second)
    }

    @Test("Expressions covered by an authored exercise are not generated again")
    func coveredExpressionsSkipped() {
        let (unit, byID) = fixture(count: 6)
        let authored = ExerciseDefinition(id: "a", type: .freeProduction, unitID: "u", expressionIDs: ["e1"],
                                          prompt: ["ro": "?"], answer: "kilme1", wrongAnswers: [])
        let exercises = JourneyLessonComposer().exercises(for: unit, authored: [authored], expressionsByID: byID, locale: "ro")
        let singles = exercises.filter { $0.type != .matching }
        #expect(singles.filter { $0.expressionIDs == ["e1"] }.map(\.id) == ["a"])
    }

    @Test("The bundled content gives every unit with approved phrases at least one lesson")
    func bundledUnitsAllHaveLessons() throws {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
        let content = try JSONDecoder().decode(ContentPackage.self,
            from: Data(contentsOf: root.appendingPathComponent("App/Resources/yalla-native-content.json")))
        let counts = JourneyLessonPlanner().lessonCounts(in: content, locale: "ro")
        let byID = Dictionary(content.expressions.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        for unit in content.units {
            let recallable = unit.expressionIDs.contains { byID[$0].map { ExpressionRecallBuilder.supportsRecall($0, locale: "ro") } ?? false }
            if recallable || content.exercises.contains(where: { $0.unitID == unit.id }) {
                #expect((counts[unit.id] ?? 0) > 0)
            }
        }
    }
}
