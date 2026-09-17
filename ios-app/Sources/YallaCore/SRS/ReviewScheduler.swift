import Foundation

public struct ReviewState: Equatable, Sendable {
    public let stage: Int
    public let dueAt: Date?

    public init(stage: Int = 0, dueAt: Date? = nil) {
        self.stage = stage
        self.dueAt = dueAt
    }
}

public enum ReviewOutcome: Equatable, Sendable {
    case incorrect
    case correct(usedHint: Bool)
}

public struct DefaultReviewScheduler: Sendable {
    public let intervals = [1, 3, 7, 14, 30]

    public init() {}

    public func nextState(current: ReviewState, outcome: ReviewOutcome, now: Date) -> ReviewState {
        switch outcome {
        case .incorrect:
            return ReviewState(stage: 0, dueAt: addDays(1, to: now))
        case .correct(let usedHint) where usedHint:
            return ReviewState(stage: 0, dueAt: addDays(1, to: now))
        case .correct:
            if let dueAt = current.dueAt, dueAt > now {
                return current
            }
            let nextStage = min(current.stage + 1, intervals.count - 1)
            return ReviewState(stage: nextStage, dueAt: addDays(intervals[nextStage], to: now))
        }
    }

    private func addDays(_ days: Int, to date: Date) -> Date {
        Calendar(identifier: .gregorian).date(byAdding: .day, value: days, to: date)!
    }
}
