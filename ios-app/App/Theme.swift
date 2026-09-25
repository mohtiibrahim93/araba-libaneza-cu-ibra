import SwiftUI
import UIKit
import YallaCore

/// Shared visual language: cream paper, cedar green and terracotta, with
/// serif titles. Every token has a light and a dark variant.
enum Theme {
    // MARK: Surfaces
    // Light values follow the Home reference specification.
    static let canvas = Color(light: 0xF4EEE3, dark: 0x171512)
    static let surface = Color(light: 0xFAF6EE, dark: 0x23201B)
    /// Hairlines, dividers and progress-ring tracks.
    static let line = Color(light: 0xE5E0D7, dark: 0x3A352C)
    static let lineStrong = Color(light: 0xD6C9B4, dark: 0x4B443A)
    static let ringTrack = line
    /// Soft card outline (black at 4% in light mode).
    static let cardStroke = Color(light: 0x000000, dark: 0xFFFFFF).opacity(0.05)

    // MARK: Text
    static let ink = Color(light: 0x1A261B, dark: 0xF1EADF)
    /// Secondary text.
    static let muted = Color(light: 0x606557, dark: 0xB3A999)
    /// Tertiary labels.
    static let faint = Color(light: 0x8F9188, dark: 0x8E867A)

    // MARK: Brand
    /// Deep cedar, used for headers and hero cards.
    static let deep = Color(light: 0x1F4638, dark: 0x1B3A2A)
    /// Darkest cedar, the leading edge of hero gradients.
    static let cedarDeep = Color(light: 0x173A2F, dark: 0x132E22)
    /// Wordmark and emblem: deep cedar on cream, light sage on dark.
    static let brand = Color(light: 0x1F4638, dark: 0xA8D5B5)
    /// Secondary cedar green: progress and selection.
    static let teal = Color(light: 0x2A5545, dark: 0x74B893)
    static let tealShade = Color(light: 0x173A2F, dark: 0x4F8F6C)
    /// Sage surface behind green elements.
    static let mint = Color(light: 0xE5ECE3, dark: 0x243A2D)
    /// Warm highlight on deep-green surfaces.
    static let lime = Color(light: 0xF1DFAE, dark: 0xF1DFAE)
    static let terracotta = Color(light: 0xCC674F, dark: 0xE0805E)
    static let terracottaShade = Color(light: 0xAA503D, dark: 0xB4623F)
    /// Warm surface behind terracotta elements.
    static let blush = Color(light: 0xF3E4D8, dark: 0x3A2620)
    /// Stronger blush for action banners.
    static let blushStrong = Color(light: 0xF0D5C8, dark: 0x442A22)
    static let coralSoft = Color(light: 0xD7AF98, dark: 0x9C6F58)
    /// Stars and points.
    static let gold = Color(light: 0xD99555, dark: 0xE2B45A)
    static let goldShade = Color(light: 0xA97A26, dark: 0xB88A35)
    static let streak = Color(light: 0xD2643F, dark: 0xF08A5D)

    // MARK: Selection and recommendation
    /// Pale warm fill behind a selected choice.
    static let selectionFill = Color(light: 0xFBF0E8, dark: 0x3A2A22)
    /// Pale sage gradient of recommendation panels.
    static let recommendationSurface = Color(light: 0xE8EFE2, dark: 0x22362A)
    static let recommendationSurfaceEnd = Color(light: 0xDDE9D3, dark: 0x1D3024)
    /// Remaining steps in progress indicators.
    static let progressInactive = Color(light: 0xDDD9D0, dark: 0x3A352C)

    // MARK: Root Explorer
    /// Terracotta medallion at the centre of a root family.
    static let rootCore = Color(light: 0xB65436, dark: 0xC8684A)
    static let rootCoreDark = Color(light: 0x93422F, dark: 0xA0503A)
    /// Lines from the root to its family words.
    static let rootConnector = Color(light: 0xA85A3D, dark: 0xC67C5E)
    static let rootNodeSurface = Color(light: 0xFAF5EC, dark: 0x262219)
    static let rootNodeIcon = Color(light: 0xDDE7D2, dark: 0x2A4032)

    // MARK: Journey
    /// Dashed ochre path across the Journey map.
    static let journeyPath = Color(light: 0xD4A261, dark: 0xB88A4E)

    // MARK: Feedback
    static let success = Color(light: 0x2F7A61, dark: 0x74B893)
    static let successBackground = Color(light: 0xE3EEE2, dark: 0x1F3326)
    static let danger = Color(light: 0xB4413A, dark: 0xFF8A80)
    static let dangerShade = Color(light: 0x8C302B, dark: 0xC7605A)
    static let dangerBackground = Color(light: 0xF9E6E1, dark: 0x3A1F1C)
    static let variant = Color(light: 0x9A6A12, dark: 0xE2B45A)
    static let variantBackground = Color(light: 0xFBF0DC, dark: 0x3A2F1A)

    // MARK: Shape
    static let cornerRadius: CGFloat = Radius.card
    static let tileDepth: CGFloat = 3

    /// Spacing scale shared by every screen.
    enum Spacing {
        static let xxs: CGFloat = 4
        static let xs: CGFloat = 6
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        /// Horizontal screen margin (16 pt on compact widths, see `screenMargin`).
        static let screen: CGFloat = 18
        /// Gap between major sections.
        static let section: CGFloat = 14
        /// Widest readable content column.
        static let maxContentWidth: CGFloat = 520
    }

    /// Corner radii: compact chips, controls, cards and feature panels.
    enum Radius {
        static let compact: CGFloat = 10
        static let control: CGFloat = 14
        static let card: CGFloat = 18
        static let feature: CGFloat = 22
    }

    enum Elevation {
        case card
        case raised
        case hero(Color)
    }

    /// Named text roles from the Home specification. Sizes are the values at
    /// the default text size and scale with Dynamic Type (see `yallaFont`).
    enum TextRole {
        case brand, greeting, hero, section, phrase, metric
        case body, bodyStrong, caption, captionStrong, tab

        var size: CGFloat {
            switch self {
            case .brand: return 25
            case .greeting: return 32
            case .hero: return 30
            case .section: return 18
            case .phrase: return 22
            case .metric: return 21
            case .body, .bodyStrong: return 16
            case .caption, .captionStrong: return 12
            case .tab: return 11
            }
        }

        var weight: Font.Weight {
            switch self {
            case .greeting, .hero, .metric: return .bold
            case .brand, .section, .bodyStrong, .captionStrong: return .semibold
            case .phrase, .tab: return .medium
            case .body, .caption: return .regular
            }
        }

        var design: Font.Design {
            switch self {
            case .brand, .greeting, .hero, .section, .phrase, .metric: return .serif
            default: return .default
            }
        }

        /// Text style whose Dynamic Type curve this role follows.
        var relativeTo: Font.TextStyle {
            switch self {
            case .greeting, .hero: return .largeTitle
            case .brand, .phrase: return .title2
            case .metric: return .title3
            case .section: return .headline
            case .body, .bodyStrong: return .body
            case .caption, .captionStrong, .tab: return .caption
            }
        }
    }

    /// Body and control text.
    static func font(_ style: Font.TextStyle, weight: Font.Weight = .regular) -> Font {
        .system(style).weight(weight)
    }

    /// Titles and the wordmark.
    static func serif(_ style: Font.TextStyle, weight: Font.Weight = .bold) -> Font {
        .system(style, design: .serif).weight(weight)
    }
}

/// Applies a `Theme.TextRole` at its specified size, scaled with Dynamic Type.
private struct TextRoleModifier: ViewModifier {
    let role: Theme.TextRole
    @ScaledMetric private var size: CGFloat

    init(role: Theme.TextRole) {
        self.role = role
        _size = ScaledMetric(wrappedValue: role.size, relativeTo: role.relativeTo)
    }

    func body(content: Content) -> some View {
        content.font(.system(size: size, weight: role.weight, design: role.design))
    }
}

extension View {
    func yallaFont(_ role: Theme.TextRole) -> some View {
        modifier(TextRoleModifier(role: role))
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
/// The one card surface every screen uses: continuous corners, a hairline
/// outline and a soft shadow.
struct CardBackground: ViewModifier {
    var fill: Color = Theme.surface
    var radius: CGFloat = Theme.Radius.card

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(fill)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .strokeBorder(Theme.cardStroke, lineWidth: 0.75)
            )
            .elevation(.card)
    }
}

extension View {
    func cardBackground(_ fill: Color = Theme.surface, radius: CGFloat = Theme.Radius.card) -> some View {
        modifier(CardBackground(fill: fill, radius: radius))
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
    /// Home shows "libaneză" in terracotta, as in the Home reference.
    var twoTone = false

    var body: some View {
        HStack(spacing: 8) {
            CedarShape()
                .fill(Theme.brand)
                .frame(width: 36, height: 40)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 1) {
                (Text("Araba ").foregroundStyle(Theme.brand)
                    + Text("libaneză").foregroundStyle(twoTone ? Theme.terracotta : Theme.brand))
                    .yallaFont(.brand)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Text(tagline)
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
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
