import Foundation
import SwiftUI
import YallaCore

struct RootTabView: View {
    let content: AppContentSnapshot
    private let reviewExpressionIDs: Set<String>
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

    var body: some View {
        TabView(selection: $selectedTab) {
            TimelineView(.periodic(from: .now, by: 30)) { context in
            HomeView(
                reviewQueue: progressModel.snapshot.reviewQueueSummary(at: context.date, expressionIDs: reviewExpressionIDs),
                summary: content.shell.home,
                progress: progressModel.snapshot,
                currentUnitTitle: currentUnitTitle,
                persistenceError: progressModel.persistenceError,
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
                }
            )
            }
            .tabItem { Label("Acasă", systemImage: "house") }
            .tag(RootTab.home)

            JourneyView(
                sections: content.shell.journeySections,
                package: content.package,
                locale: content.locale,
                progressModel: progressModel,
                path: $journeyPath
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
        .tint(Theme.teal)
        .fontDesign(.rounded)
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

private struct HomeView: View {
    let reviewQueue: ReviewQueueSummary
    let summary: HomeSummary
    let progress: LearnerProgressSnapshot
    let currentUnitTitle: String?
    let persistenceError: String?
    let onReviews: () -> Void
    let onOrientation: () -> Void
    let onContinueJourney: () -> Void
    let onSmartPractice: () -> Void
    let onSpeedDrill: () -> Void

    private var dueCount: Int {
        reviewQueue.dueNowCount
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Continuă în libaneză")
                            .font(.largeTitle.bold())
                        Text("Alege următorul pas: lecție, recapitulare sau practică rapidă.")
                            .foregroundStyle(.secondary)
                    }

                    if persistenceError != nil {
                        Label(
                            "Progresul local nu a putut fi încărcat. Datele existente nu au fost șterse.",
                            systemImage: "exclamationmark.triangle.fill"
                        )
                        .font(.subheadline.weight(.semibold))
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
                    }

                    AdaptiveRow(spacing: 12) {
                        Button(action: onReviews) {
                            MetricCard(value: dueCount, label: "recapitulări")
                        }
                        .buttonStyle(.plain)
                        .accessibilityHint("Vezi expresiile de repetat")
                        MetricCard(value: progress.activeMistakeExpressionIDs.count, label: "greșeli")
                        MetricCard(value: progress.weakSkills.count, label: "puncte slabe")
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        HomeActionRow(
                            title: "De unde încep?",
                            subtitle: "Orientare opțională · 24 de întrebări",
                            icon: "signpost.right",
                            action: onOrientation
                        )
                        Text("Pentru azi")
                            .font(.title2.bold())
                        HomeActionRow(
                            title: "Continuă parcursul",
                            subtitle: currentUnitTitle.map { "Continuă: \($0)" } ?? "Alege prima unitate din Parcurs",
                            icon: "arrow.right.circle.fill",
                            action: onContinueJourney
                        )
                        HomeActionRow(
                            title: "Practică inteligentă",
                            subtitle: "\(dueCount) recapitulări · \(progress.activeMistakeExpressionIDs.count) greșeli active",
                            icon: "brain.head.profile",
                            action: onSmartPractice
                        )
                        HomeActionRow(
                            title: "Yalla! Două minute",
                            subtitle: "Exersează viteza de reamintire",
                            icon: "timer",
                            action: onSpeedDrill
                        )
                    }
                }
                .padding()
            }
            .navigationTitle("Acasă")
        }
    }
}

private struct JourneyView: View {
    let sections: [JourneySectionSummary]
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @Binding var path: [String]

    private let navigationBuilder = LearningNavigationBuilder()

    var body: some View {
        NavigationStack(path: $path) {
            List {
                ForEach(sections) { section in
                    Section(section.level.rawValue.uppercased()) {
                        ForEach(section.units) { unit in
                            if detail(for: unit.id) != nil {
                                NavigationLink(value: unit.id) {
                                    JourneyUnitRow(
                                        unit: unit,
                                        progress: progress(for: unit.id),
                                        isCurrent: progressModel.snapshot.currentJourneyUnitID == unit.id
                                    )
                                }
                            } else {
                                JourneyUnitRow(
                                    unit: unit,
                                    progress: progress(for: unit.id),
                                    isCurrent: progressModel.snapshot.currentJourneyUnitID == unit.id
                                )
                            }
                        }
                    }
                }
            }
            .navigationTitle("Parcurs")
            .navigationDestination(for: String.self) { unitID in
                if let detail = detail(for: unitID) {
                    JourneyUnitDetailView(
                        detail: detail,
                        expressions: package.expressions,
                        locale: locale,
                        progressModel: progressModel
                    )
                } else {
                    ContentUnavailableView("Unitate indisponibilă", systemImage: "exclamationmark.triangle")
                }
            }
        }
    }

    private func progress(for unitID: String) -> ExpressionGroupProgress {
        guard let unit = package.units.first(where: { $0.id == unitID }) else {
            return ExpressionGroupProgress()
        }

        return progressModel.snapshot.expressionGroupProgress(
            expressionIDs: Set(unit.expressionIDs),
            at: Date()
        )
    }

    private func detail(for unitID: String) -> JourneyUnitDetail? {
        do {
            return try navigationBuilder.journeyUnit(
                id: unitID,
                from: package,
                locale: locale
            )
        } catch {
            return nil
        }
    }
}

private struct JourneyUnitRow: View {
    let unit: JourneyUnitSummary
    let progress: ExpressionGroupProgress
    let isCurrent: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text(unit.title)
                    .font(.headline)
                Spacer()
                if isCurrent {
                    Text("curentă")
                        .font(.caption2.weight(.semibold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(.thinMaterial, in: Capsule())
                }
            }

            Text(unit.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack(spacing: 5) {
                Text("\(progress.practicedCount)/\(progress.totalCount) exersate")

                if progress.dueCount > 0 {
                    Text("·")
                    Text("\(progress.dueCount) de repetat")
                }

                if progress.mistakeCount > 0 {
                    Text("·")
                    Text("\(progress.mistakeCount) greșeli")
                }
            }
            .font(.caption)
            .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
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
        .navigationTitle("Tutor")
    }
}

private struct MetricCard: View {
    let value: Int
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(value)")
                .font(.title2.bold())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
        .accessibilityElement(children: .combine)
    }
}

private struct HomeActionRow: View {
    let title: String
    let subtitle: String
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.title2)
                .frame(width: 34)
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.tertiary)
            }
            .padding()
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
        }
        .buttonStyle(.plain)
    }
}

