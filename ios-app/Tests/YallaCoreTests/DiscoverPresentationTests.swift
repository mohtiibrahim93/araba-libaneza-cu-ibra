import Testing
@testable import YallaCore

@Suite("Discover presentation")
struct DiscoverPresentationTests {
    private func package() -> ContentPackage {
        let expressions = [
            Expression(id: "expr.kteb", canonicalArabizi: "kteb", levelTags: [.a1], topics: ["cuvinte"], localizations: ["ro": .init(naturalMeaning: "carte")]),
            Expression(id: "expr.keeteb", canonicalArabizi: "keeteb", levelTags: [.a1], topics: ["verbe"], localizations: ["ro": .init(naturalMeaning: "a scris")]),
            Expression(id: "expr.maktab", canonicalArabizi: "maktab", levelTags: [.a1], topics: ["locuri"], localizations: ["ro": .init(naturalMeaning: "birou")])
        ]
        let root = Root(id: "root.ktb", arabiziRadicals: ["k", "t", "b"], arabicRadicals: "كتب")
        let patterns = [
            MorphologicalPattern(id: "pattern.noun.book", kind: .noun, label: "Noun"),
            MorphologicalPattern(id: "pattern.verb.form1", kind: .verbStem, label: "Verb pattern"),
            MorphologicalPattern(id: "pattern.noun.place", kind: .placeNoun, label: "Place noun")
        ]
        let links = [
            MorphologyLink(expressionID: "expr.kteb", rootID: root.id, patternID: "pattern.noun.book"),
            MorphologyLink(expressionID: "expr.keeteb", rootID: root.id, patternID: "pattern.verb.form1"),
            MorphologyLink(expressionID: "expr.maktab", rootID: root.id, patternID: "pattern.noun.place")
        ]
        return ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: expressions,
            units: [],
            roots: [root],
            audioAssets: [
                AudioAsset(
                    id: "audio.keeteb.generated",
                    expressionID: "expr.keeteb",
                    source: .curatedGenerated,
                    locator: "keeteb-generated.m4a"
                ),
                AudioAsset(
                    id: "audio.keeteb.ibrahim",
                    expressionID: "expr.keeteb",
                    source: .ibrahimRecorded,
                    locator: "keeteb-ibrahim.m4a"
                )
            ],
            morphologicalPatterns: patterns,
            morphologyLinks: links
        )
    }

    @Test("Discover exposes localized dictionary entries")
    func exposesDictionaryEntries() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")

        #expect(model.entries.count == 3)
        #expect(model.entries.contains { $0.arabizi == "kteb" && $0.meaning == "carte" })
    }

    @Test("Dictionary entries expose the preferred linked audio asset")
    func exposesPreferredAudio() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")
        let entry = try #require(model.entries.first { $0.id == "expr.keeteb" })

        #expect(entry.preferredAudioAsset?.id == "audio.keeteb.ibrahim")
    }

    @Test("Discover exposes root bubbles with family counts")
    func exposesRootBubbles() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")

        #expect(model.roots.count == 1)
        #expect(model.roots.first?.displayKey == "KTB")
        #expect(model.roots.first?.memberCount == 3)
    }

    @Test("Root explorer keeps the root in the center and family members around it")
    func rootExplorerGraph() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")
        let graph = try #require(model.rootGraph(rootID: "root.ktb"))

        #expect(graph.centerLabel == "KTB")
        #expect(Set(graph.members.map(\.label)) == Set(["kteb", "keeteb", "maktab"]))

        let keeteb = try #require(graph.members.first { $0.id == "expr.keeteb" })
        #expect(keeteb.patternLabel == "Verb pattern")
        #expect(keeteb.patternKind == .verbStem)
        #expect(keeteb.patternProductivity == .limited)
    }
    @Test("Direct root search accepts compact, segmented, and Arabic radicals")
    func directRootSearch() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")

        for query in ["KTB", "K-T-B", "كتب"] {
            let results = model.search(query)
            #expect(results.contains { result in
                guard case let .root(root) = result else { return false }
                return root.id == "root.ktb"
            })
        }
    }

    @Test("Searching a family member surfaces both the expression and its root")
    func familyMemberSearch() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")
        let results = model.search("keeteb")

        #expect(results.contains { result in
            guard case let .entry(entry) = result else { return false }
            return entry.id == "expr.keeteb"
        })
        #expect(results.contains { result in
            guard case let .root(root) = result else { return false }
            return root.id == "root.ktb"
        })
    }

}
