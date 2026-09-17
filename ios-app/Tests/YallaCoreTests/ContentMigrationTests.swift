import Foundation
import Testing
@testable import YallaCore

@Suite("Migrated content schema")
struct ContentMigrationTests {
    @Test("Expression keeps typed spelling and pronunciation variants")
    func typedVariants() throws {
        let expression = Expression(
            id: "expr.what",
            canonicalArabizi: "shou",
            variants: [
                ExpressionVariant(value: "shu", kind: .spelling),
                ExpressionVariant(value: "sho", kind: .pronunciation)
            ],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "ce")]
        )

        #expect(expression.variants.map(\.kind) == [.spelling, .pronunciation])
    }

    @Test("Expression localization supports literal and pragmatic layers")
    func translationLayers() throws {
        let expression = Expression(
            id: "expr.sample",
            canonicalArabizi: "sample",
            localizations: [
                "ro": ExpressionLocalization(
                    naturalMeaning: "sens natural",
                    literalMeaning: "sens literal",
                    pragmaticMeaning: "sens în context"
                )
            ]
        )

        let ro = try expression.localization(for: "ro")
        #expect(ro.literalMeaning == "sens literal")
        #expect(ro.pragmaticMeaning == "sens în context")
    }

    @Test("Unit has learner-facing localized title and description")
    func localizedUnit() throws {
        let unit = JourneyUnit(
            id: "a1-welcome",
            level: .a1,
            expressionIDs: [],
            localizations: [
                "ro": JourneyUnitLocalization(title: "Saluturi", description: "Învață să saluți.")
            ]
        )

        #expect(try unit.localization(for: "ro").title == "Saluturi")
    }

    @Test("Explicit drill can be represented and looked up")
    func exerciseLookup() throws {
        let expression = Expression(
            id: "expr.want",
            canonicalArabizi: "baddé",
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "vreau")]
        )
        let unit = JourneyUnit(
            id: "a1-welcome",
            level: .a1,
            expressionIDs: [expression.id],
            localizations: ["ro": JourneyUnitLocalization(title: "Saluturi", description: "")]
        )
        let exercise = ExerciseDefinition(
            id: "drill-1",
            type: .grammarDrill,
            unitID: unit.id,
            expressionIDs: [expression.id],
            prompt: ["ro": "Completează"],
            answer: "baddé",
            wrongAnswers: ["baddak"]
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 3, contentVersion: "3.0.0", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: [unit],
            exercises: [exercise]
        )
        let data = try JSONEncoder().encode(package)
        let repository = try JSONContentRepository(data: data)

        #expect(try repository.exercise(id: "drill-1")?.answer == "baddé")
        #expect(try repository.exercises(in: unit.id).map(\.id) == ["drill-1"])
    }

    @Test("Exercise referencing a missing expression is rejected")
    func missingExerciseExpressionRejected() {
        let unit = JourneyUnit(
            id: "a1-welcome",
            level: .a1,
            expressionIDs: [],
            localizations: ["ro": JourneyUnitLocalization(title: "Saluturi", description: "")]
        )
        let exercise = ExerciseDefinition(
            id: "drill-bad",
            type: .grammarDrill,
            unitID: unit.id,
            expressionIDs: ["expr.missing"],
            prompt: ["ro": "Completează"],
            answer: "x",
            wrongAnswers: []
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 3, contentVersion: "3.0.0", defaultLearnerLocale: "ro"),
            expressions: [],
            units: [unit],
            exercises: [exercise]
        )

        #expect(throws: ContentValidationError.self) {
            try ContentValidator().validate(package)
        }
    }
}

@Suite("Lexicon collections")
struct LexiconCollectionTests {
    @Test("A lexicon collection can span multiple CEFR levels")
    func collectionIsIndependentFromJourneyLevel() throws {
        let a1 = Expression(
            id: "expr.apple",
            canonicalArabizi: "tiffe7a",
            levelTags: [.a1],
            topics: ["food", "fruit"],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "măr")]
        )
        let c1 = Expression(
            id: "expr.nuanced",
            canonicalArabizi: "ta3biir",
            levelTags: [.c1],
            topics: ["language"],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "expresie")]
        )
        let collection = LexiconCollection(
            id: "lexicon.mixed",
            expressionIDs: [a1.id, c1.id],
            localizations: ["ro": LexiconCollectionLocalization(title: "Vocabular mixt", description: "")]
        )

        #expect(collection.expressionIDs == ["expr.apple", "expr.nuanced"])
        #expect(a1.levelTags == [.a1])
        #expect(c1.levelTags == [.c1])
    }

    @Test("Repository searches Arabizi variants, Arabic script, meanings, topics, and collections")
    func searchableLexicon() throws {
        let expression = Expression(
            id: "expr.water",
            canonicalArabizi: "mayy",
            arabicScript: "ميّ",
            variants: [ExpressionVariant(value: "may", kind: .spelling)],
            levelTags: [.a1],
            topics: ["restaurant", "drinks"],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "apă")]
        )
        let collection = LexiconCollection(
            id: "lexicon.restaurant",
            expressionIDs: [expression.id],
            localizations: ["ro": LexiconCollectionLocalization(title: "Restaurant", description: "")]
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 3, contentVersion: "3.0.0", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: [],
            exercises: [],
            lexiconCollections: [collection]
        )
        let repository = try JSONContentRepository(data: JSONEncoder().encode(package))

        #expect(try repository.searchExpressions(query: "may", locale: "ro").map(\.id) == [expression.id])
        #expect(try repository.searchExpressions(query: "apa", locale: "ro").map(\.id) == [expression.id])
        #expect(try repository.searchExpressions(query: "مي", locale: "ro").map(\.id) == [expression.id])
        #expect(try repository.searchExpressions(query: "restaurant", locale: "ro").map(\.id) == [expression.id])
    }
}
