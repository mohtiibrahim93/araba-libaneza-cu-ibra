import Foundation
import Testing
@testable import YallaCore

@Suite("Offline session continuity")
struct SessionContinuityTests {
    private func bank() throws -> [OrientationPilotItem] {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
        return try JSONDecoder().decode([OrientationPilotItem].self,
            from: Data(contentsOf: root.appendingPathComponent("App/Resources/orientation-pilot.json")))
    }

    @Test("Orientation resumes the next question and persists through unrelated progress writes")
    func resumesOrientation() async throws {
        let items = try bank()
        var session = try OrientationSession(items: items)
        let firstAccepted = session.record(questionID: items[0].id, answer: items[0].answer)
        #expect(firstAccepted)
        let secondAccepted = session.record(questionID: items[1].id, answer: nil)
        #expect(secondAccepted)
        let repository = LearnerProgressRepository(store: InMemoryLearnerProgressStore())
        try await repository.setOrientationCheckpoint(session.checkpoint)
        try await repository.setExpressionSaved("word", saved: true)
        try await repository.setCurrentJourneyUnitID("unit")
        let loaded = try await repository.load()
        let encoded = try JSONEncoder().encode(loaded)
        let decoded = try JSONDecoder().decode(LearnerProgressSnapshot.self, from: encoded)
        let checkpoint = try #require(decoded.orientationCheckpoint)
        let restored = try OrientationSession(items: items, checkpoint: checkpoint)
        #expect(try restored.current(locale: "ro")?.question.questionNumber == 3)
        #expect(try restored.result() == nil)
        #expect(decoded.savedExpressionIDs == ["word"])
        #expect(decoded.currentJourneyUnitID == "unit")
    }

    @Test("A completed orientation restores the result without writing mastery or SRS")
    func restoresResult() async throws {
        let items = try bank()
        var session = try OrientationSession(items: items)
        for item in items { _ = session.record(questionID: item.id, answer: item.answer) }
        let repository = LearnerProgressRepository(store: InMemoryLearnerProgressStore())
        try await repository.setOrientationCheckpoint(session.checkpoint)
        let loaded = try await repository.load()
        let restored = try OrientationSession(items: items, checkpoint: loaded.orientationCheckpoint)
        #expect(restored.isFinished)
        #expect(try restored.result()?.bandScores[.a1] == 8)
        #expect(loaded.attempts.isEmpty)
        #expect(loaded.reviewByExpressionID.isEmpty)
        try await repository.setOrientationCheckpoint(nil)
        let cleared = try await repository.load()
        #expect(cleared.orientationCheckpoint == nil)
    }

    @Test("Orientation refuses stale or out-of-order checkpoint answers")
    func rejectsInvalidCheckpoint() throws {
        let items = try bank()
        let invalid = OrientationCheckpoint(items: items, answers: [
            .init(questionID: items[1].id, answer: items[1].answer)
        ])
        #expect(throws: OrientationSessionError.invalidCheckpoint) {
            try OrientationSession(items: items, checkpoint: invalid)
        }
        let stale = OrientationCheckpoint(items: Array(items.dropLast()), answers: [])
        #expect(throws: OrientationSessionError.invalidCheckpoint) {
            try OrientationSession(items: items, checkpoint: stale)
        }
    }

    @Test("Existing progress without orientation data still loads")
    func oldProgress() throws {
        let data = Data(#"{"schemaVersion":4}"#.utf8)
        let decoded = try JSONDecoder().decode(LearnerProgressSnapshot.self, from: data)
        #expect(decoded.orientationCheckpoint == nil)
        #expect(try LearnerProgressMigrator().migrate(decoded).orientationCheckpoint == nil)
    }

    @Test("Practice time excludes interruptions and repeated pause/resume events")
    func activeTime() {
        let start = Date(timeIntervalSince1970: 100_000)
        var clock = ActivePracticeClock(startedAt: start)
        clock.pause(at: start.addingTimeInterval(10))
        clock.pause(at: start.addingTimeInterval(20))
        #expect(clock.isPaused)
        #expect(clock.elapsed(at: start.addingTimeInterval(100)) == 10)
        clock.resume(at: start.addingTimeInterval(100))
        clock.resume(at: start.addingTimeInterval(105))
        #expect(clock.elapsed(at: start.addingTimeInterval(110)) == 20)
        #expect(!clock.isPaused)
        clock.pause(at: start.addingTimeInterval(120))
        #expect(clock.elapsed(at: start.addingTimeInterval(1_000)) == 30)
    }
}
