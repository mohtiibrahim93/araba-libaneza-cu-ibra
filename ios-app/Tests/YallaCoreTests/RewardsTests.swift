import Foundation
import Testing
@testable import YallaCore

@Suite("XP and streaks")
struct RewardsTests {
    private var calendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Europe/Bucharest")!
        return calendar
    }

    private func date(_ day: Int, hour: Int = 12, month: Int = 9) -> Date {
        calendar.date(from: DateComponents(year: 2026, month: month, day: day, hour: hour))!
    }

    private func event(_ id: String, day: Int, amount: Int = 12, month: Int = 9) -> XPEvent {
        let occurred = date(day, month: month)
        return XPEvent(id: id, day: LearnerDay(calendar: calendar).key(for: occurred), amount: amount, occurredAt: occurred)
    }

    @Test("Day keys use the learner's local calendar")
    func dayKeys() {
        let learnerDay = LearnerDay(calendar: calendar)
        #expect(learnerDay.key(for: date(24)) == "2026-09-24")
        // 23:30 in Bucharest is still the same local day.
        #expect(learnerDay.key(for: date(24, hour: 23)) == "2026-09-24")
    }

    @Test("Session XP needs a completed item and starts at ten")
    func sessionXP() {
        var state = LearningSessionState(targetCount: 3)
        #expect(XPRewardPolicy().xp(for: state) == 0)

        state.recordDiscoveryCompletion()
        #expect(state.cleanFirstTryCount == 0)
        #expect(XPRewardPolicy().xp(for: state) == 10)

        func completed(firstTry: Bool) -> ExerciseResolution {
            ExerciseResolution(
                evaluation: .exact, completed: true, needsCorrection: false,
                attempt: Attempt(expressionID: "e", skill: .production, firstTryCorrect: firstTry, usedHint: false, responseTime: 1),
                mistake: nil
            )
        }
        state.record(completed(firstTry: true))
        state.record(completed(firstTry: false))
        #expect(state.cleanFirstTryCount == 1)
        #expect(XPRewardPolicy().xp(for: state) == 11)
    }

    @Test("Streak counts consecutive active days ending today")
    func streakActiveToday() {
        let summary = RewardCalculator(calendar: calendar).summary(
            events: [event("a", day: 22), event("b", day: 23), event("c", day: 24), event("d", day: 24, amount: 5)],
            at: date(24, hour: 20)
        )
        #expect(summary.streakDays == 3)
        #expect(summary.isActiveToday)
        #expect(summary.todayXP == 17)
        #expect(summary.totalXP == 41)
    }

    @Test("Streak stays alive until the end of today, then resets after a missed day")
    func streakGrace() {
        let events = [event("a", day: 22), event("b", day: 23)]
        let calculator = RewardCalculator(calendar: calendar)

        let today = calculator.summary(events: events, at: date(24, hour: 9))
        #expect(today.streakDays == 2)
        #expect(!today.isActiveToday)
        #expect(today.todayXP == 0)

        let missed = calculator.summary(events: events, at: date(25, hour: 9))
        #expect(missed.streakDays == 0)
        #expect(missed.totalXP == 24)
    }

    @Test("Streaks cross month boundaries and ignore gaps before the current run")
    func streakAcrossMonths() {
        let summary = RewardCalculator(calendar: calendar).summary(
            events: [event("old", day: 27, month: 8), event("a", day: 30, month: 9), event("b", day: 1, month: 10)],
            at: date(1, month: 10)
        )
        #expect(summary.streakDays == 2)
    }

    @Test("XP is recorded once per event even when a save is replayed")
    func idempotentXP() async throws {
        let repository = LearnerProgressRepository(store: InMemoryLearnerProgressStore())
        let award = event("session-1", day: 24)
        _ = try await repository.recordXP(award)
        _ = try await repository.recordXP(award)
        _ = try await repository.markLessonCompleted("u.lesson.1")
        _ = try await repository.setCurrentJourneyUnitID("u")

        let reloaded = try await repository.load()
        #expect(reloaded.xpEvents == [award])
        #expect(reloaded.completedLessonIDs == ["u.lesson.1"])
    }

    @Test("XP operations survive the durable outbox")
    @MainActor
    func queuedXP() async throws {
        let award = event("session-2", day: 24)
        let outbox = InMemoryProgressSaveOutbox(operations: [.xp(award)])
        let queue = ProgressSaveQueue(outbox: outbox)
        queue.enqueue(.xp(award))
        try await queue.flush(using: LearnerProgressRepository(store: InMemoryLearnerProgressStore()))

        #expect(queue.latestSnapshot?.xpEvents == [award])
        #expect(try await outbox.load().isEmpty)
    }

    @Test("Older progress without XP decodes with an empty history")
    func legacyDecode() throws {
        let json = #"{"schemaVersion": 6, "completedLessonIDs": ["u.lesson.1"]}"#.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(LearnerProgressSnapshot.self, from: json)
        #expect(decoded.xpEvents.isEmpty)
        #expect(decoded.completedLessonIDs == ["u.lesson.1"])
    }

    private func attempt(_ id: String, at date: Date, skill: MasterySkill, correct: Bool = true) -> LearningAttempt {
        LearningAttempt(
            id: id,
            expressionID: "e",
            skills: [skill],
            submittedAnswer: "a",
            firstTryCorrect: correct,
            completedCorrectly: correct,
            usedHint: false,
            retryCount: 0,
            responseTimeMilliseconds: 1_000,
            occurredAt: date
        )
    }

    private func sourced(_ id: String, day: Int, _ source: XPSource?) -> XPEvent {
        let occurred = date(day)
        return XPEvent(
            id: id, day: LearnerDay(calendar: calendar).key(for: occurred),
            amount: 10, occurredAt: occurred, source: source
        )
    }

    @Test("Daily goals count today's lesson, review, listening and speaking separately")
    func dailyGoals() {
        let calculator = DailyGoalCalculator(calendar: calendar)
        let now = date(24, hour: 20)

        let none = calculator.status(xpEvents: [], attempts: [], recordingDates: [], at: now)
        #expect(none.completedCount == 0)
        #expect(none.totalCount == 4)

        let partial = calculator.status(
            xpEvents: [sourced("l", day: 24, .lesson), sourced("p", day: 24, .practice)],
            attempts: [attempt("a", at: date(24, hour: 9), skill: .recognition)],
            recordingDates: [],
            at: now
        )
        #expect(partial == DailyGoalStatus(lessonDone: true, reviewDone: false, listeningDone: false, speakingDone: false))

        let full = calculator.status(
            xpEvents: [sourced("l", day: 24, .lesson), sourced("r", day: 24, .review)],
            attempts: [attempt("a", at: date(24, hour: 9), skill: .listening)],
            recordingDates: [date(24, hour: 10)],
            at: now
        )
        #expect(full.completedCount == 4)
    }

    @Test("Other days, untagged XP, unfinished listening answers and old recordings do not count")
    func dailyGoalsIgnoreOtherDays() {
        let status = DailyGoalCalculator(calendar: calendar).status(
            xpEvents: [sourced("old", day: 23, .lesson), sourced("legacy", day: 24, nil)],
            attempts: [
                attempt("yesterday", at: date(23), skill: .listening),
                attempt("wrong", at: date(24), skill: .listening, correct: false)
            ],
            recordingDates: [date(23)],
            at: date(24, hour: 20)
        )
        #expect(status.completedCount == 0)
    }

    @Test("XP events recorded before sources existed still decode")
    func legacyXPEventDecodes() throws {
        let json = #"{"id":"a","day":"2026-09-24","amount":12,"occurredAt":0}"#.data(using: .utf8)!
        let event = try JSONDecoder().decode(XPEvent.self, from: json)
        #expect(event.source == nil)
        #expect(event.amount == 12)
    }
}
