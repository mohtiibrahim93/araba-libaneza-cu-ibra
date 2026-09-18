import Testing
@testable import YallaCore

@Suite("M8 speaking navigation")
struct M8SpeakingNavigationTests {
    @Test("Speaking destination only includes expressions with real preferred reference audio")
    func speakingDestinationUsesPreferredAudio() throws {
        let hello = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            localizations: ["ro": .init(naturalMeaning: "salut")]
        )
        let thanks = Expression(
            id: "expr.thanks",
            canonicalArabizi: "merci",
            localizations: ["ro": .init(naturalMeaning: "mulțumesc")]
        )
        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "test",
                defaultLearnerLocale: "ro"
            ),
            expressions: [hello, thanks],
            units: [],
            audioAssets: [
                AudioAsset(
                    id: "audio.hello.generated",
                    expressionID: hello.id,
                    source: .curatedGenerated,
                    locator: "hello-generated.m4a"
                ),
                AudioAsset(
                    id: "audio.hello.ibrahim",
                    expressionID: hello.id,
                    source: .ibrahimRecorded,
                    locator: "hello-ibrahim.m4a"
                )
            ]
        )

        let destination = try LearningNavigationBuilder().practiceDestination(
            id: "speaking",
            from: package,
            locale: "ro"
        )

        guard case let .speakAndCompare(speaking) = destination else {
            Issue.record("Expected a speak-and-compare destination")
            return
        }

        #expect(speaking.expression.id == hello.id)
        #expect(speaking.expression.arabizi == "mar7aba")
        #expect(speaking.expression.meaning == "salut")
        #expect(speaking.referenceAudioAsset.id == "audio.hello.ibrahim")
    }

    @Test("Speaking stays unavailable when the package has no reference audio")
    func speakingRequiresReferenceAudio() throws {
        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "test",
                defaultLearnerLocale: "ro"
            ),
            expressions: [
                Expression(
                    id: "expr.hello",
                    canonicalArabizi: "mar7aba",
                    localizations: ["ro": .init(naturalMeaning: "salut")]
                )
            ],
            units: []
        )

        let destination = try LearningNavigationBuilder().practiceDestination(
            id: "speaking",
            from: package,
            locale: "ro"
        )

        #expect(destination == nil)
    }
}
