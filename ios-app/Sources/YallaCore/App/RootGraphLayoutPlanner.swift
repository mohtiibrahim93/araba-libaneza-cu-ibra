public struct RootGraphLayoutPosition: Equatable, Sendable {
    public let memberIndex: Int
    public let ringIndex: Int
    public let indexInRing: Int
    public let membersInRing: Int
    public let angleTurns: Double

    public init(
        memberIndex: Int,
        ringIndex: Int,
        indexInRing: Int,
        membersInRing: Int,
        angleTurns: Double
    ) {
        self.memberIndex = memberIndex
        self.ringIndex = ringIndex
        self.indexInRing = indexInRing
        self.membersInRing = membersInRing
        self.angleTurns = angleTurns
    }
}

public struct RootGraphLayoutPlanner: Sendable {
    public let maxMembersPerRing: Int

    public init(maxMembersPerRing: Int = 8) {
        self.maxMembersPerRing = max(maxMembersPerRing, 1)
    }

    public func positions(memberCount: Int) -> [RootGraphLayoutPosition] {
        guard memberCount > 0 else { return [] }

        let ringCount = (memberCount + maxMembersPerRing - 1) / maxMembersPerRing
        let baseCount = memberCount / ringCount
        let remainder = memberCount % ringCount

        var positions: [RootGraphLayoutPosition] = []
        positions.reserveCapacity(memberCount)

        var memberIndex = 0
        for ringIndex in 0..<ringCount {
            let membersInRing = baseCount + (ringIndex < remainder ? 1 : 0)
            let staggerTurns = ringIndex.isMultiple(of: 2)
                ? 0
                : 0.5 / Double(membersInRing)

            for indexInRing in 0..<membersInRing {
                let angleTurns = (
                    Double(indexInRing) / Double(membersInRing) + staggerTurns
                ).truncatingRemainder(dividingBy: 1)

                positions.append(
                    RootGraphLayoutPosition(
                        memberIndex: memberIndex,
                        ringIndex: ringIndex,
                        indexInRing: indexInRing,
                        membersInRing: membersInRing,
                        angleTurns: angleTurns
                    )
                )
                memberIndex += 1
            }
        }

        return positions
    }
}
