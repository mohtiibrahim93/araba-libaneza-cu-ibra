import Foundation
import SwiftUI
import YallaCore

struct SpeedDrillView: View {
    @State private var player: SpeedDrillPlayer
    @State private var startedAt = Date()
    @State private var promptStartedAt = Date()
    @State private var answerVisible = false
    @State private var endedManually = false

    init(
        expressions: [JourneyExpressionSummary],
        direction: SpeedDrillDirection = .learnerLanguageToLebanese
    ) {
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

            Group {
                if finished {
                    SpeedDrillSummaryView(metrics: player.session.metrics)
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
        .toolbar {
            if !endedManually && !player.session.attempts.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Încheie") {
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
                    .font(.system(size: 36, weight: .bold, design: .rounded))
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
                    HStack(spacing: 12) {
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
                        answerVisible = true
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
        var updated = player
        let responseTime = max(Date().timeIntervalSince(promptStartedAt), 0)
        guard updated.record(outcome, responseTime: responseTime) else { return }

        player = updated
        answerVisible = false
        promptStartedAt = Date()
    }

    private func elapsedSeconds(at date: Date) -> Int {
        max(Int(date.timeIntervalSince(startedAt)), 0)
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
                    Text("Două minute terminate")
                        .font(.largeTitle.bold())
                    Text("Acesta este un exercițiu de fluență și viteză de reamintire, separat de stăpânirea obișnuită.")
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 12) {
                    SpeedMetric(value: "\(metrics.correct)", label: "corecte")
                    SpeedMetric(value: "\(metrics.seen)", label: "văzute")
                }

                HStack(spacing: 12) {
                    SpeedMetric(
                        value: "(Int((metrics.accuracy * 100).rounded()))%",
                        label: "acuratețe"
                    )
                    SpeedMetric(
                        value: String(format: "%.1f", metrics.correctPerMinute),
                        label: "corecte/min"
                    )
                }

                HStack(spacing: 12) {
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
    }
}
