public enum SpeedDrillSelectionSource: String, CaseIterable, Equatable, Sendable {
    case mistake
    case due
    case current
    case reinforcement
    case familiar
    case newMaterial = "new"
}

public struct SpeedDrillSelectionItem: Equatable, Sendable {
    public let expressionID: String
    public let source: SpeedDrillSelectionSource

    public init(expressionID: String, source: SpeedDrillSelectionSource) {
        self.expressionID = expressionID
        self.source = source
    }
}

public struct SpeedDrillSelectionPlanner: Sendable {
    public let targetCount: Int

    public init(targetCount: Int = 20) {
        self.targetCount = max(targetCount, 0)
    }

    public func makeSelection(
        expressions: [Expression],
        units: [JourneyUnit],
        context: SessionCandidateContext
    ) -> [SpeedDrillSelectionItem] {
        guard targetCount > 0, !expressions.isEmpty else { return [] }

        let currentExpressionIDs = Set(
            units
                .filter { context.currentUnitIDs.contains($0.id) }
                .flatMap(\.expressionIDs)
        )

        var pools: [SpeedDrillSelectionSource: [SpeedDrillSelectionItem]] = [:]
        for expression in expressions {
            let source = source(
                for: expression.id,
                currentExpressionIDs: currentExpressionIDs,
                context: context
            )
            pools[source, default: []].append(
                SpeedDrillSelectionItem(
                    expressionID: expression.id,
                    source: source
                )
            )
        }

        let retrievalOrder: [SpeedDrillSelectionSource] = [
            .mistake,
            .due,
            .current,
            .reinforcement,
            .familiar
        ]
        let desired: [SpeedDrillSelectionSource: Int] = [
            .mistake: 4,
            .due: 4,
            .current: 4,
            .reinforcement: 4,
            .familiar: 4
        ]

        var selected: [SpeedDrillSelectionItem] = []
        var offsets: [SpeedDrillSelectionSource: Int] = [:]

        func takeOne(
            from source: SpeedDrillSelectionSource,
            respectingQuota: Bool
        ) -> SpeedDrillSelectionItem? {
            if respectingQuota,
               selected.count { $0.source == source } >= desired[source, default: 0] {
                return nil
            }

            let offset = offsets[source, default: 0]
            guard let pool = pools[source], offset < pool.count else {
                return nil
            }
            offsets[source] = offset + 1
            return pool[offset]
        }

        var madeProgress = true
        while selected.count < targetCount && madeProgress {
            madeProgress = false
            for source in retrievalOrder where selected.count < targetCount {
                if let item = takeOne(from: source, respectingQuota: true) {
                    selected.append(item)
                    madeProgress = true
                }
            }
        }

        while selected.count < targetCount {
            var added = false
            for source in retrievalOrder where selected.count < targetCount {
                if let item = takeOne(from: source, respectingQuota: false) {
                    selected.append(item)
                    added = true
                }
            }
            if !added { break }
        }

        if selected.count < targetCount {
            let newItems = pools[.newMaterial] ?? []
            let remaining = targetCount - selected.count
            selected.append(contentsOf: newItems.prefix(remaining))
        }

        return selected
    }

    private func source(
        for expressionID: String,
        currentExpressionIDs: Set<String>,
        context: SessionCandidateContext
    ) -> SpeedDrillSelectionSource {
        if context.mistakeExpressionIDs.contains(expressionID) {
            return .mistake
        }
        if context.dueExpressionIDs.contains(expressionID) {
            return .due
        }
        if currentExpressionIDs.contains(expressionID) {
            return .current
        }
        if context.reinforcementExpressionIDs.contains(expressionID) {
            return .reinforcement
        }
        if context.seenExpressionIDs.contains(expressionID) {
            return .familiar
        }
        return .newMaterial
    }
}
