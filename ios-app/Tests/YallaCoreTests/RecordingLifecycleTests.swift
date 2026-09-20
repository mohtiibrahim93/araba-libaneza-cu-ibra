import Testing
@testable import YallaCore

@Suite("Recording lifecycle")
struct RecordingLifecycleTests {
    @Test("Duplicate permission requests and canceled late completions cannot start recording")
    func requestCancellation() throws {
        var gate = RecordingRequestGate()
        let pending = gate.begin()
        let first = try #require(pending)
        #expect(gate.isPending)
        let duplicate = gate.begin()
        #expect(duplicate == nil)
        gate.cancel()
        let canceled = gate.complete(first)
        #expect(!canceled)
        #expect(!gate.isPending)
        let next = gate.begin()
        let second = try #require(next)
        let stale = gate.complete(first)
        #expect(!stale)
        #expect(gate.isPending)
        let accepted = gate.complete(second)
        #expect(accepted)
        #expect(!gate.isPending)
        let repeated = gate.complete(second)
        #expect(!repeated)
    }

    @Test("Deleting the current learner recording preserves earlier local recordings")
    func deleteRecording() {
        var session = SpeakAndCompareSession(expressionID: "word", referenceAudioAssetID: "audio")
        session.attachLearnerRecording(localLocator: "Recordings/one.m4a")
        session.attachLearnerRecording(localLocator: "Recordings/two.m4a")
        session.removeLearnerRecording(localLocator: "Recordings/two.m4a")
        #expect(session.learnerRecording?.localLocator == "Recordings/one.m4a")
        #expect(session.recordingHistory.count == 1)
        session.removeLearnerRecording(localLocator: "missing")
        #expect(session.recordingHistory.count == 1)
        session.removeLearnerRecording(localLocator: "Recordings/one.m4a")
        #expect(session.learnerRecording == nil)
    }
}
