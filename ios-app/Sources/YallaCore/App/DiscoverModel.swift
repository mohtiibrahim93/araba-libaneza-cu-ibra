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
    public let searchTerms: [String]

    public init(
        id: String,
        displayKey: String,
        arabicRadicals: String?,
        memberCount: Int,
        searchTerms: [String] = []
    ) {
        self.id = id
        self.displayKey = displayKey
        self.arabicRadicals = arabicRadicals
        self.memberCount = memberCount
        self.searchTerms = searchTerms
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

public enum DiscoverSearchResult: Identifiable, Equatable, Sendable {
    case root(RootSummary)
    case entry(DictionaryEntrySummary)

    public var id: String {
        switch self {
        case let .root(root):
            return "root:\(root.id)"
        case let .entry(entry):
            return "entry:\(entry.id)"
        }
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

    public func search(_ query: String) -> [DiscoverSearchResult] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return roots.map(DiscoverSearchResult.root)
                + entries.map(DiscoverSearchResult.entry)
        }

        let needle = normalized(trimmed)

        let rootResults = roots.filter { root in
            let candidates = [root.displayKey, root.arabicRadicals ?? ""] + root.searchTerms
            return candidates.contains { normalized($0).contains(needle) }
        }

        let entryResults = entries.filter { entry in
            let candidates = [entry.arabizi, entry.arabicScript ?? "", entry.meaning] + entry.topics
            return candidates.contains { normalized($0).contains(needle) }
        }

        return rootResults.map(DiscoverSearchResult.root)
            + entryResults.map(DiscoverSearchResult.entry)
    }

    private func normalized(_ value: String) -> String {
        value
            .lowercased()
            .replacingOccurrences(of: "-", with: "")
            .replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "_", with: "")
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
        .sorted { caseInsensitiveLess($0.arabizi, $1.arabizi) }

        let expressionsByID = Dictionary(uniqueKeysWithValues: package.expressions.map { ($0.id, $0) })
        let linksByRootID = Dictionary(grouping: package.morphologyLinks, by: \.rootID)

        var roots: [RootSummary] = []
        var graphs: [String: RootExplorerSummary] = [:]

        for root in package.roots {
            let links = linksByRootID[root.id] ?? []

            let members = links.compactMap { link -> RootExplorerMember? in
                guard let expression = expressionsByID[link.expressionID] else { return nil }
                return RootExplorerMember(
                    id: expression.id,
                    label: expression.canonicalArabizi,
                    patternID: link.patternID
                )
            }
            .sorted { caseInsensitiveLess($0.label, $1.label) }

            var searchTerms = root.searchTerms
            searchTerms.append(contentsOf: members.map(\.label))

            roots.append(
                RootSummary(
                    id: root.id,
                    displayKey: root.displayKey,
                    arabicRadicals: root.arabicRadicals,
                    memberCount: links.count,
                    searchTerms: Array(Set(searchTerms)).sorted()
                )
            )

            graphs[root.id] = RootExplorerSummary(
                rootID: root.id,
                centerLabel: root.displayKey,
                members: members
            )
        }

        roots.sort { $0.displayKey < $1.displayKey }

        return DiscoverModel(entries: entries, roots: roots, graphsByRootID: graphs)
    }

    private func caseInsensitiveLess(_ lhs: String, _ rhs: String) -> Bool {
        let left = lhs.lowercased()
        let right = rhs.lowercased()
        return left == right ? lhs < rhs : left < right
    }
}
