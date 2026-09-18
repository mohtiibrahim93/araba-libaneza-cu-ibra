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
}
