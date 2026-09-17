import Testing
@testable import YallaCore

@Suite("Exercise types and skill signals")
struct ExerciseTypeTests {
    @Test("Free production measures recall and production")
    func freeProductionSkills() {
        #expect(ExerciseDefinitionType.freeProduction.defaultMasterySkills == [.recall, .production])
    }

    @Test("Meaning choice measures meaning without granting production")
    func meaningChoiceSkills() {
        let skills = ExerciseDefinitionType.multipleChoiceMeaning.defaultMasterySkills
        #expect(skills == [.meaning])
        #expect(!skills.contains(.production))
    }

    @Test("Listening write combines listening and production")
    func listeningWriteSkills() {
        #expect(ExerciseDefinitionType.listeningWrite.defaultMasterySkills == [.listening, .production])
    }

    @Test("Speaking compare is separate from listening")
    func speakingSkills() {
        let skills = ExerciseDefinitionType.speakingCompare.defaultMasterySkills
        #expect(skills == [.speaking, .production])
        #expect(!skills.contains(.listening))
    }

    @Test("Transfer and speed recall have distinct signals")
    func advancedSignals() {
        #expect(ExerciseDefinitionType.transferChallenge.defaultMasterySkills == [.transfer, .production])
        #expect(ExerciseDefinitionType.speedRecall.defaultMasterySkills == [.retrievalFluency, .recall])
    }

    @Test("Discovery does not award test mastery by default")
    func discoveryIsInstructional() {
        #expect(ExerciseDefinitionType.discovery.defaultMasterySkills.isEmpty)
    }
}
