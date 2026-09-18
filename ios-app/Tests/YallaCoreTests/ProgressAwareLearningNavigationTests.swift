import Testing
@testable import YallaCore

@Suite("Progress-aware learning navigation")
struct ProgressAwareLearningNavigationTests {
    @Test("Smart Practice classifies package exercises from learner progress")
    func smartPracticeUsesLearnerSignals() {
        let mistake = ExerciseDefinition(
            id: "exercise.mistake",
            type: .freeProduction,
            unitID: "unit.old",
            expressionIDs: ["expr.mistake"],
            prompt: ["ro": "mistake"],
            answer: "x",
            wrongAnswers: []
        )
        let fresh = ExerciseDefinition(
            id: "exercise.new",
            type: .multipleChoiceMeaning,
            unitID: "unit.next",
            expressionIDs: ["expr.new"],
            prompt: ["ro": "new"],
            answer: "y",
            wrongAnswers: []
        )
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: [],
            units: [],
            exercises: [fresh, mistake]
        )
        let context = SessionCandidateContext(
            mistakeExpressionIDs: ["expr.mistake"],
            seenExpressionIDs: ["expr.mistake"]
        )

        let plan = LearningNavigationBuilder().smartPracticePlan(
            from: package,
            context: context,
            count: 2
        )

        #expect(plan.items.count == 2)
        #expect(plan.items.contains { $0.exercise.id == "exercise.mistake" && $0.source == .mistake })
        #expect(plan.items.contains { $0.exercise.id == "exercise.new" && $0.source == .newMaterial })
    }
    @Test("Speed Drill prioritizes retrieval-relevant learner state before unseen backfill")
    func speedDrillUsesLearnerSignals() throws {
        let expressions = [
            Expression(id: "expr.new", canonicalArabizi: "new", localizations: ["ro": .init(naturalMeaning: "nou")]),
            Expression(id: "expr.familiar", canonicalArabizi: "familiar", localizations: ["ro": .init(naturalMeaning: "familiar")]),
            Expression(id: "expr.reinforce", canonicalArabizi: "reinforce", localizations: ["ro": .init(naturalMeaning: "reinforce")]),
            Expression(id: "expr.current", canonicalArabizi: "current", localizations: ["ro": .init(naturalMeaning: "current")]),
            Expression(id: "expr.due", canonicalArabizi: "due", localizations: ["ro": .init(naturalMeaning: "due")]),
            Expression(id: "expr.mistake", canonicalArabizi: "mistake", localizations: ["ro": .init(naturalMeaning: "mistake")])
        ]
        let currentUnit = JourneyUnit(
            id: "unit.current",
            level: .a1,
            expressionIDs: ["expr.current"],
            localizations: ["ro": .init(title: "Curent", description: "")]
        )
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "speed-test", defaultLearnerLocale: "ro"),
            expressions: expressions,
            units: [currentUnit]
        )
        let context = SessionCandidateContext(
            dueExpressionIDs: ["expr.due"],
            mistakeExpressionIDs: ["expr.mistake"],
            reinforcementExpressionIDs: ["expr.reinforce"],
            currentUnitIDs: ["unit.current"],
            seenExpressionIDs: [
                "expr.mistake",
                "expr.due",
                "expr.current",
                "expr.reinforce",
                "expr.familiar"
            ]
        )

        let optionalDestination = try LearningNavigationBuilder().practiceDestination(
            id: "speed-drill",
            from: package,
            locale: "ro",
            count: 5,
            learnerContext: context
        )
        let destination = try #require(optionalDestination)

        guard case let .speedDrill(selected) = destination else {
            Issue.record("Expected progress-aware Speed Drill destination")
            return
        }

        #expect(selected.map(\.id) == [
            "expr.mistake",
            "expr.due",
            "expr.current",
            "expr.reinforce",
            "expr.familiar"
        ])
        #expect(!selected.contains { $0.id == "expr.new" })
    }

    @Test("Speed Drill uses unseen material only when retrieval pools cannot fill the session")
    func speedDrillBackfillsWithNewMaterial() {
        let expressions = [
            Expression(id: "expr.seen", canonicalArabizi: "seen", localizations: ["ro": .init(naturalMeaning: "seen")]),
            Expression(id: "expr.new1", canonicalArabizi: "new1", localizations: ["ro": .init(naturalMeaning: "new1")]),
            Expression(id: "expr.new2", canonicalArabizi: "new2", localizations: ["ro": .init(naturalMeaning: "new2")])
        ]
        let context = SessionCandidateContext(seenExpressionIDs: ["expr.seen"])

        let selection = SpeedDrillSelectionPlanner(targetCount: 3).makeSelection(
            expressions: expressions,
            units: [],
            context: context
        )

        #expect(selection.map(\.expressionID) == ["expr.seen", "expr.new1", "expr.new2"])
        #expect(selection.map(\.source) == [.familiar, .newMaterial, .newMaterial])
    }


}
