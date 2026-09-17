import Testing
@testable import YallaCore

@Suite("Exercise catalogue")
struct ExerciseCatalogTests {
    @Test("Core exercise formats map to the intended mastery skill")
    func skillMapping() {
        let mapper = ExerciseSkillMapper()

        #expect(mapper.skill(for: .multipleChoiceProduction) == .recall)
        #expect(mapper.skill(for: .multipleChoiceMeaning) == .meaning)
        #expect(mapper.skill(for: .freeProduction) == .production)
        #expect(mapper.skill(for: .wordOrder) == .sentenceBuilding)
        #expect(mapper.skill(for: .listeningChoice) == .listening)
        #expect(mapper.skill(for: .speakingCompare) == .speaking)
        #expect(mapper.skill(for: .transferChallenge) == .transfer)
        #expect(mapper.skill(for: .speedRecall) == .retrievalFluency)
    }

    @Test("Discovery exposure is not treated as a mastery test")
    func discoveryIsNotAssessment() {
        #expect(ExerciseSkillMapper().skill(for: .discovery) == nil)
    }

    @Test("Legacy drill raw values remain stable for imported content")
    func importedRawValuesStayStable() {
        #expect(ExerciseDefinitionType(rawValue: "grammar-drill") == .grammarDrill)
        #expect(ExerciseDefinitionType(rawValue: "dialogue-response") == .dialogueResponse)
    }
}
