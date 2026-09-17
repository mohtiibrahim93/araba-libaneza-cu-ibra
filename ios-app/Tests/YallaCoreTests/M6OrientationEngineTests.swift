import Testing
@testable import YallaCore

@Suite("Orientation engine")
struct OrientationEngineTests {
    @Test("Question bank requires exactly 24 questions split 8/8/8 across A1 A2 and B1")
    func validatesQuestionBankShape() throws {
        let questions = Self.questionBank()

        #expect(throws: Never.self) {
            try OrientationQuestionBankValidator().validate(questions)
        }

        let malformed = Array(questions.dropLast())
        #expect(throws: OrientationValidationError.invalidQuestionCount(expected: 24, actual: 23)) {
            try OrientationQuestionBankValidator().validate(malformed)
        }
    }

    @Test("Learner presentation hides internal CEFR band")
    func presentationHidesBand() throws {
        let question = Self.questionBank()[8]
        let presentation = try question.presentation(locale: "ro", totalQuestions: 24)
        let labels = Mirror(reflecting: presentation).children.compactMap(\.label)

        #expect(presentation.questionNumber == 9)
        #expect(presentation.totalQuestions == 24)
        #expect(presentation.prompt == "Întrebarea 9")
        #expect(!labels.contains("internalBand"))
        #expect(!labels.contains("level"))
        #expect(!labels.contains("band"))
    }

    @Test("A1 gap sends learner to foundation even if harder questions were correct")
    func a1GapTakesPriority() throws {
        let result = try OrientationEngine().score(
            questions: Self.questionBank(),
            responses: Self.responses(a1Correct: 5, a2Correct: 8, b1Correct: 8)
        )

        #expect(result.startingPoint == .a1Foundation)
        #expect(result.gapBands == [.a1])
    }

    @Test("A2 gap recommends A2 consolidation after a solid A1")
    func a2Gap() throws {
        let result = try OrientationEngine().score(
            questions: Self.questionBank(),
            responses: Self.responses(a1Correct: 7, a2Correct: 5, b1Correct: 8)
        )

        #expect(result.startingPoint == .a2Consolidation)
        #expect(result.gapBands == [.a2])
    }

    @Test("Passing A1 and A2 can recommend currently available B1 material without certification")
    func b1AvailableMaterial() throws {
        let result = try OrientationEngine().score(
            questions: Self.questionBank(),
            responses: Self.responses(a1Correct: 8, a2Correct: 8, b1Correct: 4)
        )

        #expect(result.startingPoint == .b1AvailableMaterial)
        #expect(result.gapBands == [.b1])
        #expect(!result.isCEFRCertification)
        #expect(result.unassessedSkills == Set([.listening, .speaking]))
    }

    @Test("Strong performance across the available bank recommends review and enrichment")
    func strongAcrossAvailableMaterial() throws {
        let result = try OrientationEngine().score(
            questions: Self.questionBank(),
            responses: Self.responses(a1Correct: 8, a2Correct: 8, b1Correct: 8)
        )

        #expect(result.startingPoint == .reviewAndEnrichment)
        #expect(result.gapBands.isEmpty)
        #expect(result.bandScores[.a1] == 8)
        #expect(result.bandScores[.a2] == 8)
        #expect(result.bandScores[.b1] == 8)
    }

    @Test("Scoring rejects missing or unknown responses instead of guessing")
    func rejectsInvalidResponses() {
        let questions = Self.questionBank()
        let missing = Array(Self.responses(a1Correct: 8, a2Correct: 8, b1Correct: 8).dropLast())

        #expect(throws: OrientationScoringError.responseCountMismatch(expected: 24, actual: 23)) {
            try OrientationEngine().score(questions: questions, responses: missing)
        }
    }

    private static func questionBank() -> [OrientationQuestion] {
        var questions: [OrientationQuestion] = []
        let bands: [LevelBand] = [.a1, .a2, .b1]
        var ordinal = 1

        for band in bands {
            for _ in 0..<8 {
                questions.append(OrientationQuestion(
                    id: "orientation.\(ordinal)",
                    ordinal: ordinal,
                    internalBand: band,
                    prompt: ["ro": "Întrebarea \(ordinal)"],
                    exerciseType: ordinal.isMultiple(of: 2) ? .multipleChoiceMeaning : .freeProduction
                ))
                ordinal += 1
            }
        }
        return questions
    }

    private static func responses(a1Correct: Int, a2Correct: Int, b1Correct: Int) -> [OrientationResponse] {
        let counts = [a1Correct, a2Correct, b1Correct]
        var result: [OrientationResponse] = []
        var ordinal = 1

        for correctCount in counts {
            for index in 0..<8 {
                result.append(OrientationResponse(
                    questionID: "orientation.\(ordinal)",
                    isCorrect: index < correctCount
                ))
                ordinal += 1
            }
        }
        return result
    }
}
