import Foundation

/// UI writes are ordered and retained until storage confirms success.
/// This queue is memory-only; it does not promise recovery after process termination.
@MainActor
public final class ProgressSaveQueue {
    public enum Operation: Sendable {
        case reload
        case attempt(LearningAttempt)
        case speedDrill(SpeedDrillHistoryEntry)
        case journeyUnit(String?)
        case savedExpression(String, Bool)
    }

    private var pending: [Operation] = []
    private var inFlight: Task<Void, Error>?
    public private(set) var latestSnapshot: LearnerProgressSnapshot?
    public var pendingCount: Int { pending.count }
    public var isSaving: Bool { inFlight != nil }

    public init() {}

    public func enqueue(_ operation: Operation) {
        pending.append(operation)
    }

    public func isExpressionSaved(_ id: String, in snapshot: LearnerProgressSnapshot) -> Bool {
        for operation in pending.reversed() {
            if case let .savedExpression(target, saved) = operation, target == id { return saved }
        }
        return (latestSnapshot ?? snapshot).savedExpressionIDs.contains(id)
    }

    public func flush(using repository: LearnerProgressRepository) async throws {
        if let inFlight {
            try await inFlight.value
            return
        }
        let task = Task { @MainActor in
            defer { self.inFlight = nil }
            while let operation = self.pending.first {
                let saved: LearnerProgressSnapshot
                switch operation {
                case .reload:
                    saved = try await repository.load()
                case let .attempt(attempt):
                    saved = try await repository.record(attempt)
                case let .speedDrill(entry):
                    saved = try await repository.recordSpeedDrill(entry)
                case let .journeyUnit(id):
                    saved = try await repository.setCurrentJourneyUnitID(id)
                case let .savedExpression(id, value):
                    saved = try await repository.setExpressionSaved(id, saved: value)
                }
                self.latestSnapshot = saved
                self.pending.removeFirst()
            }
        }
        inFlight = task
        try await task.value
    }
}
