import SwiftUI
import UIKit

/// Shared visual language, derived from the website game palette
/// (public/yalla/styles.css) and adapted for light and dark appearance.
enum Theme {
    // MARK: Surfaces
    static let canvas = Color(light: 0xF6F8F7, dark: 0x0C1A1B)
    static let surface = Color(light: 0xFFFFFF, dark: 0x152829)
    static let line = Color(light: 0xDAE4E2, dark: 0x2B4446)
    static let lineStrong = Color(light: 0xC3D3D0, dark: 0x3A5759)

    // MARK: Text
    static let ink = Color(light: 0x173C40, dark: 0xE6EFEE)
    static let muted = Color(light: 0x607777, dark: 0x9DB3B2)

    // MARK: Brand
    static let deep = Color(light: 0x103E40, dark: 0x0F3B3D)
    static let teal = Color(light: 0x18746A, dark: 0x3FB3A2)
    static let tealShade = Color(light: 0x0F544D, dark: 0x2A8577)
    static let mint = Color(light: 0xE7F2E9, dark: 0x173A33)
    static let lime = Color(light: 0xD8EC87, dark: 0xC5DC6E)
    static let gold = Color(light: 0xEDB95E, dark: 0xE9B458)
    static let goldShade = Color(light: 0xC8923A, dark: 0xB5832F)
    static let streak = Color(light: 0xF2701E, dark: 0xFF8A3D)

    // MARK: Feedback
    static let success = teal
    static let successBackground = Color(light: 0xE3F3EA, dark: 0x163A31)
    static let danger = Color(light: 0xB13A37, dark: 0xFF7B72)
    static let dangerShade = Color(light: 0x8A2A28, dark: 0xC25750)
    static let dangerBackground = Color(light: 0xFFF0ED, dark: 0x3A1D1C)
    static let variant = Color(light: 0x9A6A12, dark: 0xE9B458)
    static let variantBackground = Color(light: 0xFDF3E1, dark: 0x3A2F1A)

    // MARK: Shape
    static let cornerRadius: CGFloat = 16
    static let tileDepth: CGFloat = 4

    static func font(_ style: Font.TextStyle, weight: Font.Weight = .regular) -> Font {
        .system(style, design: .rounded).weight(weight)
    }
}

extension Color {
    /// Dynamic color resolved from the current light/dark trait.
    init(light: UInt32, dark: UInt32) {
        self.init(uiColor: UIColor { traits in
            UIColor(hex: traits.userInterfaceStyle == .dark ? dark : light)
        })
    }
}

private extension UIColor {
    convenience init(hex: UInt32) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}

// MARK: - Buttons

/// Large "pressable" button with a solid lower edge, used for the main lesson actions.
struct ChunkyButtonStyle: ButtonStyle {
    enum Kind {
        case primary
        case danger
        case secondary
    }

    var kind: Kind = .primary
    @Environment(\.isEnabled) private var isEnabled

    init(kind: Kind = .primary) {
        self.kind = kind
    }

    func makeBody(configuration: Configuration) -> some View {
        let pressed = configuration.isPressed && isEnabled
        return configuration.label
            .font(Theme.font(.headline, weight: .bold))
            .textCase(.uppercase)
            .kerning(0.6)
            .foregroundStyle(foreground)
            .frame(maxWidth: .infinity, minHeight: 50)
            .padding(.horizontal, 16)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous)
                    .fill(face)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous)
                            .strokeBorder(kind == .secondary && isEnabled ? Theme.line : .clear, lineWidth: 2)
                    )
            )
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous)
                    .fill(edge)
                    .offset(y: pressed ? 0 : Theme.tileDepth)
            )
            .offset(y: pressed ? Theme.tileDepth : 0)
            .padding(.bottom, Theme.tileDepth)
            .animation(.easeOut(duration: 0.08), value: pressed)
            .contentShape(Rectangle())
    }

    private var face: Color {
        guard isEnabled else { return Theme.line }
        switch kind {
        case .primary: return Theme.teal
        case .danger: return Theme.danger
        case .secondary: return Theme.surface
        }
    }

    private var edge: Color {
        guard isEnabled else { return Theme.lineStrong }
        switch kind {
        case .primary: return Theme.tealShade
        case .danger: return Theme.dangerShade
        case .secondary: return Theme.line
        }
    }

    private var foreground: Color {
        guard isEnabled else { return Theme.muted }
        switch kind {
        case .primary, .danger: return .white
        case .secondary: return Theme.teal
        }
    }
}

/// Selectable answer tile for choices, word tokens and matching pairs.
struct TileButtonStyle: ButtonStyle {
    enum Look: Equatable {
        case normal
        case selected
        case correct
        case wrong
        case muted
    }

    var state: Look = .normal
    var alignment: Alignment = .leading
    var compact = false

    func makeBody(configuration: Configuration) -> some View {
        let pressed = configuration.isPressed && state != .muted
        return configuration.label
            .font(Theme.font(compact ? .body : .headline, weight: .semibold))
            .foregroundStyle(foreground)
            .multilineTextAlignment(alignment == .center ? .center : .leading)
            .frame(maxWidth: compact ? nil : CGFloat.infinity, minHeight: compact ? 40 : 54, alignment: alignment)
            .padding(.horizontal, compact ? 14 : 16)
            .padding(.vertical, compact ? 6 : 10)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(fill)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(border, lineWidth: 2)
                    )
            )
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(border)
                    .offset(y: pressed || state == .muted ? 0 : 3)
            )
            .offset(y: pressed ? 3 : 0)
            .padding(.bottom, 3)
            .opacity(state == .muted ? 0.45 : 1)
            .animation(.easeOut(duration: 0.08), value: pressed)
            .animation(.easeInOut(duration: 0.2), value: state)
            .contentShape(Rectangle())
    }

    private var fill: Color {
        switch state {
        case .normal, .muted: return Theme.surface
        case .selected: return Theme.mint
        case .correct: return Theme.successBackground
        case .wrong: return Theme.dangerBackground
        }
    }

    private var border: Color {
        switch state {
        case .normal, .muted: return Theme.line
        case .selected: return Theme.teal
        case .correct: return Theme.success
        case .wrong: return Theme.danger
        }
    }

    private var foreground: Color {
        switch state {
        case .normal, .muted: return Theme.ink
        case .selected: return Theme.teal
        case .correct: return Theme.success
        case .wrong: return Theme.danger
        }
    }
}

// MARK: - Components

/// Thick rounded lesson progress bar.
struct LessonProgressBar: View {
    let value: Double

    var body: some View {
        GeometryReader { proxy in
            let fraction = CGFloat(min(max(value, 0), 1))
            ZStack(alignment: .leading) {
                Capsule().fill(Theme.line)
                Capsule()
                    .fill(Theme.teal)
                    .frame(width: max(proxy.size.width * fraction, fraction > 0 ? 16 : 0))
                    .overlay(alignment: .top) {
                        Capsule()
                            .fill(.white.opacity(0.25))
                            .frame(height: 4)
                            .padding(.horizontal, 8)
                            .padding(.top, 3)
                    }
            }
        }
        .frame(height: 16)
        .animation(.spring(response: 0.45, dampingFraction: 0.8), value: value)
        .accessibilityElement()
        .accessibilityLabel("Progres")
        .accessibilityValue("\(Int((min(max(value, 0), 1) * 100).rounded())) la sută")
    }
}

/// Card surface used across the redesigned screens.
struct CardBackground: ViewModifier {
    var fill: Color = Theme.surface

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous)
                    .fill(fill)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous)
                    .strokeBorder(Theme.line, lineWidth: 1.5)
            )
    }
}

extension View {
    func cardBackground(_ fill: Color = Theme.surface) -> some View {
        modifier(CardBackground(fill: fill))
    }
}

/// Wrapping row layout for word tiles.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    var lineSpacing: CGFloat = 10

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0
        var y: CGFloat = 0
        var lineHeight: CGFloat = 0
        var widest: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(ProposedViewSize(width: maxWidth, height: nil))
            if x > 0 && x + size.width > maxWidth {
                y += lineHeight + lineSpacing
                x = 0
                lineHeight = 0
            }
            x += size.width + spacing
            widest = max(widest, x - spacing)
            lineHeight = max(lineHeight, size.height)
        }
        return CGSize(width: proposal.width ?? widest, height: y + lineHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var lineHeight: CGFloat = 0
        for subview in subviews {
            let size = subview.sizeThatFits(ProposedViewSize(width: bounds.width, height: nil))
            if x > bounds.minX && x + size.width > bounds.maxX {
                y += lineHeight + lineSpacing
                x = bounds.minX
                lineHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }
    }
}

// MARK: - Rewards

/// Streak flame and XP total, shown on Home and Journey.
struct RewardBadges: View {
    let summary: RewardSummary

    var body: some View {
        HStack(spacing: 14) {
            Label("\(summary.streakDays)", systemImage: "flame.fill")
                .foregroundStyle(summary.isActiveToday ? Theme.streak : Theme.muted)
                .accessibilityLabel("Serie: \(RewardText.days(summary.streakDays))")
            Label("\(summary.totalXP)", systemImage: "bolt.fill")
                .foregroundStyle(Theme.gold)
                .accessibilityLabel("\(summary.totalXP) XP")
        }
        .font(Theme.font(.headline, weight: .heavy))
        .labelStyle(.titleAndIcon)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("rewards.badges")
    }
}

enum RewardText {
    /// Romanian plural: 1 zi, 2–19 zile, 20+ "de zile" (and 100, 200…).
    static func days(_ count: Int) -> String {
        if count == 1 { return "1 zi" }
        let lastTwo = count % 100
        if count > 0 && (lastTwo == 0 || lastTwo >= 20) { return "\(count) de zile" }
        return "\(count) zile"
    }
}
