import Testing
@testable import YallaCore

@Suite("Exercise runner correction flow")
struct ExerciseRunnerTests {
    private let exercise = ExerciseDefinition(
        id: "drill-1",
        type: .grammarDrill,
        unitID: "a1-needs",
        expressionIDs: ["expr.want"],
        prompt: ["ro": "Cum spui «vreau»?"],
        answer: "baddé",
        wrongAnswers: []
    )

    @Test("Clean first try completes and emits a clean attempt")
    func cleanFirstTry() {
        var runner = ExerciseRunner(exercise: exercise, skill: .production)
        let result = runner.submit("baddé", responseTime: 1.4)

        #expect(result.completed)
        #expect(!result.needsCorrection)
        #expect(result.attempt?.firstTryCorrect == true)
        #expect(result.attempt?.usedHint == false)
        #expect(result.mistake == nil)
    }

    @Test("Wrong first answer requires correction and preserves the mistake")
    func wrongNeedsCorrection() {
        var runner = ExerciseRunner(exercise: exercise, skill: .production)
        let first = runner.submit("baddak", responseTime: 2.0)

        #expect(!first.completed)
        #expect(first.needsCorrection)
        #expect(first.attempt == nil)
        #expect(first.mistake?.submittedAnswer == "baddak")

        let correction = runner.submit("baddé", responseTime: 1.0)

        #expect(correction.completed)
        #expect(correction.attempt?.firstTryCorrect == false)
        #expect(correction.mistake?.submittedAnswer == "baddak")
    }

    @Test("Incorrect correction does not replace the original mistake")
    func badCorrectionKeepsOriginal() {
        var runner = ExerciseRunner(exercise: exercise, skill: .production)
        _ = runner.submit("baddak", responseTime: 2)
        let second = runner.submit("badna", responseTime: 1)

        #expect(!second.completed)
        #expect(second.needsCorrection)
        #expect(second.mistake?.submittedAnswer == "baddak")
    }

    @Test("Hint used before a correct answer remains on emitted attempt")
    func hintedCorrect() {
        var runner = ExerciseRunner(exercise: exercise, skill: .production)
        runner.useHint()
        let result = runner.submit("baddé", responseTime: 3)

        #expect(result.completed)
        #expect(result.attempt?.firstTryCorrect == true)
        #expect(result.attempt?.usedHint == true)
    }

    @Test("Accepted explicit variant counts as correct")
    func explicitVariant() {
        var runner = ExerciseRunner(
            exercise: exercise,
            skill: .production,
            spellingVariants: ["baddi"]
        )
        let result = runner.submit("baddi", responseTime: 1)

        #expect(result.completed)
        #expect(result.evaluation == .acceptedSpellingVariant)
        #expect(result.attempt?.firstTryCorrect == true)
    }
}
