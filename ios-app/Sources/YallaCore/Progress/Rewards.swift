import Foundation

/// XP earned by one finished session. `id` makes recording idempotent.
public struct XPEvent: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    /// Learner's local calendar day, formatted `yyyy-MM-dd`.
    public let day: String
    public let amount: Int
    public let occurredAt: Date

    public init(id: String, day: String, amount: Int, occurredAt: Date) {
        self.id = id
        self.day = day
        self.amount = max(amount, 0)
        self.occurredAt = occurredAt
    }
}

/// Session XP: a flat completion award plus one point per clean first try.
public struct XPRewardPolicy: Sendable {
    public static let sessionCompletionXP = 10

    public init() {}

    public func xp(for state: LearningSessionState) -> Int {
        guard state.completedCount > 0 else { return 0 }
        return Self.sessionCompletionXP + state.cleanFirstTryCount
    }
}

public struct LearnerDay: Sendable {
    private let calendar: Calendar

    public init(calendar: Calendar = .current) {
        self.calendar = calendar
    }

    public func key(for date: Date) -> String {
        let parts = calendar.dateComponents([.year, .month, .day], from: date)
        return String(
            format: "%04d-%02d-%02d",
            parts.year ?? 0, parts.month ?? 0, parts.day ?? 0
        )
    }

    fileprivate func key(daysBefore count: Int, from date: Date) -> String? {
        calendar.date(byAdding: .day, value: -count, to: date).map(key(for:))
    }
}

public struct RewardSummary: Equatable, Sendable {
    public let totalXP: Int
    public let todayXP: Int
    /// Consecutive active days ending today, or yesterday if today has no XP yet.
    public let streakDays: Int
    public let isActiveToday: Bool

    public init(totalXP: Int, todayXP: Int, streakDays: Int, isActiveToday: Bool) {
        self.totalXP = totalXP
        self.todayXP = todayXP
        self.streakDays = streakDays
        self.isActiveToday = isActiveToday
    }
}

public struct RewardCalculator: Sendable {
    private let learnerDay: LearnerDay

    public init(calendar: Calendar = .current) {
        self.learnerDay = LearnerDay(calendar: calendar)
    }

    public func summary(events: [XPEvent], at date: Date) -> RewardSummary {
        var xpByDay: [String: Int] = [:]
        for event in events where event.amount > 0 {
            xpByDay[event.day, default: 0] += event.amount
        }

        let today = learnerDay.key(for: date)
        let activeToday = xpByDay[today] != nil
        var streak = 0
        var offset = activeToday ? 0 : 1
        while let day = learnerDay.key(daysBefore: offset, from: date), xpByDay[day] != nil {
            streak += 1
            offset += 1
        }

        return RewardSummary(
            totalXP: xpByDay.values.reduce(0, +),
            todayXP: xpByDay[today] ?? 0,
            streakDays: streak,
            isActiveToday: activeToday
        )
    }
}
