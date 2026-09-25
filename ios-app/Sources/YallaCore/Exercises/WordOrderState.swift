public struct WordOrderToken: Equatable, Sendable, Identifiable {
    public let id: Int
    public let value: String

    public init(id: Int, value: String) {
        self.id = id
        self.value = value
    }
}

public struct WordOrderState: Equatable, Sendable {
    public let canonicalAnswer: String
    public let tokens: [WordOrderToken]
    private let presentationOrder: [Int]
    public private(set) var selectedTokenIDs: [Int]

    public init(canonicalAnswer: String, presentedTokenOrder: [Int]? = nil) {
        self.canonicalAnswer = canonicalAnswer
        self.tokens = canonicalAnswer
            .split(whereSeparator: { $0.isWhitespace })
            .enumerated()
            .map { WordOrderToken(id: $0.offset, value: String($0.element)) }

        let defaultOrder = tokens.map(\.id)
        if let presentedTokenOrder,
           presentedTokenOrder.count == defaultOrder.count,
           Set(presentedTokenOrder) == Set(defaultOrder) {
            self.presentationOrder = presentedTokenOrder
        } else {
            self.presentationOrder = defaultOrder
        }
        self.selectedTokenIDs = []
    }

    public var remainingTokens: [WordOrderToken] {
        presentationOrder
            .filter { !selectedTokenIDs.contains($0) }
            .compactMap(token(id:))
    }

    public var selectedTokens: [WordOrderToken] {
        selectedTokenIDs.compactMap(token(id:))
    }

    public var submittedAnswer: String {
        selectedTokens.map(\.value).joined(separator: " ")
    }

    public var isCorrect: Bool {
        selectedTokenIDs.count == tokens.count &&
            AnswerNormalizer.normalize(submittedAnswer) == AnswerNormalizer.normalize(canonicalAnswer)
    }

    /// A stable shuffle of `count` token IDs derived from `seed` (e.g. the
    /// exercise ID): the same exercise always shows the same order, and the
    /// order is never the answer itself or the answer reversed when a third
    /// arrangement exists.
    public static func scrambledOrder(count: Int, seed: String) -> [Int] {
        var order = Array(0..<count)
        guard count > 1 else { return order }

        var state: UInt64 = 0xcbf29ce484222325
        for byte in seed.utf8 {
            state ^= UInt64(byte)
            state = state &* 0x100000001b3
        }
        func next() -> UInt64 {
            state = state &* 6364136223846793005 &+ 1442695040888963407
            return state >> 33
        }
        for index in stride(from: count - 1, to: 0, by: -1) {
            let other = Int(next() % UInt64(index + 1))
            order.swapAt(index, other)
        }

        let identity = Array(0..<count)
        let reversed = Array(identity.reversed())
        if count == 2 { return reversed }
        if order == identity || order == reversed {
            order = Array(order.dropFirst()) + [order[0]]
            if order == identity || order == reversed { order.swapAt(0, 1) }
        }
        return order
    }

    public mutating func select(tokenID: Int) {
        guard token(id: tokenID) != nil, !selectedTokenIDs.contains(tokenID) else { return }
        selectedTokenIDs.append(tokenID)
    }

    public mutating func undoLastSelection() {
        _ = selectedTokenIDs.popLast()
    }

    private func token(id: Int) -> WordOrderToken? {
        tokens.first { $0.id == id }
    }
}
