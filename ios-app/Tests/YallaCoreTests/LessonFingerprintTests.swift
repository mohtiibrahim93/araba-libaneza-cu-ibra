import Testing
@testable import YallaCore

@Suite("Lesson fingerprints")
struct LessonFingerprintTests {
    private func lesson(_ ids: [String]) -> JourneyLesson {
        JourneyLesson(
            id: "unit.lesson.1",
            unitID: "unit",
            number: 1,
            exercises: ids.map {
                ExerciseDefinition(id: $0, type: .freeProduction, unitID: "unit", expressionIDs: [], prompt: ["ro": "p"], answer: "a", wrongAnswers: [])
            }
        )
    }

    @Test("A finished lesson is flagged only when its exercises changed")
    func flagsChangedLessons() {
        let planner = JourneyLessonPlanner()
        let original = lesson(["e1", "e2"])
        let fingerprints = ["unit.lesson.1": planner.fingerprint(for: original)]

        #expect(planner.fingerprint(for: original) == planner.fingerprint(for: lesson(["e1", "e2"])))
        #expect(!planner.isUpdatedSinceCompletion(original, fingerprints: fingerprints))
        #expect(planner.isUpdatedSinceCompletion(lesson(["e1", "e3"]), fingerprints: fingerprints))
        #expect(!planner.isUpdatedSinceCompletion(lesson(["e9"]), fingerprints: [:]))
    }

    @Test("Replaying a changed lesson updates its fingerprint; completion is kept")
    func replayUpdatesFingerprint() async throws {
        let repository = LearnerProgressRepository(store: InMemoryLearnerProgressStore())
        _ = try await repository.markLessonCompleted("unit.lesson.1", fingerprint: "old")
        let same = try await repository.markLessonCompleted("unit.lesson.1", fingerprint: "old")
        #expect(same.lessonFingerprints["unit.lesson.1"] == "old")

        let replayed = try await repository.markLessonCompleted("unit.lesson.1", fingerprint: "new")
        #expect(replayed.completedLessonIDs == ["unit.lesson.1"])
        #expect(replayed.lessonFingerprints["unit.lesson.1"] == "new")

        let legacy = try await repository.markLessonCompleted("unit.lesson.2")
        #expect(legacy.completedLessonIDs.contains("unit.lesson.2"))
        #expect(legacy.lessonFingerprints["unit.lesson.1"] == "new")
    }
}
