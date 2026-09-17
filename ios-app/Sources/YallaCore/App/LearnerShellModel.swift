public struct HomeSummary: Equatable, Sendable {
    public let expressionCount: Int
    public let journeyUnitCount: Int
    public let exerciseCount: Int

    public init(expressionCount: Int, journeyUnitCount: Int, exerciseCount: Int) {
        self.expressionCount = expressionCount
        self.journeyUnitCount = journeyUnitCount
        self.exerciseCount = exerciseCount
    }
}

public struct JourneyUnitSummary: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let description: String
    public let expressionCount: Int

    public init(id: String, title: String, description: String, expressionCount: Int) {
        self.id = id
        self.title = title
        self.description = description
        self.expressionCount = expressionCount
    }
}

public struct JourneySectionSummary: Identifiable, Equatable, Sendable {
    public var id: String { level.rawValue }
    public let level: LevelBand
    public let units: [JourneyUnitSummary]

    public init(level: LevelBand, units: [JourneyUnitSummary]) {
        self.level = level
        self.units = units
    }
}

public struct PracticeModeSummary: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let subtitle: String
    public let isAvailable: Bool

    public init(id: String, title: String, subtitle: String, isAvailable: Bool) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.isAvailable = isAvailable
    }
}

public struct LearnerShellModel: Equatable, Sendable {
    public let home: HomeSummary
    public let journeySections: [JourneySectionSummary]
    public let practiceModes: [PracticeModeSummary]

    public init(
        home: HomeSummary,
        journeySections: [JourneySectionSummary],
        practiceModes: [PracticeModeSummary]
    ) {
        self.home = home
        self.journeySections = journeySections
        self.practiceModes = practiceModes
    }
}

public struct LearnerShellModelBuilder: Sendable {
    public init() {}

    public func build(from package: ContentPackage, locale: String) throws -> LearnerShellModel {
        let grouped = Dictionary(grouping: package.units, by: \.level)
        let sections = try LevelBand.allCases.compactMap { level -> JourneySectionSummary? in
            guard let units = grouped[level], !units.isEmpty else { return nil }
            let summaries = try units.map { unit in
                let localization = try unit.localization(for: locale)
                return JourneyUnitSummary(
                    id: unit.id,
                    title: localization.title,
                    description: localization.description,
                    expressionCount: unit.expressionIDs.count
                )
            }
            return JourneySectionSummary(level: level, units: summaries)
        }

        let listeningAvailable = !package.listeningPrompts.isEmpty && !package.audioAssets.isEmpty
        let speakingAvailable = !package.audioAssets.isEmpty

        return LearnerShellModel(
            home: HomeSummary(
                expressionCount: package.expressions.count,
                journeyUnitCount: package.units.count,
                exerciseCount: package.exercises.count
            ),
            journeySections: sections,
            practiceModes: [
                PracticeModeSummary(
                    id: "smart-session",
                    title: "Sesiune inteligentă",
                    subtitle: "Recapitulări, greșeli, puncte slabe și material nou.",
                    isAvailable: !package.exercises.isEmpty
                ),
                PracticeModeSummary(
                    id: "speed-drill",
                    title: "Yalla! Două minute",
                    subtitle: "Reamintire rapidă pentru fluență și viteză.",
                    isAvailable: !package.expressions.isEmpty
                ),
                PracticeModeSummary(
                    id: "listening",
                    title: "Ascultare",
                    subtitle: "Ascultă fără text și identifică sau scrie ce auzi.",
                    isAvailable: listeningAvailable
                ),
                PracticeModeSummary(
                    id: "speaking",
                    title: "Spune și compară",
                    subtitle: "Înregistrează-te și compară cu o referință libaneză.",
                    isAvailable: speakingAvailable
                )
            ]
        )
    }
}
