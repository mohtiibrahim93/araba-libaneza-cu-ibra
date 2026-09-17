import Testing
@testable import YallaCore

@Suite("Word order mechanics")
struct WordOrderMechanicsTests {
    @Test("Word order preserves duplicate tokens with stable identities")
    func duplicateTokensRemainSelectable() {
        var state = WordOrderState(
            canonicalAnswer: "ana ana hon",
            presentedTokenOrder: [2, 0, 1]
        )

        #expect(state.remainingTokens.map(\.value) == ["hon", "ana", "ana"])
        #expect(Set(state.remainingTokens.map(\.id)).count == 3)

        state.select(tokenID: 0)
        state.select(tokenID: 1)
        state.select(tokenID: 2)

        #expect(state.submittedAnswer == "ana ana hon")
        #expect(state.isCorrect)
    }

    @Test("Word order can undo the last selected tile")
    func undoRestoresTile() {
        var state = WordOrderState(canonicalAnswer: "baddi mayy")

        state.select(tokenID: 0)
        state.select(tokenID: 1)
        state.undoLastSelection()

        #expect(state.submittedAnswer == "baddi")
        #expect(state.remainingTokens.map(\.value) == ["mayy"])
        #expect(!state.isCorrect)
    }
}

@Suite("Matching mechanics")
struct MatchingMechanicsTests {
    @Test("Incorrect matches do not lock either pair")
    func incorrectMatchDoesNotLock() {
        var state = MatchingState(pairs: [
            MatchingPair(id: "hello", left: "mar7aba", right: "salut"),
            MatchingPair(id: "water", left: "mayy", right: "apă")
        ])

        let result = state.attempt(leftPairID: "hello", rightPairID: "water")

        #expect(result == .incorrect)
        #expect(state.matchedPairIDs.isEmpty)
        #expect(!state.isComplete)
    }

    @Test("Correct matches lock once and complete after every pair is matched")
    func correctMatchesComplete() {
        var state = MatchingState(pairs: [
            MatchingPair(id: "hello", left: "mar7aba", right: "salut"),
            MatchingPair(id: "water", left: "mayy", right: "apă")
        ])

        #expect(state.attempt(leftPairID: "hello", rightPairID: "hello") == .matched)
        #expect(state.attempt(leftPairID: "hello", rightPairID: "hello") == .alreadyMatched)
        #expect(state.attempt(leftPairID: "water", rightPairID: "water") == .matched)
        #expect(state.isComplete)
    }
}

@Suite("Discovery session behavior")
struct DiscoverySessionBehaviorTests {
    @Test("Discovery advances session progress without lowering assessed accuracy")
    func discoveryIsNonAssessed() {
        var session = LearningSessionState(targetCount: 2)

        session.recordDiscoveryCompletion()

        #expect(session.completedCount == 1)
        #expect(session.assessedCount == 0)
        #expect(session.cleanAccuracy == 0)

        session.record(ExerciseResolution(
            evaluation: .exact,
            completed: true,
            needsCorrection: false,
            attempt: Attempt(
                expressionID: "expr.hello",
                skill: .meaning,
                firstTryCorrect: true,
                usedHint: false,
                responseTime: 1
            ),
            mistake: nil
        ))

        #expect(session.completedCount == 2)
        #expect(session.assessedCount == 1)
        #expect(session.cleanAccuracy == 1)
        #expect(session.isComplete)
    }
}

@Suite("Mixed session construction")
struct MixedSessionConstructionTests {
    @Test("Builder deduplicates IDs and round-robins exercise types deterministically")
    func deterministicVariety() {
        let pool = [
            Self.exercise("choice.1", .multipleChoiceProduction),
            Self.exercise("choice.1", .multipleChoiceProduction),
            Self.exercise("choice.2", .multipleChoiceProduction),
            Self.exercise("write.1", .freeProduction),
            Self.exercise("meaning.1", .multipleChoiceMeaning),
            Self.exercise("write.2", .freeProduction)
        ]

        let result = MixedSessionBuilder().build(from: pool, count: 5)

        #expect(result.map(\.id) == ["choice.1", "write.1", "meaning.1", "choice.2", "write.2"])
        #expect(Set(result.map(\.id)).count == result.count)
    }

    @Test("Builder never exceeds the number of unique exercises")
    func capsAtUniquePoolSize() {
        let pool = [
            Self.exercise("a", .freeProduction),
            Self.exercise("a", .freeProduction),
            Self.exercise("b", .wordOrder)
        ]

        let result = MixedSessionBuilder().build(from: pool, count: 20)

        #expect(result.map(\.id) == ["a", "b"])
    }

    private static func exercise(_ id: String, _ type: ExerciseDefinitionType) -> ExerciseDefinition {
        ExerciseDefinition(
            id: id,
            type: type,
            unitID: "unit.test",
            prompt: ["ro": id],
            answer: id,
            wrongAnswers: []
        )
    }
}
