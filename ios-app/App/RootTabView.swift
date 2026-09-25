import Foundation
import SwiftUI
import YallaCore

struct RootTabView: View {
    let content: AppContentSnapshot
    private let reviewExpressionIDs: Set<String>
    private let lessonCounts: [String: Int]
    /// First approved phrase of each Journey unit, for the map signboards.
    private let signboards: [String: String]
    /// Expressions without a space in their Arabizi (the word dictionary).
    private let singleWordExpressionIDs: Set<String>
    private let topicUnits: [ProgressTopicUnit]
    @StateObject private var progressModel: LearnerProgressModel
    @State private var selectedTab: RootTab = .home
    @State private var journeyPath: [String] = []
    @State private var homePath: [String] = []
    @State private var practicePath: [String] = []
    /// Dates of local Speak & Compare recordings, for the "Vorbește" goal.
    @State private var recordingDates: [Date] = []
    @Environment(\.scenePhase) private var scenePhase
    @State private var showingReviews = false
    @State private var showingOrientation = false
    @AppStorage("hasSeenWelcome") private var hasSeenWelcome = false

    init(
        content: AppContentSnapshot,
        progressRepository: LearnerProgressRepository,
        progressOutbox: any ProgressSaveOutbox
    ) {
        self.content = content
        self.reviewExpressionIDs = Set(content.package.expressions.map(\.id))
        self.lessonCounts = JourneyLessonPlanner().lessonCounts(in: content.package, locale: content.locale)
        let arabiziByID = Dictionary(
            content.package.expressions.map { ($0.id, $0.canonicalArabizi) },
            uniquingKeysWith: { first, _ in first }
        )
        self.signboards = content.package.units.reduce(into: [:]) { result, unit in
            if let id = unit.expressionIDs.first, let phrase = arabiziByID[id] { result[unit.id] = phrase }
        }
        self.singleWordExpressionIDs = Set(
            content.package.expressions
                .filter { !$0.canonicalArabizi.trimmingCharacters(in: .whitespaces).contains(" ") }
                .map(\.id)
        )
        let locale = content.locale
        self.topicUnits = content.package.units.map { unit in
            ProgressTopicUnit(
                id: unit.id,
                title: unit.localizations[locale]?.title ?? unit.id,
                expressionIDs: unit.expressionIDs
            )
        }
        _progressModel = StateObject(
            wrappedValue: LearnerProgressModel(
                repository: progressRepository,
                outbox: progressOutbox
            )
        )
    }

    private var currentUnitLevel: LevelBand {
        let sections = content.shell.journeySections
        if let currentUnitID = progressModel.snapshot.currentJourneyUnitID,
           let section = sections.first(where: { $0.units.contains { $0.id == currentUnitID } }) {
            return section.level
        }
        return sections.first?.level ?? .a1
    }

    private var currentUnitTitle: String? {
        guard let currentUnitID = progressModel.snapshot.currentJourneyUnitID else { return nil }
        return content.shell.journeySections
            .flatMap(\.units)
            .first(where: { $0.id == currentUnitID })?
            .title
    }

    /// A1 expression that changes once per day; chosen from bundled content only.
    private func expressionOfDay(at date: Date) -> HomeExpression? {
        let candidates = content.package.expressions.filter { $0.levelTags.contains(.a1) }
        guard !candidates.isEmpty else { return nil }
        let day = Int(date.timeIntervalSince1970 / 86_400)
        for offset in 0..<min(candidates.count, 20) {
            let expression = candidates[(day + offset) % candidates.count]
            if let meaning = expression.localizations[content.locale]?.naturalMeaning,
               !meaning.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                return homeExpression(expression, meaning: meaning)
            }
        }
        return nil
    }

    /// Saved dictionary entries: a word saved from Discover saves all its
    /// merged copies, so entries (not raw expression IDs) are counted once.
    private var savedEntries: [DictionaryEntrySummary] {
        let saved = progressModel.snapshot.savedExpressionIDs
        guard !saved.isEmpty else { return [] }
        return content.discover.entries.filter { $0.expressionIDs.contains(where: saved.contains) }
    }

    private var savedPreview: [HomeExpression] {
        savedEntries.prefix(3).map { entry in
            HomeExpression(
                id: entry.id,
                arabizi: entry.arabizi,
                meaning: entry.meaning,
                arabic: entry.arabicScript,
                audio: entry.preferredAudioAsset
            )
        }
    }

    private func homeExpression(_ expression: YallaCore.Expression, meaning: String) -> HomeExpression {
        HomeExpression(
            id: expression.id,
            arabizi: expression.canonicalArabizi,
            meaning: meaning,
            arabic: expression.arabicScript,
            audio: AudioAssetResolver().bestAsset(for: expression.id, from: content.package.audioAssets)
        )
    }

    /// Size of the smart session the Practică tab would start right now.
    private func smartSessionSize(at date: Date) -> Int {
        let destination = try? LearningNavigationBuilder().practiceDestination(
            id: "smart-session",
            from: content.package,
            locale: content.locale,
            learnerContext: progressModel.snapshot.sessionCandidateContext(at: date)
        )
        guard case let .smartSession(exercises)? = destination else { return 0 }
        return exercises.count
    }

    private func openPractice(_ id: String) {
        practicePath = [id]
        selectedTab = .practice
    }

    private func progressDashboard(at date: Date) -> ProgressDashboardView {
        ProgressDashboardView(
            progress: progressModel.snapshot,
            lessonCounts: lessonCounts,
            journeyLevel: currentUnitLevel,
            reviewQueue: progressModel.snapshot.reviewQueueSummary(at: date, expressionIDs: reviewExpressionIDs),
            rewards: RewardCalculator().summary(events: progressModel.snapshot.xpEvents, at: date),
            singleWordExpressionIDs: singleWordExpressionIDs,
            topicUnits: topicUnits,
            reviewExpressionIDs: reviewExpressionIDs,
            recordingCount: recordingDates.count,
            date: date,
            onReviews: { showingReviews = true },
            onSmartPractice: { openPractice("smart-session") },
            onContinueJourney: continueJourney
        )
    }

    private func continueJourney() {
        if let unitID = progressModel.snapshot.currentJourneyUnitID {
            journeyPath = [unitID]
        }
        selectedTab = .journey
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            TimelineView(.periodic(from: .now, by: 30)) { context in
            HomeView(
                reviewQueue: progressModel.snapshot.reviewQueueSummary(at: context.date, expressionIDs: reviewExpressionIDs),
                progress: progressModel.snapshot,
                journeyLevel: currentUnitLevel,
                persistenceError: progressModel.persistenceError,
                rewards: RewardCalculator().summary(events: progressModel.snapshot.xpEvents, at: context.date),
                goals: DailyGoalCalculator().status(
                    xpEvents: progressModel.snapshot.xpEvents,
                    attempts: progressModel.snapshot.attempts,
                    recordingDates: recordingDates,
                    listeningAvailable: !content.package.listeningPrompts.isEmpty,
                    at: context.date
                ),
                smartSessionSize: smartSessionSize(at: context.date),
                weakSkills: MasterySkill.allCases.filter { progressModel.snapshot.weakSkills.contains($0) },
                expressionOfDay: expressionOfDay(at: context.date),
                savedExpressions: savedPreview,
                progressDestination: progressDashboard(at: context.date),
                progressModel: progressModel,
                path: $homePath,
                onReviews: { showingReviews = true },
                onContinueJourney: continueJourney,
                onSmartPractice: { openPractice("smart-session") },
                onListening: { openPractice("listening") },
                onSpeaking: { openPractice("speaking") },
                onSpeak: { openPractice("guided-conversation") },
                onDiscover: { selectedTab = .discover },
                onProfile: { selectedTab = .tutor }
            )
            }
            .tabItem { Label("Acasă", systemImage: "house") }
            .tag(RootTab.home)

            JourneyPathView(
                sections: content.shell.journeySections,
                package: content.package,
                locale: content.locale,
                progressModel: progressModel,
                path: $journeyPath,
                lessonCounts: lessonCounts,
                signboards: signboards,
                onProfile: { selectedTab = .tutor },
                onLevel: { showingOrientation = true }
            )
            .tabItem { Label("Călătorie", systemImage: "map") }
            .tag(RootTab.journey)

            NavigationStack(path: $practicePath) {
                PracticeListView(
                    modes: content.shell.practiceModes,
                    package: content.package,
                    locale: content.locale,
                    progressModel: progressModel
                )
                .navigationDestination(for: String.self) { id in
                    if id == "ai-conversation" {
                        AIConversationPreviewView()
                    } else if id == "guided-conversation" {
                        GuidedConversationListView(package: content.package, locale: content.locale, progressModel: progressModel)
                    } else {
                        PracticeModeScreen(
                            modeID: id,
                            modes: content.shell.practiceModes,
                            package: content.package,
                            locale: content.locale,
                            progressModel: progressModel
                        )
                    }
                }
            }
            .tabItem { Label("Exersează", systemImage: "bubble.left.and.bubble.right") }
            .tag(RootTab.practice)

            DiscoverView(
                model: content.discover,
                package: content.package,
                locale: content.locale,
                progressModel: progressModel
            )
                .tabItem { Label("Descoperă", systemImage: "safari") }
                .tag(RootTab.discover)

            TimelineView(.periodic(from: .now, by: 30)) { context in
            ProfileView(
                reviewQueue: progressModel.snapshot.reviewQueueSummary(at: context.date, expressionIDs: reviewExpressionIDs),
                progress: progressModel.snapshot,
                level: currentUnitLevel,
                savedCount: savedEntries.count,
                recordingCount: recordingDates.count,
                persistenceError: progressModel.persistenceError,
                onReviews: { showingReviews = true },
                onOrientation: { showingOrientation = true }
            )
            }
                .tabItem { Label("Tutor", systemImage: "person.crop.circle") }
                .tag(RootTab.tutor)
        }
        .tint(Theme.brand)
        .onChange(of: selectedTab) { _, _ in refreshRecordingDates() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { refreshRecordingDates() }
        }
        .safeAreaInset(edge: .bottom) { ProgressSaveStatusView(progressModel: progressModel) }
        .fullScreenCover(isPresented: Binding(
            get: { !hasSeenWelcome },
            set: { presented in if !presented { hasSeenWelcome = true } }
        )) {
            WelcomeView(
                onBeginner: {
                    hasSeenWelcome = true
                    if let firstUnit = content.shell.journeySections.first?.units.first?.id {
                        journeyPath = [firstUnit]
                    }
                    selectedTab = .journey
                },
                onPlacement: {
                    hasSeenWelcome = true
                    Task { @MainActor in
                        try? await Task.sleep(for: .milliseconds(700))
                        showingOrientation = true
                    }
                }
            )
        }
        .sheet(isPresented: $showingReviews) {
            ReviewQueueView(package: content.package, locale: content.locale, progressModel: progressModel)
        }
        .sheet(isPresented: $showingOrientation) {
            OrientationView(
                package: content.package, locale: content.locale, progressModel: progressModel,
                onStartJourney: { unitID in
                    journeyPath = [unitID]
                    selectedTab = .journey
                },
                onChooseJourney: {
                    journeyPath = []
                    selectedTab = .journey
                },
                onOpenTutor: {
                    selectedTab = .tutor
                }
            )
        }
        .task {
            await progressModel.load()
            refreshRecordingDates()
        }
    }

    private func refreshRecordingDates() {
        recordingDates = NativeAudioController.localRecordingDates()
    }
}

private enum RootTab: Hashable {
    case home
    case journey
    case practice
    case discover
    case tutor
}

private enum DiscoverFilter: String, CaseIterable, Identifiable {
    case words = "Cuvinte"
    case expressions = "Expresii"
    case saved = "Salvate"
    case roots = "Rădăcini"

    var id: String { rawValue }
}

private struct DiscoverView: View {
    let model: DiscoverModel
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @State private var query = ""
    @State private var filter: DiscoverFilter = .words
    @FocusState private var searchFocused: Bool

    private var savedExpressionIDs: Set<String> {
        progressModel.snapshot.savedExpressionIDs
    }

    private var savedPracticeExercises: [ExerciseDefinition] {
        LearningNavigationBuilder().targetedPractice(
            expressionIDs: savedExpressionIDs,
            from: package,
            count: 20
        )
    }

    private var searchResults: [DiscoverSearchResult] {
        model.search(query)
    }

    private var roots: [RootSummary] {
        searchResults.compactMap { result -> RootSummary? in
            guard case let .root(root) = result else { return nil }
            return root
        }
    }

    /// Single words vs. multi-word expressions, by their written form.
    private var entries: [DictionaryEntrySummary] {
        let all = searchResults.compactMap { result -> DictionaryEntrySummary? in
            guard case let .entry(entry) = result else { return nil }
            return entry
        }
        switch filter {
        case .words: return all.filter(\.isSingleWord)
        case .expressions: return all.filter { !$0.isSingleWord }
        case .saved: return all.filter(isSaved)
        case .roots: return []
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 18) {
                    header
                    searchField
                    chips

                    switch filter {
                    case .roots:
                        rootsGrid
                    default:
                        entrySections
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
            .scrollDismissesKeyboard(.interactively)
            .background(Theme.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private var header: some View {
        HStack(alignment: .bottom, spacing: 0) {
            Image("illus-dict-left")
                .resizable()
                .scaledToFill()
                .frame(width: 70, height: 96)
                .clipped()
                .mask(LinearGradient(colors: [.black, .clear], startPoint: .leading, endPoint: .trailing))
                .accessibilityHidden(true)
            VStack(spacing: 4) {
                CedarShape()
                    .fill(Theme.brand)
                    .frame(width: 30, height: 28)
                    .accessibilityHidden(true)
                Text("Araba libaneză")
                    .font(Theme.serif(.title2))
                    .foregroundStyle(Theme.brand)
                Text("Dicționar și ghid de expresii")
                    .font(Theme.font(.subheadline, weight: .medium))
                    .foregroundStyle(Theme.ink)
                Text("Caută. Învață. Folosește în viața reală.")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
            }
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .accessibilityElement(children: .combine)
            .accessibilityAddTraits(.isHeader)
            Image("illus-dict-right")
                .resizable()
                .scaledToFill()
                .frame(width: 70, height: 96)
                .clipped()
                .mask(LinearGradient(colors: [.clear, .black], startPoint: .leading, endPoint: .trailing))
                .accessibilityHidden(true)
        }
        .padding(.top, 8)
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Theme.muted)
            TextField("Caută Arabizi, arabă sau română", text: $query)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($searchFocused)
                .submitLabel(.search)
                .accessibilityIdentifier("discover.search")
            if !query.isEmpty {
                Button {
                    query = ""
                } label: {
                    Image(systemName: "xmark")
                        .foregroundStyle(Theme.muted)
                }
                .accessibilityLabel("Șterge căutarea")
            }
        }
        .font(Theme.font(.body))
        .padding(.horizontal, 16)
        .padding(.vertical, 13)
        .background(Theme.surface, in: Capsule())
        .overlay(Capsule().strokeBorder(Theme.line, lineWidth: 1))
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 3)
    }

    private var chips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(DiscoverFilter.allCases) { option in
                    Button {
                        filter = option
                    } label: {
                        Text(option.rawValue)
                            .font(Theme.font(.subheadline, weight: .semibold))
                            .foregroundStyle(filter == option ? Color.white : Theme.ink)
                            .padding(.horizontal, 18)
                            .padding(.vertical, 9)
                            .background(filter == option ? Theme.deep : Theme.surface, in: Capsule())
                            .overlay(Capsule().strokeBorder(filter == option ? Color.clear : Theme.line, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(filter == option ? .isSelected : [])
                }
            }
        }
    }

    @ViewBuilder
    private var entrySections: some View {
        let list = entries
        if filter == .saved && !savedPracticeExercises.isEmpty {
            NavigationLink {
                ExerciseSessionView(
                    exercises: savedPracticeExercises,
                    expressions: package.expressions,
                    locale: locale,
                    title: "Exersează expresiile salvate",
                    progressModel: progressModel
                )
            } label: {
                Label("Exersează expresiile salvate", systemImage: "bolt.fill")
                    .font(Theme.font(.headline, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Theme.terracotta, in: Capsule())
            }
            .buttonStyle(NodeButtonStyle())
        }

        if list.isEmpty {
            emptyState
        } else {
            if !query.isEmpty, let featured = list.first {
                DictionaryEntryCard(
                    entry: featured,
                    examples: model.examples(for: featured),
                    isSaved: isSaved(featured),
                    isPlaying: false,
                    onToggleSaved: { toggleSaved(featured) },
                    onPlayAudio: nil
                ) {
                    NavigationLink {
                        detail(for: featured)
                    } label: {
                        HStack(spacing: Theme.Spacing.xs) {
                            Text("Vezi detalii")
                            Image(systemName: "arrow.right")
                        }
                        .yallaFont(.captionStrong)
                        .foregroundStyle(Theme.brand)
                        .frame(minHeight: 44)
                    }
                    .accessibilityIdentifier("dictionary.open")
                }

                let family = featured.isSingleWord ? model.rootFamily(of: featured) : []
                if !family.isEmpty {
                    DictionaryListCard(
                        title: "Din aceeași rădăcină",
                        icon: "leaf.fill",
                        entries: Array(family.prefix(4)),
                        isSaved: isSaved,
                        onToggleSaved: toggleSaved,
                        destination: detail(for:)
                    )
                }

                let similar = model.similar(to: featured).filter { candidate in !family.contains(candidate) }
                if !similar.isEmpty {
                    DictionaryListCard(
                        title: featured.isSingleWord ? "Din aceeași temă" : "Expresii similare",
                        icon: "lightbulb.max.fill",
                        entries: similar,
                        isSaved: isSaved,
                        onToggleSaved: toggleSaved,
                        destination: detail(for:)
                    )
                }
            }

            let rest = query.isEmpty ? Array(list.prefix(200)) : Array(list.dropFirst().prefix(200))
            if !rest.isEmpty {
                DictionaryListCard(
                    title: listTitle,
                    icon: query.isEmpty ? "book.closed.fill" : "list.bullet",
                    count: query.isEmpty ? list.count : list.count - 1,
                    entries: rest,
                    isSaved: isSaved,
                    onToggleSaved: toggleSaved,
                    destination: detail(for:)
                )
            }
        }
    }

    @ViewBuilder
    private var emptyState: some View {
        if filter == .saved && savedExpressionIDs.isEmpty {
            ContentUnavailableView(
                "Nicio expresie salvată",
                systemImage: "bookmark",
                description: Text("Salvează expresii din dicționar ca să le găsești aici.")
            )
        } else if filter == .saved {
            ContentUnavailableView(
                "Niciun rezultat salvat",
                systemImage: "bookmark.slash",
                description: Text("Nu există expresii salvate care să corespundă căutării curente.")
            )
        } else {
            ContentUnavailableView.search(text: query)
        }
    }

    @ViewBuilder
    private var rootsGrid: some View {
        if roots.isEmpty {
            ContentUnavailableView(
                "Nicio rădăcină",
                systemImage: "leaf",
                description: Text("Rădăcinile apar aici pe măsură ce sunt aprobate de profesor.")
            )
        } else {
            Text("Descoperă cum dintr-o singură rădăcină se nasc mai multe cuvinte în araba libaneză.")
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.muted)
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)], spacing: 14) {
                ForEach(roots) { root in
                    if let graph = model.rootGraph(rootID: root.id) {
                        NavigationLink {
                            RootExplorerView(
                                graph: graph,
                                model: model,
                                package: package,
                                locale: locale,
                                progressModel: progressModel,
                                onSearch: {
                                    filter = .words
                                    searchFocused = true
                                }
                            )
                        } label: {
                            RootCircle(root: root)
                        }
                        .buttonStyle(NodeButtonStyle())
                    }
                }
            }
        }
    }

    private func detail(for entry: DictionaryEntrySummary) -> DictionaryEntryDetailView {
        DictionaryEntryDetailView(
            entry: entry,
            model: model,
            package: package,
            locale: locale,
            progressModel: progressModel
        )
    }

    private var listTitle: String {
        if !query.isEmpty { return "Alte rezultate" }
        return filter == .expressions ? "Expresii" : "Dicționar"
    }

    /// An entry counts as saved when any of its merged expressions is saved.
    private func isSaved(_ entry: DictionaryEntrySummary) -> Bool {
        entry.expressionIDs.contains(where: savedExpressionIDs.contains)
    }

    /// Saving or removing applies to every merged copy of the entry.
    private func toggleSaved(_ entry: DictionaryEntrySummary) {
        let saved = !isSaved(entry)
        Task {
            for id in entry.expressionIDs {
                await progressModel.setExpressionSaved(id, saved: saved)
            }
        }
    }
}

struct TintedIconLabelStyle: LabelStyle {
    let tint: Color

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            configuration.icon.foregroundStyle(tint)
            configuration.title
        }
    }
}

private struct RootCircle: View {
    let root: RootSummary

    var body: some View {
        VStack(spacing: 6) {
            if let arabic = root.arabicRadicals {
                Text(arabic)
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(.white)
            }
            Text(root.displayKey)
                .font(Theme.serif(.title3))
                .foregroundStyle(.white)
            Text("\(root.memberCount) forme")
                .font(Theme.font(.caption))
                .foregroundStyle(.white.opacity(0.85))
        }
        .frame(width: 140, height: 140)
        .background(Theme.terracotta, in: Circle())
        .overlay(Circle().strokeBorder(Theme.blush, lineWidth: 6))
        .shadow(color: Theme.terracotta.opacity(0.3), radius: 10, x: 0, y: 6)
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityHint("Deschide familia rădăcinii")
    }
}

