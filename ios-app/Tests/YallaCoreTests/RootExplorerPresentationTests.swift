import Foundation
import Testing
@testable import YallaCore

struct RootExplorerPresentationTests {
    private func member(_ id: String, _ kind: MorphologicalPatternKind?) -> RootExplorerMember {
        RootExplorerMember(id: id, label: id, patternID: nil, patternKind: kind)
    }

    @Test func filtersComeOnlyFromPresentCategories() {
        let presentation = RootExplorerPresentation(members: [
            member("verb", .verbStem),
            member("office", .placeNoun),
            member("books", .plural)
        ])

        #expect(presentation.availableFilters == [.all, .verbs, .nouns, .places])
        #expect(presentation.visibleMembers(for: .nouns).map(\.id) == ["books"])
        #expect(presentation.visibleMembers(for: .all).map(\.id) == ["verb", "office", "books"])
    }

    @Test func singleCategoryFamilyHasNoFilterBar() {
        let presentation = RootExplorerPresentation(members: [
            member("a", .verbStem),
            member("b", .verbStem)
        ])
        #expect(presentation.availableFilters.isEmpty)
    }

    @Test func membersWithoutPatternAreOtherNotGuessed() {
        #expect(RootFamilyFilter.category(for: nil) == .other)
        #expect(RootFamilyFilter.category(for: .agentNoun) == .persons)
        #expect(RootFamilyFilter.category(for: .participle) == .participles)
    }

    @Test func selectionFallsBackToFirstVisibleMember() {
        let presentation = RootExplorerPresentation(members: [
            member("verb", .verbStem),
            member("office", .placeNoun),
            member("library", .placeNoun)
        ])

        #expect(presentation.resolvedSelection("library", for: .places) == "library")
        #expect(presentation.resolvedSelection("verb", for: .places) == "office")
        #expect(presentation.resolvedSelection(nil, for: .all) == "verb")
        #expect(RootExplorerPresentation(members: []).resolvedSelection("x", for: .all) == nil)
    }

    @Test func graphShowsAtMostSixMembersAndReportsOverflow() {
        let members = (1...7).map { member("m\($0)", .noun) }
        let presentation = RootExplorerPresentation(members: members)

        #expect(presentation.graphMembers(for: .all).map(\.id) == ["m1", "m2", "m3", "m4", "m5", "m6"])
        #expect(presentation.hasOverflow(for: .all))
        #expect(!RootExplorerPresentation(members: Array(members.prefix(6))).hasOverflow(for: .all))
    }

    @Test func slotsMatchMemberCount() {
        #expect(RootGraphSlot.slots(forCount: 0).isEmpty)
        #expect(RootGraphSlot.slots(forCount: 3) == [.top, .lowerLeading, .lowerTrailing])
        #expect(RootGraphSlot.slots(forCount: 5).count == 5)
        #expect(RootGraphSlot.slots(forCount: 5).first == .top)
        #expect(RootGraphSlot.slots(forCount: 6).last == .bottom)
        for count in 1...6 {
            let slots = RootGraphSlot.slots(forCount: count)
            #expect(slots.count == count)
            #expect(Set(slots).count == count)
        }
    }

    @Test func discoverModelKeepsApprovedMemberOrderAndMeanings() throws {
        let expressions = [
            Expression(id: "e.z", canonicalArabizi: "zzz", levelTags: [.a1], topics: [], localizations: ["ro": .init(naturalMeaning: "ultimul alfabetic")]),
            Expression(id: "e.a", canonicalArabizi: "aaa", levelTags: [.a1], topics: [], localizations: ["ro": .init(naturalMeaning: "primul alfabetic")])
        ]
        let root = Root(id: "root.test", arabiziRadicals: ["t", "s", "t"])
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: expressions,
            units: [],
            exercises: [],
            roots: [root],
            morphologyLinks: [
                MorphologyLink(expressionID: "e.z", rootID: root.id),
                MorphologyLink(expressionID: "e.a", rootID: root.id)
            ]
        )

        let model = try DiscoverModelBuilder().build(from: package, locale: "ro")
        let graph = try #require(model.rootGraph(rootID: root.id))
        #expect(graph.members.map(\.label) == ["zzz", "aaa"])
        #expect(graph.members.first?.meaning == "ultimul alfabetic")
    }
}
