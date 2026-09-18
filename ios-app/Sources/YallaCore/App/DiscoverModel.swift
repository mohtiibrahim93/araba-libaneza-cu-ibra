import Foundation

public enum DictionaryInflectionDirection: String, Equatable, Sendable {
    case outgoing
    case incoming
}

public struct DictionaryInflectionRelationSummary: Identifiable, Equatable, Sendable {
    public let relatedExpressionID: String
    public let relatedArabizi: String
    public let kind: InflectionRelationKind
    public let direction: DictionaryInflectionDirection
    public let patternID: String?
    public let patternLabel: String?
    public let patternKind: MorphologicalPatternKind?
    public let patternProductivity: PatternProductivity?

    public var id: String {
        [
            direction.rawValue,
            relatedExpressionID,
            kind.rawValue,
            patternID ?? "no-pattern"
        ].joined(separator: ":")
    }

    public init(
        relatedExpressionID: String,
        relatedArabizi: String,
        kind: InflectionRelationKind,
        direction: DictionaryInflectionDirection,
        patternID: String? = nil,
        patternLabel: String? = nil,
        patternKind: MorphologicalPatternKind? = nil,
        patternProductivity: PatternProductivity? = nil
    ) {
        self.relatedExpressionID = relatedExpressionID
        self.relatedArabizi = relatedArabizi
        self.kind = kind
        self.direction = direction
        self.patternID = patternID
        self.patternLabel = patternLabel
        self.patternKind = patternKind
        self.patternProductivity = patternProductivity
    }
}

public struct DictionaryEntrySummary: Identifiable, Equatable, Sendable {
    public let id: String
    public let arabizi: String
    public let arabicScript: String?
    public let meaning: String
    public let levels: [LevelBand]
    public let topics: [String]
    public let rootID: String?
    public let preferredAudioAsset: AudioAsset?
    public let inflectionRelations: [DictionaryInflectionRelationSummary]

    public init(
        id: String,
        arabizi: String,
        arabicScript: String?,
        meaning: String,
        levels: [LevelBand],
        topics: [String],
        rootID: String?,
        preferredAudioAsset: AudioAsset? = nil,
        inflectionRelations: [DictionaryInflectionRelationSummary] = []
    ) {
        self.id = id
        self.arabizi = arabizi
        self.arabicScript = arabicScript
        self.meaning = meaning
        self.levels = levels
        self.topics = topics
        self.rootID = rootID
        self.preferredAudioAsset = preferredAudioAsset
        self.inflectionRelations = inflectionRelations
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
    public let patternLabel: String?
    public let patternKind: MorphologicalPatternKind?
    public let patternProductivity: PatternProductivity?

    public init(
        id: String,
        label: String,
        patternID: String?,
        patternLabel: String? = nil,
        patternKind: MorphologicalPatternKind? = nil,
        patternProductivity: PatternProductivity? = nil
    ) {
        self.id = id
        self.label = label
        self.patternID = patternID
        self.patternLabel = patternLabel
        self.patternKind = patternKind
        self.patternProductivity = patternProductivity
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

        let expressionsByID = Dictionary(uniqueKeysWithValues: package.expressions.map { ($0.id, $0) })
        let patternsByID = Dictionary(uniqueKeysWithValues: package.morphologicalPatterns.map { ($0.id, $0) })
        let audioResolver = AudioAssetResolver()

        var inflectionsByExpressionID: [String: [DictionaryInflectionRelationSummary]] = [:]
        for relation in package.inflectionRelations {
            let pattern = relation.patternID.flatMap { patternsByID[$0] }

            if let target = expressionsByID[relation.targetExpressionID] {
                inflectionsByExpressionID[relation.sourceExpressionID, default: []].append(
                    DictionaryInflectionRelationSummary(
                        relatedExpressionID: target.id,
                        relatedArabizi: target.canonicalArabizi,
                        kind: relation.kind,
                        direction: .outgoing,
                        patternID: relation.patternID,
                        patternLabel: pattern?.label,
                        patternKind: pattern?.kind,
                        patternProductivity: pattern?.productivity
                    )
                )
            }

            if let source = expressionsByID[relation.sourceExpressionID] {
                inflectionsByExpressionID[relation.targetExpressionID, default: []].append(
                    DictionaryInflectionRelationSummary(
                        relatedExpressionID: source.id,
                        relatedArabizi: source.canonicalArabizi,
                        kind: relation.kind,
                        direction: .incoming,
                        patternID: relation.patternID,
                        patternLabel: pattern?.label,
                        patternKind: pattern?.kind,
                        patternProductivity: pattern?.productivity
                    )
                )
            }
        }

        for expressionID in inflectionsByExpressionID.keys {
            inflectionsByExpressionID[expressionID]?.sort {
                caseInsensitiveLess($0.relatedArabizi, $1.relatedArabizi)
            }
        }

        let entries = try package.expressions.map { expression in
            DictionaryEntrySummary(
                id: expression.id,
                arabizi: expression.canonicalArabizi,
                arabicScript: expression.arabicScript,
                meaning: try expression.localization(for: locale).naturalMeaning,
                levels: expression.levelTags,
                topics: expression.topics,
                rootID: rootByExpressionID[expression.id],
                preferredAudioAsset: audioResolver.bestAsset(
                    for: expression.id,
                    from: package.audioAssets
                ),
                inflectionRelations: inflectionsByExpressionID[expression.id] ?? []
            )
        }
        .sorted { caseInsensitiveLess($0.arabizi, $1.arabizi) }

        let linksByRootID = Dictionary(grouping: package.morphologyLinks, by: \.rootID)

        var roots: [RootSummary] = []
        var graphs: [String: RootExplorerSummary] = [:]

        for root in package.roots {
            let links = linksByRootID[root.id] ?? []

            let members = links.compactMap { link -> RootExplorerMember? in
                guard let expression = expressionsByID[link.expressionID] else { return nil }
                let pattern = link.patternID.flatMap { patternsByID[$0] }
                return RootExplorerMember(
                    id: expression.id,
                    label: expression.canonicalArabizi,
                    patternID: link.patternID,
                    patternLabel: pattern?.label,
                    patternKind: pattern?.kind,
                    patternProductivity: pattern?.productivity
                )
            }
            .sorted { caseInsensitiveLess($0.label, $1.label) }

            var searchTerms = [root.displayKey]
            if let arabicRadicals = root.arabicRadicals {
                searchTerms.append(arabicRadicals)
            }
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
