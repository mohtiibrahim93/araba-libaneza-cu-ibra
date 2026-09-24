import Foundation
import Testing
@testable import YallaCore

@Suite("Journey lessons")
struct JourneyLessonTests {
    private func exercises(_ count: Int) -> [ExerciseDefinition] {
        (0..<count).map {
            ExerciseDefinition(
                id: "ex.\($0)",
                type: .freeProduction,
                unitID: "unit",
                expressionIDs: ["expr.\($0)"],
                prompt: ["ro": "Prompt \($0)"],
                answer: "answer \($0)",
                wrongAnswers: []
            )
        }
    }

    @Test("Units split into ordered lessons of at most twelve exercises")
    func splitsInOrder() {
        let planner = JourneyLessonPlanner()
        let lessons = planner.lessons(unitID: "a1-welcome", exercises: exercises(27))

        #expect(lessons.map(\.exercises.count) == [12, 12, 3])
        #expect(lessons.map(\.number) == [1, 2, 3])
        #expect(lessons.map(\.id) == ["a1-welcome.lesson.1", "a1-welcome.lesson.2", "a1-welcome.lesson.3"])
        #expect(lessons.flatMap(\.exercises).map(\.id) == exercises(27).map(\.id))
        #expect(planner.lessonCount(exerciseCount: 27) == 3)
        #expect(planner.lessonCount(exerciseCount: 24) == 2)
        #expect(planner.lessonCount(exerciseCount: 0) == 0)
    }

    @Test("A unit without exercises has no lessons")
    func emptyUnit() {
        #expect(JourneyLessonPlanner().lessons(unitID: "u", exercises: []).isEmpty)
    }

    @Test("First unfinished lesson is current, later ones locked, finished ones replayable")
    func statuses() {
        let planner = JourneyLessonPlanner(lessonSize: 2)
        let lessons = planner.lessons(unitID: "u", exercises: exercises(8))

        #expect(planner.statuses(for: lessons, completedLessonIDs: []) == [.current, .locked, .locked, .locked])
        #expect(
            planner.statuses(for: lessons, completedLessonIDs: ["u.lesson.1", "u.lesson.2"])
                == [.completed, .completed, .current, .locked]
        )
        #expect(
            planner.statuses(for: lessons, completedLessonIDs: ["u.lesson.1", "u.lesson.3"])
                == [.completed, .current, .completed, .locked]
        )
    }

    @Test("Unit progress counts only this unit's completed lessons")
    func unitProgress() {
        let planner = JourneyLessonPlanner()
        let progress = planner.progress(
            unitID: "u",
            lessonCount: 4,
            completedLessonIDs: ["u.lesson.1", "u.lesson.4", "other.lesson.2", "u.lesson.9"]
        )

        #expect(progress.completedCount == 2)
        #expect(progress.totalCount == 4)
        #expect(progress.fraction == 0.5)
        #expect(!progress.isComplete)
        #expect(planner.progress(unitID: "u", lessonCount: 1, completedLessonIDs: ["u.lesson.1"]).isComplete)
    }

    @Test("One-pass lesson counts match the lessons built for each unit")
    func lessonCountsMatchUnitDetails() throws {
        func expression(_ id: String, meaning: String?) -> YallaCore.Expression {
            YallaCore.Expression(
                id: id,
                canonicalArabizi: "form \(id)",
                levelTags: [.a1],
                localizations: meaning.map { ["ro": ExpressionLocalization(naturalMeaning: $0)] } ?? [:]
            )
        }
        // 30 recallable expressions, one blank meaning, one without a Romanian localization.
        var expressions = (0..<30).map { expression("e\($0)", meaning: "sens \($0)") }
        expressions.append(expression("blank", meaning: "  "))
        expressions.append(expression("missing", meaning: nil))

        let first = JourneyUnit(
            id: "u1", level: .a1,
            expressionIDs: (0..<26).map { "e\($0)" } + ["blank", "missing", "e3"],
            localizations: ["ro": .init(title: "U1", description: "Unu")]
        )
        // Shares expressions with the first unit.
        let second = JourneyUnit(
            id: "u2", level: .a1,
            expressionIDs: (20..<30).map { "e\($0)" },
            localizations: ["ro": .init(title: "U2", description: "Doi")]
        )
        let empty = JourneyUnit(
            id: "u3", level: .a2, expressionIDs: [],
            localizations: ["ro": .init(title: "U3", description: "Trei")]
        )
        let authored = [
            ExerciseDefinition(id: "a1", type: .multipleChoiceProduction, unitID: "u1", expressionIDs: ["e0"],
                               prompt: ["ro": "?"], answer: "form e0", wrongAnswers: ["x"]),
            ExerciseDefinition(id: "a2", type: .dialogueResponse, unitID: "u1", expressionIDs: [],
                               prompt: ["ro": "?"], answer: "da", wrongAnswers: ["nu"]),
            ExerciseDefinition(id: "a3", type: .freeProduction, unitID: "u2", expressionIDs: ["e25"],
                               prompt: ["ro": "?"], answer: "form e25", wrongAnswers: [])
        ]
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "lesson-count-test", defaultLearnerLocale: "ro"),
            expressions: expressions,
            units: [first, second, empty],
            exercises: authored
        )

        let planner = JourneyLessonPlanner()
        let counts = planner.lessonCounts(in: package, locale: "ro")
        let builder = LearningNavigationBuilder()
        for unit in package.units {
            let detail = try #require(try builder.journeyUnit(id: unit.id, from: package, locale: "ro"))
            #expect(counts[unit.id] == planner.lessonCount(exerciseCount: detail.exercises.count))
        }
        #expect(counts == ["u1": 3, "u2": 1, "u3": 0])
    }

    @Test("Lesson completion persists idempotently and survives other progress updates")
    func completionPersists() async throws {
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)

        _ = try await repository.markLessonCompleted("u.lesson.1")
        _ = try await repository.markLessonCompleted("u.lesson.1")
        _ = try await repository.setCurrentJourneyUnitID("u")
        _ = try await repository.toggleSavedExpressionID("expr")
        _ = try await repository.setOrientationCheckpoint(nil)
        _ = try await repository.record(
            LearningAttempt(
                id: "a1", expressionID: "expr", skills: [.production], submittedAnswer: "x",
                firstTryCorrect: true, completedCorrectly: true, usedHint: false, retryCount: 0,
                responseTimeMilliseconds: 1_000, occurredAt: Date(timeIntervalSince1970: 1_700_000_000)
            )
        )

        let reloaded = try await repository.load()
        #expect(reloaded.completedLessonIDs == ["u.lesson.1"])
        #expect(reloaded.attempts.count == 1)
        #expect(reloaded.currentJourneyUnitID == "u")
    }

    @Test("Schema 5 progress migrates to the current schema without losing learner data")
    func migratesFromSchemaFive() async throws {
        let legacyJSON = """
        {
          "schemaVersion": 5,
          "attempts": [],
          "masteryByExpressionID": {},
          "reviewByExpressionID": {},
          "activeMistakeExpressionIDs": ["expr"],
          "reinforcementExpressionIDs": [],
          "currentJourneyUnitID": "a1-welcome",
          "savedExpressionIDs": ["saved"],
          "speedDrillHistory": []
        }
        """.data(using: .utf8)!
        let legacy = try JSONDecoder().decode(LearnerProgressSnapshot.self, from: legacyJSON)
        #expect(legacy.completedLessonIDs.isEmpty)

        let store = InMemoryLearnerProgressStore(snapshot: legacy)
        let migrated = try await LearnerProgressRepository(store: store).load()

        #expect(migrated.schemaVersion == LearnerProgressSchema.currentVersion)
        #expect(migrated.currentJourneyUnitID == "a1-welcome")
        #expect(migrated.savedExpressionIDs == ["saved"])
        #expect(migrated.activeMistakeExpressionIDs == ["expr"])
        #expect(migrated.completedLessonIDs.isEmpty)
    }

    @Test("Completed lessons round-trip through JSON encoding")
    func codableRoundTrip() throws {
        let snapshot = LearnerProgressSnapshot(completedLessonIDs: ["u.lesson.1", "u.lesson.2"])
        let decoded = try JSONDecoder().decode(
            LearnerProgressSnapshot.self,
            from: JSONEncoder().encode(snapshot)
        )
        #expect(decoded == snapshot)
    }

    @Test("Lesson completion is journaled and replays once after queue recreation")
    @MainActor
    func queueReplay() async throws {
        let outbox = InMemoryProgressSaveOutbox(operations: [.lessonCompleted("u.lesson.2")])
        let store = InMemoryLearnerProgressStore()
        let repository = LearnerProgressRepository(store: store)
        let queue = ProgressSaveQueue(outbox: outbox)

        queue.enqueue(.lessonCompleted("u.lesson.2"))
        try await queue.flush(using: repository)

        #expect(queue.pendingCount == 0)
        #expect(queue.latestSnapshot?.completedLessonIDs == ["u.lesson.2"])
        #expect(try await outbox.load().isEmpty)
    }
}
