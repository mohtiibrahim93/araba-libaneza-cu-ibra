import SwiftUI

// Guided-flow building blocks shared by the Welcome screen and the placement
// test. Step counts and recommendations always come from the caller.

/// Short segments for short flows; one continuous bar beyond
/// `maxVisibleSegments` so long flows (the 24-question test) stay legible.
struct SegmentedStepProgress: View {
    /// Completed or current steps.
    let current: Int
    let total: Int
    var maxVisibleSegments = 8

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Group {
            if total <= maxVisibleSegments {
                HStack(spacing: 4) {
                    ForEach(0..<max(total, 1), id: \.self) { index in
                        Capsule()
                            .fill(index < current ? Theme.deep : Theme.progressInactive)
                            .frame(height: 6)
                    }
                }
            } else {
                GeometryReader { proxy in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Theme.progressInactive)
                        Capsule().fill(Theme.deep)
                            .frame(width: proxy.size.width * CGFloat(min(max(current, 0), total)) / CGFloat(max(total, 1)))
                    }
                }
                .frame(height: 6)
            }
        }
        .animation(reduceMotion ? nil : .easeOut(duration: 0.3), value: current)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Progres orientare")
        .accessibilityValue("\(current) din \(total)")
    }
}

/// Close or back control, step progress and a step label on one row.
struct OrientationProgressHeader: View {
    let current: Int
    let total: Int
    let label: String
    var leadingIcon: YallaIcon? = nil
    var leadingLabel = "Înapoi"
    var onLeading: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            if let onLeading, let leadingIcon {
                Button(action: onLeading) {
                    YallaIconView(leadingIcon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(Theme.deep)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(leadingLabel)
                .padding(.leading, -Theme.Spacing.md)
            }
            SegmentedStepProgress(current: current, total: total)
            Text(label)
                .font(Theme.font(.caption))
                .monospacedDigit()
                .foregroundStyle(Theme.muted)
                .lineLimit(1)
                .fixedSize()
        }
        .frame(minHeight: 44)
    }
}

/// Serif title and subtitle with Lebanese scenery and a soft sun behind it.
struct OrientationIntro: View {
    let title: String
    let subtitle: String
    var artwork: String? = nil

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private var showsArtwork: Bool { artwork != nil && !dynamicTypeSize.isAccessibilitySize }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text(title)
                .font(.system(.largeTitle, design: .serif).weight(.bold))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text(subtitle)
                .yallaFont(.body)
                .foregroundStyle(Theme.muted)
                .lineSpacing(1)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.trailing, showsArtwork ? 120 : 0)
        .padding(.vertical, Theme.Spacing.sm)
        .frame(maxWidth: .infinity, minHeight: 104, alignment: .leading)
        .background(alignment: .trailing) {
            if showsArtwork, let artwork {
                ZStack(alignment: .topTrailing) {
                    Circle()
                        .fill(Theme.coralSoft.opacity(0.5))
                        .frame(width: 70, height: 70)
                        .offset(x: -24, y: -6)
                    DecorativeImage(name: artwork, width: 160, height: 118, fadeTowards: .leading)
                }
                .offset(x: Theme.Spacing.screen)
                .accessibilityHidden(true)
            }
        }
    }
}

/// Small capsule label such as "Personalizat".
struct RecommendationBadge: View {
    var icon: YallaIcon? = .system("sparkle")
    let title: String

    var body: some View {
        HStack(spacing: 4) {
            if let icon {
                YallaIconView(icon)
                    .font(.system(size: 11, weight: .semibold))
            }
            Text(title)
                .font(Theme.font(.caption, weight: .medium))
                .lineLimit(1)
        }
        .foregroundStyle(Theme.deep)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Theme.surface.opacity(0.85), in: Capsule())
    }
}

/// Four-pointed compass star drawn natively (stand-in for Decor/CompassStar).
struct CompassStarShape: Shape {
    func path(in rect: CGRect) -> Path {
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let outer = min(rect.width, rect.height) / 2
        let inner = outer * 0.28
        var path = Path()
        for index in 0..<8 {
            let angle = Double(index) * .pi / 4 - .pi / 2
            let radius = index.isMultiple(of: 2) ? outer : inner
            let point = CGPoint(x: center.x + CGFloat(cos(angle)) * radius, y: center.y + CGFloat(sin(angle)) * radius)
            if index == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        return path
    }
}

/// Pale sage recommendation panel. The caller supplies the recommendation;
/// the card never derives a level itself.
struct RecommendationCard<Extra: View>: View {
    let eyebrow: String
    var badge: String? = nil
    let title: String
    let description: String
    var actionTitle: String? = nil
    var onAction: (() -> Void)? = nil
    @ViewBuilder var extra: () -> Extra

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack(alignment: .center, spacing: Theme.Spacing.sm) {
                CompassStarShape()
                    .fill(Theme.terracotta)
                    .frame(width: 22, height: 22)
                    .accessibilityHidden(true)
                Text(eyebrow)
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.deep)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if let badge {
                RecommendationBadge(title: badge)
            }
            Text(title)
                .font(.system(.title2, design: .serif).weight(.bold))
                .foregroundStyle(Theme.cedarDeep)
                .fixedSize(horizontal: false, vertical: true)
            Text(description)
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
            extra()
            if let actionTitle, let onAction {
                Button(action: onAction) {
                    Label(actionTitle, systemImage: "arrow.right")
                        .labelStyle(TrailingIconLabelStyle())
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 54))
                .padding(.top, Theme.Spacing.xs)
            }
        }
        .padding(Theme.Spacing.lg + 2)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(alignment: .bottomTrailing) {
            CedarShape()
                .fill(Theme.deep.opacity(0.06))
                .frame(width: 90, height: 84)
                .offset(x: 12, y: 10)
                .accessibilityHidden(true)
                .allowsHitTesting(false)
        }
        .background(
            LinearGradient(
                colors: [Theme.recommendationSurface, Theme.recommendationSurfaceEnd],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 19, style: .continuous))
        .elevation(.card)
        .accessibilityElement(children: .contain)
    }
}

extension RecommendationCard where Extra == EmptyView {
    init(
        eyebrow: String,
        badge: String? = nil,
        title: String,
        description: String,
        actionTitle: String? = nil,
        onAction: (() -> Void)? = nil
    ) {
        self.init(
            eyebrow: eyebrow, badge: badge, title: title, description: description,
            actionTitle: actionTitle, onAction: onAction
        ) { EmptyView() }
    }
}

/// Deep-cedar primary action pinned above the home indicator.
struct OrientationBottomAction: View {
    let title: String
    var isEnabled = true
    var identifier: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: "arrow.right")
                .labelStyle(TrailingIconLabelStyle())
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 54))
        .accessibilityIdentifier(identifier ?? "orientation.primary")
        .disabled(!isEnabled)
        .opacity(isEnabled ? 1 : 0.5)
        .padding(.horizontal, Theme.Spacing.screen)
        .padding(.vertical, Theme.Spacing.md)
        .background(Theme.canvas.ignoresSafeArea(edges: .bottom))
    }
}

/// Secondary action styled to sit under a primary pill.
struct OutlinePillButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.font(.subheadline, weight: .semibold))
            .foregroundStyle(Theme.deep)
            .frame(maxWidth: .infinity, minHeight: 48)
            .background(configuration.isPressed ? Theme.mint : Theme.surface, in: Capsule())
            .overlay(Capsule().strokeBorder(Theme.cardStroke, lineWidth: 0.75))
    }
}
