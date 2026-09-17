import Testing
@testable import YallaCore

@Suite("Interactive exercise session player")
struct ExerciseSessionPlayerTests {
    private let expression = Expression(
        id: "expr.want",
        canonicalArabizi: "badde",
        variants: [
            .init(value: "baddi", kind: .spelling),
            .init(value: "baddeh", kind: .pronunciation)
        ],
        localizations: ["ro": .init(naturalMeaning: "vreau")]
    )

    private func exercise(id: String = "exercise.want") -> ExerciseDefinition {
        ExerciseDefinition(
            id: id,
            type: .grammarDrill,
            unitID: "unit.needs",
            expressionIDs: [expression.id],
            prompt: ["ro": "Cum spui «vreau»?"],
            answer: "badde",
            wrongAnswers: []
        )
    }

    @Test("Clean first try records one completed attempt and waits for explicit advance")
    func cleanFirstTry() throws {
        var player = try ExerciseSessionPlayer(
            exercises: [exercise()],
            expressions: [expression]
        )

        let submitted = player.submit("badde", responseTime: 1.2)
        let resolution = try #require(submitted)

        #expect(resolution.completed)
        #expect(player.sessionState.completedCount == 1)
        #expect(player.attempts.count == 1)
        #expect(player.attempts.first?.firstTryCorrect == true)
        #expect(player.isCurrentExerciseCompleted)
        #expect(!player.isFinished)

        let advanced = player.advance()
        #expect(advanced)
        #expect(player.isFinished)
        #expect(player.currentExercise == nil)
    }

    @Test("Wrong answer requires correction and original mistake survives retry")
    func correctionPreservesInitialMistake() throws {
        var player = try ExerciseSessionPlayer(
            exercises: [exercise()],
            expressions: [expression]
        )

        let firstSubmitted = player.submit("baddak", responseTime: 2.0)
        let first = try #require(firstSubmitted)
        #expect(first.needsCorrection)
        #expect(!first.completed)
        #expect(player.sessionState.completedCount == 0)
        #expect(player.attempts.isEmpty)

        let advancedBeforeCorrection = player.advance()
        #expect(!advancedBeforeCorrection)

        let correctionSubmitted = player.submit("badde", responseTime: 0.8)
        let correction = try #require(correctionSubmitted)
        #expect(correction.completed)
        #expect(correction.mistake?.submittedAnswer == "baddak")
        #expect(correction.attempt?.firstTryCorrect == false)
        #expect(player.sessionState.mistakes.first?.submittedAnswer == "baddak")
        #expect(player.attempts.first?.firstTryCorrect == false)
    }

    @Test("Hint is retained on the completed attempt")
    func hintPersists() throws {
        var player = try ExerciseSessionPlayer(
            exercises: [exercise()],
            expressions: [expression]
        )

        let didUseHint = player.useHint()
        #expect(didUseHint)
        _ = player.submit("badde", responseTime: 3.0)

        #expect(player.attempts.first?.usedHint == true)
        #expect(player.sessionState.hintedCount == 1)
    }

    @Test("Teacher-approved spelling and pronunciation variants are accepted")
    func approvedVariants() throws {
        var spellingPlayer = try ExerciseSessionPlayer(
            exercises: [exercise(id: "exercise.spelling")],
            expressions: [expression]
        )
        let spellingSubmitted = spellingPlayer.submit("baddi", responseTime: 1.0)
        let spelling = try #require(spellingSubmitted)
        #expect(spelling.evaluation == .acceptedSpellingVariant)

        var pronunciationPlayer = try ExerciseSessionPlayer(
            exercises: [exercise(id: "exercise.pronunciation")],
            expressions: [expression]
        )
        let pronunciationSubmitted = pronunciationPlayer.submit("baddeh", responseTime: 1.0)
        let pronunciation = try #require(pronunciationSubmitted)
        #expect(pronunciation.evaluation == .acceptedPronunciationVariant)
    }

    @Test("Multiple exercises advance in order and session counters follow completions")
    func advancesInOrder() throws {
        let second = ExerciseDefinition(
            id: "exercise.second",
            type: .dialogueResponse,
            unitID: "unit.needs",
            expressionIDs: [expression.id],
            prompt: ["ro": "Răspunde natural"],
            answer: "badde",
            wrongAnswers: []
        )
        var player = try ExerciseSessionPlayer(
            exercises: [exercise(), second],
            expressions: [expression]
        )

        #expect(player.currentExercise?.id == "exercise.want")
        _ = player.submit("badde", responseTime: 1)
        let advancedFirst = player.advance()
        #expect(advancedFirst)
        #expect(player.currentExercise?.id == "exercise.second")
        #expect(player.sessionState.completedCount == 1)

        _ = player.submit("badde", responseTime: 1)
        let advancedSecond = player.advance()
        #expect(advancedSecond)
        #expect(player.isFinished)
        #expect(player.sessionState.completedCount == 2)
        #expect(player.attempts.count == 2)
    }
}
