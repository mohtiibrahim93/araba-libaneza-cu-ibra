import Foundation

public enum LearnerProgressSchema {
    public static let currentVersion = 3
}

public enum LearnerProgressMigrationError: Error, Equatable, Sendable {
    case unsupportedVersion(Int)
}

public struct LearnerProgressMigrator: Sendable {
    public init() {}

    public func migrate(_ snapshot: LearnerProgressSnapshot) throws -> LearnerProgressSnapshot {
        guard snapshot.schemaVersion >= 1,
              snapshot.schemaVersion <= LearnerProgressSchema.currentVersion
        else {
            throw LearnerProgressMigrationError.unsupportedVersion(snapshot.schemaVersion)
        }

        guard snapshot.schemaVersion < LearnerProgressSchema.currentVersion else {
            return snapshot
        }

        return LearnerProgressSnapshot(
            schemaVersion: LearnerProgressSchema.currentVersion,
            attempts: snapshot.attempts,
            masteryByExpressionID: snapshot.masteryByExpressionID,
            reviewByExpressionID: snapshot.reviewByExpressionID,
            activeMistakeExpressionIDs: snapshot.activeMistakeExpressionIDs,
            reinforcementExpressionIDs: snapshot.reinforcementExpressionIDs,
            currentJourneyUnitID: snapshot.currentJourneyUnitID,
            savedExpressionIDs: snapshot.savedExpressionIDs
        )
    }
}

public struct ExpressionGroupProgress: Equatable, Sendable {
    public let totalCount: Int
    public let practicedCount: Int
    public let unseenCount: Int
    public let dueCount: Int
    public let mistakeCount: Int
    public let savedCount: Int

    public init(
        totalCount: Int = 0,
        practicedCount: Int = 0,
        unseenCount: Int = 0,
        dueCount: Int = 0,
        mistakeCount: Int = 0,
        savedCount: Int = 0
    ) {
        self.totalCount = totalCount
        self.practicedCount = practicedCount
        self.unseenCount = unseenCount
        self.dueCount = dueCount
        self.mistakeCount = mistakeCount
        self.savedCount = savedCount
    }
}

public struct LearnerProgressSnapshot: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let attempts: [LearningAttempt]
    public let masteryByExpressionID: [String: ExpressionMastery]
    public let reviewByExpressionID: [String: ReviewState]
    public let activeMistakeExpressionIDs: Set<String>
    public let reinforcementExpressionIDs: Set<String>
    public let currentJourneyUnitID: String?
    public let savedExpressionIDs: Set<String>

    public init(
        schemaVersion: Int = LearnerProgressSchema.currentVersion,
        attempts: [LearningAttempt] = [],
        masteryByExpressionID: [String: ExpressionMastery] = [:],
        reviewByExpressionID: [String: ReviewState] = [:],
        activeMistakeExpressionIDs: Set<String> = [],
        reinforcementExpressionIDs: Set<String> = [],
        currentJourneyUnitID: String? = nil,
        savedExpressionIDs: Set<String> = []
    ) {
        self.schemaVersion = schemaVersion
        self.attempts = attempts
        self.masteryByExpressionID = masteryByExpressionID
        self.reviewByExpressionID = reviewByExpressionID
        self.activeMistakeExpressionIDs = activeMistakeExpressionIDs
        self.reinforcementExpressionIDs = reinforcementExpressionIDs
        self.currentJourneyUnitID = currentJourneyUnitID
        self.savedExpressionIDs = savedExpressionIDs
    }

    private enum CodingKeys: String, CodingKey {
        case schemaVersion
        case attempts
        case masteryByExpressionID
        case reviewByExpressionID
        case activeMistakeExpressionIDs
        case reinforcementExpressionIDs
        case currentJourneyUnitID
        case savedExpressionIDs
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        schemaVersion = try container.decodeIfPresent(Int.self, forKey: .schemaVersion) ?? 1
        attempts = try container.decodeIfPresent([LearningAttempt].self, forKey: .attempts) ?? []
        masteryByExpressionID = try container.decodeIfPresent(
            [String: ExpressionMastery].self,
            forKey: .masteryByExpressionID
        ) ?? [:]
        reviewByExpressionID = try container.decodeIfPresent(
            [String: ReviewState].self,
            forKey: .reviewByExpressionID
        ) ?? [:]
        activeMistakeExpressionIDs = try container.decodeIfPresent(
            Set<String>.self,
            forKey: .activeMistakeExpressionIDs
        ) ?? []
        reinforcementExpressionIDs = try container.decodeIfPresent(
            Set<String>.self,
            forKey: .reinforcementExpressionIDs
        ) ?? []
        currentJourneyUnitID = try container.decodeIfPresent(
            String.self,
            forKey: .currentJourneyUnitID
        )
        savedExpressionIDs = try container.decodeIfPresent(
            Set<String>.self,
            forKey: .savedExpressionIDs
        ) ?? []
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(schemaVersion, forKey: .schemaVersion)
        try container.encode(attempts, forKey: .attempts)
        try container.encode(masteryByExpressionID, forKey: .masteryByExpressionID)
        try container.encode(reviewByExpressionID, forKey: .reviewByExpressionID)
        try container.encode(activeMistakeExpressionIDs, forKey: .activeMistakeExpressionIDs)
        try container.encode(reinforcementExpressionIDs, forKey: .reinforcementExpressionIDs)
        try container.encodeIfPresent(currentJourneyUnitID, forKey: .currentJourneyUnitID)
        try container.encode(savedExpressionIDs, forKey: .savedExpressionIDs)
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

    public func dueExpressionIDs(at date: Date) -> Set<String> {
        let scheduler = ReviewScheduler()
        return Set(
            reviewByExpressionID.compactMap { expressionID, review in
                scheduler.isDue(review, at: date) ? expressionID : nil
            }
        )
    }

    public func expressionGroupProgress(
        expressionIDs: Set<String>,
        at date: Date
    ) -> ExpressionGroupProgress {
        let practicedIDs = seenExpressionIDs.intersection(expressionIDs)
        let dueIDs = dueExpressionIDs(at: date).intersection(expressionIDs)

        return ExpressionGroupProgress(
            totalCount: expressionIDs.count,
            practicedCount: practicedIDs.count,
            unseenCount: expressionIDs.count - practicedIDs.count,
            dueCount: dueIDs.count,
            mistakeCount: activeMistakeExpressionIDs.intersection(expressionIDs).count,
            savedCount: savedExpressionIDs.intersection(expressionIDs).count
        )
    }

    public func sessionCandidateContext(
        at date: Date,
        currentUnitIDs: Set<String>? = nil,
        probeExerciseIDs: Set<String> = []
    ) -> SessionCandidateContext {
        let dueExpressionIDs = dueExpressionIDs(at: date)

        let resolvedCurrentUnitIDs = currentUnitIDs
            ?? currentJourneyUnitID.map { Set([$0]) }
            ?? []

        return SessionCandidateContext(
            dueExpressionIDs: dueExpressionIDs,
            mistakeExpressionIDs: activeMistakeExpressionIDs,
            reinforcementExpressionIDs: reinforcementExpressionIDs,
            weakSkills: weakSkills,
            currentUnitIDs: resolvedCurrentUnitIDs,
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
            schemaVersion: snapshot.schemaVersion,
            attempts: snapshot.attempts + [attempt],
            masteryByExpressionID: mastery,
            reviewByExpressionID: reviews,
            activeMistakeExpressionIDs: mistakes,
            reinforcementExpressionIDs: reinforcement,
            currentJourneyUnitID: snapshot.currentJourneyUnitID,
            savedExpressionIDs: snapshot.savedExpressionIDs
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
    private let migrator: LearnerProgressMigrator

    public init(
        store: any LearnerProgressStore,
        updater: LearnerProgressUpdater = LearnerProgressUpdater(),
        migrator: LearnerProgressMigrator = LearnerProgressMigrator()
    ) {
        self.store = store
        self.updater = updater
        self.migrator = migrator
    }

    public func load() async throws -> LearnerProgressSnapshot {
        try await loadMigrated()
    }

    @discardableResult
    public func setCurrentJourneyUnitID(_ unitID: String?) async throws -> LearnerProgressSnapshot {
        let current = try await loadMigrated()
        let updated = LearnerProgressSnapshot(
            schemaVersion: current.schemaVersion,
            attempts: current.attempts,
            masteryByExpressionID: current.masteryByExpressionID,
            reviewByExpressionID: current.reviewByExpressionID,
            activeMistakeExpressionIDs: current.activeMistakeExpressionIDs,
            reinforcementExpressionIDs: current.reinforcementExpressionIDs,
            currentJourneyUnitID: unitID,
            savedExpressionIDs: current.savedExpressionIDs
        )
        try await store.save(updated)
        return updated
    }

    @discardableResult
    public func setExpressionSaved(
        _ expressionID: String,
        saved: Bool
    ) async throws -> LearnerProgressSnapshot {
        let current = try await loadMigrated()
        var savedExpressionIDs = current.savedExpressionIDs

        if saved {
            savedExpressionIDs.insert(expressionID)
        } else {
            savedExpressionIDs.remove(expressionID)
        }

        let updated = LearnerProgressSnapshot(
            schemaVersion: current.schemaVersion,
            attempts: current.attempts,
            masteryByExpressionID: current.masteryByExpressionID,
            reviewByExpressionID: current.reviewByExpressionID,
            activeMistakeExpressionIDs: current.activeMistakeExpressionIDs,
            reinforcementExpressionIDs: current.reinforcementExpressionIDs,
            currentJourneyUnitID: current.currentJourneyUnitID,
            savedExpressionIDs: savedExpressionIDs
        )
        try await store.save(updated)
        return updated
    }

    @discardableResult
    public func toggleSavedExpressionID(_ expressionID: String) async throws -> LearnerProgressSnapshot {
        let current = try await loadMigrated()
        var savedExpressionIDs = current.savedExpressionIDs
        if savedExpressionIDs.contains(expressionID) {
            savedExpressionIDs.remove(expressionID)
        } else {
            savedExpressionIDs.insert(expressionID)
        }

        let updated = LearnerProgressSnapshot(
            schemaVersion: current.schemaVersion,
            attempts: current.attempts,
            masteryByExpressionID: current.masteryByExpressionID,
            reviewByExpressionID: current.reviewByExpressionID,
            activeMistakeExpressionIDs: current.activeMistakeExpressionIDs,
            reinforcementExpressionIDs: current.reinforcementExpressionIDs,
            currentJourneyUnitID: current.currentJourneyUnitID,
            savedExpressionIDs: savedExpressionIDs
        )
        try await store.save(updated)
        return updated
    }

    @discardableResult
    public func record(_ attempt: LearningAttempt) async throws -> LearnerProgressSnapshot {
        let current = try await loadMigrated()
        let updated = updater.record(attempt, in: current)
        try await store.save(updated)
        return updated
    }

    private func loadMigrated() async throws -> LearnerProgressSnapshot {
        let stored = try await store.load()
        let migrated = try migrator.migrate(stored)
        if migrated != stored {
            try await store.save(migrated)
        }
        return migrated
    }
}
