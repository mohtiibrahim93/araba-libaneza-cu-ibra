import Testing
@testable import YallaCore

@Suite("Two-minute fluency drill")
struct SpeedDrillTests {
    @Test("Default fluency session lasts two minutes")
    func defaultDuration() {
        let session = SpeedDrillSession(direction: .lebaneseToLearnerLanguage)

        #expect(session.durationSeconds == 120)
        #expect(session.remainingSeconds(atElapsed: 0) == 120)
        #expect(session.remainingSeconds(atElapsed: 121) == 0)
        #expect(session.isExpired(atElapsed: 120))
    }

    @Test("Session reports retrieval metrics without converting them into ordinary mastery attempts")
    func metrics() {
        var session = SpeedDrillSession(direction: .learnerLanguageToLebanese)
        session.record(expressionID: "e1", outcome: .correct, responseTime: 1)
        session.record(expressionID: "e2", outcome: .correct, responseTime: 2)
        session.record(expressionID: "e3", outcome: .wrong, responseTime: 3)
        session.record(expressionID: "e4", outcome: .skipped, responseTime: 4)
        session.record(expressionID: "e5", outcome: .correct, responseTime: 5)

        let metrics = session.metrics

        #expect(metrics.seen == 5)
        #expect(metrics.correct == 3)
        #expect(metrics.wrong == 1)
        #expect(metrics.skipped == 1)
        #expect(metrics.accuracy == 0.6)
        #expect(metrics.correctPerMinute == 1.5)
        #expect(metrics.medianResponseTime == 3)
        #expect(metrics.bestCorrectStreak == 2)
        #expect(metrics.masteryAttempts.isEmpty)
    }

    @Test("Wrong and skipped answers both break a correct streak")
    func streakReset() {
        var session = SpeedDrillSession(direction: .lebaneseToLearnerLanguage)
        session.record(expressionID: "e1", outcome: .correct, responseTime: 1)
        session.record(expressionID: "e2", outcome: .correct, responseTime: 1)
        session.record(expressionID: "e3", outcome: .skipped, responseTime: 1)
        session.record(expressionID: "e4", outcome: .correct, responseTime: 1)
        session.record(expressionID: "e5", outcome: .wrong, responseTime: 1)
        session.record(expressionID: "e6", outcome: .correct, responseTime: 1)

        #expect(session.metrics.bestCorrectStreak == 2)
    }

    @Test("Median response time handles even sample counts")
    func evenMedian() {
        var session = SpeedDrillSession(direction: .lebaneseToLearnerLanguage)
        session.record(expressionID: "e1", outcome: .correct, responseTime: 1)
        session.record(expressionID: "e2", outcome: .correct, responseTime: 3)
        session.record(expressionID: "e3", outcome: .correct, responseTime: 5)
        session.record(expressionID: "e4", outcome: .correct, responseTime: 7)

        #expect(session.metrics.medianResponseTime == 4)
    }

    @Test("Empty fluency session has zeroed metrics")
    func emptyMetrics() {
        let metrics = SpeedDrillSession(direction: .lebaneseToLearnerLanguage).metrics

        #expect(metrics.seen == 0)
        #expect(metrics.accuracy == 0)
        #expect(metrics.correctPerMinute == 0)
        #expect(metrics.medianResponseTime == 0)
        #expect(metrics.bestCorrectStreak == 0)
    }
}
