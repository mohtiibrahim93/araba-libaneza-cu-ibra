import Testing
@testable import YallaCore

@Suite("Session candidate classification")
struct SessionCandidateClassifierTests {
    @Test("Known mistakes outrank due review and every other learning signal")
    func mistakeHasHighestPriority() {
        let exercise = Self.exercise(id: "ex.due", unitID: "unit.current", expressionID: "expr.1", type: .freeProduction)
        let context = SessionCandidateContext(
            dueExpressionIDs: ["expr.1"],
            mistakeExpressionIDs: ["expr.1"],
            reinforcementExpressionIDs: ["expr.1"],
            weakSkills: [.production],
            currentUnitIDs: ["unit.current"],
            seenExpressionIDs: [],
            probeExerciseIDs: ["ex.due"]
        )

        #expect(SessionCandidateClassifier().source(for: exercise, context: context) == .mistake)
    }

    @Test("Mistakes outrank weak skill and current lesson")
    func mistakePriority() {
        let exercise = Self.exercise(id: "ex.mistake", unitID: "unit.current", expressionID: "expr.2", type: .freeProduction)
        let context = SessionCandidateContext(
            mistakeExpressionIDs: ["expr.2"],
            weakSkills: [.production],
            currentUnitIDs: ["unit.current"],
            seenExpressionIDs: ["expr.2"]
        )

        #expect(SessionCandidateClassifier().source(for: exercise, context: context) == .mistake)
    }

    @Test("Weak skill identifies the exercise modality")
    func weakSkillClassification() {
        let listening = Self.exercise(id: "ex.listen", unitID: "unit.old", expressionID: "expr.3", type: .listeningChoice)
        let context = SessionCandidateContext(
            weakSkills: [.listening],
            seenExpressionIDs: ["expr.3"]
        )

        #expect(SessionCandidateClassifier().source(for: listening, context: context) == .weakSkill)
    }

    @Test("Explicit reinforcement and probe signals are preserved")
    func reinforcementAndProbe() {
        let reinforce = Self.exercise(id: "ex.reinforce", unitID: "unit.old", expressionID: "expr.4", type: .multipleChoiceMeaning)
        let probe = Self.exercise(id: "ex.probe", unitID: "unit.future", expressionID: "expr.5", type: .transferChallenge)
        let context = SessionCandidateContext(
            reinforcementExpressionIDs: ["expr.4"],
            seenExpressionIDs: ["expr.4"],
            probeExerciseIDs: ["ex.probe"]
        )

        let classifier = SessionCandidateClassifier()
        #expect(classifier.source(for: reinforce, context: context) == .reinforcement)
        #expect(classifier.source(for: probe, context: context) == .probe)
    }

    @Test("Current lesson and unseen material classify separately")
    func currentAndNew() {
        let current = Self.exercise(id: "ex.current", unitID: "unit.current", expressionID: "expr.6", type: .wordOrder)
        let new = Self.exercise(id: "ex.new", unitID: "unit.next", expressionID: "expr.7", type: .multipleChoiceProduction)
        let context = SessionCandidateContext(
            currentUnitIDs: ["unit.current"],
            seenExpressionIDs: ["expr.6"]
        )

        let classifier = SessionCandidateClassifier()
        #expect(classifier.source(for: current, context: context) == .current)
        #expect(classifier.source(for: new, context: context) == .newMaterial)
    }

    @Test("Previously seen neutral material becomes reinforcement fallback")
    func seenFallback() {
        let exercise = Self.exercise(id: "ex.seen", unitID: "unit.old", expressionID: "expr.8", type: .multipleChoiceMeaning)
        let context = SessionCandidateContext(seenExpressionIDs: ["expr.8"])

        #expect(SessionCandidateClassifier().source(for: exercise, context: context) == .reinforcement)
    }

    private static func exercise(
        id: String,
        unitID: String,
        expressionID: String,
        type: ExerciseDefinitionType
    ) -> ExerciseDefinition {
        ExerciseDefinition(
            id: id,
            type: type,
            unitID: unitID,
            expressionIDs: [expressionID],
            prompt: ["ro": id],
            answer: id,
            wrongAnswers: []
        )
    }
}
