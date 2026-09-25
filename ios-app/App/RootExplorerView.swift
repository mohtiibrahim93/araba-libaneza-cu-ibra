import SwiftUI
import YallaCore

/// Root Explorer: one approved root, its word family around it, word-type
/// filters and the selected word's details. Everything shown comes from the
/// teacher-approved morphology content.
struct RootExplorerView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    let graph: RootExplorerSummary
    let model: DiscoverModel
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    /// Returns to Discover search; the search button is hidden without it.
    var onSearch: (() -> Void)? = nil

    @StateObject private var audio = NativeAudioController()
    @State private var filter: RootFamilyFilter = .all
    @State private var selectedID: String?
    @State private var showsAllMembers = false
    @State private var showsHelp = false

    private let presentation: RootExplorerPresentation
    private let root: RootSummary?
    private let entriesByID: [String: DictionaryEntrySummary]

    init(
        graph: RootExplorerSummary,
        model: DiscoverModel,
        package: ContentPackage,
        locale: String,
        progressModel: LearnerProgressModel,
        selectedWordID: String? = nil,
        onSearch: (() -> Void)? = nil
    ) {
        self.graph = graph
        self.model = model
        self.package = package
        self.locale = locale
        self.progressModel = progressModel
        self.onSearch = onSearch
        let presentation = RootExplorerPresentation(members: graph.members)
        self.presentation = presentation
        self.root = model.roots.first { $0.id == graph.rootID }
        let memberIDs = Set(graph.members.map(\.id))
        self.entriesByID = Dictionary(
            model.entries.filter { memberIDs.contains($0.id) }.map { ($0.id, $0) },
            uniquingKeysWith: { first, _ in first }
        )
        _selectedID = State(initialValue: presentation.resolvedSelection(selectedWordID, for: .all))
    }

    private var memberIDs: Set<String> {
        Set(graph.members.map(\.id))
    }

    private var visibleMembers: [RootExplorerMember] {
        presentation.visibleMembers(for: filter)
    }

    private var graphMembers: [RootExplorerMember] {
        presentation.graphMembers(for: filter)
    }

    private var selectedMember: RootExplorerMember? {
        graph.members.first { $0.id == selectedID }
    }

    /// The graph needs room for its cards; very large text gets a list.
    private var usesRadialGraph: Bool {
        dynamicTypeSize <= .xLarge
    }

    /// Taller cards only when some member actually has Arabic script.
    private var nodeHeight: CGFloat {
        graphMembers.contains { $0.arabicScript != nil } ? 128 : 104
    }

    private var familyExercises: [ExerciseDefinition] {
        LearningNavigationBuilder().targetedPractice(
            expressionIDs: memberIDs,
            from: package,
            count: 12
        )
    }

    private var familyProgress: ExpressionGroupProgress {
        progressModel.snapshot.expressionGroupProgress(expressionIDs: memberIDs, at: Date())
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Theme.Spacing.section) {
                header
                RootExplorerTitleBar(
                    title: "Explorator de rădăcini",
                    subtitle: "Descoperă cum dintr-o singură rădăcină se nasc mai multe cuvinte în araba libaneză.",
                    onBack: { dismiss() },
                    onHowItWorks: { showsHelp = true }
                )

                if graph.members.isEmpty {
                    emptyFamily
                } else {
                    family
                    if !presentation.availableFilters.isEmpty {
                        RootCategoryFilterBar(
                            filters: presentation.availableFilters,
                            selected: filter,
                            onSelect: select(filter:)
                        )
                    }
                    if let member = selectedMember {
                        detailCard(for: member)
                            .id(member.id)
                            .transition(.opacity)
                    }
                    progressStrip
                    patternDetails
                }
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.bottom, Theme.Spacing.xxl)
            .frame(maxWidth: Theme.Spacing.maxContentWidth)
            .frame(maxWidth: .infinity)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showsHelp) { RootHowItWorksSheet() }
        .sensoryFeedback(.selection, trigger: selectedID)
        .onDisappear { audio.stopPlayback() }
    }

    // MARK: Sections

    private var header: some View {
        HStack {
            BrandHeader()
            Spacer(minLength: Theme.Spacing.sm)
            if let onSearch {
                CircularIconButton(
                    icon: .system("magnifyingglass"),
                    accessibilityLabel: "Caută în Descoperă",
                    tint: Theme.ink,
                    fill: .clear,
                    diameter: 40,
                    action: {
                        dismiss()
                        onSearch()
                    }
                )
                .accessibilityIdentifier("root.search")
            }
        }
        .padding(.top, Theme.Spacing.sm)
    }

    @ViewBuilder
    private var family: some View {
        let rootLabel = root?.displayKey ?? graph.centerLabel
        if usesRadialGraph {
            let slots = RootGraphSlot.slots(forCount: graphMembers.count)
            RootGraphLayout(slots: slots, nodeHeight: nodeHeight) {
                RootCoreNode(latinRoot: rootLabel, arabicRoot: root?.arabicRadicals)
                ForEach(graphMembers) { member in
                    RootWordNode(
                        member: member,
                        isSelected: member.id == selectedID,
                        rootLabel: rootLabel,
                        onSelect: { select(member.id) }
                    )
                }
            }
            .background { RootGraphBackground(slots: slots, nodeHeight: nodeHeight) }
            .padding(.top, Theme.Spacing.sm)

            if presentation.hasOverflow(for: filter) {
                allMembersToggle
                if showsAllMembers { memberList(visibleMembers) }
            }
        } else {
            VStack(spacing: Theme.Spacing.md) {
                RootCoreNode(latinRoot: rootLabel, arabicRoot: root?.arabicRadicals)
                    .frame(width: 140, height: 140)
                    .frame(maxWidth: .infinity)
                memberList(visibleMembers)
            }
        }
    }

    private var allMembersToggle: some View {
        Button {
            withAnimation(reduceMotion ? nil : .easeOut(duration: 0.2)) { showsAllMembers.toggle() }
        } label: {
            Label(
                showsAllMembers ? "Ascunde lista" : "Vezi toate (\(visibleMembers.count))",
                systemImage: showsAllMembers ? "chevron.up" : "list.bullet"
            )
            .yallaFont(.captionStrong)
            .foregroundStyle(Theme.deep)
            .frame(minHeight: 44)
        }
        .buttonStyle(.plain)
        .frame(maxWidth: .infinity)
        .accessibilityIdentifier("root.seeAll")
    }

    private func memberList(_ members: [RootExplorerMember]) -> some View {
        VStack(spacing: 0) {
            ForEach(Array(members.enumerated()), id: \.element.id) { index, member in
                if index > 0 { Divider().padding(.leading, 60) }
                Button { select(member.id) } label: {
                    HStack(spacing: Theme.Spacing.md) {
                        YallaIconView(member.kindIcon)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(Theme.deep)
                            .frame(width: 36, height: 36)
                            .background(Theme.rootNodeIcon, in: Circle())
                            .accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(member.label)
                                .yallaFont(.bodyStrong)
                                .foregroundStyle(Theme.ink)
                            if let meaning = member.meaning {
                                Text(meaning)
                                    .yallaFont(.caption)
                                    .foregroundStyle(Theme.muted)
                            }
                        }
                        Spacer(minLength: 0)
                        if member.id == selectedID {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(Theme.deep)
                                .accessibilityHidden(true)
                        }
                    }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.vertical, Theme.Spacing.md)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityElement(children: .combine)
                .accessibilityAddTraits(member.id == selectedID ? .isSelected : [])
            }
        }
        .cardBackground()
    }

    private func detailCard(for member: RootExplorerMember) -> some View {
        let entry = entriesByID[member.id]
        var playAudio: (() -> Void)?
        if let asset = entry?.preferredAudioAsset {
            playAudio = {
                if audio.isPlaying { audio.stopPlayback() } else { audio.playReference(asset) }
            }
        }
        return RootWordDetailCard(
            member: member,
            isSaved: progressModel.snapshot.savedExpressionIDs.contains(member.id),
            isPlaying: audio.isPlaying,
            onToggleSaved: {
                Task { await progressModel.toggleSavedExpressionID(member.id) }
            },
            onPlayAudio: playAudio
        ) {
            if !familyExercises.isEmpty {
                NavigationLink {
                    ExerciseSessionView(
                        exercises: familyExercises,
                        expressions: package.expressions,
                        locale: locale,
                        title: "Exersează familia \(graph.centerLabel)",
                        progressModel: progressModel
                    )
                } label: {
                    Label("Exersează familia", systemImage: "point.3.connected.trianglepath.dotted")
                        .yallaFont(.captionStrong)
                }
                .buttonStyle(PillButtonStyle(minHeight: 44))
                .accessibilityIdentifier("root.detail.practice")
            }
            if let entry {
                NavigationLink {
                    DictionaryEntryDetailView(
                        entry: entry,
                        model: model,
                        package: package,
                        locale: locale,
                        progressModel: progressModel
                    )
                } label: {
                    Text("Vezi în dicționar")
                        .yallaFont(.captionStrong)
                        .foregroundStyle(Theme.terracottaShade)
                        .underline()
                        .frame(minHeight: 44)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var progressStrip: some View {
        HStack(spacing: 0) {
            progressMetric("\(familyProgress.practicedCount)/\(familyProgress.totalCount)", "exersate")
            progressMetric("\(familyProgress.unseenCount)", "noi")
            progressMetric("\(familyProgress.dueCount)", "de repetat")
            progressMetric("\(familyProgress.mistakeCount)", "greșeli active")
        }
        .padding(.vertical, Theme.Spacing.md)
        .cardBackground()
    }

    private func progressMetric(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .yallaFont(.bodyStrong)
                .foregroundStyle(Theme.ink)
            Text(label)
                .yallaFont(.caption)
                .foregroundStyle(Theme.muted)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
    }

    private var patternDetails: some View {
        DisclosureGroup {
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                ForEach(graph.members) { member in
                    HStack(alignment: .top) {
                        Text(member.label)
                            .yallaFont(.bodyStrong)
                            .foregroundStyle(Theme.ink)
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text(member.patternLabel ?? "fără tipar aprobat")
                                .yallaFont(.captionStrong)
                                .foregroundStyle(Theme.ink)
                            if let metadata = patternMetadata(for: member) {
                                Text(metadata)
                                    .yallaFont(.caption)
                                    .foregroundStyle(Theme.muted)
                            }
                        }
                        .multilineTextAlignment(.trailing)
                    }
                }
            }
            .padding(.top, Theme.Spacing.sm)
        } label: {
            Text("Gramatică și tipare")
                .yallaFont(.section)
                .foregroundStyle(Theme.ink)
        }
        .tint(Theme.deep)
        .padding(Theme.Spacing.lg)
        .cardBackground()
    }

    private var emptyFamily: some View {
        VStack(spacing: Theme.Spacing.lg) {
            RootCoreNode(latinRoot: root?.displayKey ?? graph.centerLabel, arabicRoot: root?.arabicRadicals)
                .frame(width: 140, height: 140)
            Text("Familia acestei rădăcini apare aici după ce profesorul aprobă cuvintele ei.")
                .yallaFont(.body)
                .foregroundStyle(Theme.muted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.xl)
    }

    // MARK: Actions

    private func select(_ id: String) {
        guard id != selectedID else { return }
        audio.stopPlayback()
        withAnimation(reduceMotion ? nil : .easeOut(duration: 0.2)) {
            selectedID = id
        }
    }

    private func select(filter newFilter: RootFamilyFilter) {
        audio.stopPlayback()
        withAnimation(reduceMotion ? nil : .easeOut(duration: 0.18)) {
            filter = newFilter
            showsAllMembers = false
            selectedID = presentation.resolvedSelection(selectedID, for: newFilter)
        }
    }

    private func patternMetadata(for member: RootExplorerMember) -> String? {
        let values = [
            member.patternKind.map(patternKindLabel),
            member.patternProductivity.map(productivityLabel)
        ].compactMap { $0 }
        return values.isEmpty ? nil : values.joined(separator: " · ")
    }

    private func patternKindLabel(_ kind: MorphologicalPatternKind) -> String {
        switch kind {
        case .verbStem: return "tipar verbal"
        case .verbalNoun: return "substantiv verbal"
        case .participle: return "participiu"
        case .agentNoun: return "nume de agent"
        case .placeNoun: return "nume de loc"
        case .adjective: return "adjectiv"
        case .noun: return "substantiv"
        case .plural: return "plural"
        case .other: return "alt tipar"
        }
    }

    private func productivityLabel(_ productivity: PatternProductivity) -> String {
        switch productivity {
        case .productive: return "productiv"
        case .limited: return "limitat"
        case .lexicalized: return "lexicalizat"
        }
    }
}
