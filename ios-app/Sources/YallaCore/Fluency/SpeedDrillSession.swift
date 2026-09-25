import Foundation

public enum SpeedDrillDirection: String, Codable, Equatable, Sendable {
    case lebaneseToLearnerLanguage
    case learnerLanguageToLebanese
    case audioToLearnerLanguage
}

public enum SpeedDrillOutcome: String, Codable, Equatable, Sendable {
    case correct
    case wrong
    case skipped
}

public struct SpeedDrillAttempt: Equatable, Sendable {
    public let expressionID: String
    public let outcome: SpeedDrillOutcome
    public let responseTime: Double

    public init(expressionID: String, outcome: SpeedDrillOutcome, responseTime: Double) {
        self.expressionID = expressionID
        self.outcome = outcome
        self.responseTime = max(responseTime, 0)
    }
}

public struct SpeedDrillHistoryEntry: Identifiable, Codable, Equatable, Sendable {
    public let id: String
    public let direction: SpeedDrillDirection
    public let durationSeconds: Int
    public let elapsedSeconds: Int
    public let completedAt: Date
    public let seen: Int
    public let correct: Int
    public let wrong: Int
    public let skipped: Int
    public let accuracy: Double
    public let correctPerMinute: Double
    public let medianResponseTime: Double
    public let bestCorrectStreak: Int

    public init(
        id: String,
        direction: SpeedDrillDirection,
        durationSeconds: Int,
        elapsedSeconds: Int,
        completedAt: Date,
        metrics: SpeedDrillMetrics
    ) {
        self.id = id
        self.direction = direction
        self.durationSeconds = max(durationSeconds, 1)
        self.elapsedSeconds = max(elapsedSeconds, 1)
        self.completedAt = completedAt
        self.seen = metrics.seen
        self.correct = metrics.correct
        self.wrong = metrics.wrong
        self.skipped = metrics.skipped
        self.accuracy = metrics.accuracy
        self.correctPerMinute = metrics.correctPerMinute
        self.medianResponseTime = metrics.medianResponseTime
        self.bestCorrectStreak = metrics.bestCorrectStreak
    }
}

public struct SpeedDrillMetrics: Equatable, Sendable {
    public let seen: Int
    public let correct: Int
    public let wrong: Int
    public let skipped: Int
    public let accuracy: Double
    public let correctPerMinute: Double
    public let medianResponseTime: Double
    public let bestCorrectStreak: Int
    public let masteryAttempts: [Attempt]
    /// Correct answers in a row at the end of the attempts so far.
    public var currentCorrectStreak: Int = 0
    /// Answered (correct or wrong, not skipped) items per minute: the speed rate.
    public var answeredPerMinute: Double = 0
}

public struct SpeedDrillSession: Equatable, Sendable {
    public let direction: SpeedDrillDirection
    public let durationSeconds: Int
    public private(set) var attempts: [SpeedDrillAttempt]

    public init(direction: SpeedDrillDirection, durationSeconds: Int = 120) {
        self.direction = direction
        self.durationSeconds = max(durationSeconds, 1)
        self.attempts = []
    }

    public mutating func record(expressionID: String, outcome: SpeedDrillOutcome, responseTime: Double) {
        attempts.append(SpeedDrillAttempt(
            expressionID: expressionID,
            outcome: outcome,
            responseTime: responseTime
        ))
    }

    public func remainingSeconds(atElapsed elapsedSeconds: Int) -> Int {
        max(durationSeconds - max(elapsedSeconds, 0), 0)
    }

    public func isExpired(atElapsed elapsedSeconds: Int) -> Bool {
        elapsedSeconds >= durationSeconds
    }

    public var metrics: SpeedDrillMetrics {
        metrics(elapsedSeconds: durationSeconds)
    }

    public func metrics(elapsedSeconds: Int) -> SpeedDrillMetrics {
        let correct = attempts.filter { $0.outcome == .correct }.count
        let wrong = attempts.filter { $0.outcome == .wrong }.count
        let skipped = attempts.filter { $0.outcome == .skipped }.count
        let seen = attempts.count
        let accuracy = seen == 0 ? 0 : Double(correct) / Double(seen)
        let boundedElapsed = min(max(elapsedSeconds, 1), durationSeconds)
        let minutes = Double(boundedElapsed) / 60.0
        let correctPerMinute = minutes > 0 ? Double(correct) / minutes : 0

        return SpeedDrillMetrics(
            seen: seen,
            correct: correct,
            wrong: wrong,
            skipped: skipped,
            accuracy: accuracy,
            correctPerMinute: correctPerMinute,
            medianResponseTime: Self.median(attempts.map(\.responseTime)),
            bestCorrectStreak: Self.bestStreak(in: attempts),
            masteryAttempts: [],
            currentCorrectStreak: attempts.reversed().prefix { $0.outcome == .correct }.count,
            answeredPerMinute: minutes > 0 ? Double(correct + wrong) / minutes : 0
        )
    }

    private static func median(_ values: [Double]) -> Double {
        guard !values.isEmpty else { return 0 }
        let sorted = values.sorted()
        let middle = sorted.count / 2
        if sorted.count.isMultiple(of: 2) {
            return (sorted[middle - 1] + sorted[middle]) / 2
        }
        return sorted[middle]
    }

    private static func bestStreak(in attempts: [SpeedDrillAttempt]) -> Int {
        var current = 0
        var best = 0
        for attempt in attempts {
            if attempt.outcome == .correct {
                current += 1
                best = max(best, current)
            } else {
                current = 0
            }
        }
        return best
    }
}
