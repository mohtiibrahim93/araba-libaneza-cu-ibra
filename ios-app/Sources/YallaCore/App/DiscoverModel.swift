import Foundation

public struct DictionaryEntrySummary: Identifiable, Equatable, Sendable {
    public let id: String
    public let arabizi: String
    public let arabicScript: String?
    public let meaning: String
    public let levels: [LevelBand]
    public let topics: [String]
    public let rootID: String?

    public init(
        id: String,
        arabizi: String,
        arabicScript: String?,
        meaning: String,
        levels: [LevelBand],
        topics: [String],
        rootID: String?
    ) {
        self.id = id
        self.arabizi = arabizi
        self.arabicScript = arabicScript
        self.meaning = meaning
        self.levels = levels
        self.topics = topics
        self.rootID = rootID
    }
}

public struct RootSummary: Identifiable, Equatable, Sendable {
    public let id: String
    public let displayKey: String
    public let arabicRadicals: String?
    public let memberCount: Int

    public init(id: String, displayKey: String, arabicRadicals: String?, memberCount: Int) {
        self.id = id
        self.displayKey = displayKey
        self.arabicRadicals = arabicRadicals
        self.memberCount = memberCount
    }
}

public struct RootExplorerMember: Identifiable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let patternID: String?

    public init(id: String, label: String, patternID: String?) {
        self.id = id
        self.label = label
        self.patternID = patternID
    }
}

public struct RootExplorerSummary: Equatable, Sendable {
    public let rootID: String
    public let centerLabel: String
    public let members: [RootExplorerMember]

    public init(rootID: String, centerLabel: String, members: [RootExplorerMember]) {
        self.rootID = rootID
        self.centerLabel = centerLabel
        self.members = members
    }
}

public struct DiscoverModel: Equatable, Sendable {
    public let entries: [DictionaryEntrySummary]
    public let roots: [RootSummary]
    private let graphsByRootID: [String: RootExplorerSummary]

    public init(
        entries: [DictionaryEntrySummary],
        roots: [RootSummary],
        graphsByRootID: [String: RootExplorerSummary]
    ) {
        self.entries = entries
        self.roots = roots
        self.graphsByRootID = graphsByRootID
    }

    public func rootGraph(rootID: String) -> RootExplorerSummary? {
        graphsByRootID[rootID]
    }
}

public struct DiscoverModelBuilder: Sendable {
    public init() {}

    public func build(from package: ContentPackage, locale: String) throws -> DiscoverModel {
        let rootByExpressionID: [String: String] = package.morphologyLinks.reduce(into: [:]) { result, link in
            result[link.expressionID] = link.rootID
        }

        let entries = try package.expressions.map { expression in
            DictionaryEntrySummary(
                id: expression.id,
                arabizi: expression.canonicalArabizi,
                arabicScript: expression.arabicScript,
                meaning: try expression.localization(for: locale).naturalMeaning,
                levels: expression.levelTags,
                topics: expression.topics,
                rootID: rootByExpressionID[expression.id]
            )
        }
        .sorted { $0.arabizi.localizedCaseInsensitiveCompare($1.arabizi) == .orderedAscending }

        let expressionsByID = Dictionary(uniqueKeysWithValues: package.expressions.map { ($0.id, $0) })
        let linksByRootID = Dictionary(grouping: package.morphologyLinks, by: \.rootID)

        var roots: [RootSummary] = []
        var graphs: [String: RootExplorerSummary] = [:]

        for root in package.roots {
            let links = linksByRootID[root.id] ?? []
            roots.append(
                RootSummary(
                    id: root.id,
                    displayKey: root.displayKey,
                    arabicRadicals: root.arabicRadicals,
                    memberCount: links.count
                )
            )

            let members = links.compactMap { link -> RootExplorerMember? in
                guard let expression = expressionsByID[link.expressionID] else { return nil }
                return RootExplorerMember(
                    id: expression.id,
                    label: expression.canonicalArabizi,
                    patternID: link.patternID
                )
            }
            .sorted { $0.label.localizedCaseInsensitiveCompare($1.label) == .orderedAscending }

            graphs[root.id] = RootExplorerSummary(
                rootID: root.id,
                centerLabel: root.displayKey,
                members: members
            )
        }

        roots.sort { $0.displayKey < $1.displayKey }

        return DiscoverModel(entries: entries, roots: roots, graphsByRootID: graphs)
    }
}
