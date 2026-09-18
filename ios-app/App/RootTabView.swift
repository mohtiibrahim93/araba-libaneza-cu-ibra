import SwiftUI
import YallaCore

struct RootTabView: View {
    let content: AppContentSnapshot

    var body: some View {
        TabView {
            HomeView(summary: content.shell.home)
                .tabItem { Label("Acasă", systemImage: "house") }

            JourneyView(
                sections: content.shell.journeySections,
                package: content.package,
                locale: content.locale
            )
            .tabItem { Label("Parcurs", systemImage: "map") }

            PracticeView(
                modes: content.shell.practiceModes,
                package: content.package,
                locale: content.locale
            )
            .tabItem { Label("Practică", systemImage: "bolt") }

            DiscoverView(model: content.discover)
                .tabItem { Label("Descoperă", systemImage: "sparkles") }

            ProfileView()
                .tabItem { Label("Eu", systemImage: "person") }
        }
    }
}

private struct HomeView: View {
    let summary: HomeSummary

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

                    HStack(spacing: 12) {
                        MetricCard(value: summary.journeyUnitCount, label: "unități")
                        MetricCard(value: summary.expressionCount, label: "expresii")
                        MetricCard(value: summary.exerciseCount, label: "exerciții")
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Pentru azi")
                            .font(.title2.bold())
                        HomeActionRow(title: "Continuă parcursul", subtitle: "Revino la următoarea unitate", icon: "arrow.right.circle.fill")
                        HomeActionRow(title: "Practică inteligentă", subtitle: "Recapitulări, greșeli și puncte slabe", icon: "brain.head.profile")
                        HomeActionRow(title: "Yalla! Două minute", subtitle: "Exersează viteza de reamintire", icon: "timer")
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

    private let navigationBuilder = LearningNavigationBuilder()

    var body: some View {
        NavigationStack {
            List {
                ForEach(sections) { section in
                    Section(section.level.rawValue.uppercased()) {
                        ForEach(section.units) { unit in
                            unitRow(unit)
                        }
                    }
                }
            }
            .navigationTitle("Parcurs")
        }
    }

    @ViewBuilder
    private func unitRow(_ unit: JourneyUnitSummary) -> some View {
        if let detail = detail(for: unit.id) {
            NavigationLink {
                JourneyUnitDetailView(
                    detail: detail,
                    expressions: package.expressions,
                    locale: locale
                )
            } label: {
                JourneyUnitRow(unit: unit)
            }
        } else {
            JourneyUnitRow(unit: unit)
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

    private let navigationBuilder = LearningNavigationBuilder()

    var body: some View {
        NavigationStack {
            List(modes) { mode in
                practiceRow(mode)
            }
            .navigationTitle("Practică")
        }
    }

    @ViewBuilder
    private func practiceRow(_ mode: PracticeModeSummary) -> some View {
        if let destination = destination(for: mode) {
            NavigationLink {
                PracticeDestinationView(
                    destination: destination,
                    expressions: package.expressions,
                    locale: locale,
                    title: mode.title
                )
            } label: {
                PracticeModeRow(mode: mode, isNavigable: true)
            }
        } else {
            PracticeModeRow(mode: mode, isNavigable: false)
        }
    }

    private func destination(for mode: PracticeModeSummary) -> PracticeDestination? {
        guard mode.isAvailable else { return nil }
        do {
            return try navigationBuilder.practiceDestination(
                id: mode.id,
                from: package,
                locale: locale
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
    var body: some View {
        NavigationStack {
            FeaturePlaceholderView(
                title: "Progresul tău",
                subtitle: "Stăpânire, puncte slabe, cuvinte salvate, înregistrări și setări.",
                systemImage: "person"
            )
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

    var body: some View {
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
}
