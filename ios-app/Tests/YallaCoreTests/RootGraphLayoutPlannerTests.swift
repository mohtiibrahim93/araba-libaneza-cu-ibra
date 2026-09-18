import Testing
@testable import YallaCore

@Suite("Root graph layout")
struct RootGraphLayoutPlannerTests {
    @Test("Small families stay on one ring")
    func singleRing() {
        let positions = RootGraphLayoutPlanner().positions(memberCount: 6)

        #expect(positions.count == 6)
        #expect(Set(positions.map(\.ringIndex)) == [0])
        #expect(positions.allSatisfy { $0.membersInRing == 6 })
        #expect(positions.map(\.memberIndex) == Array(0..<6))
    }

    @Test("Large families split into balanced rings")
    func balancedRings() {
        let positions = RootGraphLayoutPlanner().positions(memberCount: 9)

        let firstRing = positions.filter { $0.ringIndex == 0 }
        let secondRing = positions.filter { $0.ringIndex == 1 }

        #expect(firstRing.count == 5)
        #expect(secondRing.count == 4)
        #expect(positions.map(\.memberIndex) == Array(0..<9))
        #expect(secondRing.first?.angleTurns != firstRing.first?.angleTurns)
    }

    @Test("Very large families add rings without exceeding capacity")
    func multipleRings() {
        let positions = RootGraphLayoutPlanner(maxMembersPerRing: 8)
            .positions(memberCount: 17)

        let ringCounts = Dictionary(grouping: positions, by: \.ringIndex)
            .mapValues(\.count)

        #expect(ringCounts == [0: 6, 1: 6, 2: 5])
        #expect(ringCounts.values.allSatisfy { $0 <= 8 })
        #expect(positions.map(\.memberIndex) == Array(0..<17))
    }

    @Test("Empty families produce no member positions")
    func empty() {
        #expect(RootGraphLayoutPlanner().positions(memberCount: 0).isEmpty)
    }
}
