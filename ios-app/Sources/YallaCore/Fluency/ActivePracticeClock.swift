import Foundation

/// Measures active practice only. Background interruptions require explicit resume.
public struct ActivePracticeClock: Equatable, Sendable {
    private var accumulated: TimeInterval = 0
    private var runningSince: Date?

    public init(startedAt: Date) { runningSince = startedAt }
    public var isPaused: Bool { runningSince == nil }

    public func elapsed(at date: Date) -> TimeInterval {
        accumulated + (runningSince.map { max(date.timeIntervalSince($0), 0) } ?? 0)
    }

    public mutating func pause(at date: Date) {
        guard runningSince != nil else { return }
        accumulated = elapsed(at: date)
        runningSince = nil
    }

    public mutating func resume(at date: Date) {
        guard runningSince == nil else { return }
        runningSince = date
    }
}
