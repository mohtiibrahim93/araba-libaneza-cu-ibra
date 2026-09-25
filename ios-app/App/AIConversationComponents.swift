import SwiftUI

// Building blocks of the AI conversation screen (reference 05). Until the
// feature exists they render layout placeholders only: no dialogue text,
// no scores and no feedback are shown.

/// Scenario title card with an icon and a scene illustration.
struct ConversationScenarioCard: View {
    let icon: String
    let title: String
    let detail: String
    let image: String

    var body: some View {
        HStack(spacing: Theme.Spacing.s) {
            IconBadge(systemName: icon, tint: .white, background: Theme.terracotta, size: 52)
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(Theme.serif(.headline))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Text(detail)
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
            DecorativeImage(name: image, width: 110, height: 92)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.medium, style: .continuous))
        }
        .padding(Theme.Spacing.s)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }
}

/// Avatar plus an empty speech bubble; tutor on the left, learner on the right.
struct ConversationBubblePlaceholder: View {
    enum Speaker { case tutor, learner }

    let speaker: Speaker
    /// Relative widths of the placeholder lines.
    var lines: [CGFloat] = [0.7, 0.45]

    private var isLearner: Bool { speaker == .learner }

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.xs) {
            if isLearner { Spacer(minLength: 56) } else { avatar }
            VStack(alignment: .leading, spacing: 7) {
                ForEach(Array(lines.enumerated()), id: \.offset) { index, width in
                    Capsule()
                        .fill(Theme.ink.opacity(index == 0 ? 0.16 : 0.09))
                        .frame(width: 180 * width, height: index == 0 ? 12 : 9)
                }
            }
            .padding(Theme.Spacing.m)
            .background(
                isLearner ? Theme.mint : Theme.surface,
                in: UnevenRoundedRectangle(
                    topLeadingRadius: isLearner ? Theme.Radius.large : 6,
                    bottomLeadingRadius: Theme.Radius.large,
                    bottomTrailingRadius: Theme.Radius.large,
                    topTrailingRadius: isLearner ? 6 : Theme.Radius.large,
                    style: .continuous
                )
            )
            .elevation(.card)
            if isLearner { avatar } else { Spacer(minLength: 56) }
        }
        .accessibilityHidden(true)
    }

    private var avatar: some View {
        Image(systemName: "person.fill")
            .font(.title3)
            .foregroundStyle(isLearner ? Theme.teal : Theme.terracotta)
            .frame(width: 46, height: 46)
            .background(isLearner ? Theme.mint : Theme.blush, in: Circle())
            .overlay(Circle().strokeBorder(Theme.surface, lineWidth: 2))
    }
}

/// Where pronunciation feedback will appear; shows no score until it exists.
struct PronunciationFeedbackPlaceholder: View {
    var body: some View {
        HStack(spacing: Theme.Spacing.m) {
            ProgressRing(fraction: 0, tint: Theme.teal, lineWidth: 7) {
                Image(systemName: "waveform")
                    .font(.title3)
                    .foregroundStyle(Theme.muted)
            }
            .frame(width: 70, height: 70)
            VStack(alignment: .leading, spacing: 3) {
                Label("Cum ai rostit?", systemImage: "waveform")
                    .labelStyle(TintedIconLabelStyle(tint: Theme.terracotta))
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                Text("Feedbackul de pronunție apare aici când funcția va fi gata.")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.m)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }
}

/// Empty two-by-two grid where suggested replies will appear.
struct SuggestedRepliesPlaceholder: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text("Alege un răspuns sau vorbește:")
                .font(Theme.font(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.ink)
            LazyVGrid(columns: [GridItem(.flexible(), spacing: Theme.Spacing.xs), GridItem(.flexible(), spacing: Theme.Spacing.xs)], spacing: Theme.Spacing.xs) {
                ForEach(0..<4, id: \.self) { index in
                    HStack {
                        VStack(alignment: .leading, spacing: 6) {
                            Capsule().fill(Theme.ink.opacity(0.14)).frame(width: index.isMultiple(of: 2) ? 96 : 80, height: 10)
                            Capsule().fill(Theme.ink.opacity(0.08)).frame(width: index.isMultiple(of: 2) ? 64 : 88, height: 8)
                        }
                        Spacer(minLength: 0)
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Theme.lineStrong)
                    }
                    .padding(Theme.Spacing.s)
                    .background(Theme.surface, in: RoundedRectangle(cornerRadius: Theme.Radius.small, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: Theme.Radius.small, style: .continuous).strokeBorder(Theme.line, lineWidth: 1))
                    .accessibilityHidden(true)
                }
            }
        }
    }
}

/// Keyboard, microphone and translation controls, shown disabled.
struct ConversationControlBar: View {
    var body: some View {
        HStack(spacing: Theme.Spacing.xl + 4) {
            control(icon: "keyboard", size: 56, fill: Theme.surface, tint: Theme.muted)
            control(icon: "mic.fill", size: 82, fill: Theme.terracotta.opacity(0.45), tint: .white)
                .background(Circle().fill(Theme.terracotta.opacity(0.10)).padding(-10))
            control(icon: "translate", size: 56, fill: Theme.surface, tint: Theme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.s)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Controalele de conversație nu sunt încă disponibile")
    }

    private func control(icon: String, size: CGFloat, fill: Color, tint: Color) -> some View {
        Image(systemName: icon)
            .font(.system(size: size * 0.36, weight: .semibold))
            .foregroundStyle(tint)
            .frame(width: size, height: size)
            .background(fill, in: Circle())
            .overlay(Circle().strokeBorder(Theme.line, lineWidth: 1))
    }
}
