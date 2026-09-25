import Foundation

/// First-try accuracy over a group of stored attempts.
public struct AccuracySummary: Equatable, Sendable {
    public let attempts: Int
    public let firstTryCorrect: Int

    public init(attempts: Int, firstTryCorrect: Int) {
        self.attempts = attempts
        self.firstTryCorrect = firstTryCorrect
    }

    /// Nil until something was attempted.
    public var rate: Double? {
        attempts > 0 ? Double(firstTryCorrect) / Double(attempts) : nil
    }

    static func of(_ attempts: [LearningAttempt]) -> AccuracySummary {
        AccuracySummary(attempts: attempts.count, firstTryCorrect: attempts.filter(\.firstTryCorrect).count)
    }
}

/// A Journey unit with enough answers to judge, and its first-try accuracy.
public struct UnitAttention: Equatable, Sendable, Identifiable {
    public let id: String
    public let title: String
    public let accuracy: AccuracySummary

    public init(id: String, title: String, accuracy: AccuracySummary) {
        self.id = id
        self.title = title
        self.accuracy = accuracy
    }
}

/// Unit data the insights need, independent of the content package type.
public struct ProgressTopicUnit: Equatable, Sendable {
    public let id: String
    public let title: String
    public let expressionIDs: [String]

    public init(id: String, title: String, expressionIDs: [String]) {
        self.id = id
        self.title = title
        self.expressionIDs = expressionIDs
    }
}

/// Figures for the Progress screen beyond the dashboard summary. Read-only:
/// derived from stored attempts, reviews and XP events; nothing is written.
public struct ProgressInsights: Equatable, Sendable {
    /// Dialogue answers (attempts that exercise transfer).
    public let conversation: AccuracySummary
    /// Answers about single words.
    public let vocabulary: AccuracySummary
    public let listening: AccuracySummary
    /// Single words answered at least once.
    public let wordsPractised: Int
    public let dueWords: Int
    public let duePhrases: Int
    /// Weakest units, only after enough answers.
    public let attentionUnits: [UnitAttention]
    public let lessonsPrevious30Days: Int
    /// Change against the previous 30 days; nil when that period had no lessons.
    public let lessonTrendPercent: Int?
}

public struct ProgressInsightsBuilder: Sendable {
    public static let minimumUnitAttempts = 10
    public static let attentionThreshold = 0.8

    private let calendar: Calendar

    public init(calendar: Calendar = .current) {
        self.calendar = calendar
    }

    public func insights(
        snapshot: LearnerProgressSnapshot,
        singleWordExpressionIDs: Set<String>,
        units: [ProgressTopicUnit],
        reviewExpressionIDs: Set<String>,
        lessonsLast30Days: Int,
        at date: Date
    ) -> ProgressInsights {
        let attempts = snapshot.attempts
        let conversation = AccuracySummary.of(attempts.filter { $0.skills.contains(.transfer) })
        let vocabulary = AccuracySummary.of(attempts.filter { singleWordExpressionIDs.contains($0.expressionID) })
        let listening = AccuracySummary.of(attempts.filter { $0.skills.contains(.listening) })
        let wordsPractised = snapshot.seenExpressionIDs.intersection(singleWordExpressionIDs).count

        let due = snapshot.dueExpressionIDs(at: date).intersection(reviewExpressionIDs)
        let dueWords = due.intersection(singleWordExpressionIDs).count

        var unitIDsByExpression: [String: [Int]] = [:]
        for (index, unit) in units.enumerated() {
            for expressionID in Set(unit.expressionIDs) {
                unitIDsByExpression[expressionID, default: []].append(index)
            }
        }
        var totals = Array(repeating: (attempts: 0, clean: 0), count: units.count)
        for attempt in attempts {
            for index in unitIDsByExpression[attempt.expressionID] ?? [] {
                totals[index].attempts += 1
                if attempt.firstTryCorrect { totals[index].clean += 1 }
            }
        }
        let weakUnits = units.indices
            .map { UnitAttention(id: units[$0].id, title: units[$0].title, accuracy: AccuracySummary(attempts: totals[$0].attempts, firstTryCorrect: totals[$0].clean)) }
            .filter { unit in
                guard unit.accuracy.attempts >= Self.minimumUnitAttempts, let rate = unit.accuracy.rate else { return false }
                return rate < Self.attentionThreshold
            }
            .sorted { lhs, rhs in
                let left = lhs.accuracy.rate ?? 0
                let right = rhs.accuracy.rate ?? 0
                if left != right { return left < right }
                return lhs.accuracy.attempts > rhs.accuracy.attempts
            }

        let previousStart = calendar.date(byAdding: .day, value: -60, to: date) ?? date
        let previousEnd = calendar.date(byAdding: .day, value: -30, to: date) ?? date
        let previous = snapshot.xpEvents.filter {
            $0.source == .lesson && $0.occurredAt > previousStart && $0.occurredAt <= previousEnd
        }.count
        let trend: Int? = previous > 0
            ? Int((Double(lessonsLast30Days - previous) / Double(previous) * 100).rounded())
            : nil

        return ProgressInsights(
            conversation: conversation,
            vocabulary: vocabulary,
            listening: listening,
            wordsPractised: wordsPractised,
            dueWords: dueWords,
            duePhrases: due.count - dueWords,
            attentionUnits: Array(weakUnits.prefix(3)),
            lessonsPrevious30Days: previous,
            lessonTrendPercent: trend
        )
    }
}
