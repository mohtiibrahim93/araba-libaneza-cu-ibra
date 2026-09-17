import Foundation

public enum MasterySkill: String, Codable, CaseIterable, Hashable, Sendable {
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

public struct SkillProgress: Codable, Equatable, Sendable {
    public let attempts: Int
    public let correctAttempts: Int
    public let cleanCorrect: Int
    public let lastAttemptAt: Date?

    public init(
        attempts: Int = 0,
        correctAttempts: Int = 0,
        cleanCorrect: Int = 0,
        lastAttemptAt: Date? = nil
    ) {
        self.attempts = attempts
        self.correctAttempts = correctAttempts
        self.cleanCorrect = cleanCorrect
        self.lastAttemptAt = lastAttemptAt
    }
}

public struct ExpressionMastery: Codable, Equatable, Sendable {
    public let expressionID: String
    private let skillProgress: [MasterySkill: SkillProgress]

    public init(
        expressionID: String,
        skillProgress: [MasterySkill: SkillProgress] = [:]
    ) {
        self.expressionID = expressionID
        self.skillProgress = skillProgress
    }

    public func progress(for skill: MasterySkill) -> SkillProgress {
        skillProgress[skill] ?? SkillProgress()
    }

    fileprivate func replacingProgress(_ progress: [MasterySkill: SkillProgress]) -> ExpressionMastery {
        ExpressionMastery(expressionID: expressionID, skillProgress: progress)
    }

    fileprivate var allProgress: [MasterySkill: SkillProgress] {
        skillProgress
    }
}

public struct MasteryUpdater: Sendable {
    public init() {}

    public func record(
        _ mastery: ExpressionMastery,
        skills: Set<MasterySkill>,
        correct: Bool,
        hinted: Bool,
        at date: Date
    ) -> ExpressionMastery {
        var updated = mastery.allProgress
        let clean = correct && !hinted

        for skill in skills {
            let current = mastery.progress(for: skill)
            updated[skill] = SkillProgress(
                attempts: current.attempts + 1,
                correctAttempts: current.correctAttempts + (correct ? 1 : 0),
                cleanCorrect: current.cleanCorrect + (clean ? 1 : 0),
                lastAttemptAt: date
            )
        }

        return mastery.replacingProgress(updated)
    }
}
