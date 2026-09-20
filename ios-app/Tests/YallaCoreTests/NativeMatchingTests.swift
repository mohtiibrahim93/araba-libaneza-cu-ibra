import Foundation
import Testing
@testable import YallaCore

@Suite("Native matching exercises")
struct NativeMatchingTests {
    private let expressions: [YallaCore.Expression] = [
        .init(id: "a", canonicalArabizi: "badde", localizations: ["ro": .init(naturalMeaning: "vreau")]),
        .init(id: "b", canonicalArabizi: "mayy", localizations: ["ro": .init(naturalMeaning: "apă")])
    ]
    private func board(_ ids: [String] = ["a", "b"]) -> ExerciseDefinition {
        .init(id: "board", type: .matching, unitID: "unit", expressionIDs: ids,
              prompt: ["ro": "Potrivește"], answer: "", wrongAnswers: [])
    }

    @Test("Matching uses only explicit linked expressions and requested approved meanings")
    func presentation() {
        let input = NativeExerciseInput(exercise: board(), expressions: expressions, locale: "ro")
        guard case let .matching(state) = input else { Issue.record("Expected matching board"); return }
        #expect(state.pairs.map(\.left) == ["badde", "mayy"])
        #expect(state.pairs.map(\.right) == ["vreau", "apă"])
        #expect(NativeExerciseInput(exercise: board(["a", "missing"]), expressions: expressions, locale: "ro") == .unavailable)
        #expect(NativeExerciseInput(exercise: board(["a", "a"]), expressions: expressions, locale: "ro") == .unavailable)
        #expect(NativeExerciseInput(exercise: board(["a"]), expressions: expressions, locale: "ro") == .unavailable)
        #expect(NativeExerciseInput(exercise: board(), expressions: expressions, locale: "en") == .unavailable)
        let ambiguous = [expressions[0], YallaCore.Expression(id: "b", canonicalArabizi: "mayy",
            localizations: ["ro": .init(naturalMeaning: "Vreau!")])]
        #expect(NativeExerciseInput(exercise: board(), expressions: ambiguous, locale: "ro") == .unavailable)
    }

    @Test("Wrong pairing requires correction and gives durable recognition credit to each correct target only once")
    func correctionsAndPersistence() throws {
        var player = try ExerciseSessionPlayer(exercises: [board()], expressions: expressions, locale: "ro")
        let textShortcut = player.submit("", responseTime: 0)
        #expect(textShortcut == nil)
        let wrong = player.submitMatch(leftPairID: "a", rightPairID: "b", responseTime: 2)
        #expect(wrong?.needsCorrection == true)
        let premature = player.advance()
        #expect(!premature)
        let corrected = player.submitMatch(leftPairID: "a", rightPairID: "a", responseTime: 3)
        let resolution = try #require(corrected)
        #expect(resolution.mistake?.submittedAnswer == "apă")
        #expect(!player.isCurrentExerciseCompleted)
        let durable = player.learningAttempt(id: "first", resolution: resolution, occurredAt: Date())
        #expect(durable?.expressionID == "a")
        #expect(durable?.skills == [.recognition])
        #expect(durable?.wasInitialMistake == true)
        #expect(durable?.retryCount == 1)
        let duplicate = player.submitMatch(leftPairID: "a", rightPairID: "a", responseTime: 4)
        #expect(duplicate == nil)
        let second = player.submitMatch(leftPairID: "b", rightPairID: "b", responseTime: 1)
        let secondResolution = try #require(second)
        #expect(player.learningAttempt(id: "second", resolution: secondResolution, occurredAt: Date())?.expressionID == "b")
        #expect(player.sessionState.targetCount == 2)
        #expect(player.sessionState.completedCount == 2)
        #expect(player.sessionState.cleanFirstTryCount == 1)
        #expect(player.sessionState.mistakes.count == 1)
        #expect(player.attempts.count == 2)
        #expect(player.isCurrentExerciseCompleted)
        let advanced = player.advance()
        #expect(advanced)
        #expect(player.isFinished)
    }

    @Test("Hints affect only remaining pairs and mixed sessions advance after the whole board")
    func hintsAndMixedSession() throws {
        let text = ExerciseDefinition(id: "text", type: .freeProduction, unitID: "unit",
            expressionIDs: ["a"], prompt: ["ro": "vreau"], answer: "badde", wrongAnswers: [])
        var player = try ExerciseSessionPlayer(exercises: [board(), text], expressions: expressions, locale: "ro")
        _ = player.submitMatch(leftPairID: "a", rightPairID: "a", responseTime: 1)
        let hinted = player.useHint()
        #expect(hinted)
        _ = player.submitMatch(leftPairID: "b", rightPairID: "b", responseTime: 2)
        #expect(player.attempts.map(\.usedHint) == [false, true])
        let advanced = player.advance()
        #expect(advanced)
        #expect(player.currentMatchingState == nil)
        #expect(player.currentExercise?.id == "text")
        _ = player.submit("badde", responseTime: 1)
        #expect(player.sessionState.targetCount == 3)
        #expect(player.sessionState.completedCount == 3)
        #expect(player.sessionState.hintedCount == 1)
    }

    @Test("Unresolvable matching boards fail before a session starts")
    func invalidBoard() {
        #expect(throws: ExerciseSessionPlayerError.invalidMatchingExercise(exerciseID: "board")) {
            try ExerciseSessionPlayer(exercises: [board(["a", "missing"])], expressions: expressions, locale: "ro")
        }
    }
}
