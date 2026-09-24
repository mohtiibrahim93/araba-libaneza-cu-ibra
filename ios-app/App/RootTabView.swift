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
    @AppStorage("hasSeenWelcome") private var hasSeenWelcome = false

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
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Text("Alege cum vrei să exersezi azi.")
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.muted)
                    ForEach(modes) { mode in
                        if destination(for: mode) != nil {
                            NavigationLink(value: mode.id) {
                                PracticeModeRow(mode: mode, isNavigable: true)
                            }
                            .buttonStyle(NodeButtonStyle())
                            .accessibilityIdentifier("practice.\(mode.id)")
                        } else {
                            PracticeModeRow(mode: mode, isNavigable: false)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
            }
            .background(Theme.canvas.ignoresSafeArea())
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
        let style = Self.style(for: mode.id)
        HStack(spacing: 14) {
            Image(systemName: style.icon)
                .font(.title2.weight(.semibold))
                .foregroundStyle(isNavigable ? style.tint : Theme.muted)
                .frame(width: 52, height: 52)
                .background(isNavigable ? style.background : Theme.line.opacity(0.5), in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(mode.title)
                    .font(Theme.serif(.title3))
                    .foregroundStyle(isNavigable ? Theme.ink : Theme.muted)
                Text(mode.subtitle)
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
                Text(isNavigable ? "Disponibil" : "În curând")
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(isNavigable ? Theme.teal : Theme.terracotta)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(isNavigable ? Theme.mint : Theme.blush, in: Capsule())
                    .padding(.top, 4)
            }
            Spacer(minLength: 0)
            if isNavigable {
                Image(systemName: "chevron.right")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.muted)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
        .opacity(isNavigable ? 1 : 0.85)
    }

    private static func style(for id: String) -> (icon: String, tint: Color, background: Color) {
        switch id {
        case "smart-session": return ("sparkles", Theme.terracotta, Theme.blush)
        case "speed-drill": return ("bolt.fill", Theme.goldShade, Theme.variantBackground)
        case "listening": return ("headphones", Theme.teal, Theme.mint)
        case "speaking": return ("mic.fill", Theme.terracotta, Theme.blush)
        default: return ("bolt", Theme.teal, Theme.mint)
        }
    }
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
        case .words: return all.filter { !$0.arabizi.contains(" ") }
        case .expressions: return all.filter { $0.arabizi.contains(" ") }
        case .saved: return all.filter { savedExpressionIDs.contains($0.id) }
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
                    title: "Practică expresiile salvate",
                    progressModel: progressModel
                )
            } label: {
                Label("Practică expresiile salvate", systemImage: "bolt.fill")
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
                FeaturedEntryCard(
                    entry: featured,
                    root: featured.rootID.flatMap { id in model.roots.first { $0.id == id } },
                    isSaved: savedExpressionIDs.contains(featured.id),
                    onToggleSaved: { toggleSaved(featured.id) },
                    destination: detail(for: featured)
                )
            }

            let rest = query.isEmpty ? Array(list.prefix(200)) : Array(list.dropFirst().prefix(200))
            if !rest.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        Label(listTitle, systemImage: "lightbulb.max.fill")
                            .font(Theme.serif(.headline))
                            .foregroundStyle(Theme.ink)
                            .labelStyle(TintedIconLabelStyle(tint: Theme.gold))
                        Spacer()
                        Text("\(list.count)")
                            .font(Theme.font(.caption, weight: .semibold))
                            .foregroundStyle(Theme.muted)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)

                    ForEach(rest) { entry in
                        Divider().padding(.leading, 16)
                        EntryRow(
                            entry: entry,
                            isSaved: savedExpressionIDs.contains(entry.id),
                            onToggleSaved: { toggleSaved(entry.id) },
                            destination: detail(for: entry)
                        )
                    }
                }
                .cardBackground()
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
                                progressModel: progressModel
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
        query.isEmpty ? "Dicționar" : "Expresii similare"
    }

    private func toggleSaved(_ id: String) {
        Task { await progressModel.toggleSavedExpressionID(id) }
    }
}

private struct TintedIconLabelStyle: LabelStyle {
    let tint: Color

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            configuration.icon.foregroundStyle(tint)
            configuration.title
        }
    }
}

private struct FeaturedEntryCard: View {
    let entry: DictionaryEntrySummary
    let root: RootSummary?
    let isSaved: Bool
    let onToggleSaved: () -> Void
    let destination: DictionaryEntryDetailView

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 8) {
                        Text(entry.arabizi)
                            .font(Theme.serif(.largeTitle))
                            .foregroundStyle(Theme.ink)
                            .minimumScaleFactor(0.6)
                            .lineLimit(2)
                        if let level = entry.levels.first {
                            Text(level.rawValue.uppercased())
                                .font(Theme.font(.caption, weight: .semibold))
                                .foregroundStyle(Theme.terracotta)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Theme.blush, in: Capsule())
                        }
                    }
                    if let arabic = entry.arabicScript {
                        Text(arabic)
                            .font(.title2)
                            .foregroundStyle(Theme.ink)
                    }
                }
                Spacer()
                Button(action: onToggleSaved) {
                    Image(systemName: isSaved ? "heart.fill" : "heart")
                        .font(.title3)
                        .foregroundStyle(Theme.terracotta)
                        .frame(width: 44, height: 44)
                        .background(Theme.blush, in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(isSaved ? "Elimină din salvate" : "Salvează expresia")
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Sens")
                    .font(Theme.serif(.subheadline))
                    .foregroundStyle(Theme.terracotta)
                Text(entry.meaning)
                    .font(Theme.font(.body))
                    .foregroundStyle(Theme.ink)
                if let pragmatic = entry.pragmaticMeaning {
                    Text(pragmatic)
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.muted)
                }
            }

            if let root {
                Label("Rădăcina \(root.displayKey)", systemImage: "leaf.fill")
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.teal)
            }

            NavigationLink {
                destination
            } label: {
                HStack {
                    Text("Vezi detalii și practică")
                    Image(systemName: "arrow.right")
                }
                .font(Theme.font(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.teal)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
    }
}

private struct EntryRow: View {
    let entry: DictionaryEntrySummary
    let isSaved: Bool
    let onToggleSaved: () -> Void
    let destination: DictionaryEntryDetailView

    var body: some View {
        HStack(spacing: 12) {
            NavigationLink {
                destination
            } label: {
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 8) {
                        Text(entry.arabizi)
                            .font(Theme.font(.headline, weight: .semibold))
                            .foregroundStyle(Theme.ink)
                        if let arabic = entry.arabicScript {
                            Text(arabic)
                                .foregroundStyle(Theme.muted)
                        }
                    }
                    Text(entry.meaning)
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.muted)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            Button(action: onToggleSaved) {
                Image(systemName: isSaved ? "bookmark.fill" : "bookmark")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(isSaved ? Theme.terracotta : Theme.muted)
                    .frame(width: 40, height: 40)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isSaved ? "Elimină din salvate" : "Salvează")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
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
                Section {
                    ProfileHeader(
                        rewards: RewardCalculator().summary(events: progress.xpEvents, at: Date()),
                        lessons: progress.completedLessonIDs.count,
                        saved: progress.savedExpressionIDs.count
                    )
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                }

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

private struct ProfileHeader: View {
    let rewards: RewardSummary
    let lessons: Int
    let saved: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 14) {
                CedarShape()
                    .fill(.white)
                    .frame(width: 34, height: 32)
                    .frame(width: 64, height: 64)
                    .background(Theme.deep, in: Circle())
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Drumul meu")
                        .font(Theme.serif(.title2))
                        .foregroundStyle(Theme.ink)
                    Label("\(RewardText.days(rewards.streakDays)) la rând", systemImage: "flame.fill")
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .foregroundStyle(rewards.isActiveToday ? Theme.streak : Theme.muted)
                }
            }
            HStack(spacing: 10) {
                ProfileStat(value: "\(rewards.totalXP)", label: "puncte", icon: "star.fill", tint: Theme.terracotta)
                ProfileStat(value: "\(lessons)", label: "lecții", icon: "book.fill", tint: Theme.teal)
                ProfileStat(value: "\(saved)", label: "salvate", icon: "bookmark.fill", tint: Theme.goldShade)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
        .padding(.vertical, 6)
        .accessibilityElement(children: .combine)
    }
}

private struct ProfileStat: View {
    let value: String
    let label: String
    let icon: String
    let tint: Color

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(tint)
                .frame(width: 32, height: 32)
                .background(tint.opacity(0.14), in: Circle())
            VStack(alignment: .leading, spacing: 0) {
                Text(value)
                    .font(Theme.serif(.headline))
                    .foregroundStyle(Theme.ink)
                Text(label)
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
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
