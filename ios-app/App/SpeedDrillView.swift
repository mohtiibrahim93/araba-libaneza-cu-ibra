import Foundation
import SwiftUI
import YallaCore

struct SpeedDrillView: View {
    @ObservedObject var progressModel: LearnerProgressModel

    @State private var player: SpeedDrillPlayer
    @Environment(\.scenePhase) private var scenePhase
    @State private var clock = ActivePracticeClock(startedAt: Date())
    @State private var promptStartedAtElapsed: TimeInterval = 0
    @State private var answerVisible = false
    @State private var endedManually = false
    @State private var endedAtElapsedSeconds: Int?
    @State private var didPersistResult = false
    @State private var historyID = UUID().uuidString

    init(
        expressions: [JourneyExpressionSummary],
        progressModel: LearnerProgressModel,
        direction: SpeedDrillDirection = .learnerLanguageToLebanese
    ) {
        self.progressModel = progressModel
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
                direction: direction
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
        .navigationTitle("Yalla! Două minute")
        .navigationBarTitleDisplayMode(.inline)
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
            if !endedManually && !clock.isPaused && !player.isExpired(atElapsed: elapsedSeconds(at: Date())) {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Pauză") { clock.pause(at: Date()) }
                }
            }
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

    private func drillBody(
        prompt: SpeedDrillPrompt,
        remainingSeconds: Int,
        metrics: SpeedDrillMetrics
    ) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                HStack(spacing: 10) {
                    Image(systemName: "bolt.fill")
                        .font(.largeTitle)
                        .foregroundStyle(Theme.terracotta)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Răspunde cât mai repede!")
                            .font(Theme.serif(.title3))
                            .foregroundStyle(Theme.ink)
                        Text("2 minute · Câte poți rezolva?")
                            .font(Theme.font(.subheadline))
                            .foregroundStyle(Theme.muted)
                    }
                    Spacer(minLength: 0)
                }

                HStack(alignment: .center, spacing: 12) {
                    DrillStat(
                        icon: "flame.fill", tint: Theme.streak,
                        value: "\(metrics.bestCorrectStreak)", label: "corecte la rând"
                    )
                    DrillTimerRing(
                        remaining: remainingSeconds,
                        total: player.session.durationSeconds,
                        text: timeString(remainingSeconds)
                    )
                    VStack(spacing: 10) {
                        DrillStat(
                            icon: "bolt.fill", tint: Theme.gold,
                            value: String(format: "%.0f", metrics.correctPerMinute), label: "corecte/min"
                        )
                        DrillStat(
                            icon: "target", tint: Theme.terracotta,
                            value: "\(Int((metrics.accuracy * 100).rounded()))%", label: "acuratețe"
                        )
                    }
                }

                VStack(spacing: 16) {
                    Label(promptLabel, systemImage: "text.bubble.fill")
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .foregroundStyle(Theme.teal)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .background(Theme.mint, in: Capsule())
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Text(prompt.question)
                        .font(Theme.serif(.largeTitle))
                        .foregroundStyle(Theme.ink)
                        .multilineTextAlignment(.center)
                        .minimumScaleFactor(0.6)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)

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
                    }
                }
                .padding(20)
                .cardBackground()

                if answerVisible {
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
                        Text("Arată răspunsul")
                    }
                    .buttonStyle(ChunkyButtonStyle(kind: .primary))
                    .accessibilityIdentifier("drill.reveal")
                }

                HStack {
                    Text("\(player.session.metrics.correct) corecte din \(player.session.metrics.seen)")
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.muted)
                    Spacer()
                    Button {
                        record(.skipped)
                    } label: {
                        Label("Sari peste", systemImage: "arrow.uturn.forward")
                            .font(Theme.font(.subheadline, weight: .semibold))
                            .foregroundStyle(Theme.terracotta)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(20)
            .animation(.spring(response: 0.3, dampingFraction: 0.85), value: answerVisible)
        }
        .background(Theme.canvas.ignoresSafeArea())
    }

    private var promptLabel: String {
        switch player.session.direction {
        case .learnerLanguageToLebanese:
            return "Spune în libaneză"
        case .lebaneseToLearnerLanguage:
            return "Ce înseamnă?"
        case .audioToLearnerLanguage:
            return "Ce ai auzit?"
        }
    }

    private func record(_ outcome: SpeedDrillOutcome) {
        guard canAnswer else { return }
        var updated = player
        let responseTime = max(clock.elapsed(at: Date()) - promptStartedAtElapsed, 0)
        guard updated.record(outcome, responseTime: responseTime) else { return }

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
        String(format: "%d:%02d", seconds / 60, seconds % 60)
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
