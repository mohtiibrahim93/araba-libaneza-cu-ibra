import Foundation

public struct OrientationPilotItem: Codable, Equatable, Sendable {
    public let id: String
    public let ordinal: Int
    public let internalBand: LevelBand
    public let prompt: [String: String]
    public let answer: String
    public let variants: [String]
    public let choices: [String]
    public let source: String

    public init(
        id: String, ordinal: Int, internalBand: LevelBand, prompt: [String: String],
        answer: String, variants: [String], choices: [String], source: String
    ) {
        self.id = id
        self.ordinal = ordinal
        self.internalBand = internalBand
        self.prompt = prompt
        self.answer = answer
        self.variants = variants
        self.choices = choices
        self.source = source
    }

    var question: OrientationQuestion {
        OrientationQuestion(
            id: id, ordinal: ordinal, internalBand: internalBand, prompt: prompt,
            exerciseType: choices.isEmpty ? .freeProduction : .multipleChoiceMeaning
        )
    }
}

/// The question UI receives neither the band nor the answer key.
public struct OrientationStepPresentation: Equatable, Sendable {
    public let id: String
    public let question: OrientationQuestionPresentation
    public let choices: [String]
}

public enum OrientationSessionError: Error, Equatable, Sendable {
    case invalidItem(String)
}

public struct OrientationSession: Sendable {
    private let items: [OrientationPilotItem]
    private var responses: [OrientationResponse] = []

    public init(items: [OrientationPilotItem]) throws {
        try OrientationQuestionBankValidator().validate(items.map(\.question))
        for item in items {
            guard (1...24).contains(item.ordinal),
                  !item.id.isEmpty, !item.source.isEmpty,
                  !item.prompt.isEmpty,
                  item.prompt.values.allSatisfy({ !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }),
                  !item.answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
                  item.choices.isEmpty || (
                    item.choices.count >= 2 &&
                    Set(item.choices).count == item.choices.count &&
                    item.choices.contains(item.answer) &&
                    item.choices.allSatisfy { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
                  )
            else { throw OrientationSessionError.invalidItem(item.id) }
        }
        self.items = items.sorted { $0.ordinal < $1.ordinal }
    }

    public var isFinished: Bool { responses.count == items.count }

    public func current(locale: String) throws -> OrientationStepPresentation? {
        guard !isFinished else { return nil }
        let item = items[responses.count]
        // Deterministic varied option placement, without altering authored text.
        let offset = item.choices.isEmpty ? 0 : item.ordinal % item.choices.count
        let choices = Array(item.choices.dropFirst(offset)) + Array(item.choices.prefix(offset))
        return OrientationStepPresentation(
            id: item.id,
            question: try item.question.presentation(locale: locale, totalQuestions: items.count),
            choices: choices
        )
    }

    /// True means recorded, never "correct". Stale taps cannot answer the next item.
    @discardableResult
    public mutating func record(questionID: String, answer: String?) -> Bool {
        guard !isFinished, items[responses.count].id == questionID else { return false }
        let item = items[responses.count]
        let correct: Bool
        if let answer {
            guard !answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return false }
            if !item.choices.isEmpty {
                guard item.choices.contains(answer) else { return false }
                correct = answer == item.answer
            } else {
                correct = AnswerEvaluator().evaluate(
                    answer: answer, canonical: item.answer,
                    spellingVariants: item.variants, pronunciationVariants: []
                ) != .incorrect
            }
        } else {
            correct = false
        }
        responses.append(OrientationResponse(questionID: item.id, isCorrect: correct))
        return true
    }

    public func result() throws -> OrientationResult? {
        guard isFinished else { return nil }
        return try OrientationEngine().score(questions: items.map(\.question), responses: responses)
    }
}

public extension OrientationResult {
    func startingJourneyUnit(in units: [JourneyUnit]) -> JourneyUnit? {
        let band: LevelBand
        switch startingPoint {
        case .a1Foundation: band = .a1
        case .a2Consolidation: band = .a2
        case .b1AvailableMaterial, .reviewAndEnrichment: band = .b1
        }
        return units.first { $0.level == band }
    }
}
