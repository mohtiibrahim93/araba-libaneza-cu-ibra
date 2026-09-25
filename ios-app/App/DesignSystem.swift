import SwiftUI

// Shared primitives built on the Theme tokens. Screens compose these instead
// of repeating icon circles, rings, stats and decorative scenery by hand.

extension View {
    /// Soft shadow levels from the Theme elevation tokens.
    @ViewBuilder
    func elevation(_ level: Theme.Elevation) -> some View {
        switch level {
        case .card:
            shadow(color: Color.black.opacity(0.055), radius: 10, x: 0, y: 4)
        case .raised:
            shadow(color: Color.black.opacity(0.10), radius: 12, x: 0, y: 6)
        case let .hero(tint):
            shadow(color: tint.opacity(0.10), radius: 14, x: 0, y: 6)
        }
    }
}

/// SF Symbol on a tinted circle.
struct IconBadge: View {
    let systemName: String
    var tint: Color = Theme.teal
    var background: Color? = nil
    var size: CGFloat = 44

    var body: some View {
        Image(systemName: systemName)
            .font(.system(size: size * 0.42, weight: .semibold))
            .foregroundStyle(tint)
            .frame(width: size, height: size)
            .background(background ?? tint.opacity(0.14), in: Circle())
            .accessibilityHidden(true)
    }
}

/// Circular progress track with an optional centre view.
struct ProgressRing<Center: View>: View {
    let fraction: Double
    var tint: Color = Theme.teal
    var track: Color = Theme.ringTrack
    var lineWidth: CGFloat = 5
    @ViewBuilder var center: () -> Center

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            Circle().stroke(track, lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: CGFloat(min(max(fraction, 0), 1)))
                .stroke(tint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(reduceMotion ? nil : .easeOut(duration: 0.35), value: fraction)
            center()
        }
    }
}

extension ProgressRing where Center == EmptyView {
    init(fraction: Double, tint: Color = Theme.teal, track: Color = Theme.ringTrack, lineWidth: CGFloat = 5) {
        self.init(fraction: fraction, tint: tint, track: track, lineWidth: lineWidth) { EmptyView() }
    }
}

/// Terracotta capsule call-to-action, at least 50 pt tall.
struct PillButtonStyle: ButtonStyle {
    var fill: Color = Theme.terracotta
    var pressedFill: Color = Theme.terracottaShade
    var foreground: Color = .white

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .yallaFont(.bodyStrong)
            .foregroundStyle(foreground)
            .padding(.horizontal, Theme.Spacing.xl)
            .frame(minHeight: 50)
            .background(configuration.isPressed ? pressedFill : fill, in: Capsule())
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

/// SF Symbol or asset-catalog icon behind one type, so components can take
/// either without changing their API.
enum YallaIcon: Hashable, Sendable {
    case system(String)
    case asset(String)
}

struct YallaIconView: View {
    let icon: YallaIcon

    init(_ icon: YallaIcon) {
        self.icon = icon
    }

    var body: some View {
        switch icon {
        case let .system(name):
            Image(systemName: name)
        case let .asset(name):
            Image(name)
                .renderingMode(.template)
                .resizable()
                .scaledToFit()
        }
    }
}

/// Small round icon control with a 44 pt hit area.
struct CircularIconButton: View {
    let icon: YallaIcon
    let accessibilityLabel: String
    var tint: Color = Theme.terracotta
    var fill: Color = Theme.surface.opacity(0.85)
    var diameter: CGFloat = 36
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            YallaIconView(icon)
                .font(.system(size: diameter * 0.42, weight: .semibold))
                .foregroundStyle(tint)
                .frame(width: diameter, height: diameter)
                .background(fill, in: Circle())
                .frame(minWidth: 44, minHeight: 44)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(accessibilityLabel)
    }
}

/// Terracotta brush stroke under headings.
struct HandDrawnUnderline: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.midY + 1))
        path.addCurve(
            to: CGPoint(x: rect.maxX, y: rect.midY - 1),
            control1: CGPoint(x: rect.width * 0.30, y: rect.midY - 4),
            control2: CGPoint(x: rect.width * 0.72, y: rect.midY + 3)
        )
        return path
    }
}

/// Compact phrase: bold Arabizi, meaning underneath, optional speaker.
struct PhraseRow: View {
    let primary: String
    let secondary: String
    var onSpeak: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            VStack(alignment: .leading, spacing: 1) {
                Text(primary)
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                Text(secondary)
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
            if let onSpeak {
                CircularIconButton(
                    icon: .system("speaker.wave.2"),
                    accessibilityLabel: "Redă pronunția",
                    tint: Theme.teal,
                    fill: .clear,
                    diameter: 28,
                    action: onSpeak
                )
            }
        }
        .frame(minHeight: 40)
        .accessibilityElement(children: .combine)
    }
}

/// Icon, value and caption used in stat strips.
struct StatItem: View {
    let value: String
    let label: String
    let icon: String
    let tint: Color

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            Image(systemName: icon)
                .font(.title3.weight(.semibold))
                .foregroundStyle(tint)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 0) {
                Text(value)
                    .font(Theme.serif(.title3))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Text(label)
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
            }
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
    }
}

/// Serif section title with an optional trailing caption and chevron.
struct SectionHeader: View {
    let title: String
    var trailing: String? = nil
    var showsChevron = false

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            Text(title)
                .font(Theme.serif(.headline))
                .foregroundStyle(Theme.ink)
                .accessibilityAddTraits(.isHeader)
            Spacer(minLength: Theme.Spacing.sm)
            if let trailing {
                Text(trailing)
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(Theme.muted)
            }
            if showsChevron {
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.muted)
                    .accessibilityHidden(true)
            }
        }
    }
}

/// Decorative scenery from the asset catalog, clipped and optionally faded
/// towards one edge. Always hidden from VoiceOver.
struct DecorativeImage: View {
    let name: String
    var width: CGFloat? = nil
    var height: CGFloat? = nil
    /// Edge the image fades out towards.
    var fadeTowards: Edge? = nil

    var body: some View {
        Image(name)
            .resizable()
            .scaledToFill()
            .frame(width: width, height: height)
            .frame(maxHeight: height == nil ? CGFloat.infinity : nil)
            .clipped()
            .mask(mask)
            .accessibilityHidden(true)
    }

    private var mask: LinearGradient {
        switch fadeTowards {
        case .leading?:
            return LinearGradient(colors: [.clear, .black, .black], startPoint: .leading, endPoint: .trailing)
        case .trailing?:
            return LinearGradient(colors: [.black, .black, .clear], startPoint: .leading, endPoint: .trailing)
        case .top?:
            return LinearGradient(colors: [.clear, .black], startPoint: .top, endPoint: .bottom)
        case .bottom?:
            return LinearGradient(colors: [.black, .clear], startPoint: .top, endPoint: .bottom)
        case nil:
            return LinearGradient(colors: [.black], startPoint: .top, endPoint: .bottom)
        }
    }
}

/// Thin horizontal meter, e.g. a skill's first-try accuracy.
struct MeterBar: View {
    let fraction: Double
    var tint: Color = Theme.teal
    var track: Color = Theme.line
    var height: CGFloat = 5

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Capsule().fill(track)
                Capsule().fill(tint)
                    .frame(width: geometry.size.width * CGFloat(min(max(fraction, 0), 1)))
            }
        }
        .frame(height: height)
        .accessibilityHidden(true)
    }
}
