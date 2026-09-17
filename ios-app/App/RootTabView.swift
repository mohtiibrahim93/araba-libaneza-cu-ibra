import SwiftUI
import YallaCore

struct RootTabView: View {
    let model: LearnerShellModel
    let discoverModel: DiscoverModel

    init(
        model: LearnerShellModel = AppSampleContent.shellModel,
        discoverModel: DiscoverModel = AppSampleContent.discoverModel
    ) {
        self.model = model
        self.discoverModel = discoverModel
    }

    var body: some View {
        TabView {
            HomeView(summary: model.home)
                .tabItem { Label("Acasă", systemImage: "house") }

            JourneyView(sections: model.journeySections)
                .tabItem { Label("Parcurs", systemImage: "map") }

            PracticeView(modes: model.practiceModes)
                .tabItem { Label("Practică", systemImage: "bolt") }

            DiscoverView(model: discoverModel)
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

    var body: some View {
        NavigationStack {
            List {
                ForEach(sections) { section in
                    Section(section.level.rawValue.uppercased()) {
                        ForEach(section.units) { unit in
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
                }
            }
            .navigationTitle("Parcurs")
        }
    }
}

private struct PracticeView: View {
    let modes: [PracticeModeSummary]

    var body: some View {
        NavigationStack {
            List(modes) { mode in
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
                    Text(mode.isAvailable ? "Disponibil" : "În curând")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(mode.isAvailable ? .primary : .secondary)
                }
                .padding(.vertical, 5)
            }
            .navigationTitle("Practică")
        }
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

    private var filteredEntries: [DictionaryEntrySummary] {
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return model.entries }
        let needle = query.folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current)
        return model.entries.filter { entry in
            let fields = [entry.arabizi, entry.arabicScript ?? "", entry.meaning] + entry.topics
            return fields.contains { field in
                field.folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current).contains(needle)
            }
        }
    }

    var body: some View {
        NavigationStack {
            List {
                if !model.roots.isEmpty {
                    Section("Rădăcini") {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(model.roots) { root in
                                    if let graph = model.rootGraph(rootID: root.id) {
                                        NavigationLink {
                                            RootExplorerView(graph: graph)
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

                Section("Dicționar") {
                    ForEach(filteredEntries) { entry in
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
                                   let root = model.roots.first(where: { $0.id == rootID }),
                                   let graph = model.rootGraph(rootID: rootID) {
                                    NavigationLink(root.displayKey) {
                                        RootExplorerView(graph: graph)
                                    }
                                    .font(.caption.bold())
                                    .buttonStyle(.bordered)
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
            .searchable(text: $query, prompt: "Caută Arabizi, arabă sau română")
            .navigationTitle("Descoperă")
        }
    }
}

private struct RootExplorerView: View {
    let graph: RootExplorerSummary

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Familia rădăcinii")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                GeometryReader { proxy in
                    let size = proxy.size
                    let center = CGPoint(x: size.width / 2, y: size.height / 2)
                    let radius = max(min(size.width, size.height) * 0.34, 90)

                    ZStack {
                        ForEach(Array(graph.members.enumerated()), id: \.element.id) { index, member in
                            let angle = (Double(index) / Double(max(graph.members.count, 1))) * (Double.pi * 2) - Double.pi / 2
                            let x = center.x + CGFloat(cos(angle)) * radius
                            let y = center.y + CGFloat(sin(angle)) * radius

                            Path { path in
                                path.move(to: center)
                                path.addLine(to: CGPoint(x: x, y: y))
                            }
                            .stroke(.secondary.opacity(0.35), lineWidth: 1.5)

                            Text(member.label)
                                .font(.subheadline.weight(.semibold))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(.thinMaterial, in: Capsule())
                                .position(x: x, y: y)
                        }

                        Text(graph.centerLabel)
                            .font(.title2.bold())
                            .padding(22)
                            .background(.regularMaterial, in: Circle())
                            .overlay(Circle().stroke(.secondary.opacity(0.25)))
                            .position(center)
                    }
                }
                .frame(height: 360)

                DisclosureGroup("Gramatică și tipare") {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(graph.members) { member in
                            HStack {
                                Text(member.label)
                                    .fontWeight(.semibold)
                                Spacer()
                                Text(member.patternID ?? "fără tipar etichetat")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.top, 8)
                }
            }
            .padding()
        }
        .navigationTitle(graph.centerLabel)
        .navigationBarTitleDisplayMode(.inline)
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
