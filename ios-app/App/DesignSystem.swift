import SwiftUI

// Shared primitives built on the Theme tokens. Screens compose these instead
// of repeating icon circles, rings, stats and decorative scenery by hand.

extension View {
    /// Soft shadow levels from the Theme elevation tokens.
    @ViewBuilder
    func elevation(_ level: Theme.Elevation) -> some View {
        switch level {
        case .card:
            shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)
        case .raised:
            shadow(color: Color.black.opacity(0.10), radius: 12, x: 0, y: 6)
        case let .hero(tint):
            shadow(color: tint.opacity(0.25), radius: 14, x: 0, y: 8)
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
    var track: Color = Theme.line
    var lineWidth: CGFloat = 6
    @ViewBuilder var center: () -> Center

    var body: some View {
        ZStack {
            Circle().stroke(track, lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: CGFloat(min(max(fraction, 0), 1)))
                .stroke(tint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 0.4), value: fraction)
            center()
        }
    }
}

extension ProgressRing where Center == EmptyView {
    init(fraction: Double, tint: Color = Theme.teal, track: Color = Theme.line, lineWidth: CGFloat = 6) {
        self.init(fraction: fraction, tint: tint, track: track, lineWidth: lineWidth) { EmptyView() }
    }
}

/// Capsule call-to-action with an optional trailing note.
struct PillButtonStyle: ButtonStyle {
    var fill: Color = Theme.terracotta
    var foreground: Color = .white

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.font(.headline, weight: .semibold))
            .foregroundStyle(foreground)
            .padding(.horizontal, Theme.Spacing.l)
            .padding(.vertical, Theme.Spacing.s)
            .background(fill, in: Capsule())
            .opacity(configuration.isPressed ? 0.85 : 1)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

/// Icon, value and caption used in stat strips.
struct StatItem: View {
    let value: String
    let label: String
    let icon: String
    let tint: Color

    var body: some View {
        HStack(spacing: Theme.Spacing.xs) {
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
        HStack(spacing: Theme.Spacing.xs) {
            Text(title)
                .font(Theme.serif(.headline))
                .foregroundStyle(Theme.ink)
                .accessibilityAddTraits(.isHeader)
            Spacer(minLength: Theme.Spacing.xs)
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
