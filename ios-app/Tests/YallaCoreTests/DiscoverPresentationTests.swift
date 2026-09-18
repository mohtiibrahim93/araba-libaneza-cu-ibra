import Testing
@testable import YallaCore

@Suite("Discover presentation")
struct DiscoverPresentationTests {
    private func package() -> ContentPackage {
        let expressions = [
            Expression(id: "expr.kteb", canonicalArabizi: "kteb", levelTags: [.a1], topics: ["cuvinte"], localizations: ["ro": .init(naturalMeaning: "carte")]),
            Expression(
                id: "expr.keeteb",
                canonicalArabizi: "keeteb",
                variants: [
                    ExpressionVariant(value: "author-spelling", kind: .spelling),
                    ExpressionVariant(value: "author-pronunciation", kind: .pronunciation)
                ],
                levelTags: [.a1],
                topics: ["verbe"],
                localizations: [
                    "ro": .init(
                        naturalMeaning: "a scris",
                        literalMeaning: "el a scris",
                        pragmaticMeaning: "formă de trecut aprobată pentru acest exemplu"
                    )
                ]
            ),
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
            morphologicalPatterns: patterns,
            morphologyLinks: links,
            inflectionRelations: [
                InflectionRelation(
                    sourceExpressionID: "expr.keeteb",
                    targetExpressionID: "expr.maktab",
                    kind: .derivedForm,
                    patternID: "pattern.noun.place"
                )
            ],
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
            ]
        )
    }

    @Test("Discover exposes localized dictionary entries")
    func exposesDictionaryEntries() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")

        #expect(model.entries.count == 3)
        #expect(model.entries.contains { $0.arabizi == "kteb" && $0.meaning == "carte" })
    }

    @Test("Dictionary entries preserve authored literal and pragmatic meanings")
    func exposesMeaningLayers() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")
        let entry = try #require(model.entries.first { $0.id == "expr.keeteb" })

        #expect(entry.meaning == "a scris")
        #expect(entry.literalMeaning == "el a scris")
        #expect(entry.pragmaticMeaning == "formă de trecut aprobată pentru acest exemplu")

        let searchResults = model.search("trecut aprobată")
        #expect(searchResults.contains { result in
            guard case let .entry(found) = result else { return false }
            return found.id == entry.id
        })
    }

    @Test("Dictionary entries preserve authored spelling and pronunciation variants")
    func exposesAuthoredVariants() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")
        let entry = try #require(model.entries.first { $0.id == "expr.keeteb" })

        #expect(entry.spellingVariants == ["author-spelling"])
        #expect(entry.pronunciationVariants == ["author-pronunciation"])

        for query in ["author-spelling", "author-pronunciation"] {
            let searchResults = model.search(query)

            #expect(searchResults.contains { result in
                guard case let .entry(found) = result else { return false }
                return found.id == entry.id
            })
            #expect(searchResults.contains { result in
                guard case let .root(root) = result else { return false }
                return root.id == "root.ktb"
            })
        }
    }

    @Test("Dictionary entries expose the preferred linked audio asset")
    func exposesPreferredAudio() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")
        let entry = try #require(model.entries.first { $0.id == "expr.keeteb" })

        #expect(entry.preferredAudioAsset?.id == "audio.keeteb.ibrahim")
    }

    @Test("Dictionary entries expose only explicit inflection relations with approved pattern metadata")
    func exposesInflectionRelations() throws {
        let model = try DiscoverModelBuilder().build(from: package(), locale: "ro")

        let source = try #require(model.entries.first { $0.id == "expr.keeteb" })
        let outgoing = try #require(source.inflectionRelations.first)
        #expect(outgoing.relatedExpressionID == "expr.maktab")
        #expect(outgoing.relatedArabizi == "maktab")
        #expect(outgoing.kind == .derivedForm)
        #expect(outgoing.direction == .outgoing)
        #expect(outgoing.patternLabel == "Place noun")

        let target = try #require(model.entries.first { $0.id == "expr.maktab" })
        let incoming = try #require(target.inflectionRelations.first)
        #expect(incoming.relatedExpressionID == "expr.keeteb")
        #expect(incoming.direction == .incoming)
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
