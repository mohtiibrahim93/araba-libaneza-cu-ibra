import Foundation
import Testing
@testable import YallaCore

@Suite("Native exercise controls")
struct NativeExerciseControlsTests {
    private func exercise(_ type: ExerciseDefinitionType, answer: String = "badde mayy",
                          wrong: [String] = [], ids: [String] = ["word"]) -> ExerciseDefinition {
        .init(id: "exercise", type: type, unitID: "unit", expressionIDs: ids,
              prompt: ["ro": "Prompt"], answer: answer, wrongAnswers: wrong)
    }

    @Test("Choice controls use authored answers once and remove equivalent or empty distractors")
    func authoredChoices() {
        let item = exercise(.multipleChoiceProduction, wrong: ["", "badde mayy", "Badde mayy!", "other", "OTHER"])
        let input = NativeExerciseInput(exercise: item)
        guard case let .choices(options) = input else {
            Issue.record("Expected choices")
            return
        }
        #expect(options.count == 2)
        #expect(options.contains("badde mayy"))
        #expect(options.contains("other"))
        #expect(input == NativeExerciseInput(exercise: item))
    }

    @Test("Grammar and dialogue preserve authored options while free production stays written")
    func inputTypeMatchesContent() {
        #expect(NativeExerciseInput(exercise: exercise(.grammarDrill, wrong: ["other"])).isChoice)
        #expect(NativeExerciseInput(exercise: exercise(.dialogueResponse, wrong: ["other"])).isChoice)
        #expect(NativeExerciseInput(exercise: exercise(.freeProduction, wrong: ["other"])) == .text)
        #expect(NativeExerciseInput(exercise: exercise(.reverseProduction)) == .text)
        #expect(NativeExerciseInput(exercise: exercise(.multipleChoiceMeaning)) == .unavailable)
        #expect(NativeExerciseInput(exercise: exercise(.matching)) == .unavailable)
        #expect(NativeExerciseInput(exercise: exercise(.listeningWrite)) == .unavailable)
        #expect(NativeExerciseInput(exercise: exercise(.speakingCompare)) == .unavailable)
    }

    @Test("Word-order input keeps repeated words distinct and uses the existing correction player")
    func wordOrderPreservesMistakes() throws {
        let item = exercise(.wordOrder, answer: "one two one")
        guard case var .wordOrder(state) = NativeExerciseInput(exercise: item) else {
            Issue.record("Expected word-order state")
            return
        }
        #expect(Set(state.remainingTokens.map(\.id)) == [0, 1, 2])
        state.select(tokenID: 1)
        state.select(tokenID: 0)
        state.select(tokenID: 2)
        var player = try ExerciseSessionPlayer(exercises: [item], expressions: [])
        let wrong = player.submit(state.submittedAnswer, responseTime: 2)
        #expect(wrong?.needsCorrection == true)
        let corrected = player.submit("one two one", responseTime: 3)
        #expect(corrected?.completed == true)
        #expect(corrected?.attempt?.firstTryCorrect == false)
        #expect(corrected?.mistake?.submittedAnswer == "two one one")
    }

    @Test("Unlinked and missing-expression drills cannot become durable expression progress")
    func rejectsSyntheticExpressionIDs() throws {
        for ids: [String] in [[], ["missing"]] {
            var player = try ExerciseSessionPlayer(exercises: [exercise(.grammarDrill, ids: ids)], expressions: [])
            let submitted = player.submit("badde mayy", responseTime: 1)
            let resolution = try #require(submitted)
            #expect(player.sessionState.completedCount == 1)
            let durable = player.learningAttempt(id: "attempt", resolution: resolution, occurredAt: Date())
            #expect(durable == nil)
        }
    }

    @Test("A choice retry preserves the first mistake in a valid durable expression attempt")
    func choiceRetryPersists() throws {
        let expression = YallaCore.Expression(id: "word", canonicalArabizi: "badde mayy",
            localizations: ["ro": .init(naturalMeaning: "Vreau apă")])
        var player = try ExerciseSessionPlayer(
            exercises: [exercise(.multipleChoiceProduction, wrong: ["other"])], expressions: [expression])
        _ = player.submit("other", responseTime: 2)
        let submitted = player.submit("badde mayy", responseTime: 3)
        let resolution = try #require(submitted)
        let durable = player.learningAttempt(id: "attempt", resolution: resolution, occurredAt: Date())
        #expect(durable?.expressionID == "word")
        #expect(durable?.wasInitialMistake == true)
        #expect(durable?.retryCount == 1)
    }
}
