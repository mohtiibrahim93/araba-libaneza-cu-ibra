public struct ExerciseSkillMapper: Sendable {
    public init() {}

    public func skill(for type: ExerciseDefinitionType) -> Skill? {
        switch type {
        case .multipleChoiceProduction:
            return .recall
        case .multipleChoiceMeaning, .reverseProduction:
            return .meaning
        case .freeProduction, .dialogueResponse:
            return .production
        case .matching:
            return .recognition
        case .wordOrder, .fillGap, .grammarDrill, .transformation:
            return .sentenceBuilding
        case .discovery:
            return nil
        case .listeningChoice, .listeningWrite:
            return .listening
        case .speakingCompare:
            return .speaking
        case .transferChallenge:
            return .transfer
        case .speedRecall:
            return .retrievalFluency
        }
    }
}
