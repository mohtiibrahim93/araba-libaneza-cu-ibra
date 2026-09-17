public enum SessionCandidateSource: String, CaseIterable, Codable, Equatable, Sendable {
    case due
    case mistake
    case weakSkill = "weak-skill"
    case current
    case newMaterial = "new"
    case reinforcement
    case probe
}

public struct SessionCandidate: Equatable, Sendable {
    public let exercise: ExerciseDefinition
    public let source: SessionCandidateSource

    public init(exercise: ExerciseDefinition, source: SessionCandidateSource) {
        self.exercise = exercise
        self.source = source
    }
}

public struct SessionPlanItem: Equatable, Sendable {
    public let exercise: ExerciseDefinition
    public let source: SessionCandidateSource
    public let skill: Skill?

    public init(exercise: ExerciseDefinition, source: SessionCandidateSource, skill: Skill?) {
        self.exercise = exercise
        self.source = source
        self.skill = skill
    }
}

public struct SessionPlan: Equatable, Sendable {
    public let items: [SessionPlanItem]

    public init(items: [SessionPlanItem]) {
        self.items = items
    }

    public func count(from source: SessionCandidateSource) -> Int {
        items.count { $0.source == source }
    }
}

public struct DefaultSessionPlanner: Sendable {
    public let targetCount: Int

    public init(targetCount: Int = 20) {
        self.targetCount = max(targetCount, 0)
    }

    public func makeSession(from candidates: [SessionCandidate]) -> SessionPlan {
        guard targetCount > 0 else { return SessionPlan(items: []) }

        var seen = Set<String>()
        let unique = candidates.filter { seen.insert($0.exercise.id).inserted }
        var pools = Dictionary(grouping: unique, by: \.source)
        let desired: [SessionCandidateSource: Int] = [
            .due: 4,
            .mistake: 3,
            .weakSkill: 3,
            .current: 3,
            .newMaterial: 2,
            .reinforcement: 2,
            .probe: 1
        ]
        let sourceCycle: [SessionCandidateSource] = [
            .due, .current, .mistake, .weakSkill, .newMaterial, .reinforcement
        ]

        var selected: [SessionCandidate] = []
        var selectedIDs = Set<String>()
        var sourceCounts: [SessionCandidateSource: Int] = [:]

        func expressionKey(_ candidate: SessionCandidate) -> String? {
            candidate.exercise.expressionIDs.first
        }

        func choose(from source: SessionCandidateSource, respectingQuota: Bool) -> SessionCandidate? {
            guard var pool = pools[source], !pool.isEmpty else { return nil }
            if respectingQuota, sourceCounts[source, default: 0] >= desired[source, default: 0] { return nil }

            let lastType = selected.last?.exercise.type
            let lastExpression = selected.last.flatMap(expressionKey)
            let index = pool.firstIndex { candidate in
                !selectedIDs.contains(candidate.exercise.id)
                    && candidate.exercise.type != lastType
                    && expressionKey(candidate) != lastExpression
            } ?? pool.firstIndex { candidate in
                !selectedIDs.contains(candidate.exercise.id)
                    && candidate.exercise.type != lastType
            } ?? pool.firstIndex { !selectedIDs.contains($0.exercise.id) }

            guard let index else { return nil }
            let candidate = pool.remove(at: index)
            pools[source] = pool
            return candidate
        }

        func append(_ candidate: SessionCandidate) {
            selected.append(candidate)
            selectedIDs.insert(candidate.exercise.id)
            sourceCounts[candidate.source, default: 0] += 1
        }

        var madeProgress = true
        while selected.count < targetCount && madeProgress {
            madeProgress = false
            for source in sourceCycle where selected.count < targetCount {
                if let candidate = choose(from: source, respectingQuota: true) {
                    append(candidate)
                    madeProgress = true
                }
            }
            if sourceCounts[.probe, default: 0] < desired[.probe, default: 0],
               selected.count >= 17,
               selected.count < targetCount,
               let probe = choose(from: .probe, respectingQuota: true) {
                append(probe)
                madeProgress = true
            }
        }

        let backfillOrder: [SessionCandidateSource] = [
            .due, .current, .mistake, .weakSkill, .newMaterial, .reinforcement
        ]
        while selected.count < min(targetCount, unique.count) {
            var added = false
            for source in backfillOrder where selected.count < min(targetCount, unique.count) {
                if let candidate = choose(from: source, respectingQuota: false) {
                    append(candidate)
                    added = true
                }
            }
            if !added { break }
        }

        return SessionPlan(items: selected.map { candidate in
            SessionPlanItem(
                exercise: candidate.exercise,
                source: candidate.source,
                skill: ExerciseSkillMapper().skill(for: candidate.exercise.type)
            )
        })
    }
}
