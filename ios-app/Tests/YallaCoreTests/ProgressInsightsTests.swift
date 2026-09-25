import Foundation
import Testing
@testable import YallaCore

@Suite("Progress insights")
struct ProgressInsightsTests {
    private var calendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Europe/Bucharest")!
        return calendar
    }

    private func date(_ day: Int, month: Int = 9) -> Date {
        calendar.date(from: DateComponents(year: 2026, month: month, day: day, hour: 12))!
    }

    private func attempt(_ id: String, expression: String, skills: Set<MasterySkill> = [.production], clean: Bool) -> LearningAttempt {
        LearningAttempt(
            id: id, expressionID: expression, skills: skills, submittedAnswer: "x",
            firstTryCorrect: clean, completedCorrectly: true, usedHint: false, retryCount: clean ? 0 : 1,
            responseTimeMilliseconds: 1_000, occurredAt: date(20)
        )
    }

    private func lesson(_ id: String, day: Int, month: Int = 9) -> XPEvent {
        XPEvent(id: id, day: LearnerDay(calendar: calendar).key(for: date(day, month: month)),
                amount: 12, occurredAt: date(day, month: month), source: .lesson)
    }

    private func insights(_ snapshot: LearnerProgressSnapshot, units: [ProgressTopicUnit] = [], lessons: Int = 0) -> ProgressInsights {
        ProgressInsightsBuilder(calendar: calendar).insights(
            snapshot: snapshot,
            singleWordExpressionIDs: ["w1", "w2"],
            units: units,
            reviewExpressionIDs: ["w1", "w2", "p1"],
            lessonsLast30Days: lessons,
            at: date(24)
        )
    }

    @Test("Conversation, vocabulary and listening come from their own attempts")
    func categories() {
        let snapshot = LearnerProgressSnapshot(attempts: [
            attempt("d1", expression: "p1", skills: [.production, .transfer], clean: true),
            attempt("d2", expression: "p1", skills: [.production, .transfer], clean: false),
            attempt("v1", expression: "w1", skills: [.meaning], clean: true)
        ])
        let result = insights(snapshot)
        #expect(result.conversation.rate == 0.5)
        #expect(result.vocabulary.attempts == 1)
        #expect(result.vocabulary.rate == 1)
        #expect(result.listening.rate == nil)
    }

    @Test("A unit needs ten answers before it is called weak")
    func attentionNeedsEvidence() {
        let units = [
            ProgressTopicUnit(id: "few", title: "Puține", expressionIDs: ["a"]),
            ProgressTopicUnit(id: "weak", title: "Slabă", expressionIDs: ["b"]),
            ProgressTopicUnit(id: "strong", title: "Bună", expressionIDs: ["c"])
        ]
        var attempts = (0..<3).map { attempt("a\($0)", expression: "a", clean: false) }
        attempts += (0..<10).map { attempt("b\($0)", expression: "b", clean: $0 < 5) }
        attempts += (0..<10).map { attempt("c\($0)", expression: "c", clean: $0 < 9) }
        let result = insights(LearnerProgressSnapshot(attempts: attempts), units: units)
        #expect(result.attentionUnits.map(\.id) == ["weak"])
        #expect(result.attentionUnits.first?.accuracy.rate == 0.5)
    }

    @Test("Lesson trend compares with the previous 30 days only when it had lessons")
    func trend() {
        let withPrevious = LearnerProgressSnapshot(xpEvents: [lesson("old1", day: 10, month: 8), lesson("old2", day: 12, month: 8)])
        #expect(insights(withPrevious, lessons: 3).lessonTrendPercent == 50)
        #expect(insights(LearnerProgressSnapshot(), lessons: 3).lessonTrendPercent == nil)
    }
}
