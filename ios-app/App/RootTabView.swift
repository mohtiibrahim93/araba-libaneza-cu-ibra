import Foundation
import SwiftUI
import YallaCore

struct RootTabView: View {
    let content: AppContentSnapshot
    private let reviewExpressionIDs: Set<String>
    private let lessonCounts: [String: Int]
    @StateObject private var progressModel: LearnerProgressModel
    @State private var selectedTab: RootTab = .home
    @State private var journeyPath: [String] = []
    @State private var practicePath: [String] = []
    @State private var showingReviews = false
    @State private var showingOrientation = false

    init(
        content: AppContentSnapshot,
        progressRepository: LearnerProgressRepository,
        progressOutbox: any ProgressSaveOutbox
    ) {
        self.content = content
        self.reviewExpressionIDs = Set(content.package.expressions.map(\.id))
        self.lessonCounts = JourneyLessonPlanner().lessonCounts(in: content.package, locale: content.locale)
        _progressModel = StateObject(
            wrappedValue: LearnerProgressModel(
                repository: progressRepository,
                outbox: progressOutbox
            )
        )
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
                return HomeExpression(id: expression.id, arabizi: expression.canonicalArabizi, meaning: meaning)
            }
        }
        return nil
    }

    private var savedPreview: [HomeExpression] {
        let saved = progressModel.snapshot.savedExpressionIDs
        guard !saved.isEmpty else { return [] }
        return content.package.expressions
            .filter { saved.contains($0.id) }
            .prefix(3)
            .compactMap { expression in
                guard let meaning = expression.localizations[content.locale]?.naturalMeaning else { return nil }
                return HomeExpression(id: expression.id, arabizi: expression.canonicalArabizi, meaning: meaning)
            }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            TimelineView(.periodic(from: .now, by: 30)) { context in
            HomeView(
                reviewQueue: progressModel.snapshot.reviewQueueSummary(at: context.date, expressionIDs: reviewExpressionIDs),
                progress: progressModel.snapshot,
                currentUnitTitle: currentUnitTitle,
                persistenceError: progressModel.persistenceError,
                rewards: RewardCalculator().summary(events: progressModel.snapshot.xpEvents, at: context.date),
                expressionOfDay: expressionOfDay(at: context.date),
                savedExpressions: savedPreview,
                onReviews: { showingReviews = true },
                onOrientation: { showingOrientation = true },
                onContinueJourney: {
                    if let unitID = progressModel.snapshot.currentJourneyUnitID {
                        journeyPath = [unitID]
                    }
                    selectedTab = .journey
                },
                onSmartPractice: {
                    practicePath = ["smart-session"]
                    selectedTab = .practice
                },
                onSpeedDrill: {
                    practicePath = ["speed-drill"]
                    selectedTab = .practice
                },
                onDiscover: { selectedTab = .discover }
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
                lessonCounts: lessonCounts
            )
            .tabItem { Label("Parcurs", systemImage: "map") }
            .tag(RootTab.journey)

            PracticeView(
                modes: content.shell.practiceModes,
                package: content.package,
                locale: content.locale,
                progressModel: progressModel,
                path: $practicePath
            )
            .tabItem { Label("Practică", systemImage: "bolt") }
            .tag(RootTab.practice)

            DiscoverView(
                model: content.discover,
                package: content.package,
                locale: content.locale,
                progressModel: progressModel
            )
                .tabItem { Label("Descoperă", systemImage: "sparkles") }
                .tag(RootTab.discover)

            TimelineView(.periodic(from: .now, by: 30)) { context in
            ProfileView(
                reviewQueue: progressModel.snapshot.reviewQueueSummary(at: context.date, expressionIDs: reviewExpressionIDs),
                progress: progressModel.snapshot,
                persistenceError: progressModel.persistenceError,
                onReviews: { showingReviews = true },
                onOrientation: { showingOrientation = true }
            )
            }
                .tabItem { Label("Eu", systemImage: "person") }
                .tag(RootTab.profile)
        }
        .tint(Theme.terracotta)
        .safeAreaInset(edge: .bottom) { ProgressSaveStatusView(progressModel: progressModel) }
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
                    selectedTab = .profile
                }
            )
        }
        .task {
            await progressModel.load()
        }
    }
}

private enum RootTab: Hashable {
    case home
    case journey
    case practice
    case discover
    case profile
}

struct HomeExpression: Identifiable, Equatable {
    let id: String
    let arabizi: String
    let meaning: String
}

private struct HomeView: View {
    let reviewQueue: ReviewQueueSummary
    let progress: LearnerProgressSnapshot
    let currentUnitTitle: String?
    let persistenceError: String?
    let rewards: RewardSummary
    let expressionOfDay: HomeExpression?
    let savedExpressions: [HomeExpression]
    let onReviews: () -> Void
    let onOrientation: () -> Void
    let onContinueJourney: () -> Void
    let onSmartPractice: () -> Void
    let onSpeedDrill: () -> Void
    let onDiscover: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    BrandHeader()

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Mar7aba!")
                            .font(Theme.serif(.largeTitle))
                            .foregroundStyle(Theme.ink)
                        Text("Astăzi e o zi bună pentru încă o conversație.")
                            .font(Theme.font(.subheadline))
                            .foregroundStyle(Theme.muted)
                        Capsule()
                            .fill(Theme.terracotta)
                            .frame(width: 56, height: 3)
                            .padding(.top, 4)
                            .accessibilityHidden(true)
                    }

                    if persistenceError != nil {
                        Label(
                            "Progresul local nu a putut fi încărcat. Datele existente nu au fost șterse.",
                            systemImage: "exclamationmark.triangle.fill"
                        )
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .foregroundStyle(Theme.danger)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardBackground(Theme.dangerBackground)
                    }

                    statsStrip
                    heroCard

                    Text("Practică azi")
                        .font(Theme.serif(.title3))
                        .foregroundStyle(Theme.ink)
                        .accessibilityAddTraits(.isHeader)

                    LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                        HomeTile(
                            title: "Recapitulări",
                            subtitle: reviewQueue.dueNowCount == 1 ? "1 expresie de repetat" : "\(reviewQueue.dueNowCount) de repetat",
                            icon: "clock.arrow.circlepath",
                            tint: Theme.teal, background: Theme.mint,
                            action: onReviews
                        )
                        HomeTile(
                            title: "Practică inteligentă",
                            subtitle: "\(progress.activeMistakeExpressionIDs.count) greșeli active",
                            icon: "sparkles",
                            tint: Theme.terracotta, background: Theme.blush,
                            action: onSmartPractice
                        )
                        HomeTile(
                            title: "Yalla! Două minute",
                            subtitle: "Reamintire rapidă",
                            icon: "bolt.fill",
                            tint: Theme.goldShade, background: Theme.variantBackground,
                            action: onSpeedDrill
                        )
                        HomeTile(
                            title: "De unde încep?",
                            subtitle: "Orientare · 24 de întrebări",
                            icon: "signpost.right.fill",
                            tint: Theme.deep, background: Theme.mint,
                            action: onOrientation
                        )
                    }

                    if let expressionOfDay {
                        expressionOfDayCard(expressionOfDay)
                    }

                    if !savedExpressions.isEmpty {
                        savedCard
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
            }
            .background(Theme.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private var statsStrip: some View {
        HStack(spacing: 0) {
            HomeStat(value: "\(rewards.streakDays)", label: "zile la rând", icon: "flame.fill",
                     tint: rewards.isActiveToday ? Theme.streak : Theme.muted)
            Divider().frame(height: 34)
            HomeStat(value: "\(rewards.totalXP)", label: "puncte", icon: "star.fill", tint: Theme.terracotta)
            Divider().frame(height: 34)
            HomeStat(value: "\(progress.completedLessonIDs.count)", label: "lecții", icon: "book.fill", tint: Theme.teal)
            Divider().frame(height: 34)
            HomeStat(value: "\(reviewQueue.dueNowCount)", label: "de repetat", icon: "arrow.triangle.2.circlepath", tint: Theme.goldShade)
        }
        .padding(.vertical, 14)
        .padding(.horizontal, 6)
        .cardBackground()
        .accessibilityIdentifier("home.stats")
    }

    private var heroSubtitle: String {
        currentUnitTitle == nil
            ? "Începe cu prima lecție din Parcurs."
            : "Continuă de unde ai rămas, câte o lecție scurtă."
    }

    private var heroButtonTitle: String {
        currentUnitTitle == nil ? "Începe acum" : "Continuă acum"
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Parcursul tău", systemImage: "sparkle")
                .font(Theme.font(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.lime)
            Text(currentUnitTitle ?? "Primele conversații")
                .font(Theme.serif(.title))
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)
            Text(heroSubtitle)
                .font(Theme.font(.subheadline))
                .foregroundStyle(.white.opacity(0.85))
            Button(action: onContinueJourney) {
                Label(heroButtonTitle, systemImage: "play.fill")
                    .font(Theme.font(.headline, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 22)
                    .padding(.vertical, 13)
                    .background(Theme.terracotta, in: Capsule())
            }
            .buttonStyle(NodeButtonStyle())
            .padding(.top, 4)
            .accessibilityIdentifier("home.continue")
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(alignment: .bottomTrailing) {
            CedarShape()
                .fill(.white.opacity(0.08))
                .frame(width: 150, height: 140)
                .offset(x: 20, y: 18)
                .accessibilityHidden(true)
        }
        .background(Theme.deep)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(color: Theme.deep.opacity(0.25), radius: 14, x: 0, y: 8)
    }

    private func expressionOfDayCard(_ expression: HomeExpression) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Expresia zilei", systemImage: "quote.opening")
                .font(Theme.font(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.terracotta)
            Text(expression.arabizi)
                .font(Theme.serif(.title2))
                .foregroundStyle(Theme.ink)
            Text(expression.meaning)
                .font(Theme.font(.body))
                .foregroundStyle(Theme.muted)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }

    private var savedCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Fraze salvate", systemImage: "bookmark.fill")
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.deep)
                Spacer()
                Button("Vezi toate", action: onDiscover)
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.teal)
            }
            ForEach(savedExpressions) { expression in
                VStack(alignment: .leading, spacing: 2) {
                    Text(expression.arabizi)
                        .font(Theme.font(.headline, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                    Text(expression.meaning)
                        .font(Theme.font(.caption))
                        .foregroundStyle(Theme.muted)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Theme.canvas, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .accessibilityElement(children: .combine)
            }
        }
        .padding(18)
        .cardBackground()
    }
}

private struct HomeStat: View {
    let value: String
    let label: String
    let icon: String
    let tint: Color

    var body: some View {
        VStack(spacing: 4) {
            HStack(spacing: 5) {
                Image(systemName: icon)
                    .foregroundStyle(tint)
                Text(value)
                    .font(Theme.serif(.title3))
                    .foregroundStyle(Theme.ink)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
            }
            Text(label)
                .font(Theme.font(.caption2))
                .foregroundStyle(Theme.muted)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
    }
}

private struct HomeTile: View {
    let title: String
    let subtitle: String
    let icon: String
    let tint: Color
    let background: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: icon)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(tint)
                    .frame(width: 44, height: 44)
                    .background(background, in: Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(Theme.font(.headline, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(subtitle)
                        .font(Theme.font(.caption))
                        .foregroundStyle(Theme.muted)
                        .multilineTextAlignment(.leading)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, minHeight: 138, alignment: .topLeading)
            .cardBackground()
        }
        .buttonStyle(NodeButtonStyle())
    }
}

private struct PracticeView: View {
    let modes: [PracticeModeSummary]
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @Binding var path: [String]

    private let navigationBuilder = LearningNavigationBuilder()

    var body: some View {
        NavigationStack(path: $path) {
            List(modes) { mode in
                if destination(for: mode) != nil {
                    NavigationLink(value: mode.id) {
                        PracticeModeRow(mode: mode, isNavigable: true)
                    }
                } else {
                    PracticeModeRow(mode: mode, isNavigable: false)
                }
            }
            .creamList()
            .navigationTitle("Practică")
            .navigationDestination(for: String.self) { modeID in
                if let mode = modes.first(where: { $0.id == modeID }),
                   let destination = destination(for: mode) {
                    PracticeDestinationView(
                        destination: destination,
                        expressions: package.expressions,
                        locale: locale,
                        title: mode.title,
                        progressModel: progressModel
                    )
                } else {
                    ContentUnavailableView("Mod indisponibil", systemImage: "exclamationmark.triangle")
                }
            }
        }
    }

    private func destination(for mode: PracticeModeSummary) -> PracticeDestination? {
        guard mode.isAvailable else { return nil }
        do {
            return try navigationBuilder.practiceDestination(
                id: mode.id,
                from: package,
                locale: locale,
                learnerContext: progressModel.snapshot.sessionCandidateContext(at: Date())
            )
        } catch {
            return nil
        }
    }
}

private struct PracticeModeRow: View {
    let mode: PracticeModeSummary
    let isNavigable: Bool

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: symbol(for: mode.id))
                .font(.title2)
                .frame(width: 34)
            VStack(alignment: .leading, spacing: 4) {
                Text(mode.title)
                    .font(.headline)
                Text(mode.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(isNavigable ? "Disponibil" : "În curând")
                .font(.caption.weight(.semibold))
                .foregroundStyle(isNavigable ? .primary : .secondary)
        }
        .padding(.vertical, 5)
    }

    private func symbol(for id: String) -> String {
        switch id {
        case "smart-session": return "brain.head.profile"
        case "speed-drill": return "timer"
        case "listening": return "ear"
        case "speaking": return "waveform.and.mic"
        default: return "bolt"
        }
    }
}

private struct DiscoverView: View {
    let model: DiscoverModel
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @State private var query = ""
    @State private var showSavedOnly = false

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

    private var filteredRoots: [RootSummary] {
        let roots = searchResults.compactMap { result -> RootSummary? in
            guard case let .root(root) = result else { return nil }
            return root
        }

        guard showSavedOnly else { return roots }

        return roots.filter { root in
            guard let graph = model.rootGraph(rootID: root.id) else { return false }
            return graph.members.contains { savedExpressionIDs.contains($0.id) }
        }
    }

    private var filteredEntries: [DictionaryEntrySummary] {
        let entries = searchResults.compactMap { result -> DictionaryEntrySummary? in
            guard case let .entry(entry) = result else { return nil }
            return entry
        }

        guard showSavedOnly else { return entries }
        return entries.filter { savedExpressionIDs.contains($0.id) }
    }

    var body: some View {
        NavigationStack {
            List {
                if !savedExpressionIDs.isEmpty {
                    Section("Salvate") {
                        HStack {
                            Label(
                                "\(savedExpressionIDs.count) expresii salvate",
                                systemImage: "bookmark.fill"
                            )
                            Spacer()
                            if showSavedOnly {
                                Text("filtru activ")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        if !savedPracticeExercises.isEmpty {
                            NavigationLink {
                                ExerciseSessionView(
                                    exercises: savedPracticeExercises,
                                    expressions: package.expressions,
                                    locale: locale,
                                    title: "Practică expresiile salvate",
                                    progressModel: progressModel
                                )
                            } label: {
                                Label(
                                    "Practică expresiile salvate",
                                    systemImage: "bolt.fill"
                                )
                            }
                        } else {
                            Text("Expresiile salvate nu au încă exerciții native aprobate asociate.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                if !filteredRoots.isEmpty {
                    Section("Rădăcini") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(filteredRoots) { root in
                                    if let graph = model.rootGraph(rootID: root.id) {
                                        NavigationLink {
                                            RootExplorerView(
                                                graph: graph,
                                                model: model,
                                                package: package,
                                                locale: locale,
                                                progressModel: progressModel
                                            )
                                        } label: {
                                            VStack(spacing: 4) {
                                                Text(root.displayKey)
                                                    .font(.headline)
                                                if let arabic = root.arabicRadicals {
                                                    Text(arabic)
                                                        .font(.subheadline)
                                                }
                                                Text("\(root.memberCount) forme")
                                                    .font(.caption2)
                                                    .foregroundStyle(.secondary)
                                            }
                                            .padding(.horizontal, 16)
                                            .padding(.vertical, 10)
                                            .background(.thinMaterial, in: Capsule())
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }

                if !filteredEntries.isEmpty {
                    Section("Dicționar") {
                        ForEach(filteredEntries) { entry in
                            NavigationLink {
                                DictionaryEntryDetailView(
                                    entry: entry,
                                    model: model,
                                    package: package,
                                    locale: locale,
                                    progressModel: progressModel
                                )
                            } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(entry.arabizi)
                                            .font(.headline)
                                        if let arabic = entry.arabicScript {
                                            Text(arabic)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        if progressModel.snapshot.savedExpressionIDs.contains(entry.id) {
                                            Image(systemName: "bookmark.fill")
                                                .foregroundStyle(.secondary)
                                                .accessibilityLabel("Salvat")
                                        }
                                        if let rootID = entry.rootID,
                                           let root = model.roots.first(where: { $0.id == rootID }) {
                                            Text(root.displayKey)
                                                .font(.caption.bold())
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 4)
                                                .background(.thinMaterial, in: Capsule())
                                        }
                                    }
                                    Text(entry.meaning)
                                        .foregroundStyle(.secondary)
                                    if !entry.topics.isEmpty {
                                        Text(entry.topics.joined(separator: " · "))
                                            .font(.caption)
                                            .foregroundStyle(.tertiary)
                                    }
                                }
                                .padding(.vertical, 3)
                            }
                        }
                    }
                }

                if filteredRoots.isEmpty && filteredEntries.isEmpty {
                    if showSavedOnly && savedExpressionIDs.isEmpty {
                        ContentUnavailableView(
                            "Nicio expresie salvată",
                            systemImage: "bookmark",
                            description: Text("Salvează expresii din dicționar ca să le găsești aici.")
                        )
                    } else if showSavedOnly {
                        ContentUnavailableView(
                            "Niciun rezultat salvat",
                            systemImage: "bookmark.slash",
                            description: Text("Nu există expresii salvate care să corespundă căutării curente.")
                        )
                    } else {
                        ContentUnavailableView.search(text: query)
                    }
                }
            }
            .searchable(text: $query, prompt: "Caută Arabizi, arabă sau română")
            .creamList()
            .navigationTitle("Descoperă")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showSavedOnly.toggle()
                    } label: {
                        Image(systemName: showSavedOnly ? "bookmark.fill" : "bookmark")
                    }
                    .accessibilityLabel(
                        showSavedOnly ? "Arată toate expresiile" : "Arată doar expresiile salvate"
                    )
                }
            }
        }
    }
}

private struct ProfileView: View {
    let reviewQueue: ReviewQueueSummary
    let progress: LearnerProgressSnapshot
    let persistenceError: String?
    let onReviews: () -> Void
    let onOrientation: () -> Void

    private var fluency: SpeedDrillProgressSummary {
        progress.speedDrillProgress
    }

    var body: some View {
        NavigationStack {
            List {
                if let persistenceError {
                    Section("Stocare locală") {
                        Label(
                            "Încărcarea sau salvarea progresului nu a reușit. Folosește butonul de reîncercare; datele locale nu au fost resetate.",
                            systemImage: "exclamationmark.triangle.fill"
                        )
                        Text(persistenceError)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Section {
                    Button(action: onOrientation) {
                        Label("Orientare", systemImage: "signpost.right")
                    }
                }

                Section("Tutor") {
                    NavigationLink {
                        TutorContactView()
                    } label: {
                        Label("Ibrahim Gabriel", systemImage: "person.crop.circle.badge.checkmark")
                    }
                }

                Section {
                    NavigationLink {
                        RecordingLibraryView()
                    } label: {
                        Label("Înregistrările mele", systemImage: "waveform")
                    }
                }

                Section("Progres local") {
                    LabeledContent("Încercări", value: "\(progress.attempts.count)")
                    LabeledContent("Expresii văzute", value: "\(progress.seenExpressionIDs.count)")
                    LabeledContent("De revăzut", value: "\(progress.activeMistakeExpressionIDs.count)")
                    LabeledContent("Puncte slabe", value: "\(progress.weakSkills.count)")
                    LabeledContent("Expresii salvate", value: "\(progress.savedExpressionIDs.count)")
                }

                Section {
                    Button(action: onReviews) {
                        Label("Vezi recapitulările", systemImage: "clock.arrow.circlepath")
                    }
                }

                if reviewQueue.dueNowCount > 0 || reviewQueue.upcomingCount > 0 {
                    Section("Recapitulări programate") {
                        LabeledContent(
                            "De făcut acum",
                            value: "\(reviewQueue.dueNowCount)"
                        )
                        LabeledContent(
                            "Programate mai târziu",
                            value: "\(reviewQueue.upcomingCount)"
                        )
                        if let nextUpcomingAt = reviewQueue.nextUpcomingAt {
                            LabeledContent(
                                "Următoarea",
                                value: nextUpcomingAt.formatted(
                                    date: .abbreviated,
                                    time: .shortened
                                )
                            )
                        }
                    }
                }

                if fluency.sessionCount > 0 {
                    Section("Fluență · Yalla! Două minute") {
                        LabeledContent("Sesiuni", value: "\(fluency.sessionCount)")
                        LabeledContent(
                            "Cel mai bun ritm",
                            value: "\(fluency.bestCorrectPerMinute.formatted(.number.precision(.fractionLength(1)))) corecte/min"
                        )
                        LabeledContent(
                            "Acuratețe medie",
                            value: "\((fluency.averageAccuracy * 100).formatted(.number.precision(.fractionLength(0))))%"
                        )
                        if let latestRate = fluency.latestCorrectPerMinute {
                            LabeledContent(
                                "Ultimul ritm",
                                value: "\(latestRate.formatted(.number.precision(.fractionLength(1)))) corecte/min"
                            )
                        }
                        if let latestAccuracy = fluency.latestAccuracy {
                            LabeledContent(
                                "Ultima acuratețe",
                                value: "\((latestAccuracy * 100).formatted(.number.precision(.fractionLength(0))))%"
                            )
                        }
                    }
                }

                Section {
                    Text("Progresul este păstrat local pe dispozitiv și funcționează fără cont.")
                        .foregroundStyle(.secondary)
                }
            }
            .creamList()
            .navigationTitle("Eu")
        }
    }
}

private struct TutorContactView: View {
    private let phoneDisplay = "+40 763 124 514"
    private let phoneURL = URL(string: "tel:+40763124514")!
    private let whatsappURL = URL(string: "https://wa.me/40763124514")!

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Ibrahim Gabriel")
                        .font(.title2.bold())
                    Text("Profesor de arabă libaneză")
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            Section("Contact") {
                LabeledContent("Telefon", value: phoneDisplay)
                Link(destination: phoneURL) {
                    Label("Sună", systemImage: "phone")
                }
                Link(destination: whatsappURL) {
                    Label("WhatsApp", systemImage: "message")
                }
            }

            Section("Disponibilitate") {
                Text("Program flexibil, pe bază de programare.")
                Text("Pentru o încadrare peste materialul B1 disponibil în aplicație, o conversație scurtă poate verifica și vorbirea și ascultarea.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .creamList()
        .navigationTitle("Tutor")
    }
}
