import Foundation
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
        #expect(result.submittedAnswer == "baddé")
        #expect(result.retryCount == 0)
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
        #expect(correction.submittedAnswer == "baddé")
        #expect(correction.retryCount == 1)
        #expect(correction.mistake?.submittedAnswer == "baddak")
    }

    @Test("Incorrect correction does not replace the original mistake")
    func badCorrectionKeepsOriginal() {
        var runner = ExerciseRunner(exercise: exercise, skill: .production)
        _ = runner.submit("baddak", responseTime: 2)
        let second = runner.submit("badna", responseTime: 1)

        #expect(!second.completed)
        #expect(second.needsCorrection)
        #expect(second.submittedAnswer == "badna")
        #expect(second.retryCount == 1)
        #expect(second.mistake?.submittedAnswer == "baddak")
    }

    @Test("Completed resolution converts to durable learning evidence")
    func durableAttemptBridge() throws {
        var runner = ExerciseRunner(exercise: exercise, skill: .production)
        _ = runner.submit("baddak", responseTime: 2)
        let resolution = runner.submit("baddé", responseTime: 1)

        let attempt = try #require(
            LearningAttemptFactory().make(
                id: "attempt-1",
                resolution: resolution,
                occurredAt: Date(timeIntervalSince1970: 1_700_000_000)
            )
        )

        #expect(attempt.expressionID == "expr.want")
        #expect(attempt.skills == [.production])
        #expect(attempt.submittedAnswer == "baddé")
        #expect(attempt.firstTryCorrect == false)
        #expect(attempt.completedCorrectly)
        #expect(attempt.retryCount == 1)
        #expect(attempt.responseTimeMilliseconds == 2_000)
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
