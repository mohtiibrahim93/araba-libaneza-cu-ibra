import Foundation

public struct ReviewState: Codable, Equatable, Sendable {
    public let seen: Int
    public let correct: Int
    public let streak: Int
    public let wrong: Bool
    public let lastAttemptAt: Date?
    public let reviewStage: Int?
    public let dueAt: Date?

    public init(
        seen: Int = 0,
        correct: Int = 0,
        streak: Int = 0,
        wrong: Bool = false,
        lastAttemptAt: Date? = nil,
        reviewStage: Int? = nil,
        dueAt: Date? = nil
    ) {
        self.seen = seen
        self.correct = correct
        self.streak = streak
        self.wrong = wrong
        self.lastAttemptAt = lastAttemptAt
        self.reviewStage = reviewStage
        self.dueAt = dueAt
    }
}

public struct ReviewScheduler: Sendable {
    public static let day: TimeInterval = 86_400
    public static let intervalsInDays = [1, 3, 7, 14, 30]

    public init() {}

    public func dueDate(for state: ReviewState) -> Date? {
        if let dueAt = state.dueAt { return dueAt }
        guard state.seen > 0, let lastAttemptAt = state.lastAttemptAt else { return nil }
        return lastAttemptAt.addingTimeInterval(Self.day)
    }

    public func isDue(_ state: ReviewState, at date: Date) -> Bool {
        guard let due = dueDate(for: state) else { return false }
        return due <= date
    }

    public func record(
        _ state: ReviewState,
        correct: Bool,
        hinted: Bool,
        at date: Date
    ) -> ReviewState {
        let earned = correct && !hinted
        let existingDue = dueDate(for: state)
        let advance = earned && (existingDue == nil || isDue(state, at: date))

        let stage: Int
        if earned {
            if advance {
                stage = min(Self.intervalsInDays.count - 1, (state.reviewStage ?? -1) + 1)
            } else {
                stage = state.reviewStage ?? 0
            }
        } else {
            stage = 0
        }

        let nextDue: Date?
        if !earned {
            nextDue = date.addingTimeInterval(Self.day)
        } else if advance {
            nextDue = date.addingTimeInterval(TimeInterval(Self.intervalsInDays[stage]) * Self.day)
        } else {
            nextDue = existingDue
        }

        return ReviewState(
            seen: state.seen + 1,
            correct: state.correct + (earned ? 1 : 0),
            streak: earned ? min(3, state.streak + 1) : 0,
            wrong: !earned,
            lastAttemptAt: date,
            reviewStage: stage,
            dueAt: nextDue
        )
    }
}
