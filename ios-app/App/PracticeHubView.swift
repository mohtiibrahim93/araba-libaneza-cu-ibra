import SwiftUI
import YallaCore

/// Every practice mode.
struct PracticeListView: View {
    let modes: [PracticeModeSummary]
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Alege cum vrei să exersezi azi.")
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(Theme.muted)
                ForEach(modes) { mode in
                    if PracticeModeScreen.destination(for: mode, package: package, locale: locale, progress: progressModel.snapshot) != nil {
                        NavigationLink(value: mode.id) {
                            PracticeModeRow(mode: mode, isNavigable: true)
                        }
                        .buttonStyle(NodeButtonStyle())
                        .accessibilityIdentifier("practice.\(mode.id)")
                    } else {
                        PracticeModeRow(mode: mode, isNavigable: false)
                    }
                }
                NavigationLink(value: "ai-conversation") {
                    PracticeModeRow(
                        mode: PracticeModeSummary(
                            id: "ai-conversation",
                            title: "Conversație AI",
                            subtitle: "Scenarii de dialog cu feedback. În pregătire.",
                            isAvailable: false
                        ),
                        isNavigable: false
                    )
                }
                .buttonStyle(NodeButtonStyle())
                .accessibilityIdentifier("practice.ai-conversation")
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle("Exersează")
    }
}

/// Resolves a practice mode ID to its destination screen.
struct PracticeModeScreen: View {
    let modeID: String
    let modes: [PracticeModeSummary]
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    var body: some View {
        if let mode = modes.first(where: { $0.id == modeID }),
           let destination = Self.destination(for: mode, package: package, locale: locale, progress: progressModel.snapshot) {
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

    static func destination(
        for mode: PracticeModeSummary,
        package: ContentPackage,
        locale: String,
        progress: LearnerProgressSnapshot
    ) -> PracticeDestination? {
        guard mode.isAvailable else { return nil }
        return try? LearningNavigationBuilder().practiceDestination(
            id: mode.id,
            from: package,
            locale: locale,
            learnerContext: progress.sessionCandidateContext(at: Date())
        )
    }
}

struct PracticeModeRow: View {
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
        case "ai-conversation": return ("bubble.left.and.bubble.right.fill", Theme.deep, Theme.mint)
        default: return ("bolt", Theme.teal, Theme.mint)
        }
    }
}
