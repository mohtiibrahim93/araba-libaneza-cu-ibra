public enum Skill: String, CaseIterable, Codable, Sendable {
    case recognition
    case meaning
    case recall
    case production
    case listening
    case sentenceBuilding
    case speaking
    case transfer
    case retrievalFluency
}

public struct Attempt: Equatable, Sendable {
    public let expressionID: String
    public let skill: Skill
    public let firstTryCorrect: Bool
    public let usedHint: Bool
    public let responseTime: Double

    public init(
        expressionID: String,
        skill: Skill,
        firstTryCorrect: Bool,
        usedHint: Bool,
        responseTime: Double
    ) {
        self.expressionID = expressionID
        self.skill = skill
        self.firstTryCorrect = firstTryCorrect
        self.usedHint = usedHint
        self.responseTime = responseTime
    }
}

public struct ExpressionMastery: Equatable, Sendable {
    public let expressionID: String
    private var scores: [Skill: Double]

    public init(expressionID: String, scores: [Skill: Double] = [:]) {
        self.expressionID = expressionID
        self.scores = scores
    }

    public func score(for skill: Skill) -> Double {
        scores[skill] ?? 0
    }

    fileprivate mutating func setScore(_ value: Double, for skill: Skill) {
        scores[skill] = min(max(value, 0), 1)
    }
}

public struct MasteryEngine: Sendable {
    public init() {}

    public func apply(attempt: Attempt, to mastery: inout ExpressionMastery) {
        let current = mastery.score(for: attempt.skill)
        let delta: Double

        if attempt.firstTryCorrect {
            delta = attempt.usedHint ? 0.08 : 0.18
        } else {
            delta = -0.12
        }

        mastery.setScore(current + delta, for: attempt.skill)
    }
}
