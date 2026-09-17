public typealias Skill = MasterySkill

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
