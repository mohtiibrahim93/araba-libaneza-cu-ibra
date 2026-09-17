import YallaCore

enum AppSampleContent {
    static let shellModel: LearnerShellModel = {
        let expressions = [
            Expression(
                id: "expr.hello",
                canonicalArabizi: "mar7aba",
                arabicScript: "مرحبا",
                levelTags: [.a1],
                topics: ["saluturi"],
                localizations: ["ro": .init(naturalMeaning: "salut")]
            ),
            Expression(
                id: "expr.want.first-person",
                canonicalArabizi: "badde",
                arabicScript: "بدّي",
                levelTags: [.a1],
                topics: ["nevoi"],
                localizations: ["ro": .init(naturalMeaning: "vreau")]
            ),
            Expression(
                id: "expr.water",
                canonicalArabizi: "mayy",
                arabicScript: "ميّ",
                levelTags: [.a1],
                topics: ["restaurant"],
                localizations: ["ro": .init(naturalMeaning: "apă")]
            )
        ]

        let units = [
            JourneyUnit(
                id: "unit.welcome",
                level: .a1,
                expressionIDs: ["expr.hello"],
                localizations: ["ro": .init(title: "Mar7aba!", description: "Salută și prezintă-te în libaneză.")]
            ),
            JourneyUnit(
                id: "unit.needs",
                level: .a1,
                expressionIDs: ["expr.want.first-person"],
                localizations: ["ro": .init(title: "Badde, 3ande, fiye", description: "Spune ce vrei, ce ai și ce poți face.")]
            ),
            JourneyUnit(
                id: "unit.restaurant",
                level: .a1,
                expressionIDs: ["expr.water"],
                localizations: ["ro": .init(title: "La restaurant", description: "Comandă și răspunde natural.")]
            )
        ]

        let exercises = [
            ExerciseDefinition(
                id: "exercise.hello.choice",
                unitID: "unit.welcome",
                type: .multipleChoiceProduction,
                expressionIDs: ["expr.hello"]
            ),
            ExerciseDefinition(
                id: "exercise.want.write",
                unitID: "unit.needs",
                type: .freeProduction,
                expressionIDs: ["expr.want.first-person"]
            )
        ]

        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "sample", defaultLearnerLocale: "ro"),
            expressions: expressions,
            units: units,
            exercises: exercises
        )

        return (try? LearnerShellModelBuilder().build(from: package, locale: "ro"))
            ?? LearnerShellModel(
                home: .init(expressionCount: 0, journeyUnitCount: 0, exerciseCount: 0),
                journeySections: [],
                practiceModes: []
            )
    }()
}
