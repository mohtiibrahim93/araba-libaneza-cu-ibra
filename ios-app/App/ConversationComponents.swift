import SwiftUI
import YallaCore

// Building blocks of the guided conversation (reference "AI Conversation").
// Everything shown comes from approved dialogue drills and the learner's own
// local recordings. There is no speech recognition or scoring.

/// Scenario title with its icon and scenery.
struct ScenarioCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let imageName: String?

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            IconBadge(systemName: icon, tint: .white, background: Theme.terracotta, size: 52)
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(Theme.serif(.headline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Text(subtitle)
                    .font(Theme.font(.footnote))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
            if let imageName {
                DecorativeImage(name: imageName, width: 112, height: 84)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
            }
        }
        .padding(Theme.Spacing.md)
        .cardBackground(radius: 20)
        .accessibilityElement(children: .combine)
    }
}

enum ConversationSpeaker {
    /// The situation the learner answers.
    case partner
    /// The learner's chosen or typed reply.
    case learner
}

/// One turn. Partner turns sit left on warm cream, the learner's right on sage.
struct ConversationBubble<Accessory: View>: View {
    let speaker: ConversationSpeaker
    let text: String
    var caption: String? = nil
    @ViewBuilder var accessory: () -> Accessory

    private var isLearner: Bool { speaker == .learner }

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.sm) {
            if isLearner { Spacer(minLength: 40) } else { avatar }
            VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                Text(text)
                    .font(isLearner ? Theme.serif(.headline, weight: .semibold) : Theme.font(.body))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if let caption {
                    Text(caption)
                        .font(Theme.font(.footnote))
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                accessory()
            }
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.vertical, Theme.Spacing.md)
            .background(isLearner ? Theme.mint : Theme.blush.opacity(0.7), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            if isLearner { avatar } else { Spacer(minLength: 40) }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel((isLearner ? "Tu: " : "Situația: ") + text)
    }

    private var avatar: some View {
        Image(systemName: "person.fill")
            .font(.title3)
            .foregroundStyle(isLearner ? Theme.teal : Theme.terracotta)
            .frame(width: 44, height: 44)
            .background(isLearner ? Theme.mint : Theme.blush, in: Circle())
            .overlay(Circle().strokeBorder(Theme.surface, lineWidth: 2))
            .accessibilityHidden(true)
    }
}

extension ConversationBubble where Accessory == EmptyView {
    init(speaker: ConversationSpeaker, text: String, caption: String? = nil) {
        self.init(speaker: speaker, text: text, caption: caption) { EmptyView() }
    }
}

enum SuggestedReplyState {
    case idle, incorrect, correct, muted
}

/// A reply the learner can pick; the whole card is the button.
struct SuggestedReplyCard: View {
    let title: String
    let state: SuggestedReplyState
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.sm) {
                Text(title)
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
                Image(systemName: icon)
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(tint)
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: .infinity, minHeight: 58, maxHeight: .infinity, alignment: .leading)
            .background(fill, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 15, style: .continuous)
                    .strokeBorder(border, lineWidth: state == .idle || state == .muted ? 0.75 : 1.5)
            )
            .opacity(state == .muted ? 0.55 : 1)
        }
        .buttonStyle(NodeButtonStyle())
        .accessibilityValue(stateDescription)
        .accessibilityIdentifier("conversation.reply")
    }

    private var stateDescription: String {
        switch state {
        case .incorrect: return "Incorect, încearcă alt răspuns"
        case .correct: return "Corect"
        case .idle, .muted: return ""
        }
    }

    private var icon: String {
        switch state {
        case .correct: return "checkmark.circle.fill"
        case .incorrect: return "xmark.circle.fill"
        case .idle, .muted: return "chevron.right"
        }
    }

    private var tint: Color {
        switch state {
        case .correct: return Theme.success
        case .incorrect: return Theme.terracotta
        case .idle, .muted: return Theme.muted
        }
    }

    private var fill: Color {
        switch state {
        case .correct: return Theme.successBackground
        case .incorrect: return Theme.blush
        case .idle, .muted: return Theme.surface
        }
    }

    private var border: Color {
        switch state {
        case .correct: return Theme.success
        case .incorrect: return Theme.terracotta
        case .idle, .muted: return Theme.cardStroke
        }
    }
}

/// Compare the learner's recording with the teacher's. No score is computed:
/// automatic analysis is announced as coming.
struct PronunciationCompareCard: View {
    let phrase: String
    let hasLearnerRecording: Bool
    let hasTeacherRecording: Bool
    let isPlaying: Bool
    let onPlayLearner: () -> Void
    let onPlayTeacher: () -> Void

    private var teacherTitle: String {
        hasTeacherRecording ? "Profesorul" : "Profesorul · în curând"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "waveform")
                    .foregroundStyle(Theme.terracotta)
                Text("Cum ai rostit?")
                    .font(Theme.serif(.headline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                Spacer(minLength: 0)
                RecommendationBadge(icon: .system("hourglass"), title: "Analiză · în curând")
            }
            Text(phrase)
                .font(Theme.font(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.ink)
            Text("Ascultă-te și compară cu vocea profesorului. Analiza automată a pronunției va fi adăugată mai târziu.")
                .font(Theme.font(.footnote))
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: Theme.Spacing.sm) {
                Button(action: onPlayLearner) {
                    Label("Vocea ta", systemImage: isPlaying ? "stop.fill" : "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(LessonSoftButtonStyle())
                .disabled(!hasLearnerRecording)
                .accessibilityIdentifier("conversation.play.learner")

                Button(action: onPlayTeacher) {
                    Label(teacherTitle, systemImage: "person.wave.2")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(LessonSoftButtonStyle())
                .disabled(!hasTeacherRecording)
            }
        }
        .padding(Theme.Spacing.lg)
        .cardBackground()
    }
}

enum MicrophoneDockState: Equatable {
    case idle
    case recording
    case denied
    case disabled
}

/// Keyboard toggle, large microphone and a placeholder for language help.
struct ConversationInputDock: View {
    let state: MicrophoneDockState
    let isTyping: Bool
    let onKeyboard: () -> Void
    let onMicrophone: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(spacing: Theme.Spacing.xs) {
            HStack(spacing: 34) {
                CircularIconButton(
                    icon: .system(isTyping ? "keyboard.chevron.compact.down" : "keyboard"),
                    accessibilityLabel: isTyping ? "Ascunde tastatura" : "Scrie răspunsul",
                    tint: Theme.ink,
                    fill: Theme.surface,
                    diameter: 52,
                    action: onKeyboard
                )
                Button(action: onMicrophone) {
                    ZStack {
                        Circle()
                            .fill(Theme.terracotta.opacity(state == .recording ? 0.22 : 0.12))
                            .frame(width: 108, height: 108)
                            .scaleEffect(state == .recording && !reduceMotion ? 1.06 : 1)
                            .animation(
                                state == .recording && !reduceMotion
                                    ? .easeInOut(duration: 1).repeatForever(autoreverses: true) : .default,
                                value: state
                            )
                        Circle()
                            .fill(state == .denied || state == .disabled ? Theme.faint : Theme.terracotta)
                            .frame(width: 86, height: 86)
                        Image(systemName: state == .recording ? "stop.fill" : "mic.fill")
                            .font(.system(size: 34, weight: .semibold))
                            .foregroundStyle(.white)
                    }
                    .frame(width: 108, height: 108)
                }
                .buttonStyle(.plain)
                .disabled(state == .disabled)
                .accessibilityLabel(microphoneLabel)
                .accessibilityIdentifier("conversation.mic")
                // Language help is not available yet; keep the slot visible but inactive.
                CircularIconButton(
                    icon: .system("character.bubble"),
                    accessibilityLabel: "Ajutor de limbă, în curând",
                    tint: Theme.faint,
                    fill: Theme.surface,
                    diameter: 52,
                    action: {}
                )
                .disabled(true)
            }
            Text(caption)
                .font(Theme.font(.caption))
                .foregroundStyle(Theme.muted)
        }
        .padding(.top, Theme.Spacing.sm)
        .padding(.bottom, Theme.Spacing.xs)
        .frame(maxWidth: .infinity)
        .background(Theme.canvas.ignoresSafeArea(edges: .bottom))
    }

    private var microphoneLabel: String {
        switch state {
        case .recording: return "Oprește înregistrarea"
        case .denied: return "Microfon indisponibil"
        case .idle, .disabled: return "Înregistrează-ți răspunsul"
        }
    }

    private var caption: String {
        switch state {
        case .idle: return "Spune răspunsul cu voce tare și ascultă-te"
        case .recording: return "Se înregistrează… atinge pentru a opri"
        case .denied: return "Permite accesul la microfon din Setări"
        case .disabled: return "Alege mai întâi un răspuns"
        }
    }
}
