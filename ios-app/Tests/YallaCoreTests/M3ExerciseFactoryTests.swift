import Testing
@testable import YallaCore

@Suite("Generated standard exercises")
struct ExerciseFactoryTests {
    let target = Expression(
        id: "expr.water",
        canonicalArabizi: "mayy",
        localizations: ["ro": ExpressionLocalization(naturalMeaning: "apă")]
    )
    let distractor = Expression(
        id: "expr.coffee",
        canonicalArabizi: "2ahwe",
        localizations: ["ro": ExpressionLocalization(naturalMeaning: "cafea")]
    )

    @Test("Romanian to Lebanese production choice is generated from expression data")
    func productionChoice() throws {
        let exercise = try ExerciseFactory().make(
            type: .multipleChoiceProduction,
            expression: target,
            unitID: "a1-restaurant",
            locale: "ro",
            distractors: [distractor]
        )

        #expect(exercise.id == "generated.multiple-choice-production.expr.water")
        #expect(exercise.prompt["ro"] == "apă")
        #expect(exercise.answer == "mayy")
        #expect(exercise.wrongAnswers == ["2ahwe"])
    }

    @Test("Lebanese to Romanian meaning choice reverses prompt and answer")
    func meaningChoice() throws {
        let exercise = try ExerciseFactory().make(
            type: .multipleChoiceMeaning,
            expression: target,
            unitID: "a1-restaurant",
            locale: "ro",
            distractors: [distractor]
        )

        #expect(exercise.prompt["ro"] == "mayy")
        #expect(exercise.answer == "apă")
        #expect(exercise.wrongAnswers == ["cafea"])
    }

    @Test("Free production uses learner meaning as prompt and Lebanese as answer")
    func freeProduction() throws {
        let exercise = try ExerciseFactory().make(
            type: .freeProduction,
            expression: target,
            unitID: "a1-restaurant",
            locale: "ro"
        )

        #expect(exercise.prompt["ro"] == "apă")
        #expect(exercise.answer == "mayy")
        #expect(exercise.wrongAnswers.isEmpty)
    }

    @Test("Missing learner localization is rejected instead of silently falling back")
    func missingLocaleFails() {
        #expect(throws: ExerciseFactoryError.self) {
            _ = try ExerciseFactory().make(
                type: .freeProduction,
                expression: target,
                unitID: "a1-restaurant",
                locale: "en"
            )
        }
    }
}
