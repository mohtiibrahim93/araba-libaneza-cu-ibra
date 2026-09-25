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
    public let literalMeaning: String?
    public let pragmaticMeaning: String?
    public let spellingVariants: [String]
    public let pronunciationVariants: [String]
    public let levels: [LevelBand]
    public let topics: [String]
    public let rootID: String?
    public let preferredAudioAsset: AudioAsset?
    public let inflectionRelations: [DictionaryInflectionRelationSummary]
    /// Every content expression shown by this entry. Identical Arabizi +
    /// meaning pairs imported by several units appear once in the dictionary.
    public let expressionIDs: [String]

    /// Single words (no space in the Arabizi) versus multi-word expressions.
    public var isSingleWord: Bool {
        !arabizi.trimmingCharacters(in: .whitespaces).contains(" ")
    }

    public init(
        id: String,
        arabizi: String,
        arabicScript: String?,
        meaning: String,
        literalMeaning: String? = nil,
        pragmaticMeaning: String? = nil,
        spellingVariants: [String] = [],
        pronunciationVariants: [String] = [],
        levels: [LevelBand],
        topics: [String],
        rootID: String?,
        preferredAudioAsset: AudioAsset? = nil,
        inflectionRelations: [DictionaryInflectionRelationSummary] = [],
        expressionIDs: [String]? = nil
    ) {
        self.id = id
        self.arabizi = arabizi
        self.arabicScript = arabicScript
        self.meaning = meaning
        self.literalMeaning = literalMeaning
        self.pragmaticMeaning = pragmaticMeaning
        self.spellingVariants = spellingVariants
        self.pronunciationVariants = pronunciationVariants
        self.levels = levels
        self.topics = topics
        self.rootID = rootID
        self.preferredAudioAsset = preferredAudioAsset
        self.inflectionRelations = inflectionRelations
        self.expressionIDs = expressionIDs ?? [id]
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
    public let meaning: String?
    public let arabicScript: String?

    public init(
        id: String,
        label: String,
        patternID: String?,
        patternLabel: String? = nil,
        patternKind: MorphologicalPatternKind? = nil,
        patternProductivity: PatternProductivity? = nil,
        meaning: String? = nil,
        arabicScript: String? = nil
    ) {
        self.id = id
        self.label = label
        self.patternID = patternID
        self.patternLabel = patternLabel
        self.patternKind = patternKind
        self.patternProductivity = patternProductivity
        self.meaning = meaning
        self.arabicScript = arabicScript
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
    private let entryIndexByExpressionID: [String: Int]
    private let searchKeys: [DiscoverSearchKey]
    private let tokensByEntry: [Set<String>]
    private let phraseIndexesByToken: [String: [Int]]
    /// Topic groups (Journey units, vocabulary collections) as entry indexes
    /// in content order.
    private let topicGroups: [[Int]]
    private let topicGroupIndexesByEntry: [[Int]]

    /// - Parameter topicGroups: expression IDs per unit or vocabulary
    ///   collection, in content order; used for similar expressions.
    public init(
        entries: [DictionaryEntrySummary],
        roots: [RootSummary],
        graphsByRootID: [String: RootExplorerSummary],
        topicGroups: [[String]] = []
    ) {
        self.entries = entries
        self.roots = roots
        self.graphsByRootID = graphsByRootID

        var indexByExpressionID: [String: Int] = [:]
        for (index, entry) in entries.enumerated() {
            for expressionID in entry.expressionIDs where indexByExpressionID[expressionID] == nil {
                indexByExpressionID[expressionID] = index
            }
        }
        self.entryIndexByExpressionID = indexByExpressionID
        self.searchKeys = entries.map(DiscoverSearchKey.init)

        let tokens = entries.map { DiscoverText.tokens($0.arabizi) }
        self.tokensByEntry = tokens
        var phraseIndexes: [String: [Int]] = [:]
        for (index, entry) in entries.enumerated() where !entry.isSingleWord {
            for token in tokens[index] {
                phraseIndexes[token, default: []].append(index)
            }
        }
        self.phraseIndexesByToken = phraseIndexes

        var groups: [[Int]] = []
        var groupsByEntry = Array(repeating: [Int](), count: entries.count)
        for expressionIDs in topicGroups {
            var seen = Set<Int>()
            let members = expressionIDs.compactMap { indexByExpressionID[$0] }.filter { seen.insert($0).inserted }
            guard !members.isEmpty else { continue }
            for member in members { groupsByEntry[member].append(groups.count) }
            groups.append(members)
        }
        self.topicGroups = groups
        self.topicGroupIndexesByEntry = groupsByEntry
    }

    public func rootGraph(rootID: String) -> RootExplorerSummary? {
        graphsByRootID[rootID]
    }

    /// The dictionary entry that shows this content expression.
    public func entry(forExpressionID expressionID: String) -> DictionaryEntrySummary? {
        entryIndexByExpressionID[expressionID].map { entries[$0] }
    }

    /// Roots first, then entries ranked: exact Arabizi or variant, Arabizi
    /// prefix, Arabizi contains, whole Romanian word, Romanian word prefix,
    /// Romanian contains. Alphabetical within each rank.
    public func search(_ query: String) -> [DiscoverSearchResult] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return roots.map(DiscoverSearchResult.root)
                + entries.map(DiscoverSearchResult.entry)
        }

        let needle = DiscoverText.key(trimmed)
        guard !needle.isEmpty else { return [] }

        let rootResults = roots.filter { root in
            let candidates = [root.displayKey, root.arabicRadicals ?? ""] + root.searchTerms
            return candidates.contains { DiscoverText.key($0).contains(needle) }
        }

        var ranked = Array(repeating: [DictionaryEntrySummary](), count: DiscoverSearchKey.rankCount)
        for (index, key) in searchKeys.enumerated() {
            if let rank = key.rank(for: needle) {
                ranked[rank].append(entries[index])
            }
        }

        return rootResults.map(DiscoverSearchResult.root)
            + ranked.joined().map(DiscoverSearchResult.entry)
    }

    /// Up to `limit` approved multi-word expressions that contain this single
    /// word as a whole word, shortest first.
    public func examples(for entry: DictionaryEntrySummary, limit: Int = 2) -> [DictionaryEntrySummary] {
        guard entry.isSingleWord,
              let token = DiscoverText.tokens(entry.arabizi).first,
              let indexes = phraseIndexesByToken[token]
        else { return [] }
        let phrases: [DictionaryEntrySummary] = indexes.map { entries[$0] }
        let shortestFirst = phrases.sorted { (lhs: DictionaryEntrySummary, rhs: DictionaryEntrySummary) -> Bool in
            let left = lhs.arabizi.count
            let right = rhs.arabizi.count
            if left != right { return left < right }
            return lhs.arabizi < rhs.arabizi
        }
        return Array(shortestFirst.prefix(limit))
    }

    /// Entries of the same kind from the same unit or vocabulary collection.
    /// Expressions must share at least one word of three or more letters
    /// (e.g. "baddak tekol" and "baddak teshrab"); words are ordered by how
    /// close they sit in the lesson.
    public func similar(to entry: DictionaryEntrySummary, limit: Int = 4) -> [DictionaryEntrySummary] {
        guard let index = entryIndexByExpressionID[entry.id] else { return [] }
        let ownTokens = tokensByEntry[index].filter { $0.count >= 3 }
        var best: [Int: (shared: Int, distance: Int)] = [:]

        for groupIndex in topicGroupIndexesByEntry[index] {
            let group = topicGroups[groupIndex]
            guard let position = group.firstIndex(of: index) else { continue }
            for (offset, candidate) in group.enumerated() where candidate != index {
                guard entries[candidate].isSingleWord == entry.isSingleWord else { continue }
                let shared = entry.isSingleWord
                    ? 0
                    : ownTokens.intersection(tokensByEntry[candidate]).count
                if !entry.isSingleWord && shared == 0 { continue }
                let distance = abs(offset - position)
                if let current = best[candidate] {
                    let currentIsBetter = current.shared > shared
                        || (current.shared == shared && current.distance <= distance)
                    if currentIsBetter { continue }
                }
                best[candidate] = (shared: shared, distance: distance)
            }
        }

        let ranked: [Int] = best.keys.sorted { (lhs: Int, rhs: Int) -> Bool in
            let left = best[lhs]!
            let right = best[rhs]!
            if left.shared != right.shared { return left.shared > right.shared }
            if left.distance != right.distance { return left.distance < right.distance }
            return lhs < rhs
        }
        return ranked.prefix(limit).map { entries[$0] }
    }
}

/// Text normalisation shared by search, examples and similarity. Display
/// strings are never changed; only comparison keys are.
enum DiscoverText {
    /// Lowercased, diacritic-insensitive letters and digits only.
    static func key(_ value: String) -> String {
        let folded = value.folding(options: [.caseInsensitive, .diacriticInsensitive], locale: nil)
        return String(String.UnicodeScalarView(folded.unicodeScalars.filter(CharacterSet.alphanumerics.contains)))
    }

    /// Whole words (letters and digits) of an Arabizi or Romanian string.
    static func tokens(_ value: String) -> Set<String> {
        Set(words(value))
    }

    static func words(_ value: String) -> [String] {
        value
            .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: nil)
            .components(separatedBy: CharacterSet.alphanumerics.inverted)
            .filter { !$0.isEmpty }
    }
}

struct DiscoverSearchKey: Equatable, Sendable {
    static let rankCount = 6

    let forms: [String]
    let meaningWords: Set<String>
    let meaningText: String

    init(_ entry: DictionaryEntrySummary) {
        forms = ([entry.arabizi, entry.arabicScript ?? ""] + entry.spellingVariants + entry.pronunciationVariants)
            .map(DiscoverText.key)
            .filter { !$0.isEmpty }
        let meanings = [entry.meaning, entry.literalMeaning ?? "", entry.pragmaticMeaning ?? ""] + entry.topics
        meaningWords = Set(meanings.flatMap(DiscoverText.words))
        meaningText = meanings.map(DiscoverText.key).joined(separator: "|")
    }

    func rank(for needle: String) -> Int? {
        if forms.contains(needle) { return 0 }
        if forms.contains(where: { $0.hasPrefix(needle) }) { return 1 }
        if forms.contains(where: { $0.contains(needle) }) { return 2 }
        if meaningWords.contains(needle) { return 3 }
        if meaningWords.contains(where: { $0.hasPrefix(needle) }) { return 4 }
        if meaningText.contains(needle) { return 5 }
        return nil
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

        let rawEntries = try package.expressions.map { expression in
            let localization = try expression.localization(for: locale)
            return DictionaryEntrySummary(
                id: expression.id,
                arabizi: expression.canonicalArabizi,
                arabicScript: expression.arabicScript,
                meaning: localization.naturalMeaning,
                literalMeaning: localization.literalMeaning,
                pragmaticMeaning: localization.pragmaticMeaning,
                spellingVariants: expression.variants
                    .filter { $0.kind == .spelling }
                    .map(\.value),
                pronunciationVariants: expression.variants
                    .filter { $0.kind == .pronunciation }
                    .map(\.value),
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
        let entries = mergedDuplicates(rawEntries)
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
                    patternProductivity: pattern?.productivity,
                    meaning: (try? expression.localization(for: locale))?.naturalMeaning,
                    arabicScript: expression.arabicScript
                )
            }
            // Members keep the order of the teacher-approved morphology file.

            var searchTerms = [root.displayKey]
            if let arabicRadicals = root.arabicRadicals {
                searchTerms.append(arabicRadicals)
            }
            searchTerms.append(contentsOf: members.map(\.label))
            for link in links {
                if let expression = expressionsByID[link.expressionID] {
                    searchTerms.append(contentsOf: expression.variants.map(\.value))
                }
            }

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

        return DiscoverModel(
            entries: entries,
            roots: roots,
            graphsByRootID: graphs,
            topicGroups: package.units.map(\.expressionIDs)
                + package.lexiconCollections.map(\.expressionIDs)
        )
    }

    /// Entries with the same Arabizi and the same meaning (several units
    /// importing the same card) become one entry that keeps every expression
    /// ID. Different meanings stay separate.
    private func mergedDuplicates(_ entries: [DictionaryEntrySummary]) -> [DictionaryEntrySummary] {
        var order: [String] = []
        var groups: [String: [DictionaryEntrySummary]] = [:]
        for entry in entries {
            let key = DiscoverText.key(entry.arabizi) + "|" + DiscoverText.key(entry.meaning)
            if groups[key] == nil { order.append(key) }
            groups[key, default: []].append(entry)
        }

        return order.compactMap { key -> DictionaryEntrySummary? in
            guard let group = groups[key], let first = group.first else { return nil }
            guard group.count > 1 else { return first }
            let primary = group.first { $0.rootID != nil }
                ?? group.first { $0.preferredAudioAsset != nil }
                ?? first

            func unique<T: Hashable>(_ values: [T]) -> [T] {
                var seen = Set<T>()
                return values.filter { seen.insert($0).inserted }
            }

            var relationIDs = Set<String>()
            let relations = group.flatMap(\.inflectionRelations).filter { relationIDs.insert($0.id).inserted }

            return DictionaryEntrySummary(
                id: primary.id,
                arabizi: primary.arabizi,
                arabicScript: primary.arabicScript ?? group.compactMap(\.arabicScript).first,
                meaning: primary.meaning,
                literalMeaning: primary.literalMeaning ?? group.compactMap(\.literalMeaning).first,
                pragmaticMeaning: primary.pragmaticMeaning ?? group.compactMap(\.pragmaticMeaning).first,
                spellingVariants: unique(group.flatMap(\.spellingVariants)),
                pronunciationVariants: unique(group.flatMap(\.pronunciationVariants)),
                levels: unique(group.flatMap(\.levels)),
                topics: unique(group.flatMap(\.topics)),
                rootID: primary.rootID,
                preferredAudioAsset: primary.preferredAudioAsset ?? group.compactMap(\.preferredAudioAsset).first,
                inflectionRelations: relations,
                expressionIDs: [primary.id] + group.map(\.id).filter { $0 != primary.id }
            )
        }
    }

    private func caseInsensitiveLess(_ lhs: String, _ rhs: String) -> Bool {
        let left = lhs.lowercased()
        let right = rhs.lowercased()
        return left == right ? lhs < rhs : left < right
    }
}
