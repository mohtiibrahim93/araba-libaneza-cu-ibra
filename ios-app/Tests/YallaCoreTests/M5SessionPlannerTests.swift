import Testing
@testable import YallaCore

@Suite("Adaptive session planner")
struct AdaptiveSessionPlannerTests {
    @Test("Default policy builds a 20 item session with source coverage and a single probe")
    func defaultPolicyCoverage() {
        let candidates = Self.standardCandidatePool()
        let plan = DefaultSessionPlanner().makeSession(from: candidates)

        #expect(plan.items.count == 20)
        #expect(Set(plan.items.map(\.exercise.id)).count == 20)
        #expect(plan.count(from: .due) >= 4)
        #expect(plan.count(from: .mistake) >= 3)
        #expect(plan.count(from: .weakSkill) >= 3)
        #expect(plan.count(from: .current) >= 3)
        #expect(plan.count(from: .newMaterial) >= 2)
        #expect(plan.count(from: .reinforcement) >= 2)
        #expect(plan.count(from: .probe) == 1)
    }

    @Test("Planner includes at least two listening or speaking items when available")
    func includesAudioModalities() {
        let candidates = Self.standardCandidatePool(includeAudioModalities: true)
        let plan = DefaultSessionPlanner().makeSession(from: candidates)
        let audioCount = plan.items.filter { item in
            item.skill == .listening || item.skill == .speaking
        }.count

        #expect(audioCount >= 2)
    }

    @Test("Scarce pools backfill from available candidates without duplicating exercises")
    func scarcePoolsBackfill() {
        var candidates: [SessionCandidate] = []
        for index in 0..<24 {
            candidates.append(Self.candidate(
                id: "current.\(index)",
                source: .current,
                type: index.isMultiple(of: 2) ? .freeProduction : .multipleChoiceMeaning
            ))
        }

        let plan = DefaultSessionPlanner().makeSession(from: candidates)

        #expect(plan.items.count == 20)
        #expect(Set(plan.items.map(\.exercise.id)).count == 20)
        #expect(plan.items.allSatisfy { $0.source == .current })
    }

    @Test("Ordering is deterministic and rotates sources instead of exhausting one pool first")
    func deterministicInterleaving() {
        let candidates = Self.standardCandidatePool()
        let planner = DefaultSessionPlanner()

        let first = planner.makeSession(from: candidates)
        let second = planner.makeSession(from: candidates)

        #expect(first.items.map(\.exercise.id) == second.items.map(\.exercise.id))
        #expect(Array(first.items.prefix(6).map(\.source)) == [
            .mistake, .due, .weakSkill, .current, .newMaterial, .reinforcement
        ])
    }

    @Test("Planner avoids consecutive identical modalities when an alternative is available")
    func rotatesExerciseTypes() {
        let candidates = Self.standardCandidatePool()
        let plan = DefaultSessionPlanner().makeSession(from: candidates)

        for pair in zip(plan.items, plan.items.dropFirst()) {
            if pair.0.exercise.type == pair.1.exercise.type {
                let remainingAlternative = candidates.contains { candidate in
                    !plan.items.prefix(while: { $0.exercise.id != pair.1.exercise.id }).contains(where: { $0.exercise.id == candidate.exercise.id })
                    && candidate.exercise.type != pair.0.exercise.type
                }
                #expect(!remainingAlternative)
            }
        }
    }

    private static func standardCandidatePool(includeAudioModalities: Bool = false) -> [SessionCandidate] {
        var result: [SessionCandidate] = []
        let sources: [SessionCandidateSource] = [
            .due, .mistake, .weakSkill, .current, .newMaterial, .reinforcement, .probe
        ]

        for source in sources {
            for index in 0..<8 {
                let type: ExerciseDefinitionType
                if includeAudioModalities && source == .current && index == 0 {
                    type = .listeningChoice
                } else if includeAudioModalities && source == .weakSkill && index == 0 {
                    type = .speakingCompare
                } else {
                    switch index % 4 {
                    case 0: type = .multipleChoiceMeaning
                    case 1: type = .freeProduction
                    case 2: type = .wordOrder
                    default: type = .dialogueResponse
                    }
                }
                result.append(candidate(
                    id: "\(source.rawValue).\(index)",
                    source: source,
                    type: type
                ))
            }
        }
        return result
    }

    private static func candidate(
        id: String,
        source: SessionCandidateSource,
        type: ExerciseDefinitionType
    ) -> SessionCandidate {
        SessionCandidate(
            exercise: ExerciseDefinition(
                id: id,
                type: type,
                unitID: "unit.test",
                expressionIDs: ["expr.\(id)"],
                prompt: ["ro": id],
                answer: id,
                wrongAnswers: []
            ),
            source: source
        )
    }
}
