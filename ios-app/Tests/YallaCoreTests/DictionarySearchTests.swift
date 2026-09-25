import Testing
@testable import YallaCore

struct DictionarySearchTests {
    private func expression(_ id: String, _ arabizi: String, _ meaning: String) -> Expression {
        Expression(id: id, canonicalArabizi: arabizi, levelTags: [.a1], topics: [], localizations: ["ro": .init(naturalMeaning: meaning)])
    }

    private func model(
        _ expressions: [Expression],
        units: [[String]] = [],
        collections: [LexiconCollection] = [],
        roots: [Root] = [],
        links: [MorphologyLink] = []
    ) throws -> DiscoverModel {
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: expressions,
            units: units.enumerated().map { index, ids in
                JourneyUnit(id: "unit\(index)", level: .a1, expressionIDs: ids, localizations: ["ro": .init(title: "U\(index)", description: "")])
            },
            lexiconCollections: collections,
            roots: roots,
            morphologyLinks: links
        )
        return try DiscoverModelBuilder().build(from: package, locale: "ro")
    }

    private func entryLabels(_ results: [DiscoverSearchResult]) -> [String] {
        results.compactMap { result in
            if case let .entry(entry) = result { return entry.arabizi }
            return nil
        }
    }

    @Test func exactArabiziMatchComesBeforeMeaningMatches() throws {
        let model = try model([
            expression("a", "3amiil", "client (comerciant)"),
            expression("b", "merci", "mulțumesc")
        ])
        #expect(entryLabels(model.search("merci")) == ["merci", "3amiil"])
    }

    @Test func arabiziPrefixComesBeforeContains() throws {
        let model = try model([
            expression("a", "3a bayt", "spre casă"),
            expression("b", "baytna", "casa noastră"),
            expression("c", "bayt", "casă")
        ])
        #expect(entryLabels(model.search("bayt")) == ["bayt", "baytna", "3a bayt"])
    }

    @Test func romanianSearchIgnoresDiacritics() throws {
        let model = try model([expression("a", "merci", "mulțumesc")])
        #expect(entryLabels(model.search("multumesc")) == ["merci"])
    }

    @Test func identicalCardsAppearOnceAndKeepAllIDs() throws {
        let model = try model([
            expression("a", "Ahlan", "Salut! / Bun venit!"),
            expression("b", "Ahlan", "Salut! / Bun venit!"),
            expression("c", "Ahlan", "Salut/bună")
        ])
        let ahlan = model.entries.filter { $0.arabizi == "Ahlan" }
        #expect(ahlan.count == 2)
        let merged = try #require(ahlan.first { $0.meaning == "Salut! / Bun venit!" })
        #expect(merged.expressionIDs == ["a", "b"])
        #expect(model.entry(forExpressionID: "b")?.id == "a")
    }

    @Test func examplesAreWholeWordPhrasesShortestFirst() throws {
        let model = try model([
            expression("w", "bayt", "casă"),
            expression("p1", "Ana 2a3adt bel bayt w nemt.", "Am stat acasă și am dormit."),
            expression("p2", "2a3adt bel bayt.", "Am stat acasă."),
            expression("p3", "baytna kbiir", "casa noastră e mare")
        ])
        let word = try #require(model.entries.first { $0.arabizi == "bayt" })
        #expect(model.examples(for: word).map(\.arabizi) == ["2a3adt bel bayt.", "Ana 2a3adt bel bayt w nemt."])
        let phrase = try #require(model.entries.first { $0.id == "p2" })
        #expect(model.examples(for: phrase).isEmpty)
    }

    @Test func similarExpressionsShareAWordInTheSameUnit() throws {
        let model = try model([
            expression("e1", "Baddak tekol?", "Vrei să mănânci?"),
            expression("e2", "Baddak teshrab?", "Vrei să bei?"),
            expression("e3", "El 7seb law sama7et.", "Nota, vă rog."),
            expression("e4", "Baddak tnaam?", "Vrei să dormi?")
        ], units: [["e1", "e2", "e3"], ["e4"]])
        let eat = try #require(model.entries.first { $0.id == "e1" })
        #expect(model.similar(to: eat).map(\.id) == ["e2"])
    }

    @Test func singleWordsGetNoSimilarList() throws {
        let model = try model([
            expression("w1", "bayt", "casă"),
            expression("w2", "ouda", "cameră"),
            expression("p1", "Baytna kbiir.", "Casa noastră e mare.")
        ], units: [["w1", "w2", "p1"]])
        let house = try #require(model.entries.first { $0.id == "w1" })
        #expect(model.similar(to: house).isEmpty)
    }

    @Test func numberedWordListsAreNotThemes() throws {
        let model = try model([
            expression("a", "Baddak tekol?", "Vrei să mănânci?"),
            expression("b", "Baddak tnaam?", "Vrei să dormi?"),
            expression("c", "Baddak teshrab?", "Vrei să bei?")
        ], collections: [
            LexiconCollection(id: "v-index-35", expressionIDs: ["a", "b"], localizations: [:]),
            LexiconCollection(id: "v-food", expressionIDs: ["a", "c"], localizations: [:])
        ])
        let eat = try #require(model.entries.first { $0.id == "a" })
        #expect(model.similar(to: eat).map(\.id) == ["c"])
    }

    @Test func rootFamilyListsTheOtherMembers() throws {
        let model = try model([
            expression("sit", "2a3ad", "a se așeza"),
            expression("seated", "2ee3ed", "așezat"),
            expression("rule", "2a3de", "regulă"),
            expression("hit", "darab", "a lovi")
        ], roots: [
            Root(id: "root.q3d", arabiziRadicals: ["2", "3", "d"], arabicRadicals: "قعد")
        ], links: [
            MorphologyLink(expressionID: "sit", rootID: "root.q3d", patternID: nil),
            MorphologyLink(expressionID: "seated", rootID: "root.q3d", patternID: nil),
            MorphologyLink(expressionID: "rule", rootID: "root.q3d", patternID: nil)
        ])
        let sit = try #require(model.entries.first { $0.arabizi == "2a3ad" })
        let hit = try #require(model.entries.first { $0.arabizi == "darab" })
        #expect(model.rootFamily(of: sit).map(\.arabizi) == ["2ee3ed", "2a3de"])
        #expect(model.rootFamily(of: hit).isEmpty)
    }

    @Test func relatedRootsShowTheirFamilyBothWays() throws {
        let model = try model([
            expression("sit", "2a3ad", "a se așeza"),
            expression("seat", "ma23ad", "scaun"),
            expression("stand", "we2ef", "a sta în picioare"),
            expression("stop", "maw2af", "parcare, stație")
        ], roots: [
            Root(id: "root.q3d", arabiziRadicals: ["2", "3", "d"], relatedRootIDs: ["root.w2f"]),
            Root(id: "root.w2f", arabiziRadicals: ["w", "2", "f"])
        ], links: [
            MorphologyLink(expressionID: "sit", rootID: "root.q3d"),
            MorphologyLink(expressionID: "seat", rootID: "root.q3d"),
            MorphologyLink(expressionID: "stand", rootID: "root.w2f"),
            MorphologyLink(expressionID: "stop", rootID: "root.w2f")
        ])
        let sit = try #require(model.entries.first { $0.arabizi == "2a3ad" })
        let stand = try #require(model.entries.first { $0.arabizi == "we2ef" })
        #expect(model.relatedByMeaning(of: sit).map(\.arabizi) == ["we2ef", "maw2af"])
        #expect(model.relatedByMeaning(of: stand).map(\.arabizi) == ["2a3ad", "ma23ad"])
    }
}
