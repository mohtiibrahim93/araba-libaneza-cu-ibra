import Foundation

/// Invalidates asynchronous permission completions when a screen is left or interrupted.
public struct RecordingRequestGate: Sendable {
    private var pending: UUID?
    public init() {}
    public var isPending: Bool { pending != nil }

    public mutating func begin() -> UUID? {
        guard pending == nil else { return nil }
        let token = UUID()
        pending = token
        return token
    }

    public mutating func complete(_ token: UUID) -> Bool {
        guard pending == token else { return false }
        pending = nil
        return true
    }

    public mutating func cancel() { pending = nil }
}
