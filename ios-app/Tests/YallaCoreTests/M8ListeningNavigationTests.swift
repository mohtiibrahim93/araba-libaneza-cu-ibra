import Testing
@testable import YallaCore

@Suite("M8 listening navigation")
struct M8ListeningNavigationTests {
    @Test("Listening destination resolves linked prompts, audio and localized choices")
    func listeningDestinationResolvesRealContent() throws {
        let hello = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            variants: [
                .init(value: "marhaba", kind: .spelling),
                .init(value: "mar7abeh", kind: .pronunciation)
            ],
            localizations: ["ro": .init(naturalMeaning: "salut")]
        )
        let thanks = Expression(
            id: "expr.thanks",
            canonicalArabizi: "merci",
            localizations: ["ro": .init(naturalMeaning: "mulțumesc")]
        )
        let please = Expression(
            id: "expr.please",
            canonicalArabizi: "eza betriid",
            localizations: ["ro": .init(naturalMeaning: "te rog")]
        )
        let audio = AudioAsset(
            id: "audio.hello",
            expressionID: hello.id,
            source: .approvedNative,
            locator: "hello.m4a"
        )
        let prompt = ListeningPrompt(
            id: "listen.hello",
            audioAssetID: audio.id,
            expressionID: hello.id,
            mode: .multipleChoice,
            choiceExpressionIDs: [thanks.id, please.id],
            revealWrittenLebaneseInitially: false
        )
        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "test",
                defaultLearnerLocale: "ro"
            ),
            expressions: [hello, thanks, please],
            units: [],
            audioAssets: [audio],
            listeningPrompts: [prompt]
        )

        let destination = try LearningNavigationBuilder().practiceDestination(
            id: "listening",
            from: package,
            locale: "ro"
        )

        guard case let .listening(items) = destination else {
            Issue.record("Expected a listening destination")
            return
        }

        #expect(items.count == 1)
        #expect(items[0].id == prompt.id)
        #expect(items[0].expression.id == hello.id)
        #expect(items[0].audioAsset.id == audio.id)
        #expect(items[0].choices == ["salut", "mulțumesc", "te rog"])
        #expect(items[0].revealWrittenLebaneseInitially == false)
        #expect(items[0].spellingVariants == ["marhaba"])
        #expect(items[0].pronunciationVariants == ["mar7abeh"])
    }

    @Test("Listening multiple choice uses only explicitly approved distractors")
    func listeningUsesExplicitDistractorsOnly() throws {
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
        let unrelated = Expression(
            id: "expr.unrelated",
            canonicalArabizi: "beet",
            localizations: ["ro": .init(naturalMeaning: "casă")]
        )
        let audio = AudioAsset(
            id: "audio.hello",
            expressionID: hello.id,
            source: .ibrahimRecorded,
            locator: "hello.m4a"
        )
        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "explicit-listening",
                defaultLearnerLocale: "ro"
            ),
            expressions: [hello, thanks, unrelated],
            units: [],
            audioAssets: [audio],
            listeningPrompts: [
                ListeningPrompt(
                    id: "listen.hello",
                    audioAssetID: audio.id,
                    expressionID: hello.id,
                    mode: .multipleChoice,
                    choiceExpressionIDs: [thanks.id, unrelated.id]
                )
            ]
        )

        let destination = try LearningNavigationBuilder().practiceDestination(
            id: "listening",
            from: package,
            locale: "ro"
        )

        guard case let .listening(items) = destination else {
            Issue.record("Expected a listening destination")
            return
        }

        #expect(items[0].choices == ["salut", "mulțumesc", "casă"])
    }

    @Test("Free-write listening does not fabricate multiple-choice answers")
    func freeWriteHasNoChoices() throws {
        let hello = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            localizations: ["ro": .init(naturalMeaning: "salut")]
        )
        let audio = AudioAsset(
            id: "audio.hello",
            expressionID: hello.id,
            source: .ibrahimRecorded,
            locator: "hello.m4a"
        )
        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "test",
                defaultLearnerLocale: "ro"
            ),
            expressions: [hello],
            units: [],
            audioAssets: [audio],
            listeningPrompts: [
                ListeningPrompt(
                    id: "listen.write.hello",
                    audioAssetID: audio.id,
                    expressionID: hello.id,
                    mode: .freeWrite
                )
            ]
        )

        let destination = try LearningNavigationBuilder().practiceDestination(
            id: "listening",
            from: package,
            locale: "ro"
        )

        guard case let .listening(items) = destination else {
            Issue.record("Expected a listening destination")
            return
        }

        #expect(items.count == 1)
        #expect(items[0].choices.isEmpty)
    }

    @Test("Listening destination rejects audio linked to a different expression")
    func listeningDestinationRejectsMismatchedAudioExpression() throws {
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
        let thanksAudio = AudioAsset(
            id: "audio.thanks",
            expressionID: thanks.id,
            source: .approvedNative,
            locator: "thanks.m4a"
        )
        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "mismatched-listening",
                defaultLearnerLocale: "ro"
            ),
            expressions: [hello, thanks],
            units: [],
            audioAssets: [thanksAudio],
            listeningPrompts: [
                ListeningPrompt(
                    id: "listen.hello",
                    audioAssetID: thanksAudio.id,
                    expressionID: hello.id,
                    mode: .freeWrite
                )
            ]
        )

        let destination = try LearningNavigationBuilder().practiceDestination(
            id: "listening",
            from: package,
            locale: "ro"
        )

        #expect(destination == nil)
    }

    @Test("Listening stays unavailable without a listening prompt")
    func listeningRequiresPrompt() throws {
        let package = ContentPackage(
            manifest: .init(
                schemaVersion: 3,
                contentVersion: "test",
                defaultLearnerLocale: "ro"
            ),
            expressions: [],
            units: []
        )

        #expect(
            try LearningNavigationBuilder().practiceDestination(
                id: "listening",
                from: package,
                locale: "ro"
            ) == nil
        )
    }
}
