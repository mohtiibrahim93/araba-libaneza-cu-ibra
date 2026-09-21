import Foundation

public enum ProgressSaveOperation: Codable, Equatable, Sendable {
    case orientation(OrientationCheckpoint?)
    case reload
    case attempt(LearningAttempt)
    case speedDrill(SpeedDrillHistoryEntry)
    case journeyUnit(String?)
    case savedExpression(String, Bool)

    fileprivate var isDurable: Bool {
        if case .reload = self { return false }
        return true
    }
}

public protocol ProgressSaveOutbox: Sendable {
    func load() async throws -> [ProgressSaveOperation]
    func replace(with operations: [ProgressSaveOperation]) async throws
}

public enum ProgressSaveOutboxError: Error, Equatable, Sendable, LocalizedError {
    case unsupportedVersion(Int)

    public var errorDescription: String? {
        switch self {
        case let .unsupportedVersion(version):
            return "Coada locală de recuperare folosește o versiune incompatibilă (\(version))."
        }
    }
}

public actor InMemoryProgressSaveOutbox: ProgressSaveOutbox {
    private var operations: [ProgressSaveOperation]

    public init(operations: [ProgressSaveOperation] = []) {
        self.operations = operations.filter(\.isDurable)
    }

    public func load() async throws -> [ProgressSaveOperation] {
        operations
    }

    public func replace(with operations: [ProgressSaveOperation]) async throws {
        self.operations = operations.filter(\.isDurable)
    }
}

public actor JSONFileProgressSaveOutbox: ProgressSaveOutbox {
    private struct Envelope: Codable {
        let schemaVersion: Int
        let operations: [ProgressSaveOperation]
    }

    private static let schemaVersion = 1
    private let fileURL: URL

    public init(fileURL: URL) {
        self.fileURL = fileURL
    }

    public func load() async throws -> [ProgressSaveOperation] {
        let fileManager = FileManager.default
        guard fileManager.fileExists(atPath: fileURL.path) else { return [] }

        let data = try Data(contentsOf: fileURL)
        let envelope = try JSONDecoder().decode(Envelope.self, from: data)
        guard envelope.schemaVersion == Self.schemaVersion else {
            throw ProgressSaveOutboxError.unsupportedVersion(envelope.schemaVersion)
        }
        return envelope.operations.filter(\.isDurable)
    }

    public func replace(with operations: [ProgressSaveOperation]) async throws {
        let durableOperations = operations.filter(\.isDurable)
        let fileManager = FileManager.default

        if durableOperations.isEmpty {
            if fileManager.fileExists(atPath: fileURL.path) {
                try fileManager.removeItem(at: fileURL)
            }
            return
        }

        try fileManager.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true,
            attributes: nil
        )

        let envelope = Envelope(
            schemaVersion: Self.schemaVersion,
            operations: durableOperations
        )
        let data = try JSONEncoder().encode(envelope)
        try data.write(to: fileURL, options: .atomic)
    }
}

/// UI writes are ordered and retained until storage confirms success.
/// Durable operations are journaled separately so failed writes can be replayed after relaunch.
@MainActor
public final class ProgressSaveQueue {
    public typealias Operation = ProgressSaveOperation

    private let outbox: any ProgressSaveOutbox
    private var pending: [Operation] = []
    private var inFlight: Task<Void, Error>?
    private var restoreTask: Task<[ProgressSaveOperation], Error>?
    private var didRestore = false

    public private(set) var latestSnapshot: LearnerProgressSnapshot?
    public var pendingCount: Int { pending.count }
    public var isSaving: Bool { inFlight != nil }

    public init(outbox: any ProgressSaveOutbox = InMemoryProgressSaveOutbox()) {
        self.outbox = outbox
    }

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
        try await restoreIfNeeded()

        if let inFlight {
            try await inFlight.value
            return
        }

        let task = Task { @MainActor in
            defer { self.inFlight = nil }

            while let operation = self.pending.first {
                // Journal the current durable queue before mutating the primary progress store.
                try await self.persistPending()

                let saved: LearnerProgressSnapshot
                switch operation {
                case let .orientation(checkpoint):
                    saved = try await repository.setOrientationCheckpoint(checkpoint)
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

                // Remove from memory only after the durable outbox also records the removal.
                // If this cleanup fails, replay is safe because every write operation is idempotent.
                let remaining = Array(self.pending.dropFirst())
                try await self.outbox.replace(with: remaining.filter(\.isDurable))
                self.pending = remaining
            }
        }

        inFlight = task
        try await task.value
    }

    private func restoreIfNeeded() async throws {
        guard !didRestore else { return }

        let task: Task<[ProgressSaveOperation], Error>
        if let existing = restoreTask {
            task = existing
        } else {
            let outbox = self.outbox
            let created = Task {
                try await outbox.load()
            }
            restoreTask = created
            task = created
        }

        do {
            let restored = try await task.value
            if !didRestore {
                pending = restored.filter(\.isDurable) + pending
                didRestore = true
            }
            restoreTask = nil
        } catch {
            restoreTask = nil
            throw error
        }
    }

    private func persistPending() async throws {
        try await outbox.replace(with: pending.filter(\.isDurable))
    }
}
