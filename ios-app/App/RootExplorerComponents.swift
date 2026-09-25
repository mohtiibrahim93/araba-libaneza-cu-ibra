import SwiftUI
import YallaCore

// MARK: - Labels and icons

extension RootFamilyFilter {
    var title: String {
        switch self {
        case .all: return "Toate formele"
        case .verbs: return "Verbe"
        case .nouns: return "Substantive"
        case .places: return "Locuri"
        case .persons: return "Persoane"
        case .adjectives: return "Adjective"
        case .participles: return "Participii"
        case .other: return "Alte forme"
        }
    }

    var icon: YallaIcon {
        switch self {
        case .all: return .system("square.grid.2x2.fill")
        case .verbs: return .system("bolt")
        case .nouns: return .system("book")
        case .places: return .system("mappin.and.ellipse")
        case .persons: return .system("person")
        case .adjectives: return .system("paintpalette")
        case .participles: return .system("pencil.line")
        case .other: return .system("ellipsis.circle")
        }
    }
}

extension RootExplorerMember {
    /// Word-type icon; used until semantic icons exist in the content.
    var kindIcon: YallaIcon {
        RootFamilyFilter.category(for: patternKind).icon
    }

    /// Singular word-type label from the approved pattern kind.
    var partOfSpeechLabel: String? {
        switch patternKind {
        case .verbStem: return "Verb"
        case .noun: return "Substantiv"
        case .verbalNoun: return "Substantiv verbal"
        case .plural: return "Plural"
        case .placeNoun: return "Loc"
        case .agentNoun: return "Persoană"
        case .adjective: return "Adjectiv"
        case .participle: return "Participiu"
        case .other: return "Altă formă"
        case nil: return nil
        }
    }
}

// MARK: - Title bar

struct RootExplorerTitleBar: View {
    let title: String
    let subtitle: String
    let onBack: () -> Void
    let onHowItWorks: () -> Void

    var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .top, spacing: Theme.Spacing.md) {
                backButton
                titles
                Spacer(minLength: 0)
                HowItWorksButton(action: onHowItWorks)
            }
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                HStack(alignment: .top, spacing: Theme.Spacing.md) {
                    backButton
                    titles
                }
                HowItWorksButton(action: onHowItWorks)
            }
        }
    }

    private var backButton: some View {
        CircularIconButton(
            icon: .system("chevron.left"),
            accessibilityLabel: "Înapoi",
            tint: Theme.ink,
            fill: Theme.surface,
            diameter: 44,
            action: onBack
        )
        .elevation(.card)
        .accessibilityIdentifier("root.back")
    }

    private var titles: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
            Text(title)
                .yallaFont(.hero)
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(.isHeader)
            Text(subtitle)
                .yallaFont(.caption)
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

struct HowItWorksButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label("Cum funcționează?", systemImage: "lightbulb")
                .yallaFont(.captionStrong)
                .foregroundStyle(Theme.terracottaShade)
                .padding(.horizontal, Theme.Spacing.md)
                .frame(minHeight: 44)
                .background(Theme.blush, in: Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("root.help")
    }
}

// MARK: - Graph nodes

struct RootCoreNode: View {
    let latinRoot: String
    let arabicRoot: String?

    /// Radicals are shown spaced, as a root rather than a word.
    private var spacedArabic: String? {
        arabicRoot.map { $0.map(String.init).joined(separator: " ") }
    }

    /// Fills the size its parent proposes (the graph layout decides it).
    var body: some View {
        GeometryReader { proxy in
            medallion(diameter: min(proxy.size.width, proxy.size.height))
                .frame(width: proxy.size.width, height: proxy.size.height)
        }
        .aspectRatio(1, contentMode: .fit)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Rădăcina \(latinRoot.map(String.init).joined(separator: " "))")
        .accessibilityValue(arabicRoot ?? "")
        .accessibilityIdentifier("root.core")
    }

    private func medallion(diameter: CGFloat) -> some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Theme.rootCore, Theme.rootCoreDark],
                        center: .center,
                        startRadius: 0,
                        endRadius: diameter * 0.6
                    )
                )
            CompassStarShape()
                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                .padding(diameter * 0.08)
            Circle()
                .strokeBorder(Color.white.opacity(0.18), lineWidth: 1)
                .padding(diameter * 0.06)

            VStack(spacing: 2) {
                if let spacedArabic {
                    Text(spacedArabic)
                        .font(.system(size: diameter * 0.2, weight: .semibold))
                        .environment(\.layoutDirection, .rightToLeft)
                }
                Text(latinRoot)
                    .font(.system(size: diameter * 0.16, weight: .bold, design: .serif))
                Text("rădăcină")
                    .font(.system(size: diameter * 0.085))
                    .opacity(0.85)
            }
            .foregroundStyle(.white)
            .lineLimit(1)
            .minimumScaleFactor(0.7)
            .padding(diameter * 0.14)
        }
        .frame(width: diameter, height: diameter)
        .overlay(Circle().strokeBorder(Theme.rootCoreDark, lineWidth: 1.5))
        .shadow(color: Theme.rootCoreDark.opacity(0.25), radius: 10, x: 0, y: 5)
    }
}

struct RootWordNode: View {
    let member: RootExplorerMember
    let isSelected: Bool
    let rootLabel: String
    let onSelect: () -> Void

    static let iconDiameter: CGFloat = 40

    var body: some View {
        Button(action: onSelect) {
            VStack(spacing: 3) {
                Text(member.label)
                    .yallaFont(.section)
                    .foregroundStyle(Theme.ink)
                if let arabic = member.arabicScript {
                    Text(arabic)
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Theme.terracottaShade)
                        .environment(\.layoutDirection, .rightToLeft)
                }
                if let meaning = member.meaning {
                    Text(meaning)
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                        .lineLimit(2)
                }
            }
            .multilineTextAlignment(.center)
            .lineLimit(1)
            .minimumScaleFactor(0.75)
            .padding(.top, Self.iconDiameter / 2 + 4)
            .padding(.horizontal, Theme.Spacing.sm)
            .padding(.bottom, Theme.Spacing.sm)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(Theme.rootNodeSurface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .strokeBorder(isSelected ? Theme.deep : Theme.lineStrong, lineWidth: isSelected ? 1.5 : 0.75)
            )
            .shadow(color: .black.opacity(isSelected ? 0.08 : 0.04), radius: isSelected ? 10 : 6, x: 0, y: 3)
            .overlay(alignment: .top) {
                YallaIconView(member.kindIcon)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(Theme.deep)
                    .frame(width: Self.iconDiameter, height: Self.iconDiameter)
                    .background(Theme.rootNodeIcon, in: Circle())
                    .overlay(Circle().strokeBorder(Theme.surface, lineWidth: 2))
                    .offset(y: -Self.iconDiameter / 2)
                    .accessibilityHidden(true)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(NodeButtonStyle())
        .accessibilityLabel(member.label)
        .accessibilityValue(accessibilityValue)
        .accessibilityHint("Selectează pentru detalii")
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : [.isButton])
        .accessibilityIdentifier("root.node")
    }

    private var accessibilityValue: String {
        let parts = [member.meaning, member.partOfSpeechLabel, "Cuvânt din familia \(rootLabel)."]
        return parts.compactMap { $0 }.joined(separator: ". ")
    }
}

// MARK: - Graph geometry

/// Positions of the root and its family around it for a given width. Shared
/// by the node layout and the connector canvas so both always agree.
struct RootGraphGeometry {
    /// Half of `RootWordNode.iconDiameter`; the icon circle sits above the card.
    static let iconOverlap: CGFloat = 20

    let rootDiameter: CGFloat
    let nodeSize: CGSize
    let rootCenter: CGPoint
    let centers: [CGPoint]
    let height: CGFloat

    init(width: CGFloat, slots: [RootGraphSlot], nodeHeight: CGFloat) {
        let rootDiameter = min(max(width * 0.36, 118), 156)
        let nodeWidth = min(140, max(88, (width - rootDiameter - 24) / 2))
        let nodeSize = CGSize(width: nodeWidth, height: nodeHeight)
        let overlap = Self.iconOverlap
        let gap: CGFloat = 26

        let rootY: CGFloat
        if slots.contains(.top) {
            rootY = overlap + nodeHeight + gap + rootDiameter / 2
        } else if slots.contains(.upperLeading) {
            rootY = overlap + nodeHeight / 2 + rootDiameter * 0.3
        } else {
            rootY = rootDiameter / 2 + 8
        }
        let upperY = rootY - rootDiameter * 0.3
        let lowerY = slots.contains(.upperLeading)
            ? max(upperY + nodeHeight + overlap + 12, rootY + rootDiameter * 0.35)
            : rootY + rootDiameter * 0.35
        let bottomY = rootY + rootDiameter / 2 + gap + overlap + nodeHeight / 2

        let leadingX = nodeWidth / 2
        let trailingX = width - nodeWidth / 2
        let centers = slots.map { slot -> CGPoint in
            switch slot {
            case .top: return CGPoint(x: width / 2, y: overlap + nodeHeight / 2)
            case .upperLeading: return CGPoint(x: leadingX, y: upperY)
            case .upperTrailing: return CGPoint(x: trailingX, y: upperY)
            case .lowerLeading: return CGPoint(x: leadingX, y: lowerY)
            case .lowerTrailing: return CGPoint(x: trailingX, y: lowerY)
            case .bottom: return CGPoint(x: width / 2, y: bottomY)
            }
        }

        let nodesBottom = centers.map { $0.y + nodeHeight / 2 }.max() ?? 0
        self.rootDiameter = rootDiameter
        self.nodeSize = nodeSize
        self.rootCenter = CGPoint(x: width / 2, y: rootY)
        self.centers = centers
        self.height = max(nodesBottom, rootY + rootDiameter / 2) + 8
    }

    /// Where the line from the root centre towards `center` meets the node's
    /// card edge.
    func nodeEdgePoint(towards center: CGPoint) -> CGPoint {
        let dx = rootCenter.x - center.x
        let dy = rootCenter.y - center.y
        let halfW = nodeSize.width / 2
        let halfH = nodeSize.height / 2
        let scaleX = dx == 0 ? CGFloat.infinity : halfW / abs(dx)
        let scaleY = dy == 0 ? CGFloat.infinity : halfH / abs(dy)
        let scale = min(scaleX, scaleY, 1)
        return CGPoint(x: center.x + dx * scale, y: center.y + dy * scale)
    }

    func rootEdgePoint(towards center: CGPoint) -> CGPoint {
        let dx = center.x - rootCenter.x
        let dy = center.y - rootCenter.y
        let length = max(sqrt(dx * dx + dy * dy), 0.001)
        let radius = rootDiameter / 2 + 4
        return CGPoint(x: rootCenter.x + dx / length * radius, y: rootCenter.y + dy / length * radius)
    }
}

/// Places the root (first subview) and the family nodes (remaining subviews,
/// in slot order) using `RootGraphGeometry`.
struct RootGraphLayout: Layout {
    let slots: [RootGraphSlot]
    let nodeHeight: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 390
        return CGSize(width: width, height: RootGraphGeometry(width: width, slots: slots, nodeHeight: nodeHeight).height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let geometry = RootGraphGeometry(width: bounds.width, slots: slots, nodeHeight: nodeHeight)
        guard let root = subviews.first else { return }
        root.place(
            at: CGPoint(x: bounds.minX + geometry.rootCenter.x, y: bounds.minY + geometry.rootCenter.y),
            anchor: .center,
            proposal: ProposedViewSize(width: geometry.rootDiameter, height: geometry.rootDiameter)
        )
        for (index, subview) in subviews.dropFirst().enumerated() where index < geometry.centers.count {
            let center = geometry.centers[index]
            subview.place(
                at: CGPoint(x: bounds.minX + center.x, y: bounds.minY + center.y),
                anchor: .center,
                proposal: ProposedViewSize(geometry.nodeSize)
            )
        }
    }
}

/// Connector lines and quiet decoration behind the graph. Never interactive.
struct RootGraphBackground: View {
    let slots: [RootGraphSlot]
    let nodeHeight: CGFloat

    var body: some View {
        GeometryReader { proxy in
            let geometry = RootGraphGeometry(width: proxy.size.width, slots: slots, nodeHeight: nodeHeight)
            ZStack {
                // Faint arabesque stand-in: concentric rings and a star.
                ForEach(1..<4) { ring in
                    Circle()
                        .stroke(Theme.lineStrong.opacity(0.35), lineWidth: 0.75)
                        .frame(
                            width: geometry.rootDiameter * (1 + CGFloat(ring) * 0.45),
                            height: geometry.rootDiameter * (1 + CGFloat(ring) * 0.45)
                        )
                        .position(geometry.rootCenter)
                }
                CompassStarShape()
                    .stroke(Theme.lineStrong.opacity(0.35), lineWidth: 0.75)
                    .frame(width: geometry.rootDiameter * 2.1, height: geometry.rootDiameter * 2.1)
                    .position(geometry.rootCenter)
                CedarShape()
                    .fill(Theme.brand.opacity(0.07))
                    .frame(width: 70, height: 78)
                    .position(x: proxy.size.width - 36, y: 44)

                Canvas { context, _ in
                    for center in geometry.centers {
                        let start = geometry.rootEdgePoint(towards: center)
                        let end = geometry.nodeEdgePoint(towards: center)
                        var line = Path()
                        line.move(to: start)
                        line.addLine(to: end)
                        context.stroke(line, with: .color(Theme.rootConnector.opacity(0.8)), lineWidth: 2.5)
                        let dot = CGRect(x: start.x - 4, y: start.y - 4, width: 8, height: 8)
                        context.fill(Path(ellipseIn: dot), with: .color(Theme.rootConnector))
                    }
                }
            }
        }
        .accessibilityHidden(true)
        .allowsHitTesting(false)
    }
}

// MARK: - Filters

struct RootFilterChip: View {
    let title: String
    let icon: YallaIcon?
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.xs) {
                if let icon {
                    YallaIconView(icon)
                        .font(.system(size: 13, weight: .semibold))
                        .accessibilityHidden(true)
                }
                Text(title)
                    .yallaFont(.captionStrong)
            }
            .foregroundStyle(isSelected ? Color.white : Theme.ink)
            .padding(.horizontal, 14)
            .frame(minHeight: 44)
            .background(isSelected ? Theme.deep : Theme.surface, in: Capsule())
            .overlay(Capsule().strokeBorder(isSelected ? Color.clear : Theme.line, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityIdentifier("root.filter")
    }
}

struct RootCategoryFilterBar: View {
    let filters: [RootFamilyFilter]
    let selected: RootFamilyFilter
    let onSelect: (RootFamilyFilter) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.sm) {
                ForEach(filters, id: \.self) { filter in
                    RootFilterChip(
                        title: filter.title,
                        icon: filter.icon,
                        isSelected: filter == selected,
                        action: { onSelect(filter) }
                    )
                }
            }
            .padding(.vertical, 2)
        }
        .scrollClipDisabled()
    }
}

// MARK: - Detail card

struct PartOfSpeechBadge: View {
    let label: String

    var body: some View {
        Text(label)
            .yallaFont(.captionStrong)
            .foregroundStyle(Theme.terracottaShade)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Theme.blush, in: Capsule())
    }
}

/// Selected family word. Image, audio and example appear only when the
/// content provides them.
struct RootWordDetailCard<Actions: View>: View {
    let member: RootExplorerMember
    let isSaved: Bool
    let isPlaying: Bool
    let onToggleSaved: () -> Void
    let onPlayAudio: (() -> Void)?
    @ViewBuilder var actions: () -> Actions

    var body: some View {
        ViewThatFits(in: .horizontal) {
            content
                .padding(.leading, 128)
                .background(alignment: .leading) {
                    artwork.frame(width: 128)
                }
            VStack(alignment: .leading, spacing: 0) {
                artwork.frame(height: 110)
                content
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 19, style: .continuous))
        .cardBackground(radius: 19)
    }

    /// Word-type panel standing in for per-word artwork.
    private var artwork: some View {
        ZStack {
            LinearGradient(
                colors: [Theme.recommendationSurface, Theme.recommendationSurfaceEnd],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            CedarShape()
                .fill(Theme.brand.opacity(0.08))
                .frame(width: 90, height: 100)
                .offset(x: 24, y: 30)
            YallaIconView(member.kindIcon)
                .font(.system(size: 38, weight: .regular))
                .foregroundStyle(Theme.deep)
        }
        .accessibilityHidden(true)
    }

    private var content: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.sm) {
                    Text(member.label)
                        .yallaFont(.phrase)
                        .foregroundStyle(Theme.ink)
                    if let arabic = member.arabicScript {
                        Text(arabic)
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(Theme.terracottaShade)
                            .environment(\.layoutDirection, .rightToLeft)
                    }
                    if let onPlayAudio {
                        CircularIconButton(
                            icon: .system(isPlaying ? "stop.fill" : "speaker.wave.2.fill"),
                            accessibilityLabel: isPlaying ? "Oprește redarea" : "Redă pronunția pentru \(member.label)",
                            tint: Theme.deep,
                            fill: Theme.mint,
                            diameter: 30,
                            action: onPlayAudio
                        )
                    }
                    Spacer(minLength: 0)
                }
                if let pos = member.partOfSpeechLabel {
                    PartOfSpeechBadge(label: pos)
                }
                if let meaning = member.meaning {
                    Text(meaning)
                        .yallaFont(.body)
                        .foregroundStyle(Theme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            ViewThatFits(in: .horizontal) {
                HStack(spacing: Theme.Spacing.sm) { saveButton; actions() }
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) { saveButton; actions() }
            }
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var saveButton: some View {
        Button(action: onToggleSaved) {
            Label(isSaved ? "Salvat" : "Salvează", systemImage: isSaved ? "bookmark.fill" : "bookmark")
                .yallaFont(.captionStrong)
                .foregroundStyle(Theme.deep)
                .padding(.horizontal, 14)
                .frame(minHeight: 44)
                .background(Theme.surface, in: Capsule())
                .overlay(Capsule().strokeBorder(Theme.lineStrong, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("root.detail.save")
    }
}

// MARK: - Help

struct RootHowItWorksSheet: View {
    @Environment(\.dismiss) private var dismiss

    private let points: [(icon: String, text: String)] = [
        ("character.book.closed", "În arabă, multe cuvinte pornesc de la o rădăcină: un grup de consoane, de obicei trei, legat de o idee. De exemplu, K-T-B este legată de scris."),
        ("square.stack.3d.up", "Vocalele și tiparele din jurul consoanelor formează cuvinte diferite: un verb, un loc, o persoană sau un obiect."),
        ("exclamationmark.bubble", "Cuvintele din aceeași familie au adesea un sens înrudit, dar sensul nu se poate ghici mereu din rădăcină. Învață fiecare cuvânt cu sensul lui."),
        ("hand.tap", "Atinge un cuvânt din jurul rădăcinii ca să-i vezi sensul și tipul. Filtrele arată doar verbele, locurile sau alte tipuri de cuvinte."),
        ("checkmark.seal", "Familiile afișate sunt cele aprobate de profesor. Nu sunt o analiză etimologică completă.")
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    ForEach(points, id: \.text) { point in
                        HStack(alignment: .top, spacing: Theme.Spacing.md) {
                            Image(systemName: point.icon)
                                .font(.title3)
                                .foregroundStyle(Theme.terracotta)
                                .frame(width: 28)
                                .accessibilityHidden(true)
                            Text(point.text)
                                .yallaFont(.body)
                                .foregroundStyle(Theme.ink)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
                .padding(Theme.Spacing.xl)
            }
            .background(Theme.canvas.ignoresSafeArea())
            .navigationTitle("Cum funcționează?")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Am înțeles") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}
