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
        /// Nil when the learner speaks first (the scene opens with their line).
        public let partner: Line?
        public let exerciseID: String
        /// The Romanian of the learner's reply, for exercises whose prompt
        /// does not quote it (e.g. „Shu esmak?” — spune că te cheamă George).
        public let learnerRo: String?
        /// The Romanian per reply, when the exercise accepts several.
        public let learnerRoByAnswer: [String: String]?
    }

    public struct Scene: Codable, Equatable, Sendable {
        public let title: String
        public let turns: [Turn]
    }

    public let unitID: String
    public let scenes: [Scene]

    public var turns: [Turn] { scenes.flatMap(\.turns) }

    /// The learner's Romanian for turn `index`, when the script gives it;
    /// per reply when the turn accepts several.
    public func learnerRo(at index: Int, answer: String? = nil) -> String? {
        let all = turns
        guard all.indices.contains(index) else { return nil }
        let turn = all[index]
        if let answer, let byAnswer = turn.learnerRoByAnswer {
            let key = AnswerNormalizer.normalize(answer)
            if let match = byAnswer.first(where: { AnswerNormalizer.normalize($0.key) == key }) {
                return match.value
            }
        }
        return turn.learnerRo
    }

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
/// prompt (Alege replica pentru: „Îmi place humusul.”). Other prompts quote
/// what someone says in Arabizi, so they give none.
public enum DialoguePromptText {
    public static func quotedRomanian(in prompt: String) -> String? {
        guard prompt.hasPrefix("Alege replica pentru"),
              let open = prompt.firstIndex(of: "„"),
              let close = prompt[open...].firstIndex(of: "”") else { return nil }
        let quote = prompt[prompt.index(after: open)..<close].trimmingCharacters(in: .whitespaces)
        return quote.isEmpty ? nil : quote
    }
}
