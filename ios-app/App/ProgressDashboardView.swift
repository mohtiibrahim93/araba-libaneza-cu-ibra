import SwiftUI
import YallaCore

/// "Progresul meu": journey completion, skills, streak, activity and what to review.
struct ProgressDashboardView: View {
    let progress: LearnerProgressSnapshot
    let lessonCounts: [String: Int]
    let journeyLevel: LevelBand
    let reviewQueue: ReviewQueueSummary
    let rewards: RewardSummary
    /// Single-word expressions, Journey units and review scope for insights.
    let singleWordExpressionIDs: Set<String>
    let topicUnits: [ProgressTopicUnit]
    let reviewExpressionIDs: Set<String>
    /// The learner's own Speak & Compare recordings on this device.
    let recordingCount: Int
    let date: Date
    let onReviews: () -> Void
    let onSmartPractice: () -> Void
    let onContinueJourney: () -> Void

    private let builder = ProgressDashboardBuilder()

    var body: some View {
        let summary = builder.summary(snapshot: progress, lessonCounts: lessonCounts, at: date)
        let insights = ProgressInsightsBuilder().insights(
            snapshot: progress,
            singleWordExpressionIDs: singleWordExpressionIDs,
            units: topicUnits,
            reviewExpressionIDs: reviewExpressionIDs,
            lessonsLast30Days: summary.lessonsLast30Days,
            at: date
        )
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                BrandHeader(tagline: "Mai aproape de oameni. Mai aproape de Liban.")

                VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                    Text("Progresul meu")
                        .font(Theme.serif(.largeTitle))
                        .foregroundStyle(Theme.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Text("O călătorie reală, pas cu pas.")
                        .font(Theme.serif(.subheadline, weight: .regular))
                        .foregroundStyle(Theme.muted)
                }
                .padding(.vertical, Theme.Spacing.md)
                .padding(.trailing, 80)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(alignment: .trailing) {
                    DecorativeImage(name: "illus-progress", width: 190, height: 104, fadeTowards: .leading)
                        .offset(x: Theme.Spacing.screen)
                }
                .accessibilityIdentifier("progress.header")

                ProgressOverviewCard(summary: summary, level: journeyLevel)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Theme.Spacing.sm), count: 4), spacing: Theme.Spacing.sm) {
                    SkillProgressCard(
                        title: "Conversație", icon: "bubble.left.and.bubble.right.fill",
                        fill: Theme.deep, foreground: .white,
                        fraction: insights.conversation.rate,
                        detail: accuracyDetail(insights.conversation, unit: "replici")
                    )
                    SkillProgressCard(
                        title: "Vocabular", icon: "book.fill",
                        fill: Theme.terracotta, foreground: .white,
                        fraction: insights.vocabulary.rate,
                        detail: vocabularyDetail(insights)
                    )
                    SkillProgressCard(
                        title: "Ascultare", icon: "headphones",
                        fill: Theme.variantBackground, foreground: Theme.ink,
                        fraction: insights.listening.rate,
                        detail: accuracyDetail(insights.listening, unit: "răspunsuri")
                    )
                    SkillProgressCard(
                        title: "Pronunție", icon: "mic.fill",
                        fill: Theme.mint, foreground: Theme.ink,
                        fraction: nil,
                        countValue: recordingCount > 0 ? recordingCount : nil,
                        detail: recordingCount > 0 ? "înregistrări ale tale" : "Fără înregistrări încă"
                    )
                }

                HStack(alignment: .top, spacing: Theme.Spacing.md) {
                    StreakCard(rewards: rewards)
                    ActivityHeatmapCard(
                        days: builder.recentDays(weeks: 8, endingAt: date),
                        xpByDay: summary.xpByDay,
                        lessonsLast30Days: summary.lessonsLast30Days,
                        trendPercent: insights.lessonTrendPercent
                    )
                }

                VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                    ProgressListCard(title: "Repetiții programate", icon: "calendar", onSeeAll: onReviews) {
                        if insights.dueWords + insights.duePhrases + progress.activeMistakeExpressionIDs.count == 0 {
                            Text("Ești la zi cu repetițiile.")
                                .font(Theme.font(.caption))
                                .foregroundStyle(Theme.muted)
                        }
                        if insights.dueWords > 0 {
                            ScheduledReviewRow(icon: "character.book.closed", title: "Cuvinte de revizuit",
                                               detail: "\(insights.dueWords) cuvinte", action: "Revizuiește", onTap: onReviews)
                        }
                        if insights.duePhrases > 0 {
                            ScheduledReviewRow(icon: "text.bubble", title: "Expresii de revizuit",
                                               detail: "\(insights.duePhrases) expresii", action: "Revizuiește", onTap: onReviews)
                        }
                        if !progress.activeMistakeExpressionIDs.isEmpty {
                            ScheduledReviewRow(icon: "exclamationmark.bubble", title: "Greșeli active",
                                               detail: "\(progress.activeMistakeExpressionIDs.count) expresii", action: "Exersează", onTap: onSmartPractice)
                        }
                    }
                    ProgressListCard(title: "Zone care au nevoie de atenție", icon: "chart.bar.xaxis") {
                        if insights.attentionUnits.isEmpty {
                            Text(attentionEmptyText)
                                .font(Theme.font(.caption))
                                .foregroundStyle(Theme.muted)
                                .fixedSize(horizontal: false, vertical: true)
                        } else {
                            ForEach(insights.attentionUnits) { unit in
                                AttentionAreaRow(
                                    icon: "book.closed",
                                    title: unit.title,
                                    fraction: unit.accuracy.rate ?? 0,
                                    onTap: onSmartPractice
                                )
                            }
                        }
                    }
                }

                JourneyEncouragementBanner(action: onContinueJourney)
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.md)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle("Progres")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var attentionEmptyText: String {
        "Încă nu sunt destule răspunsuri. O lecție apare aici după cel puțin \(ProgressInsightsBuilder.minimumUnitAttempts) răspunsuri, dacă ai sub 80% corecte din prima."
    }

    private func vocabularyDetail(_ insights: ProgressInsights) -> String {
        insights.wordsPractised > 0 ? "\(insights.wordsPractised) cuvinte exersate" : "Fără date încă"
    }

    private func accuracyDetail(_ accuracy: AccuracySummary, unit: String) -> String {
        accuracy.attempts > 0 ? "corecte din prima · \(accuracy.attempts) \(unit)" : "Fără date încă"
    }

    static func skillIcon(_ skill: MasterySkill) -> String {
        switch skill {
        case .recognition: return "eye"
        case .meaning: return "text.book.closed"
        case .recall: return "brain.head.profile"
        case .production: return "text.bubble"
        case .listening: return "ear"
        case .sentenceBuilding: return "list.bullet.rectangle"
        case .speaking: return "speaker.wave.2"
        case .transfer: return "arrow.triangle.branch"
        case .retrievalFluency: return "bolt"
        }
    }

    static func skillName(_ skill: MasterySkill) -> String {
        switch skill {
        case .recognition: return "Recunoaștere"
        case .meaning: return "Înțeles"
        case .recall: return "Reamintire"
        case .production: return "Producție"
        case .listening: return "Ascultare"
        case .sentenceBuilding: return "Construcția propozițiilor"
        case .speaking: return "Pronunție"
        case .transfer: return "Transfer"
        case .retrievalFluency: return "Fluență"
        }
    }
}
