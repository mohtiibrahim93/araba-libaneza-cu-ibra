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

    private func result(_ id: String, unit: String, type: ExerciseDefinitionType = .dialogueResponse, clean: Bool) -> ExerciseResult {
        ExerciseResult(id: id, exerciseID: "x-\(id)", unitID: unit, exerciseType: type.rawValue, firstTryCorrect: clean, occurredAt: date(20))
    }

    @Test("Conversation comes from dialogue exercise results; vocabulary from word attempts")
    func categories() {
        let snapshot = LearnerProgressSnapshot(
            attempts: [attempt("v1", expression: "w1", skills: [.meaning], clean: true)],
            exerciseResults: [
                result("d1", unit: "u", clean: true),
                result("d2", unit: "u", clean: false),
                result("g1", unit: "u", type: .grammarDrill, clean: false)
            ]
        )
        let found = insights(snapshot)
        #expect(found.conversation.rate == 0.5)
        #expect(found.conversation.attempts == 2)
        #expect(found.vocabulary.attempts == 1)
        #expect(found.vocabulary.rate == 1)
        #expect(found.listening.rate == nil)
    }

    @Test("A unit needs ten answers before it is called weak")
    func attentionNeedsEvidence() {
        let units = [
            ProgressTopicUnit(id: "few", title: "Puține", expressionIDs: []),
            ProgressTopicUnit(id: "weak", title: "Slabă", expressionIDs: []),
            ProgressTopicUnit(id: "strong", title: "Bună", expressionIDs: [])
        ]
        var results = (0..<3).map { result("a\($0)", unit: "few", clean: false) }
        results += (0..<10).map { result("b\($0)", unit: "weak", type: .grammarDrill, clean: $0 < 5) }
        results += (0..<10).map { result("c\($0)", unit: "strong", clean: $0 < 9) }
        let found = insights(LearnerProgressSnapshot(exerciseResults: results), units: units)
        #expect(found.attentionUnits.map(\.id) == ["weak"])
        #expect(found.attentionUnits.first?.accuracy.rate == 0.5)
    }

    @Test("Lesson trend compares with the previous 30 days only when it had lessons")
    func trend() {
        let withPrevious = LearnerProgressSnapshot(xpEvents: [lesson("old1", day: 10, month: 8), lesson("old2", day: 12, month: 8)])
        #expect(insights(withPrevious, lessons: 3).lessonTrendPercent == 50)
        #expect(insights(LearnerProgressSnapshot(), lessons: 3).lessonTrendPercent == nil)
    }

    @Test("Exercise results persist, survive other updates and are recorded once")
    func exerciseResultsPersist() async throws {
        let repository = LearnerProgressRepository(store: InMemoryLearnerProgressStore())
        let first = result("r1", unit: "u", clean: true)
        _ = try await repository.recordExerciseResult(first)
        _ = try await repository.recordExerciseResult(first)
        let afterXP = try await repository.recordXP(lesson("l1", day: 20))
        #expect(afterXP.exerciseResults == [first])

        let data = try JSONEncoder().encode(afterXP)
        let decoded = try JSONDecoder().decode(LearnerProgressSnapshot.self, from: data)
        #expect(decoded.exerciseResults == [first])
    }
}
