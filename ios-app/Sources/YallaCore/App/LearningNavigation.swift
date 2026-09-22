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

public struct ListeningPracticeItem: Identifiable, Equatable, Sendable {
    public let id: String
    public let mode: ListeningMode
    public let expression: JourneyExpressionSummary
    public let audioAsset: AudioAsset
    public let choices: [String]
    public let spellingVariants: [String]
    public let pronunciationVariants: [String]
    public let revealWrittenLebaneseInitially: Bool

    public init(
        id: String,
        mode: ListeningMode,
        expression: JourneyExpressionSummary,
        audioAsset: AudioAsset,
        choices: [String] = [],
        spellingVariants: [String] = [],
        pronunciationVariants: [String] = [],
        revealWrittenLebaneseInitially: Bool = false
    ) {
        self.id = id
        self.mode = mode
        self.expression = expression
        self.audioAsset = audioAsset
        self.choices = choices
        self.spellingVariants = spellingVariants
        self.pronunciationVariants = pronunciationVariants
        self.revealWrittenLebaneseInitially = revealWrittenLebaneseInitially
    }
}

public struct SpeakAndCompareDestination: Equatable, Sendable {
    public let expression: JourneyExpressionSummary
    public let referenceAudioAsset: AudioAsset

    public init(expression: JourneyExpressionSummary, referenceAudioAsset: AudioAsset) {
        self.expression = expression
        self.referenceAudioAsset = referenceAudioAsset
    }
}

public enum PracticeDestination: Equatable, Sendable {
    case smartSession([ExerciseDefinition])
    case speedDrill([JourneyExpressionSummary])
    case listening([ListeningPracticeItem])
    case speakAndCompare(SpeakAndCompareDestination)
}

public struct LearningNavigationBuilder: Sendable {
    private let sessionBuilder: MixedSessionBuilder
    private let candidateClassifier: SessionCandidateClassifier

    public init(
        sessionBuilder: MixedSessionBuilder = MixedSessionBuilder(),
        candidateClassifier: SessionCandidateClassifier = SessionCandidateClassifier()
    ) {
        self.sessionBuilder = sessionBuilder
        self.candidateClassifier = candidateClassifier
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
        let exercises = ExpressionRecallBuilder().supplement(
            package.exercises.filter { $0.unitID == unit.id },
            from: package, expressionIDs: Set(unit.expressionIDs), locale: locale
        )

        return JourneyUnitDetail(
            id: unit.id,
            level: unit.level,
            title: localization.title,
            description: localization.description,
            expressions: expressions,
            exercises: exercises
        )
    }

    public func targetedPractice(
        expressionIDs: Set<String>,
        from package: ContentPackage,
        count: Int = 12
    ) -> [ExerciseDefinition] {
        guard !expressionIDs.isEmpty else { return [] }
        let candidates = ExpressionRecallBuilder().supplement(
            package.exercises, from: package, expressionIDs: expressionIDs,
            locale: package.manifest.defaultLearnerLocale
        ).filter { exercise in
            !Set(exercise.expressionIDs).isDisjoint(with: expressionIDs)
        }
        return sessionBuilder.build(from: candidates, count: count)
    }

    public func smartPractice(from package: ContentPackage, count: Int = 20, locale: String? = nil) -> [ExerciseDefinition] {
        sessionBuilder.build(from: ExpressionRecallBuilder().supplement(
            package.exercises, from: package, locale: locale ?? package.manifest.defaultLearnerLocale
        ), count: count)
    }

    public func smartPracticePlan(
        from package: ContentPackage,
        context: SessionCandidateContext,
        count: Int = 20,
        locale: String? = nil
    ) -> SessionPlan {
        let candidates = candidateClassifier.candidates(
            from: ExpressionRecallBuilder().supplement(
                package.exercises, from: package, locale: locale ?? package.manifest.defaultLearnerLocale
            ),
            context: context
        )
        return DefaultSessionPlanner(targetCount: count).makeSession(from: candidates)
    }

    public func smartPractice(
        from package: ContentPackage,
        context: SessionCandidateContext,
        count: Int = 20,
        locale: String? = nil
    ) -> [ExerciseDefinition] {
        smartPracticePlan(from: package, context: context, count: count, locale: locale)
            .items
            .map(\.exercise)
    }

    public func practiceDestination(
        id: String,
        from package: ContentPackage,
        locale: String,
        count: Int = 20,
        learnerContext: SessionCandidateContext? = nil
    ) throws -> PracticeDestination? {
        switch id {
        case "smart-session":
            let exercises = learnerContext.map {
                smartPractice(from: package, context: $0, count: count, locale: locale)
            } ?? smartPractice(from: package, count: count, locale: locale)
            return .smartSession(exercises)
        case "speed-drill":
            let target = max(count, 0)
            let expressionByID = Dictionary(
                uniqueKeysWithValues: package.expressions.map { ($0.id, $0) }
            )
            let selectedIDs: [String]
            if let learnerContext {
                selectedIDs = SpeedDrillSelectionPlanner(targetCount: target)
                    .makeSelection(
                        expressions: package.expressions,
                        units: package.units,
                        context: learnerContext
                    )
                    .map(\.expressionID)
            } else {
                selectedIDs = package.expressions
                    .prefix(target)
                    .map(\.id)
            }

            let expressions = try selectedIDs.compactMap { expressionID -> JourneyExpressionSummary? in
                guard let expression = expressionByID[expressionID] else { return nil }
                return JourneyExpressionSummary(
                    id: expression.id,
                    arabizi: expression.canonicalArabizi,
                    arabicScript: expression.arabicScript,
                    meaning: try expression.localization(for: locale).naturalMeaning
                )
            }
            return .speedDrill(expressions)
        case "listening":
            let target = max(count, 0)
            guard target > 0 else { return nil }

            let expressionsByID = Dictionary(
                uniqueKeysWithValues: package.expressions.map { ($0.id, $0) }
            )
            let audioByID = Dictionary(
                uniqueKeysWithValues: package.audioAssets.map { ($0.id, $0) }
            )

            var localizedMeanings: [String: String] = [:]
            for expression in package.expressions {
                localizedMeanings[expression.id] = try expression.localization(for: locale).naturalMeaning
            }

            let items = try package.listeningPrompts
                .sorted { $0.id < $1.id }
                .compactMap { prompt -> ListeningPracticeItem? in
                    guard let expression = expressionsByID[prompt.expressionID],
                          let audio = audioByID[prompt.audioAssetID],
                          audio.expressionID == expression.id,
                          let meaning = localizedMeanings[expression.id]
                    else {
                        return nil
                    }

                    let choices: [String]
                    if prompt.mode == .multipleChoice {
                        let distractors = prompt.choiceExpressionIDs.compactMap { choiceID in
                            localizedMeanings[choiceID]
                        }
                        choices = [meaning] + distractors
                    } else {
                        choices = []
                    }

                    return ListeningPracticeItem(
                        id: prompt.id,
                        mode: prompt.mode,
                        expression: JourneyExpressionSummary(
                            id: expression.id,
                            arabizi: expression.canonicalArabizi,
                            arabicScript: expression.arabicScript,
                            meaning: meaning
                        ),
                        audioAsset: audio,
                        choices: choices,
                        spellingVariants: expression.variants
                            .filter { $0.kind == .spelling }
                            .map(\.value),
                        pronunciationVariants: expression.variants
                            .filter { $0.kind == .pronunciation }
                            .map(\.value),
                        revealWrittenLebaneseInitially: prompt.revealWrittenLebaneseInitially
                    )
                }
                .prefix(target)

            let resolved = Array(items)
            return resolved.isEmpty ? nil : .listening(resolved)
        case "speaking":
            let resolver = AudioAssetResolver()
            let audioBackedExpressions = package.expressions.filter { expression in
                resolver.bestAsset(
                    for: expression.id,
                    from: package.audioAssets
                ) != nil
            }

            let selectedExpression: Expression?
            if let learnerContext {
                let selectedID = SpeedDrillSelectionPlanner(targetCount: 1)
                    .makeSelection(
                        expressions: audioBackedExpressions,
                        units: package.units,
                        context: learnerContext
                    )
                    .first?
                    .expressionID
                selectedExpression = selectedID.flatMap { selectedID in
                    audioBackedExpressions.first { $0.id == selectedID }
                }
            } else {
                selectedExpression = audioBackedExpressions.first
            }

            guard let expression = selectedExpression,
                  let asset = resolver.bestAsset(
                    for: expression.id,
                    from: package.audioAssets
                  )
            else {
                return nil
            }

            return .speakAndCompare(
                SpeakAndCompareDestination(
                    expression: JourneyExpressionSummary(
                        id: expression.id,
                        arabizi: expression.canonicalArabizi,
                        arabicScript: expression.arabicScript,
                        meaning: try expression.localization(for: locale).naturalMeaning
                    ),
                    referenceAudioAsset: asset
                )
            )
        default:
            return nil
        }
    }
}

