import Foundation
import Testing
@testable import YallaCore

@Suite("Review scheduler parity")
struct ReviewSchedulerTests {
    private let scheduler = ReviewScheduler()
    private let day: TimeInterval = 86_400
    private let now = Date(timeIntervalSince1970: 2_000_000_000)

    @Test("First clean correct starts stage zero and schedules one day")
    func firstCleanCorrect() {
        let updated = scheduler.record(ReviewState(), correct: true, hinted: false, at: now)

        #expect(updated.seen == 1)
        #expect(updated.correct == 1)
        #expect(updated.streak == 1)
        #expect(updated.wrong == false)
        #expect(updated.reviewStage == 0)
        #expect(updated.lastAttemptAt == now)
        #expect(updated.dueAt == now.addingTimeInterval(day))
    }

    @Test("Clean correct when due advances to three-day stage")
    func dueCorrectAdvances() {
        let state = ReviewState(
            seen: 1,
            correct: 1,
            streak: 1,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 0,
            dueAt: now
        )

        let updated = scheduler.record(state, correct: true, hinted: false, at: now)

        #expect(updated.reviewStage == 1)
        #expect(updated.dueAt == now.addingTimeInterval(3 * day))
        #expect(updated.correct == 2)
        #expect(updated.streak == 2)
    }

    @Test("Early clean correct preserves current stage and due date")
    func earlyCorrectPreservesDue() {
        let futureDue = now.addingTimeInterval(2 * day)
        let state = ReviewState(
            seen: 4,
            correct: 3,
            streak: 2,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 1,
            dueAt: futureDue
        )

        let updated = scheduler.record(state, correct: true, hinted: false, at: now)

        #expect(updated.reviewStage == 1)
        #expect(updated.dueAt == futureDue)
        #expect(updated.seen == 5)
        #expect(updated.correct == 4)
        #expect(updated.streak == 3)
    }

    @Test("Wrong answer resets review state and schedules one day")
    func wrongResets() {
        let state = ReviewState(
            seen: 8,
            correct: 6,
            streak: 3,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 3,
            dueAt: now.addingTimeInterval(7 * day)
        )

        let updated = scheduler.record(state, correct: false, hinted: false, at: now)

        #expect(updated.seen == 9)
        #expect(updated.correct == 6)
        #expect(updated.streak == 0)
        #expect(updated.wrong == true)
        #expect(updated.reviewStage == 0)
        #expect(updated.dueAt == now.addingTimeInterval(day))
    }

    @Test("Hinted correct is not earned and resets like a wrong answer")
    func hintedCorrectResets() {
        let state = ReviewState(
            seen: 3,
            correct: 3,
            streak: 3,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 2,
            dueAt: now
        )

        let updated = scheduler.record(state, correct: true, hinted: true, at: now)

        #expect(updated.correct == 3)
        #expect(updated.streak == 0)
        #expect(updated.wrong == true)
        #expect(updated.reviewStage == 0)
        #expect(updated.dueAt == now.addingTimeInterval(day))
    }

    @Test("Streak is capped at three")
    func streakCap() {
        let state = ReviewState(
            seen: 3,
            correct: 3,
            streak: 3,
            wrong: false,
            lastAttemptAt: now.addingTimeInterval(-day),
            reviewStage: 0,
            dueAt: now
        )

        let updated = scheduler.record(state, correct: true, hinted: false, at: now)
        #expect(updated.streak == 3)
    }

    @Test("Legacy due date falls back to last attempt plus one day")
    func legacyDueFallback() {
        let last = now.addingTimeInterval(-2 * day)
        let state = ReviewState(
            seen: 1,
            correct: 0,
            streak: 0,
            wrong: true,
            lastAttemptAt: last,
            reviewStage: nil,
            dueAt: nil
        )

        #expect(scheduler.dueDate(for: state) == last.addingTimeInterval(day))
        #expect(scheduler.isDue(state, at: now))
    }

    @Test("Unseen state has no due date")
    func unseenHasNoDueDate() {
        #expect(scheduler.dueDate(for: ReviewState()) == nil)
        #expect(!scheduler.isDue(ReviewState(), at: now))
    }
}
