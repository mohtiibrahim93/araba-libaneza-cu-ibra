public struct JourneyExpressionSummary: Identifiable, Equatable, Sendable {
    public let id: String
    public let arabizi: String
    public let arabicScript: String?
    public let meaning: String

    public init(id: String, arabizi: String, arabicScript: String?, meaning: String) {
        self.id = id
        self.arabizi = arabizi
        self.arabicScript = arabicScript
        self.meaning = meaning
    }
}

public struct JourneyUnitDetail: Identifiable, Equatable, Sendable {
    public let id: String
    public let level: LevelBand
    public let title: String
    public let description: String
    public let expressions: [JourneyExpressionSummary]
    public let exercises: [ExerciseDefinition]

    public init(
        id: String,
        level: LevelBand,
        title: String,
        description: String,
        expressions: [JourneyExpressionSummary],
        exercises: [ExerciseDefinition]
    ) {
        self.id = id
        self.level = level
        self.title = title
        self.description = description
        self.expressions = expressions
        self.exercises = exercises
    }
}

public struct LearningNavigationBuilder: Sendable {
    private let sessionBuilder: MixedSessionBuilder

    public init(sessionBuilder: MixedSessionBuilder = MixedSessionBuilder()) {
        self.sessionBuilder = sessionBuilder
    }

    public func journeyUnit(
        id: String,
        from package: ContentPackage,
        locale: String
    ) throws -> JourneyUnitDetail? {
        guard let unit = package.units.first(where: { $0.id == id }) else {
            return nil
        }

        let localization = try unit.localization(for: locale)
        let expressionsByID = Dictionary(uniqueKeysWithValues: package.expressions.map { ($0.id, $0) })
        let expressions = try unit.expressionIDs.compactMap { expressionID -> JourneyExpressionSummary? in
            guard let expression = expressionsByID[expressionID] else { return nil }
            return JourneyExpressionSummary(
                id: expression.id,
                arabizi: expression.canonicalArabizi,
                arabicScript: expression.arabicScript,
                meaning: try expression.localization(for: locale).naturalMeaning
            )
        }
        let exercises = package.exercises.filter { $0.unitID == unit.id }

        return JourneyUnitDetail(
            id: unit.id,
            level: unit.level,
            title: localization.title,
            description: localization.description,
            expressions: expressions,
            exercises: exercises
        )
    }

    public func smartPractice(from package: ContentPackage, count: Int = 20) -> [ExerciseDefinition] {
        sessionBuilder.build(from: package.exercises, count: count)
    }
}
