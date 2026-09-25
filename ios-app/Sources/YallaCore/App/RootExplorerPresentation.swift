/// Word-type filters for the Root Explorer, derived only from the approved
/// morphological pattern kind of each family member.
public enum RootFamilyFilter: String, CaseIterable, Hashable, Sendable {
    case all
    case verbs
    case nouns
    case places
    case persons
    case adjectives
    case participles
    case other

    /// The category a member belongs to. Members without an approved pattern
    /// fall under `.other` instead of being guessed.
    public static func category(for kind: MorphologicalPatternKind?) -> RootFamilyFilter {
        switch kind {
        case .verbStem: return .verbs
        case .noun, .verbalNoun, .plural: return .nouns
        case .placeNoun: return .places
        case .agentNoun: return .persons
        case .adjective: return .adjectives
        case .participle: return .participles
        case .other, nil: return .other
        }
    }

    public func includes(_ member: RootExplorerMember) -> Bool {
        self == .all || self == Self.category(for: member.patternKind)
    }
}

/// Where a family member sits around the root in the radial graph.
public enum RootGraphSlot: String, CaseIterable, Hashable, Sendable {
    case top
    case upperLeading
    case upperTrailing
    case lowerLeading
    case lowerTrailing
    case bottom

    /// Slots for up to `RootExplorerPresentation.maxGraphMembers` members,
    /// in the same order as the members.
    public static func slots(forCount count: Int) -> [RootGraphSlot] {
        switch count {
        case ...0: return []
        case 1: return [.top]
        case 2: return [.upperLeading, .upperTrailing]
        case 3: return [.top, .lowerLeading, .lowerTrailing]
        case 4: return [.upperLeading, .upperTrailing, .lowerLeading, .lowerTrailing]
        case 5: return [.top, .upperLeading, .upperTrailing, .lowerLeading, .lowerTrailing]
        default: return [.top, .upperLeading, .upperTrailing, .lowerLeading, .lowerTrailing, .bottom]
        }
    }
}

/// Screen state for one root family: filters, visible members, graph members
/// and the selected word. Pure data, so it is testable without SwiftUI.
public struct RootExplorerPresentation: Equatable, Sendable {
    public static let maxGraphMembers = 6

    public let members: [RootExplorerMember]

    public init(members: [RootExplorerMember]) {
        self.members = members
    }

    /// `.all` plus each category that has members, in a fixed order.
    /// Empty when the family has only one category (no filter bar needed).
    public var availableFilters: [RootFamilyFilter] {
        let present = Set(members.map { RootFamilyFilter.category(for: $0.patternKind) })
        guard present.count > 1 else { return [] }
        return [.all] + RootFamilyFilter.allCases.filter { $0 != .all && present.contains($0) }
    }

    public func visibleMembers(for filter: RootFamilyFilter) -> [RootExplorerMember] {
        members.filter(filter.includes)
    }

    /// Members drawn around the root; the rest go to the "Vezi toate" list.
    public func graphMembers(for filter: RootFamilyFilter) -> [RootExplorerMember] {
        Array(visibleMembers(for: filter).prefix(Self.maxGraphMembers))
    }

    public func hasOverflow(for filter: RootFamilyFilter) -> Bool {
        visibleMembers(for: filter).count > Self.maxGraphMembers
    }

    /// Keeps the current selection when it is still visible, otherwise falls
    /// back to the first visible member (or nil when nothing is visible).
    public func resolvedSelection(_ current: String?, for filter: RootFamilyFilter) -> String? {
        let visible = visibleMembers(for: filter)
        if let current, visible.contains(where: { $0.id == current }) {
            return current
        }
        return visible.first?.id
    }
}
