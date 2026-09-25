import Foundation
import SwiftUI
import YallaCore

struct SpeedDrillView: View {
    @ObservedObject var progressModel: LearnerProgressModel
    let mode: SpeedDrillMode

    @State private var player: SpeedDrillPlayer
    @Environment(\.scenePhase) private var scenePhase
    @State private var clock = ActivePracticeClock(startedAt: Date())
    @State private var promptStartedAtElapsed: TimeInterval = 0
    @State private var answerVisible = false
    @State private var endedManually = false
    @State private var endedAtElapsedSeconds: Int?
    @State private var didPersistResult = false
    @State private var historyID = UUID().uuidString
    /// Choice or typed answer being shown as feedback before the next card.
    @State private var feedback: Feedback?
    @State private var typed = ""
    @FocusState private var fieldFocused: Bool

    private struct Feedback: Equatable {
        let chosen: String
        let correct: Bool
    }

    init(
        expressions: [JourneyExpressionSummary],
        progressModel: LearnerProgressModel,
        direction: SpeedDrillDirection = .learnerLanguageToLebanese,
        mode: SpeedDrillMode = .memory
    ) {
        self.progressModel = progressModel
        self.mode = mode
        let cards = expressions.map {
            SpeedDrillCard(
                id: $0.id,
                lebanese: $0.arabizi,
                learnerMeaning: $0.meaning
            )
        }
        _player = State(
            initialValue: SpeedDrillPlayer(
                cards: cards,
                // Typed answers are checked as Arabizi.
                direction: mode == .write ? .learnerLanguageToLebanese : direction
            )
        )
    }

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { timeline in
            let elapsed = elapsedSeconds(at: timeline.date)
            let finished = endedManually || player.isExpired(atElapsed: elapsed)
            let effectiveElapsed = endedAtElapsedSeconds
                ?? min(max(elapsed, 1), player.session.durationSeconds)
            let metrics = player.session.metrics(elapsedSeconds: effectiveElapsed)

            Group {
                if finished {
                    SpeedDrillSummaryView(metrics: metrics)
                        .task {
                            await persistResultIfNeeded(
                                elapsedSeconds: effectiveElapsed,
                                metrics: metrics
                            )
                        }
                } else if clock.isPaused {
                    VStack(spacing: 18) {
                        Image(systemName: "pause.circle.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(Theme.terracotta)
                        Text("Exercițiu în pauză")
                            .font(Theme.serif(.title2))
                            .foregroundStyle(Theme.ink)
                        Text("Timpul petrecut în pauză nu intră în rezultat.")
                            .font(Theme.font(.body))
                            .foregroundStyle(Theme.muted)
                            .multilineTextAlignment(.center)
                        Button("Reia exercițiul") { clock.resume(at: Date()) }
                            .buttonStyle(ChunkyButtonStyle(kind: .primary))
                            .accessibilityIdentifier("drill.resume")
                    }
                    .padding(24)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Theme.canvas.ignoresSafeArea())
                } else if let prompt = player.currentPrompt {
                    drillBody(
                        prompt: prompt,
                        remainingSeconds: player.remainingSeconds(atElapsed: elapsed),
                        metrics: player.session.metrics(elapsedSeconds: max(elapsed, 1))
                    )
                } else {
                    ContentUnavailableView(
                        "Nu există expresii",
                        systemImage: "timer",
                        description: Text("Adaugă expresii în conținut înainte să pornești acest mod.")
                    )
                }
            }
        }
        .creamList()
        .navigationTitle("Speed Drill")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onChange(of: scenePhase) { _, phase in
            if phase != .active { clock.pause(at: Date()) }
        }
        .onDisappear {
            clock.pause(at: Date())
            let elapsed = min(max(elapsedSeconds(at: Date()), 1), player.session.durationSeconds)
            let metrics = player.session.metrics(elapsedSeconds: elapsed)
            endedAtElapsedSeconds = elapsed
            endedManually = true
            Task { await persistResultIfNeeded(elapsedSeconds: elapsed, metrics: metrics) }
        }
        .toolbar {
            if !endedManually && !player.session.attempts.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Încheie") {
                        endedAtElapsedSeconds = min(max(elapsedSeconds(at: Date()), 1), player.session.durationSeconds)
                        endedManually = true
                    }
                }
            }
        }
    }

    // MARK: Layout

    private func drillBody(
        prompt: SpeedDrillPrompt,
        remainingSeconds: Int,
        metrics: SpeedDrillMetrics
    ) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.section) {
                header
                liveStats(remainingSeconds: remainingSeconds, metrics: metrics)
                questionCard(prompt: prompt)
                HStack {
                    Text("\(metrics.correct) corecte din \(metrics.seen)")
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.muted)
                    Spacer()
                    Button {
                        record(.skipped)
                    } label: {
                        Label("Sari peste", systemImage: "arrow.uturn.forward")
                            .font(Theme.font(.subheadline, weight: .semibold))
                            .foregroundStyle(Theme.terracotta)
                            .frame(minHeight: 44)
                    }
                    .buttonStyle(.plain)
                    .disabled(feedback != nil)
                    .accessibilityIdentifier("drill.skip")
                }
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: Theme.Spacing.maxContentWidth)
            .frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Theme.canvas.ignoresSafeArea())
    }

    private var header: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            Image(systemName: "bolt.fill")
                .font(.system(size: 36, weight: .bold))
                .foregroundStyle(Theme.terracotta)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text("Speed Drill")
                    .font(.system(.largeTitle, design: .default).weight(.bold))
                    .foregroundStyle(Theme.ink)
                Text("Răspunde cât mai repede!")
                    .font(Theme.font(.title3, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                Text("\(player.session.durationSeconds / 60) minute · \(mode.title)")
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 0)
            CircularIconButton(
                icon: .system("pause.fill"),
                accessibilityLabel: "Pauză Speed Drill",
                tint: Theme.ink,
                fill: Theme.surface,
                diameter: 44
            ) {
                clock.pause(at: Date())
            }
            .accessibilityIdentifier("drill.pause")
        }
        .background(alignment: .topTrailing) {
            DecorativeImage(name: "illus-raouche", width: 170, height: 96, fadeTowards: .leading)
                .opacity(0.35)
                .offset(x: Theme.Spacing.screen, y: -8)
        }
    }

    private func liveStats(remainingSeconds: Int, metrics: SpeedDrillMetrics) -> some View {
        HStack(alignment: .center, spacing: Theme.Spacing.sm) {
            VStack(spacing: Theme.Spacing.sm) {
                DrillStat(icon: "flame.fill", tint: Theme.streak,
                          value: "\(metrics.currentCorrectStreak)", label: "corecte la rând")
                DrillStat(icon: "speedometer", tint: Theme.teal,
                          value: String(format: "%.0f", metrics.answeredPerMinute), label: "cuvinte/min")
            }
            DrillTimerRing(
                remaining: remainingSeconds,
                total: player.session.durationSeconds,
                text: timeString(remainingSeconds)
            )
            .overlay(alignment: .leading) { SpeedLinesDecoration().offset(x: -22) }
            VStack(spacing: Theme.Spacing.sm) {
                DrillStat(icon: "bolt.fill", tint: Theme.gold,
                          value: String(format: "%.0f", metrics.correctPerMinute), label: "corecte/min")
                DrillStat(icon: "target", tint: Theme.terracotta,
                          value: "\(Int((metrics.accuracy * 100).rounded()))%", label: "acuratețe")
            }
        }
    }

    private func questionCard(prompt: SpeedDrillPrompt) -> some View {
        VStack(spacing: Theme.Spacing.lg) {
            HStack {
                SpeedPromptModeBadge(icon: badgeIcon, title: promptLabel)
                Spacer(minLength: Theme.Spacing.sm)
                Text("Cardul \(player.session.attempts.count + 1)")
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(Theme.muted)
                    .monospacedDigit()
                    .accessibilityIdentifier("drill.counter")
            }

            Text(prompt.question)
                .font(Theme.serif(.largeTitle, weight: .semibold))
                .foregroundStyle(Theme.deep)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.6)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Theme.Spacing.sm)
                .accessibilityAddTraits(.isHeader)

            switch mode {
            case .choice:
                choiceGrid(prompt: prompt)
            case .memory:
                memoryControls(prompt: prompt)
            case .write:
                writeControls(prompt: prompt)
            }
        }
        .padding(Theme.Spacing.lg + 2)
        .background(alignment: .topTrailing) {
            DecorativeImage(name: "illus-house", width: 130, height: 110, fadeTowards: .bottom)
                .opacity(0.22)
        }
        .cardBackground(radius: 23)
        .animation(.easeOut(duration: 0.2), value: answerVisible)
    }

    // MARK: Modes

    private func choiceGrid(prompt: SpeedDrillPrompt) -> some View {
        let options = player.choices(count: 4)
        return AdaptiveChoiceGrid(preferredColumns: 2, minimumCardWidth: 140, spacing: 10) {
            ForEach(options, id: \.self) { option in
                SpeedAnswerCard(title: option, state: choiceState(option, answer: prompt.answer)) {
                    answer(option, correct: AnswerNormalizer.normalize(option) == AnswerNormalizer.normalize(prompt.answer))
                }
            }
        }
    }

    private func choiceState(_ option: String, answer: String) -> SpeedAnswerState {
        guard let feedback else { return .idle }
        if option == feedback.chosen { return feedback.correct ? .correct : .incorrect }
        if !feedback.correct && AnswerNormalizer.normalize(option) == AnswerNormalizer.normalize(answer) {
            return .revealedCorrect
        }
        return .disabled
    }

    @ViewBuilder
    private func memoryControls(prompt: SpeedDrillPrompt) -> some View {
        if answerVisible {
            VStack(spacing: 6) {
                Text("Răspuns")
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(Theme.teal)
                Text(prompt.answer)
                    .font(Theme.serif(.title2))
                    .foregroundStyle(Theme.ink)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Theme.mint, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .transition(.scale(scale: 0.95).combined(with: .opacity))

            AdaptiveRow(spacing: 12) {
                Button {
                    record(.wrong)
                } label: {
                    Label("Greșit", systemImage: "xmark")
                }
                .buttonStyle(ChunkyButtonStyle(kind: .danger))
                .accessibilityIdentifier("drill.wrong")

                Button {
                    record(.correct)
                } label: {
                    Label("Corect", systemImage: "checkmark")
                }
                .buttonStyle(ChunkyButtonStyle(kind: .primary))
                .accessibilityIdentifier("drill.correct")
            }
        } else {
            Button {
                if canAnswer { answerVisible = true }
            } label: {
                Label("Arată răspunsul", systemImage: "eye")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 56))
            .accessibilityIdentifier("drill.reveal")
        }
    }

    @ViewBuilder
    private func writeControls(prompt: SpeedDrillPrompt) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            TextField("Scrie în Arabizi", text: $typed)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($fieldFocused)
                .submitLabel(.done)
                .onSubmit { checkTyped(prompt) }
                .disabled(feedback != nil)
                .padding(.horizontal, Theme.Spacing.lg)
                .frame(minHeight: 52)
                .background(Theme.surface, in: Capsule())
                .overlay(Capsule().strokeBorder(writeBorder, lineWidth: feedback == nil ? 0.75 : 1.5))
                .accessibilityIdentifier("drill.field")
            Button {
                checkTyped(prompt)
            } label: {
                Image(systemName: "arrow.right")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(width: 52, height: 52)
                    .background(Theme.cedarDeep, in: Circle())
            }
            .buttonStyle(.plain)
            .disabled(typed.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || feedback != nil)
            .accessibilityLabel("Verifică")
            .accessibilityIdentifier("drill.check")
        }
        if let feedback {
            let message: String = feedback.correct ? "Corect" : "Corect era: \(prompt.answer)"
            let icon: String = feedback.correct ? "checkmark.circle.fill" : "xmark.circle.fill"
            Label(message, systemImage: icon)
            .font(Theme.font(.subheadline, weight: .semibold))
            .foregroundStyle(feedback.correct ? Theme.success : Theme.terracottaShade)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var writeBorder: Color {
        guard let feedback else { return Theme.cardStroke }
        return feedback.correct ? Theme.success : Theme.terracotta
    }

    private func checkTyped(_ prompt: SpeedDrillPrompt) {
        let text = typed.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        let result = AnswerEvaluator().evaluate(answer: text, canonical: prompt.answer, spellingVariants: [], pronunciationVariants: [])
        answer(text, correct: result != .incorrect)
    }

    // MARK: Actions

    /// Shows the result briefly, then records it. The response time is taken
    /// at the tap, so the feedback pause does not count toward it.
    private func answer(_ chosen: String, correct: Bool) {
        guard canAnswer, feedback == nil else { return }
        let responseTime = max(clock.elapsed(at: Date()) - promptStartedAtElapsed, 0)
        feedback = Feedback(chosen: chosen, correct: correct)
        let delay: Duration = correct ? .milliseconds(450) : .milliseconds(1_100)
        Task { @MainActor in
            try? await Task.sleep(for: delay)
            record(correct ? .correct : .wrong, responseTime: responseTime)
            feedback = nil
            typed = ""
            if mode == .write { fieldFocused = true }
        }
    }

    private var badgeIcon: String {
        switch mode {
        case .choice: return "hand.tap"
        case .memory: return "brain.head.profile"
        case .write: return "keyboard"
        }
    }

    private var promptLabel: String {
        switch player.session.direction {
        case .learnerLanguageToLebanese:
            return mode == .write ? "Scrie în libaneză" : "Spune în libaneză"
        case .lebaneseToLearnerLanguage:
            return "Ce înseamnă?"
        case .audioToLearnerLanguage:
            return "Ce ai auzit?"
        }
    }

    private func record(_ outcome: SpeedDrillOutcome, responseTime: TimeInterval? = nil) {
        guard !endedManually, !player.isExpired(atElapsed: elapsedSeconds(at: Date())) else { return }
        var updated = player
        let time = responseTime ?? max(clock.elapsed(at: Date()) - promptStartedAtElapsed, 0)
        guard updated.record(outcome, responseTime: time) else { return }

        player = updated
        answerVisible = false
        promptStartedAtElapsed = clock.elapsed(at: Date())
    }

    @MainActor
    private func persistResultIfNeeded(
        elapsedSeconds: Int,
        metrics: SpeedDrillMetrics
    ) async {
        guard !didPersistResult, metrics.seen > 0 else { return }
        didPersistResult = true

        let entry = SpeedDrillHistoryEntry(
            id: historyID,
            direction: player.session.direction,
            durationSeconds: player.session.durationSeconds,
            elapsedSeconds: elapsedSeconds,
            completedAt: Date(),
            metrics: metrics
        )
        await progressModel.recordSpeedDrill(entry)
    }

    private var canAnswer: Bool {
        !endedManually && !clock.isPaused && !player.isExpired(atElapsed: elapsedSeconds(at: Date()))
    }

    private func elapsedSeconds(at date: Date) -> Int {
        max(Int(clock.elapsed(at: date)), 0)
    }

    private func timeString(_ seconds: Int) -> String {
        String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }
}

private struct DrillStat: View {
    let icon: String
    let tint: Color
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .foregroundStyle(tint)
                Text(value)
                    .font(Theme.serif(.title3))
                    .foregroundStyle(Theme.ink)
                    .monospacedDigit()
            }
            Text(label)
                .font(Theme.font(.caption2))
                .foregroundStyle(Theme.muted)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }
}

private struct DrillTimerRing: View {
    let remaining: Int
    let total: Int
    let text: String

    var body: some View {
        let fraction = CGFloat(total > 0 ? Double(remaining) / Double(total) : 0)
        ZStack {
            Circle()
                .stroke(Theme.line, lineWidth: 9)
            Circle()
                .trim(from: 0, to: fraction)
                .stroke(Theme.terracotta, style: StrokeStyle(lineWidth: 9, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 1), value: remaining)
            VStack(spacing: 0) {
                Text(text)
                    .font(Theme.serif(.title))
                    .foregroundStyle(Theme.ink)
                    .monospacedDigit()
                Text("rămas")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
            }
        }
        .frame(width: 120, height: 120)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Timp rămas \(text)")
    }
}

private struct SpeedDrillSummaryView: View {
    let metrics: SpeedDrillMetrics

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: "bolt.circle.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(Theme.terracotta)
                    Text("Exercițiu încheiat")
                        .font(Theme.serif(.largeTitle))
                        .foregroundStyle(Theme.ink)
                    Text("Acesta este un exercițiu de fluență și viteză de reamintire, separat de stăpânirea obișnuită.")
                        .font(Theme.font(.body))
                        .foregroundStyle(Theme.muted)
                }

                AdaptiveRow(spacing: 12) {
                    SpeedMetric(value: "\(metrics.correct)", label: "corecte", icon: "checkmark.circle.fill", tint: Theme.teal)
                    SpeedMetric(value: "\(metrics.seen)", label: "văzute", icon: "eye.fill", tint: Theme.muted)
                }

                AdaptiveRow(spacing: 12) {
                    SpeedMetric(
                        value: "\(Int((metrics.accuracy * 100).rounded()))%",
                        label: "acuratețe", icon: "target", tint: Theme.terracotta
                    )
                    SpeedMetric(
                        value: String(format: "%.1f", metrics.correctPerMinute),
                        label: "corecte/min", icon: "bolt.fill", tint: Theme.gold
                    )
                }

                AdaptiveRow(spacing: 12) {
                    SpeedMetric(
                        value: String(format: "%.1f", metrics.answeredPerMinute),
                        label: "cuvinte/min", icon: "speedometer", tint: Theme.teal
                    )
                    SpeedMetric(value: "\(metrics.skipped)", label: "sărite", icon: "arrow.uturn.forward", tint: Theme.muted)
                }

                AdaptiveRow(spacing: 12) {
                    SpeedMetric(value: "\(metrics.bestCorrectStreak)", label: "serie maximă", icon: "flame.fill", tint: Theme.streak)
                    SpeedMetric(
                        value: String(format: "%.1fs", metrics.medianResponseTime),
                        label: "timp median", icon: "clock.fill", tint: Theme.teal
                    )
                }
            }
            .padding(20)
        }
        .background(Theme.canvas.ignoresSafeArea())
    }
}

private struct SpeedMetric: View {
    let value: String
    let label: String
    let icon: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(label, systemImage: icon)
                .font(Theme.font(.caption, weight: .semibold))
                .foregroundStyle(tint)
            Text(value)
                .font(Theme.serif(.title))
                .foregroundStyle(Theme.ink)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }
}
