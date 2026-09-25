import Foundation

/// A teacher-approved conversation for a unit: the other person's lines
/// (Arabizi with Romanian) and, after each one, the dialogue exercise the
/// learner answers.
public struct ConversationScript: Codable, Equatable, Sendable {
    public struct Line: Codable, Equatable, Sendable {
        public let arabizi: String
        public let ro: String
    }

    public struct Turn: Codable, Equatable, Sendable {
        public let partner: Line
        public let exerciseID: String
    }

    public struct Scene: Codable, Equatable, Sendable {
        public let title: String
        public let turns: [Turn]
    }

    public let unitID: String
    public let scenes: [Scene]

    public var turns: [Turn] { scenes.flatMap(\.turns) }

    /// The scene title to show before the turn, when a new scene starts there.
    public func sceneTitle(beforeTurn index: Int) -> String? {
        var start = 0
        for (number, scene) in scenes.enumerated() {
            if index == start { return "Scena \(number + 1) · \(scene.title)" }
            start += scene.turns.count
        }
        return nil
    }
}

public struct ConversationScriptFile: Codable, Equatable, Sendable {
    public let scripts: [ConversationScript]
}

/// The Romanian a dialogue exercise asks for, taken from the quote in its
/// prompt (Alege replica pentru: „Îmi place humusul.”).
public enum DialoguePromptText {
    public static func quotedRomanian(in prompt: String) -> String? {
        guard let open = prompt.firstIndex(of: "„"),
              let close = prompt[open...].firstIndex(of: "”") else { return nil }
        let quote = prompt[prompt.index(after: open)..<close].trimmingCharacters(in: .whitespaces)
        return quote.isEmpty ? nil : quote
    }
}
