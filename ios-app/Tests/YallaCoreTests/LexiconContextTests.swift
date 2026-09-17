import Foundation
import Testing
@testable import YallaCore

@Suite("Lexicon context")
struct LexiconContextTests {
    @Test("Repository reports where an expression is used")
    func expressionUsage() throws {
        let expression = Expression(
            id: "expr.water",
            canonicalArabizi: "mayy",
            levelTags: [.a1],
            topics: ["drinks"],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "apă")]
        )
        let unit = JourneyUnit(
            id: "a1-restaurant",
            level: .a1,
            expressionIDs: [expression.id],
            localizations: ["ro": JourneyUnitLocalization(title: "Restaurant", description: "")]
        )
        let collection = LexiconCollection(
            id: "lexicon.drinks",
            expressionIDs: [expression.id],
            localizations: ["ro": LexiconCollectionLocalization(title: "Băuturi", description: "")]
        )
        let exercise = ExerciseDefinition(
            id: "drill-water",
            type: .grammarDrill,
            unitID: unit.id,
            expressionIDs: [expression.id],
            prompt: ["ro": "Spune apă"],
            answer: "mayy",
            wrongAnswers: []
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 3, contentVersion: "3.0.0", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: [unit],
            exercises: [exercise],
            lexiconCollections: [collection]
        )
        let repository = try JSONContentRepository(data: JSONEncoder().encode(package))

        let usage = try repository.usage(for: expression.id)
        #expect(usage.journeyUnitIDs == [unit.id])
        #expect(usage.lexiconCollectionIDs == [collection.id])
        #expect(usage.exerciseIDs == [exercise.id])
    }

    @Test("Search can be narrowed by CEFR level and topic")
    func filteredSearch() throws {
        let water = Expression(
            id: "expr.water",
            canonicalArabizi: "mayy",
            levelTags: [.a1],
            topics: ["restaurant", "drinks"],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "apă")]
        )
        let debate = Expression(
            id: "expr.debate",
            canonicalArabizi: "ni2aash",
            levelTags: [.c1],
            topics: ["discussion"],
            localizations: ["ro": ExpressionLocalization(naturalMeaning: "dezbatere")]
        )
        let package = ContentPackage(
            manifest: ContentManifest(schemaVersion: 3, contentVersion: "3.0.0", defaultLearnerLocale: "ro"),
            expressions: [water, debate],
            units: []
        )
        let repository = try JSONContentRepository(data: JSONEncoder().encode(package))

        #expect(try repository.searchExpressions(query: "", locale: "ro", filter: LexiconFilter(levels: [.a1])).map(\.id) == [water.id])
        #expect(try repository.searchExpressions(query: "", locale: "ro", filter: LexiconFilter(topics: ["discussion"])).map(\.id) == [debate.id])
    }
}
