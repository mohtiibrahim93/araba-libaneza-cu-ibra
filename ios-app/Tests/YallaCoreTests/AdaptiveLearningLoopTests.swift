import Foundation
import Testing
@testable import YallaCore

@Suite("Adaptive learning loop")
struct AdaptiveLearningLoopTests {
    private let start = Date(timeIntervalSince1970: 1_700_000_000)

    @Test("Real learner history drives remediation-first Smart Practice sources")
    func realisticHistoryBuildsAdaptivePlan() {
        let planDate = start.addingTimeInterval(2 * ReviewScheduler.day)
        var snapshot = LearnerProgressSnapshot(currentJourneyUnitID: "unit.current")
        let updater = LearnerProgressUpdater()

        snapshot = updater.record(
            attempt(
                id: "mistake-1",
                expressionID: "expr.mistake",
                skill: .production,
                firstTryCorrect: false,
                at: start.addingTimeInterval(3_600)
            ),
            in: snapshot
        )

        snapshot = updater.record(
            attempt(
                id: "due-1",
                expressionID: "expr.due",
                skill: .meaning,
                firstTryCorrect: true,
                at: start
            ),
            in: snapshot
        )

        snapshot = updater.record(
            attempt(
                id: "weak-1",
                expressionID: "expr.weak",
                skill: .listening,
                firstTryCorrect: false,
                at: start
            ),
            in: snapshot
        )
        snapshot = updater.record(
            attempt(
                id: "weak-2",
                expressionID: "expr.weak",
                skill: .listening,
                firstTryCorrect: true,
                at: start.addingTimeInterval(ReviewScheduler.day)
            ),
            in: snapshot
        )

        snapshot = updater.record(
            attempt(
                id: "reinforce-1",
                expressionID: "expr.reinforce",
                skill: .meaning,
                firstTryCorrect: true,
                usedHint: true,
                at: planDate
            ),
            in: snapshot
        )

        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "adaptive-test",
                defaultLearnerLocale: "ro"
            ),
            expressions: [],
            units: [],
            exercises: [
                exercise("exercise.mistake", unit: "unit.old", expression: "expr.mistake", type: .freeProduction),
                exercise("exercise.due", unit: "unit.old", expression: "expr.due", type: .multipleChoiceMeaning),
                exercise("exercise.weak", unit: "unit.old", expression: "expr.weak", type: .listeningWrite),
                exercise("exercise.current", unit: "unit.current", expression: "expr.current", type: .wordOrder),
                exercise("exercise.new", unit: "unit.next", expression: "expr.new", type: .multipleChoiceProduction),
                exercise("exercise.reinforce", unit: "unit.old", expression: "expr.reinforce", type: .reverseProduction)
            ]
        )

        let context = snapshot.sessionCandidateContext(at: planDate)
        let plan = LearningNavigationBuilder().smartPracticePlan(
            from: package,
            context: context,
            count: 6
        )

        #expect(plan.items.map(\.source) == [
            .mistake,
            .due,
            .weakSkill,
            .current,
            .newMaterial,
            .reinforcement
        ])
        #expect(context.mistakeExpressionIDs == ["expr.mistake"])
        #expect(context.dueExpressionIDs.contains("expr.mistake"))
        #expect(context.dueExpressionIDs.contains("expr.due"))
        #expect(context.weakSkills == [.listening])
        #expect(context.currentUnitIDs == ["unit.current"])
        #expect(!context.mistakeExpressionIDs.contains("expr.weak"))
        #expect(context.reinforcementExpressionIDs == ["expr.reinforce"])
    }

    private func attempt(
        id: String,
        expressionID: String,
        skill: MasterySkill,
        firstTryCorrect: Bool,
        usedHint: Bool = false,
        at date: Date
    ) -> LearningAttempt {
        LearningAttempt(
            id: id,
            expressionID: expressionID,
            skills: [skill],
            submittedAnswer: firstTryCorrect ? "correct" : "wrong",
            firstTryCorrect: firstTryCorrect,
            completedCorrectly: true,
            usedHint: usedHint,
            retryCount: firstTryCorrect ? 0 : 1,
            responseTimeMilliseconds: 1_500,
            occurredAt: date
        )
    }

    private func exercise(
        _ id: String,
        unit: String,
        expression: String,
        type: ExerciseDefinitionType
    ) -> ExerciseDefinition {
        ExerciseDefinition(
            id: id,
            type: type,
            unitID: unit,
            expressionIDs: [expression],
            prompt: ["ro": id],
            answer: "correct",
            wrongAnswers: []
        )
    }
}
