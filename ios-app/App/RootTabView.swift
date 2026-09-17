import SwiftUI
import YallaCore

struct RootTabView: View {
    let model: LearnerShellModel

    init(model: LearnerShellModel = AppSampleContent.shellModel) {
        self.model = model
    }

    var body: some View {
        TabView {
            HomeView(summary: model.home)
                .tabItem { Label("Acasă", systemImage: "house") }

            JourneyView(sections: model.journeySections)
                .tabItem { Label("Parcurs", systemImage: "map") }

            PracticeView(modes: model.practiceModes)
                .tabItem { Label("Practică", systemImage: "bolt") }

            DiscoverView()
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
    var body: some View {
        NavigationStack {
            FeaturePlaceholderView(
                title: "Descoperă Libanul",
                subtitle: "Dicționar, rădăcini, gramatică, cultură, muzică și situații reale.",
                systemImage: "sparkles"
            )
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
