import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Acasă", systemImage: "house") }

            JourneyView()
                .tabItem { Label("Parcurs", systemImage: "map") }

            PracticeView()
                .tabItem { Label("Practică", systemImage: "bolt") }

            DiscoverView()
                .tabItem { Label("Descoperă", systemImage: "sparkles") }

            ProfileView()
                .tabItem { Label("Eu", systemImage: "person") }
        }
    }
}

private struct HomeView: View {
    var body: some View {
        NavigationStack {
            FeaturePlaceholderView(
                title: "Continuă în libaneză",
                subtitle: "Lecții, recapitulări, greșeli și activitățile prioritare pentru azi.",
                systemImage: "house"
            )
            .navigationTitle("Acasă")
        }
    }
}

private struct JourneyView: View {
    var body: some View {
        NavigationStack {
            FeaturePlaceholderView(
                title: "Parcursul tău",
                subtitle: "A1 disponibil, A2 în consolidare și B1 în dezvoltare.",
                systemImage: "map"
            )
            .navigationTitle("Parcurs")
        }
    }
}

private struct PracticeView: View {
    var body: some View {
        NavigationStack {
            FeaturePlaceholderView(
                title: "Practică inteligentă",
                subtitle: "Recapitulări SRS, greșeli, ascultare, vorbire și Yalla! două minute.",
                systemImage: "bolt"
            )
            .navigationTitle("Practică")
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
