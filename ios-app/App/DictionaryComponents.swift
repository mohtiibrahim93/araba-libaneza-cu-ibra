import SwiftUI
import YallaCore

// MARK: - Save mark

/// Cedar-shaped save mark: outline when not saved, filled when saved.
struct CedarBookmark: View {
    let isSaved: Bool
    var height: CGFloat = 22
    var tint: Color = Theme.terracotta

    var body: some View {
        ZStack {
            if isSaved {
                CedarShape().fill(tint)
            } else {
                CedarShape().stroke(tint, style: StrokeStyle(lineWidth: 1.5, lineJoin: .round))
            }
        }
        .frame(width: height * 0.9, height: height)
        .accessibilityHidden(true)
    }
}

/// 44 pt save control with the cedar mark.
struct CedarSaveButton: View {
    let isSaved: Bool
    let itemLabel: String
    var filledBackground = true
    let action: () -> Void

    private var accessibilityTitle: String {
        isSaved ? "Elimină \(itemLabel) din salvate" : "Salvează \(itemLabel)"
    }

    var body: some View {
        Button(action: action) {
            CedarBookmark(isSaved: isSaved)
                .frame(width: 44, height: 44)
                .background(filledBackground ? Theme.blush : Color.clear, in: Circle())
                .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(accessibilityTitle)
        .accessibilityIdentifier("dictionary.save")
    }
}

// MARK: - Entry card

/// Main dictionary entry: word, level, save, meaning and lesson examples.
/// Arabic, audio and notes appear only when the content has them.
struct DictionaryEntryCard<Footer: View>: View {
    let entry: DictionaryEntrySummary
    let examples: [DictionaryEntrySummary]
    let isSaved: Bool
    let isPlaying: Bool
    let onToggleSaved: () -> Void
    let onPlayAudio: (() -> Void)?
    @ViewBuilder var footer: () -> Footer

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack(alignment: .top, spacing: Theme.Spacing.md) {
                if let onPlayAudio {
                    CircularIconButton(
                        icon: .system(isPlaying ? "stop.fill" : "speaker.wave.2.fill"),
                        accessibilityLabel: isPlaying ? "Oprește redarea" : "Redă pronunția pentru \(entry.arabizi)",
                        tint: Theme.brand,
                        fill: Theme.mint,
                        diameter: 40,
                        action: onPlayAudio
                    )
                }
                VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                    AdaptiveRow(spacing: Theme.Spacing.sm) {
                        Text(entry.arabizi)
                            .yallaFont(.hero)
                            .foregroundStyle(Theme.ink)
                            .fixedSize(horizontal: false, vertical: true)
                        if let level = entry.levels.first {
                            PartOfSpeechBadge(label: level.rawValue.uppercased())
                                .accessibilityLabel("Nivel \(level.rawValue.uppercased())")
                        }
                    }
                    if let arabic = entry.arabicScript {
                        Text(arabic)
                            .font(.title2)
                            .foregroundStyle(Theme.ink)
                            .environment(\.layoutDirection, .rightToLeft)
                    }
                }
                Spacer(minLength: 0)
                CedarSaveButton(isSaved: isSaved, itemLabel: entry.arabizi, action: onToggleSaved)
            }

            VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                sectionLabel("Sens")
                Text(entry.meaning)
                    .yallaFont(.body)
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if let literal = entry.literalMeaning {
                    Text("Literal: \(literal)")
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                }
                if let pragmatic = entry.pragmaticMeaning {
                    Text(pragmatic)
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                }
            }

            if !examples.isEmpty {
                Divider().overlay(Theme.line)
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    sectionLabel("Exemple din lecții")
                    ForEach(examples) { example in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(example.arabizi)
                                .yallaFont(.bodyStrong)
                                .foregroundStyle(Theme.ink)
                            Text(example.meaning)
                                .yallaFont(.caption)
                                .foregroundStyle(Theme.muted)
                        }
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityElement(children: .combine)
                    }
                }
            }

            footer()
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground(radius: 19)
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .yallaFont(.captionStrong)
            .foregroundStyle(Theme.terracottaShade)
            .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Lists

/// One dictionary row: word, meaning and the cedar save mark.
struct DictionaryResultRow<Destination: View>: View {
    let entry: DictionaryEntrySummary
    let isSaved: Bool
    let onToggleSaved: () -> Void
    @ViewBuilder var destination: () -> Destination

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            NavigationLink {
                destination()
            } label: {
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: Theme.Spacing.sm) {
                        Text(entry.arabizi)
                            .yallaFont(.bodyStrong)
                            .foregroundStyle(Theme.ink)
                        if let arabic = entry.arabicScript {
                            Text(arabic)
                                .foregroundStyle(Theme.muted)
                        }
                    }
                    Text(entry.meaning)
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            CedarSaveButton(isSaved: isSaved, itemLabel: entry.arabizi, filledBackground: false, action: onToggleSaved)
        }
        .padding(.leading, Theme.Spacing.lg)
        .padding(.trailing, Theme.Spacing.xs)
        .padding(.vertical, Theme.Spacing.xs)
    }
}

/// Titled card of dictionary rows ("Expresii similare", "Alte rezultate"…).
struct DictionaryListCard<Destination: View>: View {
    let title: String
    let icon: String
    var count: Int? = nil
    let entries: [DictionaryEntrySummary]
    let isSaved: (DictionaryEntrySummary) -> Bool
    let onToggleSaved: (DictionaryEntrySummary) -> Void
    @ViewBuilder var destination: (DictionaryEntrySummary) -> Destination

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Label(title, systemImage: icon)
                    .yallaFont(.section)
                    .foregroundStyle(Theme.ink)
                    .labelStyle(TintedIconLabelStyle(tint: Theme.gold))
                    .accessibilityAddTraits(.isHeader)
                Spacer()
                if let count {
                    Text("\(count)")
                        .yallaFont(.captionStrong)
                        .foregroundStyle(Theme.muted)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.vertical, Theme.Spacing.md)

            ForEach(entries) { entry in
                Divider().padding(.leading, Theme.Spacing.lg)
                DictionaryResultRow(
                    entry: entry,
                    isSaved: isSaved(entry),
                    onToggleSaved: { onToggleSaved(entry) },
                    destination: { destination(entry) }
                )
            }
        }
        .cardBackground()
    }
}
