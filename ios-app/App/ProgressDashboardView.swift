import SwiftUI
import YallaCore

/// "Progresul meu": journey completion, skills, streak, activity and what to review.
struct ProgressDashboardView: View {
    let progress: LearnerProgressSnapshot
    let lessonCounts: [String: Int]
    let journeyLevel: LevelBand
    let reviewQueue: ReviewQueueSummary
    let rewards: RewardSummary
    let date: Date
    let onReviews: () -> Void
    let onSmartPractice: () -> Void
    let onSpeedDrill: () -> Void
    let onContinueJourney: () -> Void
    let onSettings: () -> Void

    private let builder = ProgressDashboardBuilder()

    private struct SkillCard {
        let skill: MasterySkill
        let title: String
        let icon: String
        let fill: Color
        let foreground: Color
    }

    private let skillCards: [SkillCard] = [
        SkillCard(skill: .recognition, title: "Recunoaștere", icon: "eye.fill", fill: Theme.deep, foreground: .white),
        SkillCard(skill: .production, title: "Producție", icon: "text.bubble.fill", fill: Theme.terracotta, foreground: .white),
        SkillCard(skill: .listening, title: "Ascultare", icon: "headphones", fill: Theme.variantBackground, foreground: Theme.ink),
        SkillCard(skill: .speaking, title: "Pronunție", icon: "mic.fill", fill: Theme.mint, foreground: Theme.ink)
    ]

    var body: some View {
        let summary = builder.summary(snapshot: progress, lessonCounts: lessonCounts, at: date)
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                HStack(alignment: .center) {
                    BrandHeader(tagline: "Mai aproape de oameni. Mai aproape de Liban.")
                    Spacer(minLength: Theme.Spacing.xs)
                    Button(action: onSettings) {
                        Image(systemName: "gearshape")
                            .font(.title3.weight(.medium))
                            .foregroundStyle(Theme.ink)
                            .frame(width: 44, height: 44)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Setări și profil")
                }

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
                .padding(.vertical, Theme.Spacing.s)
                .padding(.trailing, 80)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(alignment: .trailing) {
                    DecorativeImage(name: "illus-progress", width: 190, height: 104, fadeTowards: .leading)
                        .offset(x: Theme.Spacing.screen)
                }
                .accessibilityIdentifier("progress.header")

                ProgressOverviewCard(summary: summary, level: journeyLevel)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Theme.Spacing.xs), count: 4), spacing: Theme.Spacing.xs) {
                    ForEach(skillCards, id: \.skill) { card in
                        SkillProgressCard(
                            title: card.title,
                            icon: card.icon,
                            fill: card.fill,
                            foreground: card.foreground,
                            skill: summary.skill(card.skill)
                        )
                    }
                }

                HStack(alignment: .top, spacing: Theme.Spacing.s) {
                    StreakCard(rewards: rewards)
                    ActivityHeatmapCard(
                        days: builder.recentDays(weeks: 8, endingAt: date),
                        xpByDay: summary.xpByDay,
                        lessonsLast30Days: summary.lessonsLast30Days
                    )
                }

                VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                    ProgressListCard(title: "Repetiții programate", icon: "calendar", onSeeAll: onReviews) {
                        ScheduledReviewRow(icon: "arrow.triangle.2.circlepath", title: "De repetat acum",
                                           detail: "\(reviewQueue.dueNowCount) expresii", action: "Revizuiește", onTap: onReviews)
                        ScheduledReviewRow(icon: "exclamationmark.bubble", title: "Greșeli active",
                                           detail: "\(progress.activeMistakeExpressionIDs.count) expresii", action: "Exersează", onTap: onSmartPractice)
                        ScheduledReviewRow(icon: "bolt", title: "Speed Drill",
                                           detail: "\(progress.speedDrillProgress.sessionCount) sesiuni", action: "Începe", onTap: onSpeedDrill)
                    }
                    ProgressListCard(title: "Zone care au nevoie de atenție", icon: "chart.bar.xaxis") {
                        let weak = weakSkills(summary)
                        if weak.isEmpty {
                            Text("Nicio zonă slabă încă. Exersează ca să vezi unde poți crește.")
                                .font(Theme.font(.caption))
                                .foregroundStyle(Theme.muted)
                                .fixedSize(horizontal: false, vertical: true)
                        } else {
                            ForEach(weak, id: \.skill) { skill in
                                AttentionAreaRow(
                                    icon: Self.skillIcon(skill.skill),
                                    title: Self.skillName(skill.skill),
                                    fraction: skill.cleanRate ?? 0,
                                    onTap: onSmartPractice
                                )
                            }
                        }
                    }
                }

                JourneyEncouragementBanner(action: onContinueJourney)
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.s)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
    }

    /// Practised skills under 80% first-try accuracy, weakest first.
    private func weakSkills(_ summary: ProgressDashboardSummary) -> [SkillSummary] {
        Array(
            summary.skills.values
                .filter { ($0.cleanRate ?? 1) < 0.8 }
                .sorted { ($0.cleanRate ?? 0) < ($1.cleanRate ?? 0) }
                .prefix(3)
        )
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
