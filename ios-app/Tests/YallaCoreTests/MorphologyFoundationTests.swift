import Testing
@testable import YallaCore

@Suite("Lebanese morphology foundation")
struct MorphologyFoundationTests {
    @Test("Root display key is normalized as a learner-friendly consonantal family")
    func rootDisplayKey() {
        let root = Root(
            id: "root.ktb",
            arabiziRadicals: ["k", "t", "b"],
            arabicRadicals: "كتب"
        )

        #expect(root.displayKey == "KTB")
    }

    @Test("Expressions from the same root remain distinct lexical entries")
    func groupsExpressionsByRootWithoutCollapsingIdentity() {
        let links = [
            MorphologyLink(expressionID: "expr.kteb", rootID: "root.ktb", patternID: "pattern.noun.book"),
            MorphologyLink(expressionID: "expr.keeteb", rootID: "root.ktb", patternID: "pattern.verb.form1"),
            MorphologyLink(expressionID: "expr.maktab", rootID: "root.ktb", patternID: "pattern.noun.place"),
            MorphologyLink(expressionID: "expr.maktoub", rootID: "root.ktb", patternID: "pattern.participle.passive")
        ]

        #expect(links.allSatisfy { $0.rootID == "root.ktb" })
        #expect(Set(links.map(\.expressionID)).count == 4)
    }

    @Test("Root explorer builds a central root node with one edge to each attested family member")
    func buildsRootExplorerGraph() {
        let root = Root(id: "root.ktb", arabiziRadicals: ["k", "t", "b"], arabicRadicals: "كتب")
        let expressions = [
            "expr.kteb": Expression(id: "expr.kteb", canonicalArabizi: "kteb", localizations: ["ro": .init(naturalMeaning: "carte")]),
            "expr.keeteb": Expression(id: "expr.keeteb", canonicalArabizi: "keeteb", localizations: ["ro": .init(naturalMeaning: "a scris")]),
            "expr.maktab": Expression(id: "expr.maktab", canonicalArabizi: "maktab", localizations: ["ro": .init(naturalMeaning: "birou")])
        ]
        let links = [
            MorphologyLink(expressionID: "expr.kteb", rootID: root.id, patternID: "pattern.noun.book"),
            MorphologyLink(expressionID: "expr.keeteb", rootID: root.id, patternID: "pattern.verb.form1"),
            MorphologyLink(expressionID: "expr.maktab", rootID: root.id, patternID: "pattern.noun.place")
        ]

        let graph = RootFamilyGraphBuilder().build(root: root, expressionsByID: expressions, links: links)

        #expect(graph.nodes.first?.kind == .root)
        #expect(graph.nodes.first?.label == "KTB")
        #expect(graph.nodes.filter { $0.kind == .expression }.count == 3)
        #expect(graph.edges.count == 3)
    }

    @Test("Morphological patterns are reusable but do not imply that every theoretical form exists")
    func patternProductivityIsExplicit() {
        let pattern = MorphologicalPattern(
            id: "pattern.participle.passive",
            kind: .participle,
            label: "Passive participle",
            productivity: .lexicalized
        )

        #expect(pattern.productivity == .lexicalized)
    }

    @Test("Plural relations are independent from root-family relations")
    func pluralRelationIsSeparate() {
        let plural = InflectionRelation(
            sourceExpressionID: "expr.book.singular",
            targetExpressionID: "expr.book.plural",
            kind: .plural,
            patternID: "pattern.plural.broken.example"
        )

        #expect(plural.kind == .plural)
        #expect(plural.sourceExpressionID != plural.targetExpressionID)
    }
}
