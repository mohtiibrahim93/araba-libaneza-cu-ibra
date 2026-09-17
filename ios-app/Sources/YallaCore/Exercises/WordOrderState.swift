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
