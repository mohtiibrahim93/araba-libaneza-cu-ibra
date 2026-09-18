public struct SessionCandidateContext: Sendable {
    public let dueExpressionIDs: Set<String>
    public let mistakeExpressionIDs: Set<String>
    public let reinforcementExpressionIDs: Set<String>
    public let weakSkills: Set<Skill>
    public let currentUnitIDs: Set<String>
    public let seenExpressionIDs: Set<String>
    public let probeExerciseIDs: Set<String>

    public init(
        dueExpressionIDs: Set<String> = [],
        mistakeExpressionIDs: Set<String> = [],
        reinforcementExpressionIDs: Set<String> = [],
        weakSkills: Set<Skill> = [],
        currentUnitIDs: Set<String> = [],
        seenExpressionIDs: Set<String> = [],
        probeExerciseIDs: Set<String> = []
    ) {
        self.dueExpressionIDs = dueExpressionIDs
        self.mistakeExpressionIDs = mistakeExpressionIDs
        self.reinforcementExpressionIDs = reinforcementExpressionIDs
        self.weakSkills = weakSkills
        self.currentUnitIDs = currentUnitIDs
        self.seenExpressionIDs = seenExpressionIDs
        self.probeExerciseIDs = probeExerciseIDs
    }
}

public struct SessionCandidateClassifier: Sendable {
    private let skillMapper: ExerciseSkillMapper

    public init(skillMapper: ExerciseSkillMapper = ExerciseSkillMapper()) {
        self.skillMapper = skillMapper
    }

    public func source(
        for exercise: ExerciseDefinition,
        context: SessionCandidateContext
    ) -> SessionCandidateSource {
        let expressionIDs = Set(exercise.expressionIDs)

        if !expressionIDs.isDisjoint(with: context.mistakeExpressionIDs) {
            return .mistake
        }
        if !expressionIDs.isDisjoint(with: context.dueExpressionIDs) {
            return .due
        }
        if let skill = skillMapper.skill(for: exercise.type), context.weakSkills.contains(skill) {
            return .weakSkill
        }
        if !expressionIDs.isDisjoint(with: context.reinforcementExpressionIDs) {
            return .reinforcement
        }
        if context.probeExerciseIDs.contains(exercise.id) {
            return .probe
        }
        if context.currentUnitIDs.contains(exercise.unitID) {
            return .current
        }
        if expressionIDs.isDisjoint(with: context.seenExpressionIDs) {
            return .newMaterial
        }
        return .reinforcement
    }

    public func candidates(
        from exercises: [ExerciseDefinition],
        context: SessionCandidateContext
    ) -> [SessionCandidate] {
        exercises.map { exercise in
            SessionCandidate(
                exercise: exercise,
                source: source(for: exercise, context: context)
            )
        }
    }
}
