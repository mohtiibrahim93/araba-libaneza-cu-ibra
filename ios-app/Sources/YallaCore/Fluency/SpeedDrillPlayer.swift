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
