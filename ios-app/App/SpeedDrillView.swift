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
                        Image(systemName: "pause.circle").font(.largeTitle)
                        Text("Exercițiu în pauză").font(.title2.bold())
                        Text("Timpul petrecut în pauză nu intră în rezultat.")
                            .foregroundStyle(.secondary)
                        Button("Reia exercițiul") { clock.resume(at: Date()) }
                            .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else if let prompt = player.currentPrompt {
                    drillBody(
                        prompt: prompt,
                        remainingSeconds: player.remainingSeconds(atElapsed: elapsed)
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
        remainingSeconds: Int
    ) -> some View {
        ScrollView {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text(timeString(remainingSeconds))
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .monospacedDigit()
                Text("\(player.session.metrics.correct) corecte din \(player.session.metrics.seen)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(spacing: 14) {
                Text(promptLabel)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)

                Text(prompt.question)
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .multilineTextAlignment(.center)
                    .minimumScaleFactor(0.7)

                if answerVisible {
                    VStack(spacing: 7) {
                        Text("Răspuns")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                        Text(prompt.answer)
                            .font(.title2.bold())
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 18))
                }
            }
            .frame(maxWidth: .infinity)

            Spacer()

            if answerVisible {
                VStack(spacing: 12) {
                    AdaptiveRow(spacing: 12) {
                        Button {
                            record(.wrong)
                        } label: {
                            Label("Greșit", systemImage: "xmark")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)

                        Button {
                            record(.correct)
                        } label: {
                            Label("Corect", systemImage: "checkmark")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                    }

                    Button {
                        record(.skipped)
                    } label: {
                        Text("Sari peste")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.secondary)
                }
            } else {
                VStack(spacing: 12) {
                    Button {
                        if canAnswer { answerVisible = true }
                    } label: {
                        Text("Arată răspunsul")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)

                    Button {
                        record(.skipped)
                    } label: {
                        Text("Sari peste")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        }
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

private struct SpeedDrillSummaryView: View {
    let metrics: SpeedDrillMetrics

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: "timer")
                        .font(.system(size: 42))
                    Text("Exercițiu încheiat")
                        .font(.largeTitle.bold())
                    Text("Acesta este un exercițiu de fluență și viteză de reamintire, separat de stăpânirea obișnuită.")
                        .foregroundStyle(.secondary)
                }

                AdaptiveRow(spacing: 12) {
                    SpeedMetric(value: "\(metrics.correct)", label: "corecte")
                    SpeedMetric(value: "\(metrics.seen)", label: "văzute")
                }

                AdaptiveRow(spacing: 12) {
                    SpeedMetric(
                        value: "\(Int((metrics.accuracy * 100).rounded()))%",
                        label: "acuratețe"
                    )
                    SpeedMetric(
                        value: String(format: "%.1f", metrics.correctPerMinute),
                        label: "corecte/min"
                    )
                }

                AdaptiveRow(spacing: 12) {
                    SpeedMetric(value: "\(metrics.bestCorrectStreak)", label: "serie maximă")
                    SpeedMetric(
                        value: String(format: "%.1fs", metrics.medianResponseTime),
                        label: "timp median"
                    )
                }
            }
            .padding()
        }
    }
}

private struct SpeedMetric: View {
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(value)
                .font(.title.bold())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .accessibilityElement(children: .combine)
    }
}
