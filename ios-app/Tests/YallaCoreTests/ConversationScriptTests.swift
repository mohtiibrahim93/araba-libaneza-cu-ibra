import Foundation
import Testing
@testable import YallaCore

@Suite("Conversation scripts and hints")
struct ConversationScriptTests {
    private var root: URL {
        URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
    }

    @Test("Bundled scripts only use dialogue exercises of their own unit")
    func scriptsReferenceRealDialogues() throws {
        let content = try JSONDecoder().decode(ContentPackage.self,
            from: Data(contentsOf: root.appendingPathComponent("App/Resources/yalla-native-content.json")))
        let file = try JSONDecoder().decode(ConversationScriptFile.self,
            from: Data(contentsOf: root.appendingPathComponent("App/Resources/conversation-scripts.json")))
        let exercises = Dictionary(content.exercises.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        #expect(!file.scripts.isEmpty)
        for script in file.scripts {
            let ids = script.turns.map(\.exerciseID)
            #expect(Set(ids).count == ids.count, "\(script.unitID) repeats an exercise")
            for turn in script.turns {
                let exercise = try #require(exercises[turn.exerciseID], "missing \(turn.exerciseID)")
                #expect(exercise.type == .dialogueResponse)
                #expect(exercise.unitID == script.unitID)
                #expect(!turn.partner.arabizi.isEmpty && !turn.partner.ro.isEmpty)
            }
        }
    }

    @Test("Scene titles appear only where a scene starts")
    func sceneTitles() throws {
        let json = """
        {"unitID":"u","scenes":[
          {"title":"A","turns":[{"partner":{"arabizi":"x","ro":"x"},"exerciseID":"1"},{"partner":{"arabizi":"y","ro":"y"},"exerciseID":"2"}]},
          {"title":"B","turns":[{"partner":{"arabizi":"z","ro":"z"},"exerciseID":"3"}]}]}
        """
        let script = try JSONDecoder().decode(ConversationScript.self, from: Data(json.utf8))
        #expect(script.sceneTitle(beforeTurn: 0) == "Scena 1 · A")
        #expect(script.sceneTitle(beforeTurn: 1) == nil)
        #expect(script.sceneTitle(beforeTurn: 2) == "Scena 2 · B")
    }

    @Test("The reply's Romanian comes from the quoted prompt")
    func quotedRomanian() {
        #expect(DialoguePromptText.quotedRomanian(in: "Alege replica pentru: „Îmi place humusul.”") == "Îmi place humusul.")
        #expect(DialoguePromptText.quotedRomanian(in: "Spune că familia voastră este mare.") == nil)
        #expect(DialoguePromptText.quotedRomanian(in: "Cineva te întreabă „Shu esmak?”. Spune că te cheamă George.") == nil)
    }

    @Test("Hints give the first letter and the word count, never the answer")
    func hintClues() {
        #expect(AnswerHint.clue(for: "B7ebb el 7ommos.") == "Începe cu „B” · 3 cuvinte")
        #expect(AnswerHint.clue(for: "3afwan") == "Începe cu „3” · 1 cuvânt")
        #expect(AnswerHint.clue(for: "Mar7aba! Shu esmak?").contains("esmak") == false)
        #expect(AnswerHint.matchingClue(left: "mayy", right: "apă") == "„mayy” → începe cu „a”")
    }
}
