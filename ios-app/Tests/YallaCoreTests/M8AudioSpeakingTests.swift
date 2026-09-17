import Testing
@testable import YallaCore

@Suite("M8 audio and speaking")
struct M8AudioSpeakingTests {
    @Test("Audio assets preserve source priority and phrase-specific overrides")
    func audioAssetPriority() {
        let native = AudioAsset(
            id: "audio.expr.hello.native",
            expressionID: "expr.hello",
            source: .approvedNative,
            locator: "hello-native.m4a"
        )
        let generated = AudioAsset(
            id: "audio.expr.hello.generated",
            expressionID: "expr.hello",
            source: .curatedGenerated,
            locator: "hello-generated.m4a"
        )

        #expect(native.source.priority < generated.source.priority)
    }

    @Test("Listening choice can hide written Lebanese while keeping answer identity")
    func listeningChoiceKeepsExpressionIdentity() {
        let item = ListeningPrompt(
            id: "listen.hello",
            audioAssetID: "audio.expr.hello.native",
            expressionID: "expr.hello",
            mode: .multipleChoice,
            revealWrittenLebaneseInitially: false
        )

        #expect(item.expressionID == "expr.hello")
        #expect(item.revealWrittenLebaneseInitially == false)
    }

    @Test("Speak and compare stores learner recording separately from reference audio")
    func speakAndCompareKeepsBothRecordingsSeparate() {
        var session = SpeakAndCompareSession(
            expressionID: "expr.hello",
            referenceAudioAssetID: "audio.expr.hello.native"
        )

        session.attachLearnerRecording(localLocator: "recordings/attempt-1.m4a")

        #expect(session.referenceAudioAssetID == "audio.expr.hello.native")
        #expect(session.learnerRecording?.localLocator == "recordings/attempt-1.m4a")
        #expect(session.learnerRecording?.sharingState == .localOnly)
    }

    @Test("Retry keeps prior learner attempts instead of overwriting them")
    func speakingRetriesArePreserved() {
        var session = SpeakAndCompareSession(
            expressionID: "expr.hello",
            referenceAudioAssetID: "audio.expr.hello.native"
        )

        session.attachLearnerRecording(localLocator: "recordings/attempt-1.m4a")
        session.attachLearnerRecording(localLocator: "recordings/attempt-2.m4a")

        #expect(session.recordingHistory.count == 2)
        #expect(session.learnerRecording?.localLocator == "recordings/attempt-2.m4a")
    }

    @Test("Playback speed supports the slow-reference choices without changing the asset")
    func playbackSpeedIsSessionPreference() {
        var session = SpeakAndCompareSession(
            expressionID: "expr.hello",
            referenceAudioAssetID: "audio.expr.hello.native"
        )
        session.referencePlaybackRate = .slow

        #expect(session.referencePlaybackRate.rawValue == 0.6)
        #expect(session.referenceAudioAssetID == "audio.expr.hello.native")
    }
}
