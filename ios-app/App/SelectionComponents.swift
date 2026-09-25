import SwiftUI

// Selectable cards and the layout that arranges them. Parents own the
// selection state; these views only draw it and report taps.

enum SelectionIndicatorStyle {
    case radio
    case check
}

/// Radio ring or check disc. Hidden from VoiceOver: the card announces state.
struct SelectionIndicator: View {
    let isSelected: Bool
    var style: SelectionIndicatorStyle = .radio
    var tint: Color = Theme.terracotta

    var body: some View {
        Group {
            switch style {
            case .radio:
                Circle()
                    .strokeBorder(isSelected ? tint : Theme.lineStrong, lineWidth: 1.5)
                    .frame(width: 19, height: 19)
                    .overlay {
                        if isSelected {
                            Circle().fill(tint).frame(width: 9, height: 9)
                        }
                    }
            case .check:
                ZStack {
                    Circle()
                        .fill(isSelected ? tint : Theme.surface.opacity(0.9))
                    Circle()
                        .strokeBorder(isSelected ? tint : Theme.lineStrong, lineWidth: 1.5)
                    if isSelected {
                        Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .frame(width: 23, height: 23)
            }
        }
        .accessibilityHidden(true)
    }
}

/// Shared outline and fill for selectable cards.
private struct SelectableCardBackground: ViewModifier {
    let isSelected: Bool
    var radius: CGFloat = 15

    func body(content: Content) -> some View {
        content
            .background(
                isSelected ? Theme.selectionFill : Theme.surface,
                in: RoundedRectangle(cornerRadius: radius, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .strokeBorder(isSelected ? Theme.terracotta : Theme.cardStroke, lineWidth: isSelected ? 1.5 : 0.75)
            )
            .shadow(color: .black.opacity(isSelected ? 0.07 : 0.045), radius: isSelected ? 10 : 8, x: 0, y: 3)
    }
}

extension View {
    fileprivate func selectableCard(_ isSelected: Bool, radius: CGFloat = 15) -> some View {
        modifier(SelectableCardBackground(isSelected: isSelected, radius: radius))
    }
}

/// One choice among several: a compact centred tile, or a full-width row.
struct SingleSelectOptionCard: View {
    enum Layout {
        case tile
        case row
    }

    var icon: YallaIcon? = nil
    var iconTint: Color = Theme.teal
    let title: String
    var subtitle: String? = nil
    let isSelected: Bool
    var layout: Layout = .tile
    let action: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Button(action: action) {
            Group {
                switch layout {
                case .tile: tile
                case .row: row
                }
            }
            .selectableCard(isSelected)
            .contentShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
            .animation(reduceMotion ? nil : .easeInOut(duration: 0.18), value: isSelected)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityHint(subtitle ?? "")
        .accessibilityValue(isSelected ? "Selectat" : "Neselectat")
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }

    private var tile: some View {
        VStack(spacing: Theme.Spacing.xs) {
            if let icon {
                YallaIconView(icon)
                    .font(.system(size: 26, weight: .regular))
                    .foregroundStyle(iconTint)
                    .frame(height: 30)
            }
            Text(title)
                .font(Theme.serif(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.ink)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            if let subtitle {
                Text(subtitle)
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: Theme.Spacing.xs)
            SelectionIndicator(isSelected: isSelected)
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var row: some View {
        HStack(spacing: Theme.Spacing.md) {
            SelectionIndicator(isSelected: isSelected)
            if let icon {
                YallaIconView(icon)
                    .font(.system(size: 20))
                    .foregroundStyle(iconTint)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .yallaFont(.bodyStrong)
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if let subtitle {
                    Text(subtitle)
                        .font(Theme.font(.caption))
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.md)
        .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
    }
}

/// Illustrated choice that can be combined with others.
struct MultiSelectIllustratedCard: View {
    let imageName: String
    let title: String
    let subtitle: String
    let isSelected: Bool
    let action: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 0) {
                Color.clear
                    .frame(height: 84)
                    .overlay {
                        Image(imageName)
                            .resizable()
                            .scaledToFill()
                    }
                    .clipped()
                    .mask(LinearGradient(stops: [
                        .init(color: .black, location: 0.0),
                        .init(color: .black, location: 0.8),
                        .init(color: .clear, location: 1.0)
                    ], startPoint: .top, endPoint: .bottom))
                    .overlay(alignment: .topTrailing) {
                        SelectionIndicator(isSelected: isSelected, style: .check)
                            .padding(Theme.Spacing.sm)
                    }
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(Theme.serif(.subheadline, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(subtitle)
                        .font(Theme.font(.caption))
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.top, Theme.Spacing.sm)
                .padding(.bottom, Theme.Spacing.md)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .clipShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
            .selectableCard(isSelected)
            .contentShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
            .animation(reduceMotion ? nil : .easeInOut(duration: 0.18), value: isSelected)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityHint(subtitle)
        .accessibilityValue(isSelected ? "Selectat" : "Neselectat")
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }
}

/// Grid whose column count follows the available width: up to
/// `preferredColumns`, never narrower than `minimumCardWidth`, one column at
/// accessibility text sizes. Cards in a row share the row's height.
struct AdaptiveChoiceGrid<Content: View>: View {
    let preferredColumns: Int
    let minimumCardWidth: CGFloat
    var spacing: CGFloat = Theme.Spacing.sm
    @ViewBuilder var content: () -> Content

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        AdaptiveGridLayout(
            preferredColumns: dynamicTypeSize.isAccessibilitySize ? 1 : preferredColumns,
            minimumCardWidth: minimumCardWidth,
            spacing: spacing
        ) {
            content()
        }
    }
}

private struct AdaptiveGridLayout: Layout {
    let preferredColumns: Int
    let minimumCardWidth: CGFloat
    let spacing: CGFloat

    private func columnCount(for width: CGFloat) -> Int {
        let fitting = Int((width + spacing) / (minimumCardWidth + spacing))
        return max(1, min(preferredColumns, fitting))
    }

    private func metrics(width: CGFloat, subviews: Subviews) -> (columns: Int, columnWidth: CGFloat, rowHeights: [CGFloat]) {
        let columns = columnCount(for: width)
        let columnWidth = (width - spacing * CGFloat(columns - 1)) / CGFloat(columns)
        var rowHeights: [CGFloat] = []
        var index = 0
        while index < subviews.count {
            let end = min(index + columns, subviews.count)
            let height = (index..<end)
                .map { subviews[$0].sizeThatFits(ProposedViewSize(width: columnWidth, height: nil)).height }
                .max() ?? 0
            rowHeights.append(height)
            index = end
        }
        return (columns, columnWidth, rowHeights)
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width
            ?? minimumCardWidth * CGFloat(preferredColumns) + spacing * CGFloat(preferredColumns - 1)
        let layout = metrics(width: width, subviews: subviews)
        let height = layout.rowHeights.reduce(0, +) + spacing * CGFloat(max(layout.rowHeights.count - 1, 0))
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let layout = metrics(width: bounds.width, subviews: subviews)
        var y = bounds.minY
        for (row, height) in layout.rowHeights.enumerated() {
            for column in 0..<layout.columns {
                let index = row * layout.columns + column
                guard index < subviews.count else { break }
                let x = bounds.minX + CGFloat(column) * (layout.columnWidth + spacing)
                subviews[index].place(
                    at: CGPoint(x: x, y: y),
                    proposal: ProposedViewSize(width: layout.columnWidth, height: height)
                )
            }
            y += height + spacing
        }
    }
}

/// Numbered terracotta marker, question title and optional helper line.
struct QuestionSectionHeader: View {
    var number: Int? = nil
    let title: String
    var helper: String? = nil

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            if let number {
                Text("\(number)")
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 30, height: 30)
                    .background(Theme.terracotta, in: Circle())
                    .accessibilityHidden(true)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.serif(.headline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if let helper {
                    Text(helper)
                        .font(Theme.font(.footnote))
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.top, number == nil ? 0 : 4)
        }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}
