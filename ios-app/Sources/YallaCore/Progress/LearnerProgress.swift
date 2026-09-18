import Foundation

public struct LearnerProgressSnapshot: Codable, Equatable, Sendable {
    public let attempts: [LearningAttempt]
    public let masteryByExpressionID: [String: ExpressionMastery]
    public let reviewByExpressionID: [String: ReviewState]
    public let activeMistakeExpressionIDs: Set<String>
    public let reinforcementExpressionIDs: Set<String>

    public init(
        attempts: [LearningAttempt] = [],
        masteryByExpressionID: [String: ExpressionMastery] = [:],
        reviewByExpressionID: [String: ReviewState] = [:],
        activeMistakeExpressionIDs: Set<String> = [],
        reinforcementExpressionIDs: Set<String> = []
    ) {
        self.attempts = attempts
        self.masteryByExpressionID = masteryByExpressionID
        self.reviewByExpressionID = reviewByExpressionID
        self.activeMistakeExpressionIDs = activeMistakeExpressionIDs
        self.reinforcementExpressionIDs = reinforcementExpressionIDs
    }

    public var seenExpressionIDs: Set<String> {
        Set(attempts.map(\.expressionID))
    }

    public var weakSkills: Set<MasterySkill> {
        var totals: [MasterySkill: (attempts: Int, clean: Int)] = [:]

        for mastery in masteryByExpressionID.values {
            for skill in MasterySkill.allCases {
                let progress = mastery.progress(for: skill)
                guard progress.attempts > 0 else { continue }
                let current = totals[skill] ?? (0, 0)
                totals[skill] = (
                    attempts: current.attempts + progress.attempts,
                    clean: current.clean + progress.cleanCorrect
                )
            }
        }

        return Set(totals.compactMap { skill, total in
            guard total.attempts >= 2 else { return nil }
            let cleanRate = Double(total.clean) / Double(total.attempts)
            return cleanRate < 0.6 ? skill : nil
        })
    }

    public func sessionCandidateContext(
        at date: Date,
        currentUnitIDs: Set<String> = [],
        probeExerciseIDs: Set<String> = []
    ) -> SessionCandidateContext {
        let scheduler = ReviewScheduler()
        let dueExpressionIDs = Set(
            reviewByExpressionID.compactMap { expressionID, review in
                scheduler.isDue(review, at: date) ? expressionID : nil
            }
        )

        return SessionCandidateContext(
            dueExpressionIDs: dueExpressionIDs,
            mistakeExpressionIDs: activeMistakeExpressionIDs,
            reinforcementExpressionIDs: reinforcementExpressionIDs,
            weakSkills: weakSkills,
            currentUnitIDs: currentUnitIDs,
            seenExpressionIDs: seenExpressionIDs,
            probeExerciseIDs: probeExerciseIDs
        )
    }
}

public struct LearnerProgressUpdater: Sendable {
    private let progressUpdater: AttemptProgressUpdater

    public init(progressUpdater: AttemptProgressUpdater = AttemptProgressUpdater()) {
        self.progressUpdater = progressUpdater
    }

    public func record(
        _ attempt: LearningAttempt,
        in snapshot: LearnerProgressSnapshot
    ) -> LearnerProgressSnapshot {
        guard !snapshot.attempts.contains(where: { $0.id == attempt.id }) else {
            return snapshot
        }

        let currentMastery = snapshot.masteryByExpressionID[attempt.expressionID]
            ?? ExpressionMastery(expressionID: attempt.expressionID)
        let currentReview = snapshot.reviewByExpressionID[attempt.expressionID]
            ?? ReviewState()
        let progress = progressUpdater.apply(
            attempt,
            review: currentReview,
            mastery: currentMastery
        )

        var mastery = snapshot.masteryByExpressionID
        mastery[attempt.expressionID] = progress.mastery

        var reviews = snapshot.reviewByExpressionID
        reviews[attempt.expressionID] = progress.review

        var mistakes = snapshot.activeMistakeExpressionIDs
        var reinforcement = snapshot.reinforcementExpressionIDs

        if attempt.earnedCleanCredit {
            mistakes.remove(attempt.expressionID)
            reinforcement.remove(attempt.expressionID)
        } else {
            if attempt.wasInitialMistake {
                mistakes.insert(attempt.expressionID)
            }
            reinforcement.insert(attempt.expressionID)
        }

        return LearnerProgressSnapshot(
            attempts: snapshot.attempts + [attempt],
            masteryByExpressionID: mastery,
            reviewByExpressionID: reviews,
            activeMistakeExpressionIDs: mistakes,
            reinforcementExpressionIDs: reinforcement
        )
    }
}

public protocol LearnerProgressStore: Sendable {
    func load() async throws -> LearnerProgressSnapshot
    func save(_ snapshot: LearnerProgressSnapshot) async throws
}

public actor InMemoryLearnerProgressStore: LearnerProgressStore {
    private var snapshot: LearnerProgressSnapshot

    public init(snapshot: LearnerProgressSnapshot = LearnerProgressSnapshot()) {
        self.snapshot = snapshot
    }

    public func load() async throws -> LearnerProgressSnapshot {
        snapshot
    }

    public func save(_ snapshot: LearnerProgressSnapshot) async throws {
        self.snapshot = snapshot
    }
}

public actor LearnerProgressRepository {
    private let store: any LearnerProgressStore
    private let updater: LearnerProgressUpdater

    public init(
        store: any LearnerProgressStore,
        updater: LearnerProgressUpdater = LearnerProgressUpdater()
    ) {
        self.store = store
        self.updater = updater
    }

    public func load() async throws -> LearnerProgressSnapshot {
        try await store.load()
    }

    @discardableResult
    public func record(_ attempt: LearningAttempt) async throws -> LearnerProgressSnapshot {
        let current = try await store.load()
        let updated = updater.record(attempt, in: current)
        try await store.save(updated)
        return updated
    }
}
