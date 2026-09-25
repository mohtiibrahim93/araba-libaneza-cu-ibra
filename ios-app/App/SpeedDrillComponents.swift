import SwiftUI
import YallaCore

// Building blocks of the Speed Drill (reference "Speed Drill"). Timing,
// outcomes and history stay in SpeedDrillPlayer / ActivePracticeClock.

/// How the learner answers during a drill.
enum SpeedDrillMode: String, CaseIterable, Identifiable {
    /// Four answers; the tap is checked at once.
    case choice
    /// Reveal the answer and grade yourself.
    case memory
    /// Type the answer; the app checks it against the approved form.
    case write

    var id: String { rawValue }

    var title: String {
        switch self {
        case .choice: return "Alegere rapidă"
        case .memory: return "Din memorie"
        case .write: return "Scrie"
        }
    }

    var subtitle: String {
        switch self {
        case .choice: return "Patru variante, atingi răspunsul."
        case .memory: return "Îți amintești, apoi verifici singur."
        case .write: return "Scrii răspunsul în Arabizi."
        }
    }

    var icon: String {
        switch self {
        case .choice: return "square.grid.2x2"
        case .memory: return "brain.head.profile"
        case .write: return "keyboard"
        }
    }
}

enum SpeedAnswerState {
    case idle
    case correct
    case incorrect
    /// The right answer shown after a wrong tap.
    case revealedCorrect
    case disabled
}

/// One of the four answers in "Alegere rapidă".
struct SpeedAnswerCard: View {
    let title: String
    let state: SpeedAnswerState
    let action: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.sm) {
                Text(title)
                    .font(Theme.font(.body, weight: .semibold))
                    .foregroundStyle(foreground)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
                if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(state == .correct ? .white : iconTint)
                }
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: .infinity, minHeight: 72, maxHeight: .infinity, alignment: .leading)
            .background(background, in: RoundedRectangle(cornerRadius: 17, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 17, style: .continuous)
                    .strokeBorder(border, lineWidth: state == .idle || state == .disabled ? 0.75 : 1.5)
            )
            .overlay(alignment: .topLeading) {
                if state == .correct && !reduceMotion {
                    SuccessSparks()
                        .offset(x: -8, y: -10)
                        .transition(.opacity)
                }
            }
            .shadow(color: .black.opacity(state == .correct ? 0.12 : 0.05), radius: 8, x: 0, y: 3)
            .scaleEffect(state == .correct && !reduceMotion ? 1.02 : 1)
            .animation(reduceMotion ? nil : .easeOut(duration: 0.18), value: state)
        }
        .buttonStyle(.plain)
        .disabled(state != .idle)
        .accessibilityLabel(title)
        .accessibilityValue(accessibilityValue)
        .accessibilityIdentifier("drill.choice")
    }

    private var background: AnyShapeStyle {
        switch state {
        case .correct:
            return AnyShapeStyle(LinearGradient(
                colors: [Theme.success.opacity(0.85), Theme.success],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ))
        case .incorrect: return AnyShapeStyle(Theme.blush)
        case .revealedCorrect: return AnyShapeStyle(Theme.successBackground)
        case .idle, .disabled: return AnyShapeStyle(Theme.surface)
        }
    }

    private var foreground: Color {
        switch state {
        case .correct: return .white
        case .incorrect: return Theme.terracottaShade
        case .disabled: return Theme.muted
        case .idle, .revealedCorrect: return Theme.ink
        }
    }

    private var border: Color {
        switch state {
        case .correct, .revealedCorrect: return Theme.success
        case .incorrect: return Theme.terracotta
        case .idle, .disabled: return Theme.cardStroke
        }
    }

    private var icon: String? {
        switch state {
        case .correct, .revealedCorrect: return "checkmark.circle.fill"
        case .incorrect: return "xmark.circle.fill"
        case .idle, .disabled: return nil
        }
    }

    private var iconTint: Color {
        state == .incorrect ? Theme.terracotta : Theme.success
    }

    private var accessibilityValue: String {
        switch state {
        case .correct: return "Răspuns corect"
        case .incorrect: return "Răspuns greșit"
        case .revealedCorrect: return "Acesta era răspunsul corect"
        case .idle, .disabled: return ""
        }
    }
}

/// A few short strokes around a correct answer.
private struct SuccessSparks: View {
    var body: some View {
        ZStack {
            ForEach(0..<5, id: \.self) { index in
                Capsule()
                    .fill([Theme.success, Theme.terracotta, Theme.gold][index % 3])
                    .frame(width: 3, height: CGFloat(8 + index % 3 * 3))
                    .rotationEffect(.degrees(Double(index) * 36 - 72))
                    .offset(x: CGFloat(index) * 7, y: CGFloat(index % 2) * 4)
            }
        }
        .accessibilityHidden(true)
        .allowsHitTesting(false)
    }
}

/// Instruction chip above the prompt.
struct SpeedPromptModeBadge: View {
    let icon: String
    let title: String

    var body: some View {
        Label(title, systemImage: icon)
            .font(Theme.font(.subheadline, weight: .semibold))
            .foregroundStyle(Theme.ink)
            .labelStyle(TintedIconLabelStyle(tint: Theme.deep))
            .padding(.horizontal, Theme.Spacing.md)
            .frame(minHeight: 40)
            .background(Theme.surface, in: Capsule())
            .overlay(Capsule().strokeBorder(Theme.cardStroke, lineWidth: 0.75))
    }
}

/// Thin terracotta motion strokes flanking the timer.
struct SpeedLinesDecoration: View {
    var mirrored = false

    var body: some View {
        VStack(alignment: mirrored ? .leading : .trailing, spacing: 7) {
            ForEach([34, 22, 40, 18], id: \.self) { length in
                Capsule()
                    .fill(Theme.terracotta.opacity(Double(length) / 80))
                    .frame(width: CGFloat(length), height: 2.5)
            }
        }
        .accessibilityHidden(true)
        .allowsHitTesting(false)
    }
}
