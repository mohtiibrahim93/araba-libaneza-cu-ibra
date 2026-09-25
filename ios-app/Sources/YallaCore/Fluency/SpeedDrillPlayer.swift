public struct SpeedDrillCard: Identifiable, Equatable, Sendable {
    public let id: String
    public let lebanese: String
    public let learnerMeaning: String

    public init(id: String, lebanese: String, learnerMeaning: String) {
        self.id = id
        self.lebanese = lebanese
        self.learnerMeaning = learnerMeaning
    }
}

public struct SpeedDrillPrompt: Equatable, Sendable {
    public let expressionID: String
    public let question: String
    public let answer: String

    public init(expressionID: String, question: String, answer: String) {
        self.expressionID = expressionID
        self.question = question
        self.answer = answer
    }
}

public struct SpeedDrillPlayer: Equatable, Sendable {
    public let cards: [SpeedDrillCard]
    public private(set) var currentIndex: Int
    public private(set) var session: SpeedDrillSession

    public init(
        cards: [SpeedDrillCard],
        direction: SpeedDrillDirection,
        durationSeconds: Int = 120
    ) {
        self.cards = cards
        self.currentIndex = 0
        self.session = SpeedDrillSession(
            direction: direction,
            durationSeconds: durationSeconds
        )
    }

    public var currentPrompt: SpeedDrillPrompt? {
        guard !cards.isEmpty else { return nil }
        let card = cards[currentIndex]
        switch session.direction {
        case .learnerLanguageToLebanese:
            return SpeedDrillPrompt(
                expressionID: card.id,
                question: card.learnerMeaning,
                answer: card.lebanese
            )
        case .lebaneseToLearnerLanguage:
            return SpeedDrillPrompt(
                expressionID: card.id,
                question: card.lebanese,
                answer: card.learnerMeaning
            )
        case .audioToLearnerLanguage:
            return SpeedDrillPrompt(
                expressionID: card.id,
                question: card.lebanese,
                answer: card.learnerMeaning
            )
        }
    }

    /// Up to `count` answers for the current prompt: the right one plus other
    /// cards' answers whose meaning shares no content word with it, so only
    /// one choice can be read as correct. The right answer's position moves
    /// with the attempt count; the result is deterministic.
    public func choices(count: Int = 4) -> [String] {
        guard let prompt = currentPrompt, !cards.isEmpty else { return [] }
        let target = cards[currentIndex]
        let targetWords = JourneyLessonComposer.meaningWords(target.learnerMeaning)
        var seenAnswers: Set<String> = [AnswerNormalizer.normalize(prompt.answer)]
        var wrong: [String] = []
        for offset in 1..<max(cards.count, 1) {
            let candidate = cards[(currentIndex + offset) % cards.count]
            let answer = session.direction == .learnerLanguageToLebanese ? candidate.lebanese : candidate.learnerMeaning
            let normalized = AnswerNormalizer.normalize(answer)
            guard !normalized.isEmpty, !seenAnswers.contains(normalized),
                  JourneyLessonComposer.meaningWords(candidate.learnerMeaning).isDisjoint(with: targetWords)
            else { continue }
            seenAnswers.insert(normalized)
            wrong.append(answer)
            if wrong.count == count - 1 { break }
        }
        var result = wrong
        let position = session.attempts.count % (wrong.count + 1)
        result.insert(prompt.answer, at: position)
        return result
    }

    @discardableResult
    public mutating func record(
        _ outcome: SpeedDrillOutcome,
        responseTime: Double
    ) -> Bool {
        guard let prompt = currentPrompt else { return false }

        session.record(
            expressionID: prompt.expressionID,
            outcome: outcome,
            responseTime: responseTime
        )
        currentIndex = (currentIndex + 1) % cards.count
        return true
    }

    public func remainingSeconds(atElapsed elapsedSeconds: Int) -> Int {
        session.remainingSeconds(atElapsed: elapsedSeconds)
    }

    public func isExpired(atElapsed elapsedSeconds: Int) -> Bool {
        session.isExpired(atElapsed: elapsedSeconds)
    }
}
