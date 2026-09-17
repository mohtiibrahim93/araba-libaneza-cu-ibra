import Testing
@testable import YallaCore

@Suite("Journey and Practice navigation")
struct LearningNavigationTests {
    private func package() -> ContentPackage {
        let hello = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            levelTags: [.a1],
            localizations: ["ro": .init(naturalMeaning: "salut")]
        )
        let thanks = Expression(
            id: "expr.thanks",
            canonicalArabizi: "merci",
            levelTags: [.a1],
            localizations: ["ro": .init(naturalMeaning: "mulțumesc")]
        )
        let unit = JourneyUnit(
            id: "unit.welcome",
            level: .a1,
            expressionIDs: [hello.id, thanks.id],
            localizations: ["ro": .init(title: "Primele replici", description: "Salută și mulțumește.")]
        )
        let exercises = [
            ExerciseDefinition(
                id: "ex.choice",
                type: .multipleChoiceProduction,
                unitID: unit.id,
                expressionIDs: [hello.id],
                prompt: ["ro": "Cum spui salut?"],
                answer: "mar7aba",
                wrongAnswers: ["merci"]
            ),
            ExerciseDefinition(
                id: "ex.write",
                type: .freeProduction,
                unitID: unit.id,
                expressionIDs: [thanks.id],
                prompt: ["ro": "Cum spui mulțumesc?"],
                answer: "merci",
                wrongAnswers: []
            )
        ]
        return ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "navigation-test", defaultLearnerLocale: "ro"),
            expressions: [hello, thanks],
            units: [unit],
            exercises: exercises
        )
    }

    @Test("Journey detail resolves localized expressions and exercises from one unit")
    func journeyDetail() throws {
        let optionalDetail = try LearningNavigationBuilder().journeyUnit(
            id: "unit.welcome",
            from: package(),
            locale: "ro"
        )
        let detail = try #require(optionalDetail)

        #expect(detail.title == "Primele replici")
        #expect(detail.expressions.map(\.arabizi) == ["mar7aba", "merci"])
        #expect(detail.expressions.map(\.meaning) == ["salut", "mulțumesc"])
        #expect(detail.exercises.map(\.id) == ["ex.choice", "ex.write"])
    }

    @Test("Smart practice returns a bounded mixed session from real package exercises")
    func smartPractice() {
        let session = LearningNavigationBuilder().smartPractice(from: package(), count: 20)

        #expect(session.count == 2)
        #expect(Set(session.map(\.id)) == Set(["ex.choice", "ex.write"]))
    }

    @Test("Smart practice mode resolves to a real session destination")
    func smartPracticeDestination() throws {
        let optionalDestination = try LearningNavigationBuilder().practiceDestination(
            id: "smart-session",
            from: package(),
            locale: "ro",
            count: 20
        )
        let destination = try #require(optionalDestination)

        guard case let .smartSession(exercises) = destination else {
            Issue.record("Expected smart-session to resolve to a smart practice destination")
            return
        }

        #expect(exercises.count == 2)
        #expect(Set(exercises.map(\.id)) == Set(["ex.choice", "ex.write"]))
    }

    @Test("Speed drill mode resolves to a localized expression session")
    func speedDrillDestination() throws {
        let optionalDestination = try LearningNavigationBuilder().practiceDestination(
            id: "speed-drill",
            from: package(),
            locale: "ro",
            count: 20
        )
        let destination = try #require(optionalDestination)

        guard case let .speedDrill(expressions) = destination else {
            Issue.record("Expected speed-drill to resolve to a speed drill destination")
            return
        }

        #expect(expressions.map(\.arabizi) == ["mar7aba", "merci"])
        #expect(expressions.map(\.meaning) == ["salut", "mulțumesc"])
    }

    @Test("Unavailable practice modes do not fabricate a destination")
    func unavailablePracticeDestination() throws {
        let destination = try LearningNavigationBuilder().practiceDestination(
            id: "listening",
            from: package(),
            locale: "ro"
        )

        #expect(destination == nil)
    }

    @Test("Unknown Journey unit does not fabricate a destination")
    func missingUnit() throws {
        let detail = try LearningNavigationBuilder().journeyUnit(
            id: "unit.missing",
            from: package(),
            locale: "ro"
        )
        #expect(detail == nil)
    }
}
