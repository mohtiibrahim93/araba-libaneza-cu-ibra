public struct MatchingPair: Equatable, Sendable, Identifiable {
    public let id: String
    public let left: String
    public let right: String

    public init(id: String, left: String, right: String) {
        self.id = id
        self.left = left
        self.right = right
    }
}

public enum MatchingAttemptResult: Equatable, Sendable {
    case matched
    case incorrect
    case alreadyMatched
}

public struct MatchingState: Equatable, Sendable {
    public let pairs: [MatchingPair]
    public private(set) var matchedPairIDs: Set<String>

    public init(pairs: [MatchingPair]) {
        self.pairs = pairs
        self.matchedPairIDs = []
    }

    public var isComplete: Bool {
        !pairs.isEmpty && matchedPairIDs.count == Set(pairs.map(\.id)).count
    }

    public mutating func attempt(leftPairID: String, rightPairID: String) -> MatchingAttemptResult {
        if matchedPairIDs.contains(leftPairID) || matchedPairIDs.contains(rightPairID) {
            return .alreadyMatched
        }

        guard leftPairID == rightPairID, pairs.contains(where: { $0.id == leftPairID }) else {
            return .incorrect
        }

        matchedPairIDs.insert(leftPairID)
        return .matched
    }
}
