import Foundation
import Testing
@testable import YallaCore

@Suite("Content-aware review counts")
struct ContentAwareReviewCountsTests {
    @Test("Dashboard counts match resolved queue rows without deleting historical progress")
    func matchesQueue() throws {
        let now = Date(timeIntervalSince1970: 200_000)
        let ids: Set<String> = ["due", "later", "legacy", "unseen"]
        let progress = LearnerProgressSnapshot(reviewByExpressionID: [
            "due": .init(dueAt: now),
            "later": .init(dueAt: now.addingTimeInterval(60)),
            "legacy": .init(seen: 1, lastAttemptAt: now.addingTimeInterval(-90_000)),
            "unseen": .init(),
            "removed": .init(dueAt: now),
            "old-drill": .init(dueAt: now.addingTimeInterval(1))
        ])
        let package = ContentPackage(
            manifest: .init(schemaVersion: 3, contentVersion: "test", defaultLearnerLocale: "ro"),
            expressions: ids.sorted().map {
                YallaCore.Expression(id: $0, canonicalArabizi: $0,
                    localizations: ["ro": .init(naturalMeaning: $0)])
            }, units: [], exercises: [])
        let rows = try ReviewQueueBuilder().items(from: package, progress: progress, locale: "ro", at: now)
        let summary = progress.reviewQueueSummary(at: now, expressionIDs: ids)
        #expect(summary.dueNowCount == rows.filter(\.isDue).count)
        #expect(summary.upcomingCount == rows.filter { !$0.isDue }.count)
        #expect(summary.nextUpcomingAt == now.addingTimeInterval(60))
        #expect(progress.reviewByExpressionID.count == 6)
        #expect(progress.reviewQueueSummary(at: now).dueNowCount == 3)
        #expect(progress.reviewQueueSummary(at: now, expressionIDs: []).dueNowCount == 0)
        #expect(progress.reviewQueueSummary(at: now, expressionIDs: []).nextUpcomingAt == nil)
    }

    @Test("Content-aware counts cross the exact due boundary using the existing scheduler")
    func dueBoundary() {
        let now = Date(timeIntervalSince1970: 200_000)
        let progress = LearnerProgressSnapshot(reviewByExpressionID: ["word": .init(dueAt: now)])
        let before = progress.reviewQueueSummary(at: now.addingTimeInterval(-1), expressionIDs: ["word"])
        let due = progress.reviewQueueSummary(at: now, expressionIDs: ["word"])
        #expect(before.dueNowCount == 0)
        #expect(before.upcomingCount == 1)
        #expect(due.dueNowCount == 1)
        #expect(due.upcomingCount == 0)
        #expect(due.nextUpcomingAt == nil)
    }
}
