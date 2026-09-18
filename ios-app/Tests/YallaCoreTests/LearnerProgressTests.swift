import Foundation
import Testing
@testable import YallaCore

@Suite("Persistent learner progress")
struct LearnerProgressTests {
    private let now = Date(timeIntervalSince1970: 1_700_000_000)

    private func attempt(
        id: String,
        firstTryCorrect: Bool,
        usedHint: Bool = false,
        offset: TimeInterval = 0
    ) -> LearningAttempt {
        LearningAttempt(
            id: id,
            expressionID: "expr.want",
            skills: [.production],
            submittedAnswer: firstTryCorrect ? "badde" : "baddak",
            firstTryCorrect: firstTryCorrect,
            completedCorrectly: true,
            usedHint: usedHint,
            retryCount: firstTryCorrect ? 0 : 1,
            responseTimeMilliseconds: 1_500,
            occurredAt: now.addingTimeInterval(offset)
        )
    }

    @Test("Recording an initial mistake preserves history and updates mastery plus SRS")
    func mistakeUpdatesProgress() {
        let initial = LearnerProgressSnapshot()
        let updated = LearnerProgressUpdater().record(
            attempt(id: "attempt-1", firstTryCorrect: false),
            in: initial
        )

        #expect(updated.attempts.count == 1)
        #expect(updated.attempts.first?.id == "attempt-1")
        #expect(updated.masteryByExpressionID["expr.want"]?.progress(for: .production).attempts == 1)
        #expect(updated.masteryByExpressionID["expr.want"]?.progress(for: .production).cleanCorrect == 0)
        #expect(updated.reviewByExpressionID["expr.want"]?.wrong == true)
        #expect(updated.activeMistakeExpressionIDs == ["expr.want"])
        #expect(updated.reinforcementExpressionIDs == ["expr.want"])
    }

    @Test("A later clean retrieval clears active remediation without erasing the original attempt")
    func cleanRetrievalResolvesActiveRemediation() {
        let updater = LearnerProgressUpdater()
        let afterMistake = updater.record(
            attempt(id: "attempt-1", firstTryCorrect: false),
            in: LearnerProgressSnapshot()
        )
        let recovered = updater.record(
            attempt(id: "attempt-2", firstTryCorrect: true, offset: ReviewScheduler.day),
            in: afterMistake
        )

        #expect(recovered.attempts.map(\.id) == ["attempt-1", "attempt-2"])
        #expect(recovered.activeMistakeExpressionIDs.isEmpty)
        #expect(recovered.reinforcementExpressionIDs.isEmpty)
        #expect(recovered.masteryByExpressionID["expr.want"]?.progress(for: .production).attempts == 2)
        #expect(recovered.masteryByExpressionID["expr.want"]?.progress(for: .production).cleanCorrect == 1)
    }

    @Test("Planner context is derived from real due, mistake, weak and seen learner state")
    func plannerContextReflectsProgress() {
        let updater = LearnerProgressUpdater()
        let first = updater.record(
            attempt(id: "attempt-1", firstTryCorrect: false),
            in: LearnerProgressSnapshot()
        )
        let second = updater.record(
            attempt(id: "attempt-2", firstTryCorrect: false, offset: 60),
            in: first
        )

        let context = second.sessionCandidateContext(
            at: now.addingTimeInterval(ReviewScheduler.day + 60)
        )

        #expect(context.dueExpressionIDs == ["expr.want"])
        #expect(context.mistakeExpressionIDs == ["expr.want"])
        #expect(context.reinforcementExpressionIDs == ["expr.want"])
        #expect(context.seenExpressionIDs == ["expr.want"])
        #expect(context.weakSkills == [.production])
    }

    @Test("Recording the same durable attempt twice is idempotent")
    func duplicateAttemptIsIgnored() {
        let updater = LearnerProgressUpdater()
        let durable = attempt(id: "attempt-duplicate", firstTryCorrect: false)
        let first = updater.record(durable, in: LearnerProgressSnapshot())
        let second = updater.record(durable, in: first)

        #expect(second == first)
        #expect(second.attempts.count == 1)
        #expect(second.reviewByExpressionID["expr.want"]?.seen == 1)
        #expect(second.masteryByExpressionID["expr.want"]?.progress(for: .production).attempts == 1)
    }

    @Test("Older persisted snapshots decode without the current Journey unit field")
    func legacySnapshotStillDecodes() throws {
        let legacyJSON = """
        {
          "attempts": [],
          "masteryByExpressionID": {},
          "reviewByExpressionID": {},
          "activeMistakeExpressionIDs": [],
          "reinforcementExpressionIDs": []
        }
        """.data(using: .utf8)!

        let decoded = try JSONDecoder().decode(LearnerProgressSnapshot.self, from: legacyJSON)

        #expect(decoded.schemaVersion == 1)
        #expect(decoded.currentJourneyUnitID == nil)
        #expect(decoded.savedExpressionIDs.isEmpty)
        #expect(decoded.attempts.isEmpty)
    }

    @Test("Repository upgrades older snapshots to the current learner progress schema")
    func repositoryMigratesLegacySnapshot() async throws {
        let legacy = LearnerProgressSnapshot(
            schemaVersion: 1,
            currentJourneyUnitID: nil
        )
        let store = InMemoryLearnerProgressStore(snapshot: legacy)
        let repository = LearnerProgressRepository(store: store)

        let migrated = try await repository.load()
        let persisted = try await store.load()

        #expect(migrated.schemaVersion == LearnerProgressSchema.currentVersion)
        #expect(persisted.schemaVersion == LearnerProgressSchema.currentVersion)
    }

    @Test("Repository rejects learner progress created by an unsupported future schema")
    func futureSchemaIsRejected() async {
        let future = LearnerProgressSnapshot(
            schemaVersion: LearnerProgressSchema.currentVersion + 1
        )
        let repository = LearnerProgressRepository(
            store: InMemoryLearnerProgressStore(snapshot: future)
        )

        await #expect(throws: LearnerProgressMigrationError.self) {
            _ = try await repository.load()
        }
    }

    @Test("Saved dictionary expressions persist and can be toggled without affecting learning evidence")
    func savedExpressionsPersist() async throws {
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)

        let saved = try await repository.toggleSavedExpressionID("expr.want")
        #expect(saved.savedExpressionIDs == ["expr.want"])
        #expect(saved.attempts.isEmpty)

        let reloaded = try await repository.load()
        #expect(reloaded.savedExpressionIDs == ["expr.want"])

        let unsaved = try await repository.toggleSavedExpressionID("expr.want")
        #expect(unsaved.savedExpressionIDs.isEmpty)
        #expect(unsaved.attempts.isEmpty)
    }

    @Test("Current Journey unit persists and automatically feeds Smart Practice context")
    func currentJourneyUnitPersists() async throws {
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)

        let updated = try await repository.setCurrentJourneyUnitID("unit.restaurant")
        let reloaded = try await repository.load()
        let context = reloaded.sessionCandidateContext(at: now)

        #expect(updated.currentJourneyUnitID == "unit.restaurant")
        #expect(reloaded.currentJourneyUnitID == "unit.restaurant")
        #expect(context.currentUnitIDs == ["unit.restaurant"])
    }

    @Test("Explicit saved-state updates persist and can be removed")
    func explicitSavedStatePersistsAndRemoves() async throws {
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)

        let saved = try await repository.setExpressionSaved("expr.want", saved: true)
        #expect(saved.savedExpressionIDs == ["expr.want"])

        let reloaded = try await repository.load()
        #expect(reloaded.savedExpressionIDs == ["expr.want"])

        let removed = try await repository.setExpressionSaved("expr.want", saved: false)
        #expect(removed.savedExpressionIDs.isEmpty)
    }

    @Test("Legacy snapshots decode with empty speed drill history")
    func legacySnapshotHasNoFluencyHistory() throws {
        let legacyJSON = """
        {
          "schemaVersion": 3,
          "attempts": [],
          "masteryByExpressionID": {},
          "reviewByExpressionID": {},
          "activeMistakeExpressionIDs": [],
          "reinforcementExpressionIDs": [],
          "savedExpressionIDs": []
        }
        """.data(using: .utf8)!

        let decoded = try JSONDecoder().decode(LearnerProgressSnapshot.self, from: legacyJSON)

        #expect(decoded.speedDrillHistory.isEmpty)
    }

    @Test("Speed drill history persists without changing mastery or SRS")
    func speedDrillHistoryIsSeparateFromMastery() async throws {
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)
        var session = SpeedDrillSession(
            direction: .learnerLanguageToLebanese,
            durationSeconds: 120
        )
        session.record(expressionID: "expr.want", outcome: .correct, responseTime: 1.2)
        session.record(expressionID: "expr.want", outcome: .wrong, responseTime: 2.3)

        let metrics = session.metrics(elapsedSeconds: 30)
        let entry = SpeedDrillHistoryEntry(
            id: "speed-1",
            direction: session.direction,
            durationSeconds: session.durationSeconds,
            elapsedSeconds: 30,
            completedAt: now,
            metrics: metrics
        )

        let updated = try await repository.recordSpeedDrill(entry)
        let duplicate = try await repository.recordSpeedDrill(entry)

        #expect(updated.speedDrillHistory.count == 1)
        #expect(updated.speedDrillHistory.first?.correct == 1)
        #expect(updated.speedDrillHistory.first?.wrong == 1)
        #expect(updated.speedDrillHistory.first?.correctPerMinute == 2)
        #expect(updated.attempts.isEmpty)
        #expect(updated.masteryByExpressionID.isEmpty)
        #expect(updated.reviewByExpressionID.isEmpty)
        #expect(duplicate.speedDrillHistory.count == 1)
    }

    @Test("Speed drill progress summary aggregates history and uses the latest completed session")
    func speedDrillProgressSummary() {
        var firstSession = SpeedDrillSession(
            direction: .learnerLanguageToLebanese,
            durationSeconds: 120
        )
        firstSession.record(expressionID: "expr.want", outcome: .correct, responseTime: 1)
        firstSession.record(expressionID: "expr.want", outcome: .correct, responseTime: 1)

        var secondSession = SpeedDrillSession(
            direction: .lebaneseToLearnerLanguage,
            durationSeconds: 120
        )
        secondSession.record(expressionID: "expr.want", outcome: .correct, responseTime: 1)
        secondSession.record(expressionID: "expr.want", outcome: .wrong, responseTime: 2)

        let first = SpeedDrillHistoryEntry(
            id: "speed-first",
            direction: firstSession.direction,
            durationSeconds: firstSession.durationSeconds,
            elapsedSeconds: 30,
            completedAt: now,
            metrics: firstSession.metrics(elapsedSeconds: 30)
        )
        let second = SpeedDrillHistoryEntry(
            id: "speed-second",
            direction: secondSession.direction,
            durationSeconds: secondSession.durationSeconds,
            elapsedSeconds: 60,
            completedAt: now.addingTimeInterval(60),
            metrics: secondSession.metrics(elapsedSeconds: 60)
        )

        let summary = LearnerProgressSnapshot(
            speedDrillHistory: [first, second]
        ).speedDrillProgress

        #expect(summary.sessionCount == 2)
        #expect(summary.bestCorrectPerMinute == 4)
        #expect(summary.averageAccuracy == 0.75)
        #expect(summary.latestCorrectPerMinute == 1)
        #expect(summary.latestAccuracy == 0.5)
    }

    @Test("Review queue separates due work from future reviews and reports the next upcoming date")
    func reviewQueueSummary() {
        let soon = now.addingTimeInterval(ReviewScheduler.day)
        let later = now.addingTimeInterval(3 * ReviewScheduler.day)
        let snapshot = LearnerProgressSnapshot(
            reviewByExpressionID: [
                "expr.due": ReviewState(
                    seen: 1,
                    correct: 0,
                    lastAttemptAt: now.addingTimeInterval(-ReviewScheduler.day),
                    reviewStage: 0,
                    dueAt: now.addingTimeInterval(-60)
                ),
                "expr.soon": ReviewState(
                    seen: 1,
                    correct: 1,
                    lastAttemptAt: now,
                    reviewStage: 0,
                    dueAt: soon
                ),
                "expr.later": ReviewState(
                    seen: 2,
                    correct: 2,
                    lastAttemptAt: now,
                    reviewStage: 1,
                    dueAt: later
                ),
                "expr.unseen": ReviewState()
            ]
        )

        let summary = snapshot.reviewQueueSummary(at: now)

        #expect(summary.dueNowCount == 1)
        #expect(summary.upcomingCount == 2)
        #expect(summary.nextUpcomingAt == soon)
    }

    @Test("Repository persists updates through its store abstraction")
    func repositoryRoundTrip() async throws {
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)

        _ = try await repository.record(
            attempt(id: "attempt-1", firstTryCorrect: false)
        )
        let reloaded = try await repository.load()

        #expect(reloaded.attempts.count == 1)
        #expect(reloaded.activeMistakeExpressionIDs == ["expr.want"])
        #expect(reloaded.reviewByExpressionID["expr.want"]?.seen == 1)
    }
}
