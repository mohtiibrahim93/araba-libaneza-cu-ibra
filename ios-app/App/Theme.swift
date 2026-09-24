import SwiftUI
import UIKit
import YallaCore

/// Shared visual language: cream paper, cedar green and terracotta, with
/// serif titles. Every token has a light and a dark variant.
enum Theme {
    // MARK: Surfaces
    static let canvas = Color(light: 0xF5EFE4, dark: 0x171512)
    static let surface = Color(light: 0xFFFCF6, dark: 0x23201B)
    static let line = Color(light: 0xE8DFD0, dark: 0x3A352C)
    static let lineStrong = Color(light: 0xD6C9B4, dark: 0x4B443A)

    // MARK: Text
    static let ink = Color(light: 0x2A2621, dark: 0xF1EADF)
    static let muted = Color(light: 0x7C7265, dark: 0xB3A999)

    // MARK: Brand
    /// Deep cedar, used for headers and hero cards.
    static let deep = Color(light: 0x1F4A34, dark: 0x1B3A2A)
    /// Cedar green: primary actions, progress and selection.
    static let teal = Color(light: 0x2D6A4A, dark: 0x74B893)
    static let tealShade = Color(light: 0x1F4E36, dark: 0x4F8F6C)
    /// Sage tint behind green elements.
    static let mint = Color(light: 0xE4EDE3, dark: 0x243A2D)
    /// Warm highlight on deep-green surfaces.
    static let lime = Color(light: 0xF1DFAE, dark: 0xF1DFAE)
    static let terracotta = Color(light: 0xC4613F, dark: 0xE0805E)
    static let terracottaShade = Color(light: 0x9C4A2F, dark: 0xB4623F)
    /// Blush tint behind terracotta elements.
    static let blush = Color(light: 0xF6E4DA, dark: 0x3A2620)
    static let gold = Color(light: 0xD9A441, dark: 0xE2B45A)
    static let goldShade = Color(light: 0xA97A26, dark: 0xB88A35)
    static let streak = Color(light: 0xD2643F, dark: 0xF08A5D)

    // MARK: Feedback
    static let success = teal
    static let successBackground = Color(light: 0xE3EEE2, dark: 0x1F3326)
    static let danger = Color(light: 0xB4413A, dark: 0xFF8A80)
    static let dangerShade = Color(light: 0x8C302B, dark: 0xC7605A)
    static let dangerBackground = Color(light: 0xF9E6E1, dark: 0x3A1F1C)
    static let variant = Color(light: 0x9A6A12, dark: 0xE2B45A)
    static let variantBackground = Color(light: 0xFBF0DC, dark: 0x3A2F1A)

    // MARK: Shape
    static let cornerRadius: CGFloat = 18
    static let tileDepth: CGFloat = 3

    /// Body and control text.
    static func font(_ style: Font.TextStyle, weight: Font.Weight = .regular) -> Font {
        .system(style).weight(weight)
    }

    /// Titles and the wordmark.
    static func serif(_ style: Font.TextStyle, weight: Font.Weight = .bold) -> Font {
        .system(style, design: .serif).weight(weight)
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
        case accent
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
            .font(Theme.font(.headline, weight: .semibold))
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
        case .accent: return Theme.terracotta
        case .danger: return Theme.danger
        case .secondary: return Theme.surface
        }
    }

    private var edge: Color {
        guard isEnabled else { return Theme.lineStrong }
        switch kind {
        case .primary: return Theme.tealShade
        case .accent: return Theme.terracottaShade
        case .danger: return Theme.dangerShade
        case .secondary: return Theme.line
        }
    }

    private var foreground: Color {
        guard isEnabled else { return Theme.muted }
        switch kind {
        case .primary, .accent, .danger: return .white
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
                    .strokeBorder(Theme.line, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)
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


// MARK: - Brand

/// Cedar silhouette from the app icon artwork (Design/AppIcon.svg).
struct CedarShape: Shape {
    func path(in rect: CGRect) -> Path {
        // Source coordinates span x 276...748 and y 266...690.
        let points: [(CGFloat, CGFloat)] = [
            (512, 266), (596, 366), (560, 366), (652, 446), (602, 446), (714, 534),
            (646, 534), (748, 614), (538, 614), (538, 690), (486, 690), (486, 614),
            (276, 614), (378, 534), (310, 534), (422, 446), (372, 446), (464, 366), (428, 366)
        ]
        let scale = min(rect.width / 472, rect.height / 424)
        let offsetX = rect.minX + (rect.width - 472 * scale) / 2
        let offsetY = rect.minY + (rect.height - 424 * scale) / 2
        var path = Path()
        for (index, point) in points.enumerated() {
            let mapped = CGPoint(x: offsetX + (point.0 - 276) * scale, y: offsetY + (point.1 - 266) * scale)
            if index == 0 { path.move(to: mapped) } else { path.addLine(to: mapped) }
        }
        path.closeSubpath()
        return path
    }
}

/// Cedar emblem, serif wordmark and tagline.
struct BrandHeader: View {
    var tagline = "Vorbește. Cunoaște. Trăiește Libanul."

    var body: some View {
        HStack(spacing: 12) {
            CedarShape()
                .fill(Theme.deep)
                .frame(width: 40, height: 38)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 1) {
                Text("Araba libaneză")
                    .font(Theme.serif(.title2))
                    .foregroundStyle(Theme.deep)
                Text(tagline)
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

/// Warm cream background and cards for grouped lists.
struct CreamListStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .scrollContentBackground(.hidden)
            .background(Theme.canvas.ignoresSafeArea())
    }
}

extension View {
    func creamList() -> some View {
        modifier(CreamListStyle())
    }
}
