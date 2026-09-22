import Foundation
import Testing
@testable import YallaCore

@Suite("M8 audio repository")
struct M8AudioRepositoryTests {
    @Test("Repository returns the preferred audio asset for an expression")
    func repositoryResolvesPreferredAudio() throws {
        let json = #"""
        {
          "manifest": {"schemaVersion": 3, "contentVersion": "test", "defaultLearnerLocale": "ro"},
          "expressions": [
            {"id":"expr.hello","canonicalArabizi":"mar7aba","localizations":{"ro":{"naturalMeaning":"salut"}}}
          ],
          "units": [],
          "audioAssets": [
            {"id":"audio.generated","expressionID":"expr.hello","source":"curatedGenerated","locator":"generated.m4a"},
            {"id":"audio.ibrahim","expressionID":"expr.hello","source":"ibrahimRecorded","locator":"ibrahim.m4a"}
          ],
          "listeningPrompts": []
        }
        """#

        let repository = try JSONContentRepository(data: Data(json.utf8))

        #expect(try repository.preferredAudioAsset(for: "expr.hello")?.id == "audio.ibrahim")
    }

    @Test("Repository returns listening prompts for their expression")
    func repositoryFindsListeningPrompts() throws {
        let json = #"""
        {
          "manifest": {"schemaVersion": 3, "contentVersion": "test", "defaultLearnerLocale": "ro"},
          "expressions": [
            {"id":"expr.hello","canonicalArabizi":"mar7aba","localizations":{"ro":{"naturalMeaning":"salut"}}}
          ],
          "units": [],
          "audioAssets": [
            {"id":"audio.hello","expressionID":"expr.hello","source":"approvedNative","locator":"hello.m4a"}
          ],
          "listeningPrompts": [
            {"id":"listen.hello","audioAssetID":"audio.hello","expressionID":"expr.hello","mode":"freeWrite","choiceExpressionIDs":[],"revealWrittenLebaneseInitially":false}
          ]
        }
        """#

        let repository = try JSONContentRepository(data: Data(json.utf8))

        #expect(try repository.listeningPrompts(for: "expr.hello").map(\.id) == ["listen.hello"])
    }
}
