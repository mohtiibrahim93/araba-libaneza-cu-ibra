import Foundation
import Testing
@testable import YallaCore

@Suite("Content foundation")
struct ContentFoundationTests {
    @Test("One Lebanese expression resolves through multiple learner languages")
    func expressionResolvesRomanianAndEnglish() throws {
        let expression = Expression(
            id: "expr.want.first-person",
            canonicalArabizi: "baddé",
            arabicScript: "بدّي",
            localizations: [
                "ro": ExpressionLocalization(naturalMeaning: "vreau"),
                "en": ExpressionLocalization(naturalMeaning: "I want")
            ]
        )

        #expect(try expression.localization(for: "ro").naturalMeaning == "vreau")
        #expect(try expression.localization(for: "en").naturalMeaning == "I want")
    }

    @Test("Changing learner-facing wording does not change expression identity")
    func stableIdentitySurvivesWordingChanges() {
        let before = Expression(
            id: "expr.want.first-person",
            canonicalArabizi: "badde",
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "vreau")]
        )
        let after = Expression(
            id: "expr.want.first-person",
            canonicalArabizi: "baddé",
            arabicScript: "بدّي",
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "vreau")]
        )

        #expect(before.id == after.id)
    }

    @Test("Valid content package passes reference validation")
    func validPackagePassesValidation() throws {
        let expression = Expression(
            id: "expr.water",
            canonicalArabizi: "mayy",
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "apă")]
        )
        let unit = JourneyUnit(
            id: "unit.restaurant",
            level: .a1,
            expressionIDs: [expression.id]
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 1, contentVersion: "1.0.0", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: [unit]
        )

        try ContentValidator().validate(package)
    }

    @Test("Broken expression references reject a content package")
    func brokenReferenceFailsValidation() {
        let unit = JourneyUnit(
            id: "unit.restaurant",
            level: .a1,
            expressionIDs: ["expr.missing"]
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 1, contentVersion: "1.0.0", defaultLearnerLocale: "ro"),
            expressions: [],
            units: [unit]
        )

        #expect(throws: ContentValidationError.self) {
            try ContentValidator().validate(package)
        }
    }
}

@Suite("Content repository")
struct ContentRepositoryTests {
    @Test("Repository decodes content and retrieves an expression by stable ID")
    func repositoryDecodesAndRetrievesExpression() throws {
        let json = #"""
        {
          "manifest": {
            "schemaVersion": 1,
            "contentVersion": "1.0.0",
            "defaultLearnerLocale": "ro"
          },
          "expressions": [
            {
              "id": "expr.hello",
              "canonicalArabizi": "mar7aba",
              "arabicScript": "مرحبا",
              "localizations": {
                "ro": { "naturalMeaning": "salut" },
                "en": { "naturalMeaning": "hello" }
              }
            }
          ],
          "units": [
            {
              "id": "unit.welcome",
              "level": "a1",
              "expressionIDs": ["expr.hello"]
            }
          ]
        }
        """#

        let repository = try JSONContentRepository(data: Data(json.utf8))

        #expect(try repository.expression(id: "expr.hello")?.canonicalArabizi == "mar7aba")
        #expect(try repository.expression(id: "expr.missing") == nil)
    }

    @Test("Default learner locale must exist for every expression")
    func missingDefaultLocalizationFailsValidation() {
        let expression = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            localizations: ["en": ExpressionLocalization(naturalMeaning: "hello")]
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 1, contentVersion: "1.0.0", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: []
        )

        #expect(throws: ContentValidationError.self) {
            try ContentValidator().validate(package)
        }
    }
}
