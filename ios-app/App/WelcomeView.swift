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
    @State private var level: Level = .beginner
    @State private var goals: Set<Goal> = [.conversation]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 8) {
                        BrandHeader(tagline: "Limbă · Oameni · Cultură")
                        Text("Să te cunoaștem mai bine")
                            .font(Theme.serif(.title))
                            .foregroundStyle(Theme.ink)
                            .padding(.top, 8)
                        Text("Alege de unde pornești. Obiectivele te ajută să rămâi motivat.")
                            .font(Theme.font(.subheadline))
                            .foregroundStyle(Theme.muted)
                    }
                    Spacer(minLength: 0)
                    Image("illus-onb-town")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 96)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .accessibilityHidden(true)
                }

                stepTitle(number: 1, title: "Care este nivelul tău actual?")
                HStack(spacing: 10) {
                    ForEach(Level.allCases) { option in
                        levelCard(option)
                    }
                }

                stepTitle(number: 2, title: "Care sunt obiectivele tale principale?", hint: "Poți alege mai multe variante.")
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    ForEach(Goal.allCases) { goal in
                        goalCard(goal)
                    }
                }

                recommendation
            }
            .padding(20)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .safeAreaInset(edge: .bottom, spacing: 0) {
            Button {
                storedGoals = goals.map(\.rawValue).sorted().joined(separator: ",")
                if level == .beginner { onBeginner() } else { onPlacement() }
            } label: {
                Label("Continuă", systemImage: "arrow.right")
                    .labelStyle(TrailingIconLabelStyle())
            }
            .buttonStyle(ChunkyButtonStyle(kind: .primary))
            .accessibilityIdentifier("welcome.continue")
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Theme.canvas.ignoresSafeArea(edges: .bottom))
        }
    }

    private func stepTitle(number: Int, title: String, hint: String? = nil) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Text("\(number)")
                .font(Theme.font(.subheadline, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 28, height: 28)
                .background(Theme.terracotta, in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.serif(.headline))
                    .foregroundStyle(Theme.ink)
                if let hint {
                    Text(hint)
                        .font(Theme.font(.caption))
                        .foregroundStyle(Theme.muted)
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }

    private func levelCard(_ option: Level) -> some View {
        let selected = level == option
        return Button {
            level = option
        } label: {
            VStack(spacing: 8) {
                Image(systemName: option.icon)
                    .font(.title3)
                    .foregroundStyle(selected ? Theme.terracotta : Theme.teal)
                Text(option.title)
                    .font(Theme.serif(.subheadline))
                    .foregroundStyle(Theme.ink)
                    .multilineTextAlignment(.center)
                Text(option.subtitle)
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
                Image(systemName: selected ? "largecircle.fill.circle" : "circle")
                    .foregroundStyle(selected ? Theme.terracotta : Theme.lineStrong)
            }
            .padding(12)
            .frame(maxWidth: .infinity, minHeight: 170)
            .background(selected ? Theme.blush : Theme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(selected ? Theme.terracotta : Theme.line, lineWidth: selected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    private func goalCard(_ goal: Goal) -> some View {
        let selected = goals.contains(goal)
        return Button {
            if selected { goals.remove(goal) } else { goals.insert(goal) }
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                Color.clear
                    .frame(maxWidth: .infinity)
                    .frame(height: 78)
                    .overlay {
                        Image(goal.image)
                            .resizable()
                            .scaledToFill()
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(alignment: .topTrailing) {
                        Image(systemName: selected ? "checkmark.circle.fill" : "circle")
                            .font(.title3)
                            .foregroundStyle(selected ? Theme.terracotta : .white)
                            .background(Circle().fill(selected ? .white : Color.black.opacity(0.15)))
                            .padding(6)
                    }
                    .accessibilityHidden(true)
                Text(goal.title)
                    .font(Theme.serif(.subheadline))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Text(goal.subtitle)
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .background(selected ? Theme.blush : Theme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(selected ? Theme.terracotta : Theme.line, lineWidth: selected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    private var recommendation: some View {
        let beginner = level == .beginner
        let title: String = beginner ? "A1 – conversații de bază" : "Testul „De unde încep?”"
        let detail: String = beginner
            ? "Începi cu lecții scurte și practice, utile în situații reale."
            : "24 de întrebări fără cronometru îți recomandă unitatea potrivită din Parcurs."
        return VStack(alignment: .leading, spacing: 8) {
            Label("Recomandarea noastră pentru tine", systemImage: "sparkle")
                .font(Theme.font(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.teal)
            Text(title)
                .font(Theme.serif(.title2))
                .foregroundStyle(Theme.ink)
            Text(detail)
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.mint, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .accessibilityElement(children: .combine)
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
