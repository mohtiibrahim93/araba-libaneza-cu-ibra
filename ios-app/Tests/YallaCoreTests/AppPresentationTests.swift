import Testing
@testable import YallaCore

@Suite("Native shell presentation")
struct AppPresentationTests {
    private func package() -> ContentPackage {
        let hello = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            levelTags: [.a1],
            topics: ["saluturi"],
            localizations: ["ro": .init(naturalMeaning: "salut")]
        )
        let water = Expression(
            id: "expr.water",
            canonicalArabizi: "mayy",
            levelTags: [.a1],
            topics: ["restaurant"],
            localizations: ["ro": .init(naturalMeaning: "apă")]
        )
        let welcome = JourneyUnit(
            id: "unit.welcome",
            level: .a1,
            expressionIDs: [hello.id],
            localizations: ["ro": .init(title: "Mar7aba!", description: "Salută și prezintă-te")]
        )
        let restaurant = JourneyUnit(
            id: "unit.restaurant",
            level: .a1,
            expressionIDs: [water.id],
            localizations: ["ro": .init(title: "La restaurant", description: "Comandă și răspunde natural")]
        )
        let exercise = ExerciseDefinition(
            id: "exercise.hello.choice",
            type: .multipleChoiceProduction,
            unitID: welcome.id,
            expressionIDs: [hello.id],
            prompt: ["ro": "Cum spui «salut»?"],
            answer: "mar7aba",
            wrongAnswers: ["merci", "yalla"]
        )
        return ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: [hello, water],
            units: [welcome, restaurant],
            exercises: [exercise]
        )
    }

    @Test("Journey presentation is grouped by CEFR level and localized")
    func journeyGroupsLocalizedUnits() throws {
        let model = try LearnerShellModelBuilder().build(from: package(), locale: "ro")

        #expect(model.journeySections.count == 1)
        #expect(model.journeySections.first?.level == .a1)
        #expect(model.journeySections.first?.units.map(\.title) == ["Mar7aba!", "La restaurant"])
    }

    @Test("Home summary uses real package counts")
    func homeSummaryUsesPackageCounts() throws {
        let model = try LearnerShellModelBuilder().build(from: package(), locale: "ro")

        #expect(model.home.expressionCount == 2)
        #expect(model.home.journeyUnitCount == 2)
        #expect(model.home.exerciseCount == 1)
    }

    @Test("Speaking availability requires expression-linked reference audio")
    func speakingRequiresLinkedAudio() throws {
        let expression = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            localizations: ["ro": .init(naturalMeaning: "salut")]
        )
        let genericAudioPackage = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "generic-audio", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: [],
            audioAssets: [
                AudioAsset(
                    id: "audio.generic",
                    source: .genericFallback,
                    locator: "generic.m4a"
                )
            ]
        )
        let linkedAudioPackage = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "linked-audio", defaultLearnerLocale: "ro"),
            expressions: [expression],
            units: [],
            audioAssets: [
                AudioAsset(
                    id: "audio.hello",
                    expressionID: expression.id,
                    source: .approvedNative,
                    locator: "hello.m4a"
                )
            ]
        )

        let genericModel = try LearnerShellModelBuilder().build(from: genericAudioPackage, locale: "ro")
        let linkedModel = try LearnerShellModelBuilder().build(from: linkedAudioPackage, locale: "ro")

        #expect(genericModel.practiceModes.first(where: { $0.id == "speaking" })?.isAvailable == false)
        #expect(linkedModel.practiceModes.first(where: { $0.id == "speaking" })?.isAvailable == true)
    }

    @Test("Practice surfaces core learning modes without pretending unavailable media exists")
    func practiceModesReflectCapabilities() throws {
        let model = try LearnerShellModelBuilder().build(from: package(), locale: "ro")

        #expect(model.practiceModes.contains { $0.id == "smart-session" && $0.isAvailable })
        #expect(model.practiceModes.contains { $0.id == "speed-drill" && $0.isAvailable })
        #expect(model.practiceModes.contains { $0.id == "listening" && !$0.isAvailable })
        #expect(model.practiceModes.contains { $0.id == "speaking" && !$0.isAvailable })
    }
}
