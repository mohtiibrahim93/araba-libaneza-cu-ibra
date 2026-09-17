import Foundation
import Testing
@testable import YallaCore

@Suite("App content bootstrap")
struct AppContentBootstrapTests {
    private func package() -> ContentPackage {
        let hello = Expression(
            id: "expr.hello",
            canonicalArabizi: "mar7aba",
            arabicScript: "مرحبا",
            levelTags: [.a1],
            topics: ["saluturi"],
            localizations: [
                "ro": .init(naturalMeaning: "salut"),
                "en": .init(naturalMeaning: "hello")
            ]
        )
        let unit = JourneyUnit(
            id: "unit.hello",
            level: .a1,
            expressionIDs: [hello.id],
            localizations: [
                "ro": .init(title: "Salutări", description: "Începe conversația."),
                "en": .init(title: "Greetings", description: "Start the conversation.")
            ]
        )
        return ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "bootstrap-test", defaultLearnerLocale: "ro"),
            expressions: [hello],
            units: [unit]
        )
    }

    @Test("One validated package feeds shell and Discover presentation")
    func buildsCoherentPresentation() throws {
        let data = try JSONEncoder().encode(package())
        let content = try AppContentBootstrap().load(data: data)

        #expect(content.package.manifest.contentVersion == "bootstrap-test")
        #expect(content.locale == "ro")
        #expect(content.shell.home.expressionCount == 1)
        #expect(content.shell.journeySections.first?.units.first?.title == "Salutări")
        #expect(content.discover.entries.first?.arabizi == "mar7aba")
        #expect(content.discover.entries.first?.meaning == "salut")
    }

    @Test("Learner locale changes presentation without changing content identity")
    func supportsLocaleOverride() throws {
        let data = try JSONEncoder().encode(package())
        let content = try AppContentBootstrap().load(data: data, locale: "en")

        #expect(content.locale == "en")
        #expect(content.package.expressions.first?.id == "expr.hello")
        #expect(content.shell.journeySections.first?.units.first?.title == "Greetings")
        #expect(content.discover.entries.first?.meaning == "hello")
    }

    @Test("Invalid references are rejected before presentation is built")
    func rejectsInvalidPackage() throws {
        let invalid = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "invalid", defaultLearnerLocale: "ro"),
            expressions: [],
            units: [
                JourneyUnit(
                    id: "unit.broken",
                    level: .a1,
                    expressionIDs: ["expr.missing"],
                    localizations: ["ro": .init(title: "Broken", description: "Broken")]
                )
            ]
        )
        let data = try JSONEncoder().encode(invalid)

        #expect(throws: ContentValidationError.self) {
            _ = try AppContentBootstrap().load(data: data)
        }
    }
}
