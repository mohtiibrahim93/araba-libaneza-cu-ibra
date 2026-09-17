import YallaCore

enum AppSampleContent {
    static let package: ContentPackage = {
        let expressions = [
            Expression(id: "expr.hello", canonicalArabizi: "mar7aba", arabicScript: "مرحبا", levelTags: [.a1], topics: ["saluturi"], localizations: ["ro": .init(naturalMeaning: "salut")]),
            Expression(id: "expr.want.first-person", canonicalArabizi: "badde", arabicScript: "بدّي", levelTags: [.a1], topics: ["nevoi"], localizations: ["ro": .init(naturalMeaning: "vreau")]),
            Expression(id: "expr.water", canonicalArabizi: "mayy", arabicScript: "ميّ", levelTags: [.a1], topics: ["restaurant"], localizations: ["ro": .init(naturalMeaning: "apă")]),
            Expression(id: "expr.kteb", canonicalArabizi: "kteb", levelTags: [.a1], topics: ["cuvinte"], localizations: ["ro": .init(naturalMeaning: "carte")]),
            Expression(id: "expr.keeteb", canonicalArabizi: "keeteb", levelTags: [.a1], topics: ["verbe"], localizations: ["ro": .init(naturalMeaning: "a scris")]),
            Expression(id: "expr.maktab", canonicalArabizi: "maktab", levelTags: [.a1], topics: ["locuri"], localizations: ["ro": .init(naturalMeaning: "birou")]),
            Expression(id: "expr.maktabe", canonicalArabizi: "maktabe", levelTags: [.a2], topics: ["locuri"], localizations: ["ro": .init(naturalMeaning: "bibliotecă")]),
            Expression(id: "expr.maktoub", canonicalArabizi: "maktoub", levelTags: [.a2], topics: ["participii"], localizations: ["ro": .init(naturalMeaning: "scris")])
        ]

        let units = [
            JourneyUnit(id: "unit.welcome", level: .a1, expressionIDs: ["expr.hello"], localizations: ["ro": .init(title: "Mar7aba!", description: "Salută și prezintă-te în libaneză.")]),
            JourneyUnit(id: "unit.needs", level: .a1, expressionIDs: ["expr.want.first-person"], localizations: ["ro": .init(title: "Badde, 3ande, fiye", description: "Spune ce vrei, ce ai și ce poți face.")]),
            JourneyUnit(id: "unit.restaurant", level: .a1, expressionIDs: ["expr.water"], localizations: ["ro": .init(title: "La restaurant", description: "Comandă și răspunde natural.")])
        ]

        let exercises = [
            ExerciseDefinition(
                id: "exercise.hello.choice",
                type: .multipleChoiceProduction,
                unitID: "unit.welcome",
                expressionIDs: ["expr.hello"],
                prompt: ["ro": "Cum spui salut?"],
                answer: "mar7aba",
                wrongAnswers: ["merci"]
            ),
            ExerciseDefinition(
                id: "exercise.want.write",
                type: .freeProduction,
                unitID: "unit.needs",
                expressionIDs: ["expr.want.first-person"],
                prompt: ["ro": "Cum spui vreau?"],
                answer: "badde",
                wrongAnswers: []
            )
        ]

        let root = Root(id: "root.ktb", arabiziRadicals: ["k", "t", "b"], arabicRadicals: "كتب")
        let patterns = [
            MorphologicalPattern(id: "pattern.noun.book", kind: .noun, label: "Noun"),
            MorphologicalPattern(id: "pattern.verb.form1", kind: .verbStem, label: "Verb pattern"),
            MorphologicalPattern(id: "pattern.noun.place", kind: .placeNoun, label: "Place noun"),
            MorphologicalPattern(id: "pattern.participle.passive", kind: .participle, label: "Passive participle")
        ]
        let links = [
            MorphologyLink(expressionID: "expr.kteb", rootID: root.id, patternID: "pattern.noun.book"),
            MorphologyLink(expressionID: "expr.keeteb", rootID: root.id, patternID: "pattern.verb.form1"),
            MorphologyLink(expressionID: "expr.maktab", rootID: root.id, patternID: "pattern.noun.place"),
            MorphologyLink(expressionID: "expr.maktabe", rootID: root.id, patternID: "pattern.noun.place"),
            MorphologyLink(expressionID: "expr.maktoub", rootID: root.id, patternID: "pattern.participle.passive")
        ]

        return ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "sample", defaultLearnerLocale: "ro"),
            expressions: expressions,
            units: units,
            exercises: exercises,
            roots: [root],
            morphologicalPatterns: patterns,
            morphologyLinks: links
        )
    }()

    static let shellModel: LearnerShellModel =
        (try? LearnerShellModelBuilder().build(from: package, locale: "ro"))
        ?? LearnerShellModel(home: .init(expressionCount: 0, journeyUnitCount: 0, exerciseCount: 0), journeySections: [], practiceModes: [])

    static let discoverModel: DiscoverModel =
        (try? DiscoverModelBuilder().build(from: package, locale: "ro"))
        ?? DiscoverModel(entries: [], roots: [], graphsByRootID: [:])
}
