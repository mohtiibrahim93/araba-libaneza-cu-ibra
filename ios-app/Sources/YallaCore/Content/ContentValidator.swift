public enum ContentValidationError: Error, Equatable, Sendable {
    case duplicateExpressionID(String)
    case duplicateUnitID(String)
    case duplicateExerciseID(String)
    case duplicateLexiconCollectionID(String)
    case duplicateRootID(String)
    case duplicateMorphologicalPatternID(String)
    case duplicateAudioAssetID(String)
    case duplicateListeningPromptID(String)
    case missingExpressionReference(unitID: String, expressionID: String)
    case missingDefaultLocalization(expressionID: String, locale: String)
    case missingDefaultUnitLocalization(unitID: String, locale: String)
    case missingExerciseUnitReference(exerciseID: String, unitID: String)
    case missingExerciseExpressionReference(exerciseID: String, expressionID: String)
    case missingDefaultLexiconCollectionLocalization(collectionID: String, locale: String)
    case missingLexiconExpressionReference(collectionID: String, expressionID: String)
    case missingMorphologyExpressionReference(expressionID: String)
    case missingMorphologyRootReference(rootID: String)
    case missingMorphologyPatternReference(patternID: String)
    case missingInflectionSourceExpressionReference(expressionID: String)
    case missingInflectionTargetExpressionReference(expressionID: String)
    case missingInflectionPatternReference(patternID: String)
    case missingAudioExpressionReference(audioAssetID: String, expressionID: String)
    case missingListeningAudioReference(promptID: String, audioAssetID: String)
    case missingListeningExpressionReference(promptID: String, expressionID: String)
}

public struct ContentValidator: Sendable {
    public init() {}

    public func validate(_ package: ContentPackage) throws {
        var expressionIDs = Set<String>()
        for expression in package.expressions {
            guard expressionIDs.insert(expression.id).inserted else {
                throw ContentValidationError.duplicateExpressionID(expression.id)
            }
            guard expression.localizations[package.manifest.defaultLearnerLocale] != nil else {
                throw ContentValidationError.missingDefaultLocalization(
                    expressionID: expression.id,
                    locale: package.manifest.defaultLearnerLocale
                )
            }
        }

        var unitIDs = Set<String>()
        for unit in package.units {
            guard unitIDs.insert(unit.id).inserted else {
                throw ContentValidationError.duplicateUnitID(unit.id)
            }
            guard unit.localizations[package.manifest.defaultLearnerLocale] != nil else {
                throw ContentValidationError.missingDefaultUnitLocalization(
                    unitID: unit.id,
                    locale: package.manifest.defaultLearnerLocale
                )
            }
            for expressionID in unit.expressionIDs where !expressionIDs.contains(expressionID) {
                throw ContentValidationError.missingExpressionReference(unitID: unit.id, expressionID: expressionID)
            }
        }

        var collectionIDs = Set<String>()
        for collection in package.lexiconCollections {
            guard collectionIDs.insert(collection.id).inserted else {
                throw ContentValidationError.duplicateLexiconCollectionID(collection.id)
            }
            guard collection.localizations[package.manifest.defaultLearnerLocale] != nil else {
                throw ContentValidationError.missingDefaultLexiconCollectionLocalization(
                    collectionID: collection.id,
                    locale: package.manifest.defaultLearnerLocale
                )
            }
            for expressionID in collection.expressionIDs where !expressionIDs.contains(expressionID) {
                throw ContentValidationError.missingLexiconExpressionReference(
                    collectionID: collection.id,
                    expressionID: expressionID
                )
            }
        }

        var exerciseIDs = Set<String>()
        for exercise in package.exercises {
            guard exerciseIDs.insert(exercise.id).inserted else {
                throw ContentValidationError.duplicateExerciseID(exercise.id)
            }
            guard unitIDs.contains(exercise.unitID) else {
                throw ContentValidationError.missingExerciseUnitReference(exerciseID: exercise.id, unitID: exercise.unitID)
            }
            for expressionID in exercise.expressionIDs where !expressionIDs.contains(expressionID) {
                throw ContentValidationError.missingExerciseExpressionReference(
                    exerciseID: exercise.id,
                    expressionID: expressionID
                )
            }
        }

        var rootIDs = Set<String>()
        for root in package.roots {
            guard rootIDs.insert(root.id).inserted else {
                throw ContentValidationError.duplicateRootID(root.id)
            }
        }

        var patternIDs = Set<String>()
        for pattern in package.morphologicalPatterns {
            guard patternIDs.insert(pattern.id).inserted else {
                throw ContentValidationError.duplicateMorphologicalPatternID(pattern.id)
            }
        }

        for link in package.morphologyLinks {
            guard expressionIDs.contains(link.expressionID) else {
                throw ContentValidationError.missingMorphologyExpressionReference(expressionID: link.expressionID)
            }
            guard rootIDs.contains(link.rootID) else {
                throw ContentValidationError.missingMorphologyRootReference(rootID: link.rootID)
            }
            if let patternID = link.patternID, !patternIDs.contains(patternID) {
                throw ContentValidationError.missingMorphologyPatternReference(patternID: patternID)
            }
        }

        for relation in package.inflectionRelations {
            guard expressionIDs.contains(relation.sourceExpressionID) else {
                throw ContentValidationError.missingInflectionSourceExpressionReference(expressionID: relation.sourceExpressionID)
            }
            guard expressionIDs.contains(relation.targetExpressionID) else {
                throw ContentValidationError.missingInflectionTargetExpressionReference(expressionID: relation.targetExpressionID)
            }
            if let patternID = relation.patternID, !patternIDs.contains(patternID) {
                throw ContentValidationError.missingInflectionPatternReference(patternID: patternID)
            }
        }

        var audioAssetIDs = Set<String>()
        for audio in package.audioAssets {
            guard audioAssetIDs.insert(audio.id).inserted else {
                throw ContentValidationError.duplicateAudioAssetID(audio.id)
            }
            if let expressionID = audio.expressionID, !expressionIDs.contains(expressionID) {
                throw ContentValidationError.missingAudioExpressionReference(
                    audioAssetID: audio.id,
                    expressionID: expressionID
                )
            }
        }

        var listeningPromptIDs = Set<String>()
        for prompt in package.listeningPrompts {
            guard listeningPromptIDs.insert(prompt.id).inserted else {
                throw ContentValidationError.duplicateListeningPromptID(prompt.id)
            }
            guard audioAssetIDs.contains(prompt.audioAssetID) else {
                throw ContentValidationError.missingListeningAudioReference(
                    promptID: prompt.id,
                    audioAssetID: prompt.audioAssetID
                )
            }
            guard expressionIDs.contains(prompt.expressionID) else {
                throw ContentValidationError.missingListeningExpressionReference(
                    promptID: prompt.id,
                    expressionID: prompt.expressionID
                )
            }
        }
    }
}
