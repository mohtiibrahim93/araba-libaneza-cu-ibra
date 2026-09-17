import Foundation
import Testing
@testable import YallaCore

@Suite("Root repository")
struct RootRepositoryTests {
    @Test("Repository can resolve a root family and build its graph")
    func repositoryBuildsRootFamilyGraph() throws {
        let json = #"""
        {
          "manifest": {"schemaVersion": 4, "contentVersion": "1.0.0", "defaultLearnerLocale": "ro"},
          "expressions": [
            {"id":"expr.kteb","canonicalArabizi":"kteb","localizations":{"ro":{"naturalMeaning":"carte"}}},
            {"id":"expr.keeteb","canonicalArabizi":"keeteb","localizations":{"ro":{"naturalMeaning":"a scris"}}}
          ],
          "units": [],
          "roots": [
            {"id":"root.ktb","arabiziRadicals":["k","t","b"],"arabicRadicals":"كتب"}
          ],
          "morphologicalPatterns": [
            {"id":"pattern.noun.book","kind":"noun","label":"Book noun","productivity":"lexicalized"},
            {"id":"pattern.verb.form1","kind":"verbStem","label":"Basic verb family","productivity":"limited"}
          ],
          "morphologyLinks": [
            {"expressionID":"expr.kteb","rootID":"root.ktb","patternID":"pattern.noun.book"},
            {"expressionID":"expr.keeteb","rootID":"root.ktb","patternID":"pattern.verb.form1"}
          ]
        }
        """#

        let repository = try JSONContentRepository(data: Data(json.utf8))
        let optionalGraph = try repository.rootFamilyGraph(rootID: "root.ktb")
        let graph = try #require(optionalGraph)

        #expect(graph.root.displayKey == "KTB")
        #expect(graph.nodes.filter { $0.kind == .expression }.count == 2)
    }

    @Test("Broken morphology references reject a package")
    func brokenMorphologyReferenceFails() {
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 4, contentVersion: "1.0.0", defaultLearnerLocale: "ro"),
            expressions: [],
            units: [],
            roots: [Root(id: "root.ktb", arabiziRadicals: ["k", "t", "b"])],
            morphologyLinks: [MorphologyLink(expressionID: "expr.missing", rootID: "root.ktb")]
        )

        #expect(throws: ContentValidationError.self) {
            try ContentValidator().validate(package)
        }
    }
}
