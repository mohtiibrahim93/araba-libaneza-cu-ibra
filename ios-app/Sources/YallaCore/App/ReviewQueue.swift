import Foundation

public struct ReviewQueueItemSummary: Identifiable, Equatable, Sendable {
    public var id: String { expression.id }
    public let expression: JourneyExpressionSummary
    public let dueAt: Date
    public let isDue: Bool
    public let canPractice: Bool
}

public struct ReviewQueueBuilder: Sendable {
    public init() {}

    public func items(
        from package: ContentPackage,
        progress: LearnerProgressSnapshot,
        locale: String,
        at date: Date
    ) throws -> [ReviewQueueItemSummary] {
        let scheduler = ReviewScheduler()
        let practiceIDs = Set(playableExercises(in: package).compactMap { $0.expressionIDs.first })
        return try package.expressions.compactMap { expression -> ReviewQueueItemSummary? in
            guard let review = progress.reviewByExpressionID[expression.id],
                  let dueAt = scheduler.dueDate(for: review) else { return nil }
            return ReviewQueueItemSummary(
                expression: JourneyExpressionSummary(
                    id: expression.id,
                    arabizi: expression.canonicalArabizi,
                    arabicScript: expression.arabicScript,
                    meaning: try expression.localization(for: locale).naturalMeaning
                ),
                dueAt: dueAt,
                isDue: dueAt <= date,
                canPractice: practiceIDs.contains(expression.id)
            )
        }.sorted {
            $0.dueAt == $1.dueAt ? $0.id < $1.id : $0.dueAt < $1.dueAt
        }
    }

    public func practice(
        from package: ContentPackage,
        progress: LearnerProgressSnapshot,
        at date: Date,
        count: Int = 20
    ) -> [ExerciseDefinition] {
        guard count > 0 else { return [] }
        let scheduler = ReviewScheduler()
        let dueIDs = progress.dueExpressionIDs(at: date)
        let candidates = playableExercises(in: package).filter {
            guard let target = $0.expressionIDs.first else { return false }
            return dueIDs.contains(target)
        }.sorted { lhs, rhs in
            let leftID = lhs.expressionIDs[0]
            let rightID = rhs.expressionIDs[0]
            let leftDate = progress.reviewByExpressionID[leftID].flatMap { scheduler.dueDate(for: $0) } ?? date
            let rightDate = progress.reviewByExpressionID[rightID].flatMap { scheduler.dueDate(for: $0) } ?? date
            if leftDate != rightDate { return leftDate < rightDate }
            if leftID != rightID { return leftID < rightID }
            return lhs.id < rhs.id
        }
        // One retrieval per expression; the player records its primary target.
        var selectedIDs = Set<String>()
        return Array(candidates.filter {
            selectedIDs.insert($0.expressionIDs[0]).inserted
        }.prefix(count))
    }

    private func playableExercises(in package: ContentPackage) -> [ExerciseDefinition] {
        let expressionIDs = Set(package.expressions.map(\.id))
        return package.exercises.filter { exercise in
            guard !exercise.expressionIDs.isEmpty,
                  Set(exercise.expressionIDs).isSubset(of: expressionIDs),
                  !exercise.answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            else { return false }
            // The existing native session presents text responses. Audio and
            // structural interaction types require their own complete flows.
            switch exercise.type {
            case .freeProduction, .reverseProduction, .dialogueResponse,
                 .fillGap, .grammarDrill, .transformation:
                return true
            default:
                return false
            }
        }
    }
}
