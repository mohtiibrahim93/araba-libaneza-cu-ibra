import SwiftUI

/// First-launch welcome: starting level and personal goals.
/// Beginners go straight to the Journey; others take the placement test.
struct WelcomeView: View {
    enum Level: String, CaseIterable, Identifiable {
        case beginner, studied, advanced
        var id: String { rawValue }

        var title: String {
            switch self {
            case .beginner: return "Începător"
            case .studied: return "Am mai studiat"
            case .advanced: return "Nivel avansat"
            }
        }

        var subtitle: String {
            switch self {
            case .beginner: return "Încep de la zero sau știu doar câteva cuvinte."
            case .studied: return "Știu deja noțiuni de bază."
            case .advanced: return "Vreau să îmi perfecționez cunoștințele."
            }
        }

        var icon: String {
            switch self {
            case .beginner: return "leaf.fill"
            case .studied: return "chart.bar.fill"
            case .advanced: return "graduationcap.fill"
            }
        }

        var tint: Color {
            self == .beginner ? Theme.teal : Theme.terracotta
        }
    }

    enum Goal: String, CaseIterable, Identifiable {
        case conversation, arabizi, travel, culture
        var id: String { rawValue }

        var title: String {
            switch self {
            case .conversation: return "Vreau conversație"
            case .arabizi: return "Vreau să citesc Arabizi"
            case .travel: return "Vreau pentru călătorii"
            case .culture: return "Sunt pasionat(ă) de cultură"
            }
        }

        var subtitle: String {
            switch self {
            case .conversation: return "Să pot vorbi în situații reale, în viața de zi cu zi."
            case .arabizi: return "Să înțeleg scrierea libaneză cu litere latine."
            case .travel: return "Să mă descurc în vacanțe în Liban."
            case .culture: return "Mă interesează limba, oamenii și tradițiile."
            }
        }

        var image: String {
            switch self {
            case .conversation: return "illus-onb-conv"
            case .arabizi: return "illus-onb-alpha"
            case .travel: return "illus-onb-travel"
            case .culture: return "illus-onb-culture"
            }
        }
    }

    let onBeginner: () -> Void
    let onPlacement: () -> Void

    @AppStorage("learnerGoals") private var storedGoals = ""
    @AppStorage("learnerName") private var learnerName = ""
    @State private var level: Level = .beginner
    @State private var goals: Set<Goal> = [.conversation]

    /// Beginners finish here; everyone else continues with the placement test.
    private var stageTotal: Int { level == .beginner ? 1 : 2 }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                OrientationProgressHeader(current: 1, total: stageTotal, label: "Pasul 1 din \(stageTotal)")
                OrientationIntro(
                    title: "Să te cunoaștem mai bine",
                    subtitle: "Alege de unde pornești. Obiectivele te ajută să rămâi motivat.",
                    artwork: "illus-onb-town"
                )

                HStack(spacing: 10) {
                    Image(systemName: "person.fill")
                        .foregroundStyle(Theme.terracotta)
                    TextField("Cum te cheamă? (opțional)", text: $learnerName)
                        .textInputAutocapitalization(.words)
                        .autocorrectionDisabled()
                        .accessibilityIdentifier("welcome.name")
                }
                .font(Theme.font(.body))
                .padding(.horizontal, 16)
                .frame(minHeight: 48)
                .background(Theme.surface, in: Capsule())
                .overlay(Capsule().strokeBorder(Theme.cardStroke, lineWidth: 0.75))

                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    QuestionSectionHeader(number: 1, title: "Care este nivelul tău actual?")
                    AdaptiveChoiceGrid(preferredColumns: 3, minimumCardWidth: 100, spacing: Theme.Spacing.sm) {
                        ForEach(Level.allCases) { option in
                            SingleSelectOptionCard(
                                icon: .system(option.icon),
                                iconTint: option.tint,
                                title: option.title,
                                subtitle: option.subtitle,
                                isSelected: level == option,
                                action: { level = option }
                            )
                        }
                    }
                }

                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    QuestionSectionHeader(
                        number: 2,
                        title: "Care sunt obiectivele tale principale?",
                        helper: "Poți alege mai multe variante."
                    )
                    AdaptiveChoiceGrid(preferredColumns: 2, minimumCardWidth: 150, spacing: 10) {
                        ForEach(Goal.allCases) { goal in
                            MultiSelectIllustratedCard(
                                imageName: goal.image,
                                title: goal.title,
                                subtitle: goal.subtitle,
                                isSelected: goals.contains(goal),
                                action: {
                                    if goals.contains(goal) { goals.remove(goal) } else { goals.insert(goal) }
                                }
                            )
                        }
                    }
                }

                RecommendationCard(
                    eyebrow: "Recomandarea noastră pentru tine",
                    badge: "Pe baza nivelului ales",
                    title: recommendationTitle,
                    description: recommendationDetail
                )
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: Theme.Spacing.maxContentWidth)
            .frame(maxWidth: .infinity)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .scrollDismissesKeyboard(.interactively)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            OrientationBottomAction(
                title: level == .beginner ? "Continuă" : "Continuă cu testul",
                identifier: "welcome.continue"
            ) {
                storedGoals = goals.map(\.rawValue).sorted().joined(separator: ",")
                if level == .beginner { onBeginner() } else { onPlacement() }
            }
        }
    }

    private var recommendationTitle: String {
        level == .beginner ? "A1 – conversații de bază" : "Testul „De unde încep?”"
    }

    private var recommendationDetail: String {
        level == .beginner
            ? "Începi cu lecții scurte și practice, utile în situații reale."
            : "24 de întrebări fără cronometru îți recomandă unitatea potrivită din Călătorie."
    }
}

/// Title first, icon after it.
struct TrailingIconLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            configuration.title
            configuration.icon
        }
    }
}
