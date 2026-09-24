import Foundation
import Testing
@testable import YallaCore

@Suite("Progress dashboard")
struct ProgressDashboardTests {
    private var calendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Europe/Bucharest")!
        return calendar
    }

    private func date(_ day: Int, month: Int = 9) -> Date {
        calendar.date(from: DateComponents(year: 2026, month: month, day: day, hour: 12))!
    }

    private func attempt(_ id: String, expression: String, clean: Bool) -> LearningAttempt {
        LearningAttempt(
            id: id, expressionID: expression, skills: [.production], submittedAnswer: "x",
            firstTryCorrect: clean, completedCorrectly: true, usedHint: false, retryCount: clean ? 0 : 1,
            responseTimeMilliseconds: 1_000, occurredAt: date(20)
        )
    }

    private func xp(_ id: String, day: Int, month: Int = 9, source: XPSource?) -> XPEvent {
        XPEvent(id: id, day: LearnerDay(calendar: calendar).key(for: date(day, month: month)),
                amount: 12, occurredAt: date(day, month: month), source: source)
    }

    @Test("Journey completion counts only lessons of known units")
    func journeyCompletion() {
        let snapshot = LearnerProgressSnapshot(completedLessonIDs: ["u1.lesson.1", "u1.lesson.2", "u2.lesson.1", "gone.lesson.1"])
        let summary = ProgressDashboardBuilder(calendar: calendar)
            .summary(snapshot: snapshot, lessonCounts: ["u1": 4, "u2": 6], at: date(24))
        #expect(summary.completedLessons == 3)
        #expect(summary.totalLessons == 10)
        #expect(summary.journeyFraction == 0.3)
    }

    @Test("Skill accuracy uses first-try results and stays empty for unpractised skills")
    func skillAccuracy() {
        var snapshot = LearnerProgressSnapshot()
        let updater = LearnerProgressUpdater()
        snapshot = updater.record(attempt("a", expression: "e1", clean: true), in: snapshot)
        snapshot = updater.record(attempt("b", expression: "e2", clean: false), in: snapshot)

        let summary = ProgressDashboardBuilder(calendar: calendar).summary(snapshot: snapshot, lessonCounts: [:], at: date(24))
        #expect(summary.skill(.production).attempts == 2)
        #expect(summary.skill(.production).cleanRate == 0.5)
        #expect(summary.skill(.listening).cleanRate == nil)
        #expect(summary.practisedExpressions == 2)
    }

    @Test("Recent lessons and daily activity come from XP events")
    func activity() {
        let snapshot = LearnerProgressSnapshot(xpEvents: [
            xp("l1", day: 20, source: .lesson),
            xp("l2", day: 22, source: .lesson),
            xp("r1", day: 22, source: .review),
            xp("old", day: 1, month: 8, source: .lesson)
        ])
        let builder = ProgressDashboardBuilder(calendar: calendar)
        let summary = builder.summary(snapshot: snapshot, lessonCounts: [:], at: date(24))
        #expect(summary.lessonsLast30Days == 2)
        #expect(summary.xpByDay["2026-09-22"] == 24)

        let days = builder.recentDays(weeks: 2, endingAt: date(24))
        #expect(days.count == 14)
        #expect(days.last == "2026-09-24")
        #expect(days.first == "2026-09-11")
    }
}
