import Testing
@testable import YallaCore

@Suite("Learning session state")
struct LearningSessionStateTests {
    @Test("Session counts clean, hinted and corrected outcomes without erasing mistakes")
    func aggregatesOutcomes() {
        var session = LearningSessionState(targetCount: 20)

        session.record(ExerciseResolution(
            evaluation: .exact,
            completed: true,
            needsCorrection: false,
            attempt: Attempt(
                expressionID: "expr.1",
                skill: .production,
                firstTryCorrect: true,
                usedHint: false,
                responseTime: 1
            ),
            mistake: nil
        ))
        session.record(ExerciseResolution(
            evaluation: .exact,
            completed: true,
            needsCorrection: false,
            attempt: Attempt(
                expressionID: "expr.2",
                skill: .production,
                firstTryCorrect: true,
                usedHint: true,
                responseTime: 2
            ),
            mistake: nil
        ))
        let mistake = ExerciseMistake(
            exerciseID: "ex.3",
            expressionID: "expr.3",
            submittedAnswer: "wrong",
            correctAnswer: "right"
        )
        session.record(ExerciseResolution(
            evaluation: .exact,
            completed: true,
            needsCorrection: false,
            attempt: Attempt(
                expressionID: "expr.3",
                skill: .production,
                firstTryCorrect: false,
                usedHint: false,
                responseTime: 3
            ),
            mistake: mistake
        ))

        #expect(session.completedCount == 3)
        #expect(session.cleanFirstTryCount == 1)
        #expect(session.hintedCount == 1)
        #expect(session.mistakes == [mistake])
        #expect(session.reinforcementExpressionIDs == Set(["expr.2", "expr.3"]))
        #expect(session.cleanAccuracy == 1.0 / 3.0)
    }

    @Test("Incomplete correction attempts do not advance session progress")
    func incompleteDoesNotAdvance() {
        var session = LearningSessionState(targetCount: 20)
        let mistake = ExerciseMistake(
            exerciseID: "ex.1",
            expressionID: "expr.1",
            submittedAnswer: "wrong",
            correctAnswer: "right"
        )

        session.record(ExerciseResolution(
            evaluation: .incorrect,
            completed: false,
            needsCorrection: true,
            attempt: nil,
            mistake: mistake
        ))

        #expect(session.completedCount == 0)
        #expect(session.mistakes.isEmpty)
    }

    @Test("Session reports completion at its configured target")
    func targetCompletion() {
        var session = LearningSessionState(targetCount: 2)
        let clean = { (id: String) in
            ExerciseResolution(
                evaluation: .exact,
                completed: true,
                needsCorrection: false,
                attempt: Attempt(
                    expressionID: id,
                    skill: .meaning,
                    firstTryCorrect: true,
                    usedHint: false,
                    responseTime: 1
                ),
                mistake: nil
            )
        }

        session.record(clean("expr.1"))
        #expect(!session.isComplete)
        session.record(clean("expr.2"))
        #expect(session.isComplete)
    }
}
