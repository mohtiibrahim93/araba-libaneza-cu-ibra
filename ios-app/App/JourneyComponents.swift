import SwiftUI
import YallaCore

// Building blocks of the Călătorie map. Units, levels, progress and phrases
// come from the caller; the map never invents curriculum.

enum JourneyUnitState {
    case completed
    case current
    case available
    /// The unit exists but has no exercises yet.
    case preparing
}

enum JourneyMilestoneState {
    case completed
    case current
    case available
    /// Level announced but without units yet.
    case comingSoon
}

/// "Nivelul tău" capsule with the learner's current band.
struct CurrentLevelPill: View {
    let level: String
    var subtitle = "Nivelul tău"
    var onTap: (() -> Void)? = nil

    var body: some View {
        let content = HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: "chart.bar.fill")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(Theme.teal)
            VStack(alignment: .leading, spacing: 0) {
                Text(subtitle)
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
                Text(level)
                    .font(.system(.title3, design: .serif).weight(.bold))
                    .foregroundStyle(Theme.ink)
            }
            if onTap != nil {
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.muted)
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .frame(minHeight: 58)
        .background(Theme.surface, in: Capsule())
        .elevation(.card)

        if let onTap {
            Button(action: onTap) { content }
                .buttonStyle(.plain)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("\(subtitle) \(level)")
                .accessibilityHint("Deschide testul de orientare")
                .accessibilityAddTraits(.isButton)
                .accessibilityIdentifier("journey.level")
        } else {
            content
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("\(subtitle) \(level)")
        }
    }
}

/// Circular CEFR marker placed on the path.
struct JourneyMilestoneBadge: View {
    let level: String
    let state: JourneyMilestoneState

    private var fill: Color {
        switch state {
        case .completed, .available: return Theme.deep
        case .current: return Theme.terracotta
        case .comingSoon: return Theme.faint
        }
    }

    var body: some View {
        Text(level)
            .font(.system(.headline, design: .serif).weight(.bold))
            .foregroundStyle(.white)
            .frame(width: 44, height: 44)
            .background(fill, in: Circle())
            .overlay(Circle().strokeBorder(Theme.surface, lineWidth: 2.5))
            .overlay(alignment: .bottomTrailing) {
                if state == .completed {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 15))
                        .foregroundStyle(Theme.success, Theme.surface)
                        .background(Circle().fill(Theme.surface))
                        .offset(x: 3, y: 3)
                }
            }
            .shadow(color: .black.opacity(0.12), radius: 5, x: 0, y: 2)
            .accessibilityHidden(true)
    }
}

/// Thin progress capsule for cards.
struct JourneyProgressMiniBar: View {
    let progress: Double
    var onDark = false

    var body: some View {
        MeterBar(
            fraction: progress,
            tint: onDark ? .white : Theme.teal,
            track: onDark ? Color.white.opacity(0.3) : Theme.progressInactive,
            height: 5
        )
        .frame(width: 64)
    }
}

/// Unit card in its four states. The current unit is larger and terracotta.
struct JourneyLessonCard: View {
    let number: Int
    let title: String
    let subtitle: String
    let completed: Int
    let total: Int
    let state: JourneyUnitState

    private var isCurrent: Bool { state == .current }
    private var foreground: Color { isCurrent ? .white : Theme.ink }
    private var secondary: Color { isCurrent ? .white.opacity(0.9) : Theme.muted }

    var body: some View {
        VStack(alignment: .leading, spacing: isCurrent ? 4 : 3) {
            HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.xs) {
                Text("\(number). \(title)")
                    .font(.system(isCurrent ? .title3 : .headline, design: .serif).weight(.semibold))
                    .foregroundStyle(state == .preparing ? Theme.muted : foreground)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
                if isCurrent {
                    Image(systemName: "chevron.right")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(.white)
                }
            }
            Text(subtitle)
                .font(Theme.font(isCurrent ? .subheadline : .caption))
                .foregroundStyle(secondary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: Theme.Spacing.sm) {
                if state == .preparing {
                    Image(systemName: "hourglass")
                        .font(.caption2)
                    Text("În pregătire")
                        .font(Theme.font(.caption2, weight: .semibold))
                } else {
                    JourneyProgressMiniBar(progress: total > 0 ? Double(completed) / Double(total) : 0, onDark: isCurrent)
                    if state == .completed {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.caption)
                            .foregroundStyle(Theme.success)
                    }
                    Text("\(completed)/\(total) lecții")
                        .font(Theme.font(.caption2, weight: .semibold))
                        .monospacedDigit()
                }
            }
            .foregroundStyle(secondary)
            .padding(.top, isCurrent ? 8 : 5)
        }
        .padding(.horizontal, isCurrent ? 16 : 13)
        .padding(.vertical, isCurrent ? 15 : 11)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            isCurrent ? Theme.terracotta : Theme.surface,
            in: RoundedRectangle(cornerRadius: isCurrent ? 18 : 15, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: isCurrent ? 18 : 15, style: .continuous)
                .strokeBorder(isCurrent ? Theme.terracottaShade.opacity(0.4) : Theme.cardStroke, lineWidth: 0.75)
        )
        .shadow(color: .black.opacity(isCurrent ? 0.13 : 0.07), radius: isCurrent ? 12 : 8, x: 0, y: isCurrent ? 6 : 3)
        .opacity(state == .preparing ? 0.85 : 1)
    }
}

/// Painted-stone plaque with an approved Arabizi phrase from the unit.
struct JourneyScenicLabel: View {
    let arabizi: String
    var arabic: String? = nil
    var tilt: Double = -2

    var body: some View {
        VStack(spacing: 1) {
            if let arabic, !arabic.isEmpty {
                Text(arabic)
                    .font(.system(size: 16, weight: .semibold))
            }
            Text(arabizi)
                .font(.system(.subheadline, design: .serif).weight(.semibold).italic())
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .foregroundStyle(Theme.ink.opacity(0.85))
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .frame(maxWidth: 140)
        .background(
            RoundedRectangle(cornerRadius: 6, style: .continuous)
                .fill(Theme.variantBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 6, style: .continuous)
                .strokeBorder(Theme.goldShade.opacity(0.45), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.10), radius: 3, x: 0, y: 2)
        .rotationEffect(.degrees(tilt))
        .accessibilityHidden(true)
    }
}

/// Soft scenery beside a card. Faded at its edges so neighbouring scenes blend
/// into one landscape. Stand-in until the Journey scenery strips exist.
struct JourneyScenery: View {
    let imageName: String
    var faded = false

    var body: some View {
        Color.clear
            .overlay {
                Image(imageName)
                    .resizable()
                    .scaledToFill()
                    .saturation(faded ? 0.25 : 0.95)
                    .opacity(faded ? 0.45 : 0.9)
            }
            .clipped()
            .mask(
                RadialGradient(
                    colors: [.black, .black.opacity(0.85), .clear],
                    center: .center,
                    startRadius: 20,
                    endRadius: 120
                )
            )
            .accessibilityHidden(true)
            .allowsHitTesting(false)
    }
}

/// Positions of path points reported by map nodes, keyed by node ID.
struct JourneyAnchorKey: PreferenceKey {
    static var defaultValue: [String: Anchor<CGPoint>] { [:] }

    static func reduce(value: inout [String: Anchor<CGPoint>], nextValue: () -> [String: Anchor<CGPoint>]) {
        value.merge(nextValue(), uniquingKeysWith: { $1 })
    }
}

/// Dashed S-curves, one per gap between consecutive map nodes.
struct JourneyPathShape: Shape {
    /// (bottom of a node, top of the next node) pairs.
    let segments: [(CGPoint, CGPoint)]

    func path(in rect: CGRect) -> Path {
        var path = Path()
        for (start, end) in segments {
            let midY = (start.y + end.y) / 2
            path.move(to: start)
            path.addCurve(
                to: end,
                control1: CGPoint(x: start.x, y: midY),
                control2: CGPoint(x: end.x, y: midY)
            )
        }
        return path
    }
}

extension View {
    /// Reports this node's top and bottom centres as path end points.
    func journeyAnchor(_ id: String) -> some View {
        self
            .anchorPreference(key: JourneyAnchorKey.self, value: .top) { [id + ".top": $0] }
            .transformAnchorPreference(key: JourneyAnchorKey.self, value: .bottom) { value, anchor in
                value[id + ".bottom"] = anchor
            }
    }
}
