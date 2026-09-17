public struct LearningSessionState: Equatable, Sendable {
    public let targetCount: Int
    public private(set) var completedCount: Int
    public private(set) var cleanFirstTryCount: Int
    public private(set) var hintedCount: Int
    public private(set) var mistakes: [ExerciseMistake]
    public private(set) var reinforcementExpressionIDs: Set<String>

    public init(targetCount: Int) {
        self.targetCount = max(targetCount, 0)
        self.completedCount = 0
        self.cleanFirstTryCount = 0
        self.hintedCount = 0
        self.mistakes = []
        self.reinforcementExpressionIDs = []
    }

    public var cleanAccuracy: Double {
        guard completedCount > 0 else { return 0 }
        return Double(cleanFirstTryCount) / Double(completedCount)
    }

    public var isComplete: Bool {
        completedCount >= targetCount
    }

    public mutating func record(_ resolution: ExerciseResolution) {
        guard resolution.completed, let attempt = resolution.attempt else { return }

        completedCount += 1

        if attempt.firstTryCorrect && !attempt.usedHint {
            cleanFirstTryCount += 1
        }

        if attempt.usedHint {
            hintedCount += 1
            reinforcementExpressionIDs.insert(attempt.expressionID)
        }

        if let mistake = resolution.mistake {
            mistakes.append(mistake)
            reinforcementExpressionIDs.insert(mistake.expressionID)
        } else if !attempt.firstTryCorrect {
            reinforcementExpressionIDs.insert(attempt.expressionID)
        }
    }
}
