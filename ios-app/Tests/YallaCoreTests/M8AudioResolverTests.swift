import Testing
@testable import YallaCore

@Suite("M8 audio resolution and validation")
struct M8AudioResolverTests {
    @Test("Best audio prefers approved native over lower-priority sources")
    func bestAudioUsesSourcePriority() {
        let assets = [
            AudioAsset(id: "generated", expressionID: "expr.hello", source: .curatedGenerated, locator: "generated.m4a"),
            AudioAsset(id: "ibrahim", expressionID: "expr.hello", source: .ibrahimRecorded, locator: "ibrahim.m4a"),
            AudioAsset(id: "native", expressionID: "expr.hello", source: .approvedNative, locator: "native.m4a")
        ]

        let selected = AudioAssetResolver().bestAsset(for: "expr.hello", from: assets)

        #expect(selected?.id == "native")
    }

    @Test("Best audio ignores assets belonging to another expression")
    func bestAudioMatchesExpressionIdentity() {
        let assets = [
            AudioAsset(id: "other-native", expressionID: "expr.other", source: .approvedNative, locator: "other.m4a"),
            AudioAsset(id: "hello-generated", expressionID: "expr.hello", source: .curatedGenerated, locator: "hello.m4a")
        ]

        let selected = AudioAssetResolver().bestAsset(for: "expr.hello", from: assets)

        #expect(selected?.id == "hello-generated")
    }

    @Test("Content validation rejects a listening prompt whose audio asset is missing")
    func missingListeningAudioIsRejected() {
        let expression = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            localizations: ["ro": .init(naturalMeaning: "salut")]
        )
        let prompt = ListeningPrompt(
            id: "listen.hello",
            audioAssetID: "audio.missing",
            expressionID: expression.id,
            mode: .multipleChoice
        )
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: [],
            listeningPrompts: [prompt]
        )

        #expect(throws: ContentValidationError.self) {
            try ContentValidator().validate(package)
        }
    }

    @Test("Content validation rejects an audio asset tied to an unknown expression")
    func audioWithMissingExpressionIsRejected() {
        let audio = AudioAsset(
            id: "audio.ghost",
            expressionID: "expr.missing",
            source: .approvedNative,
            locator: "ghost.m4a"
        )
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: [],
            units: [],
            audioAssets: [audio]
        )

        #expect(throws: ContentValidationError.self) {
            try ContentValidator().validate(package)
        }
    }
}
