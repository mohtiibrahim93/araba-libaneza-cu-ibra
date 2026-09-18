import SwiftUI
import YallaCore

struct RootTabView: View {
    let content: AppContentSnapshot
    @StateObject private var progressModel: LearnerProgressModel
    @State private var selectedTab: RootTab = .home
    @State private var journeyPath: [String] = []
    @State private var practicePath: [String] = []

    init(
        content: AppContentSnapshot,
        progressRepository: LearnerProgressRepository
    ) {
        self.content = content
        _progressModel = StateObject(
            wrappedValue: LearnerProgressModel(repository: progressRepository)
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
            HomeView(
                summary: content.shell.home,
                progress: progressModel.snapshot,
                currentUnitTitle: currentUnitTitle,
                persistenceError: progressModel.persistenceError,
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

            DiscoverView(model: content.discover)
                .tabItem { Label("Descoperă", systemImage: "sparkles") }
                .tag(RootTab.discover)

            ProfileView(
                progress: progressModel.snapshot,
                persistenceError: progressModel.persistenceError
            )
                .tabItem { Label("Eu", systemImage: "person") }
                .tag(RootTab.profile)
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
    let summary: HomeSummary
    let progress: LearnerProgressSnapshot
    let currentUnitTitle: String?
    let persistenceError: String?
    let onContinueJourney: () -> Void
    let onSmartPractice: () -> Void
    let onSpeedDrill: () -> Void

    private var dueCount: Int {
        progress.dueExpressionIDs(at: Date()).count
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

                    HStack(spacing: 12) {
                        MetricCard(value: dueCount, label: "recapitulări")
                        MetricCard(value: progress.activeMistakeExpressionIDs.count, label: "greșeli")
                        MetricCard(value: progress.weakSkills.count, label: "puncte slabe")
                    }

                    VStack(alignment: .leading, spacing: 12) {
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
                                    JourneyUnitRow(unit: unit)
                                }
                            } else {
                                JourneyUnitRow(unit: unit)
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

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(unit.title)
                .font(.headline)
            Text(unit.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text("\(unit.expressionCount) expresii")
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
    @State private var query = ""

    private var searchResults: [DiscoverSearchResult] {
        model.search(query)
    }

    private var filteredRoots: [RootSummary] {
        searchResults.compactMap { result in
            guard case let .root(root) = result else { return nil }
            return root
        }
    }

    private var filteredEntries: [DictionaryEntrySummary] {
        searchResults.compactMap { result in
            guard case let .entry(entry) = result else { return nil }
            return entry
        }
    }

    var body: some View {
        NavigationStack {
            List {
                if !filteredRoots.isEmpty {
                    Section("Rădăcini") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(filteredRoots) { root in
                                    if let graph = model.rootGraph(rootID: root.id) {
                                        NavigationLink {
                                            RootExplorerView(graph: graph, model: model)
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
                                DictionaryEntryDetailView(entry: entry, model: model)
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
                    ContentUnavailableView.search(text: query)
                }
            }
            .searchable(text: $query, prompt: "Caută Arabizi, arabă sau română")
            .navigationTitle("Descoperă")
        }
    }
}

private struct ProfileView: View {
    let progress: LearnerProgressSnapshot
    let persistenceError: String?

    var body: some View {
        NavigationStack {
            List {
                if let persistenceError {
                    Section("Stocare locală") {
                        Label(
                            "Progresul nu a putut fi citit. Datele locale nu au fost resetate automat.",
                            systemImage: "exclamationmark.triangle.fill"
                        )
                        Text(persistenceError)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Progres local") {
                    LabeledContent("Încercări", value: "\(progress.attempts.count)")
                    LabeledContent("Expresii văzute", value: "\(progress.seenExpressionIDs.count)")
                    LabeledContent("De revăzut", value: "\(progress.activeMistakeExpressionIDs.count)")
                    LabeledContent("Puncte slabe", value: "\(progress.weakSkills.count)")
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
