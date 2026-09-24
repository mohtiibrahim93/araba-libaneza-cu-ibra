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
            VStack(alignment: .leading, spacing: 18) {
                BrandHeader(tagline: "Mai aproape de oameni. Mai aproape de Liban.")

                VStack(alignment: .leading, spacing: 4) {
                    Text("Progresul meu")
                        .font(Theme.serif(.largeTitle))
                        .foregroundStyle(Theme.ink)
                    Text("O călătorie reală, pas cu pas.")
                        .font(Theme.serif(.subheadline, weight: .regular))
                        .foregroundStyle(Theme.muted)
                }
                .padding(.trailing, 120)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(alignment: .trailing) {
                    Image("illus-progress")
                        .resizable()
                        .scaledToFill()
                        .frame(width: 170, height: 90)
                        .clipped()
                        .mask(LinearGradient(colors: [.clear, .black, .black], startPoint: .leading, endPoint: .trailing))
                        .offset(x: 20)
                        .accessibilityHidden(true)
                }
                .accessibilityIdentifier("progress.header")

                overviewCard(summary)
                skillsRow(summary)

                HStack(alignment: .top, spacing: 12) {
                    streakCard
                    activityCard(summary)
                }

                HStack(alignment: .top, spacing: 12) {
                    reviewsCard
                    attentionCard(summary)
                }

                closingBanner
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle("Progres")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func overviewCard(_ summary: ProgressDashboardSummary) -> some View {
        HStack(spacing: 18) {
            ZStack {
                Circle().stroke(Theme.line, lineWidth: 10)
                Circle()
                    .trim(from: 0, to: CGFloat(summary.journeyFraction))
                    .stroke(Theme.deep, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    Text("\(Int((summary.journeyFraction * 100).rounded()))%")
                        .font(Theme.serif(.title))
                        .foregroundStyle(Theme.ink)
                    Text("din Parcurs")
                        .font(Theme.font(.caption2))
                        .foregroundStyle(Theme.muted)
                }
            }
            .frame(width: 118, height: 118)

            VStack(alignment: .leading, spacing: 6) {
                Text("Nivelul parcursului")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                Text(journeyLevel.rawValue.uppercased())
                    .font(Theme.serif(.largeTitle))
                    .foregroundStyle(Theme.ink)
                Text("\(summary.completedLessons) din \(summary.totalLessons) lecții")
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.teal)
                Text("\(summary.practisedExpressions) expresii exersate")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 0)
        }
        .padding(18)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }

    private func skillsRow(_ summary: ProgressDashboardSummary) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(skillCards, id: \.skill) { card in
                    let skill = summary.skill(card.skill)
                    VStack(alignment: .leading, spacing: 10) {
                        Image(systemName: card.icon)
                            .foregroundStyle(card.foreground)
                            .frame(width: 38, height: 38)
                            .background(card.foreground.opacity(0.15), in: Circle())
                        Text(card.title)
                            .font(Theme.serif(.headline))
                            .foregroundStyle(card.foreground)
                        if let rate = skill.cleanRate {
                            Text("\(Int((rate * 100).rounded()))%")
                                .font(Theme.serif(.title2))
                                .foregroundStyle(card.foreground)
                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    Capsule().fill(card.foreground.opacity(0.25))
                                    Capsule().fill(card.foreground)
                                        .frame(width: geometry.size.width * CGFloat(rate))
                                }
                            }
                            .frame(height: 5)
                            Text("\(skill.attempts) încercări din prima")
                                .font(Theme.font(.caption2))
                                .foregroundStyle(card.foreground.opacity(0.85))
                        } else {
                            Text("Fără date încă")
                                .font(Theme.font(.subheadline, weight: .semibold))
                                .foregroundStyle(card.foreground.opacity(0.85))
                        }
                    }
                    .padding(14)
                    .frame(width: 150, height: 190, alignment: .topLeading)
                    .background(card.fill, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .accessibilityElement(children: .combine)
                }
            }
        }
    }

    private var streakCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Seria ta actuală")
                .font(Theme.serif(.subheadline))
                .foregroundStyle(Theme.ink)
            HStack(spacing: 8) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(rewards.isActiveToday ? Theme.streak : Theme.muted)
                Text(RewardText.days(rewards.streakDays))
                    .font(Theme.serif(.title2))
                    .foregroundStyle(Theme.ink)
                    .minimumScaleFactor(0.7)
            }
            Text(rewards.isActiveToday ? "Continuă așa!" : "Exersează azi ca să păstrezi seria.")
                .font(Theme.font(.caption))
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(14)
        .frame(maxWidth: .infinity, minHeight: 150, alignment: .topLeading)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }

    private func activityCard(_ summary: ProgressDashboardSummary) -> some View {
        let days = builder.recentDays(weeks: 8, endingAt: date)
        return VStack(alignment: .leading, spacing: 8) {
            Text("Activitatea ta")
                .font(Theme.serif(.subheadline))
                .foregroundStyle(Theme.ink)
            let columns = Array(repeating: GridItem(.flexible(), spacing: 3), count: 8)
            LazyVGrid(columns: columns, spacing: 3) {
                ForEach(0..<7, id: \.self) { weekday in
                    ForEach(0..<8, id: \.self) { week in
                        let key = days[week * 7 + weekday]
                        RoundedRectangle(cornerRadius: 2, style: .continuous)
                            .fill(activityColor(summary.xpByDay[key] ?? 0))
                            .aspectRatio(1, contentMode: .fit)
                    }
                }
            }
            .accessibilityHidden(true)
            Text("\(summary.lessonsLast30Days) lecții în ultima lună")
                .font(Theme.font(.caption2, weight: .semibold))
                .foregroundStyle(Theme.muted)
        }
        .padding(14)
        .frame(maxWidth: .infinity, minHeight: 150, alignment: .topLeading)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }

    private func activityColor(_ xp: Int) -> Color {
        switch xp {
        case 0: return Theme.line.opacity(0.7)
        case 1..<15: return Theme.teal.opacity(0.35)
        case 15..<40: return Theme.teal.opacity(0.65)
        default: return Theme.deep
        }
    }

    private var reviewsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Repetiții programate", systemImage: "calendar")
                .font(Theme.serif(.subheadline))
                .foregroundStyle(Theme.ink)
            ProgressActionRow(icon: "arrow.triangle.2.circlepath", title: "De repetat acum",
                              detail: "\(reviewQueue.dueNowCount) expresii", action: "Revizuiește", onTap: onReviews)
            ProgressActionRow(icon: "exclamationmark.bubble.fill", title: "Greșeli active",
                              detail: "\(progress.activeMistakeExpressionIDs.count) expresii", action: "Exersează", onTap: onSmartPractice)
            ProgressActionRow(icon: "bolt.fill", title: "Speed Drill",
                              detail: "\(progress.speedDrillProgress.sessionCount) sesiuni", action: "Începe", onTap: onSpeedDrill)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .cardBackground()
    }

    private func attentionCard(_ summary: ProgressDashboardSummary) -> some View {
        let weak = summary.skills.values
            .filter { ($0.cleanRate ?? 1) < 0.8 }
            .sorted { ($0.cleanRate ?? 0) < ($1.cleanRate ?? 0) }
            .prefix(3)
        return VStack(alignment: .leading, spacing: 12) {
            Label("Zone care au nevoie de atenție", systemImage: "chart.bar.xaxis")
                .font(Theme.serif(.subheadline))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            if weak.isEmpty {
                Text("Nicio zonă slabă încă. Exersează ca să vezi unde poți crește.")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
            } else {
                ForEach(Array(weak), id: \.skill) { skill in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(Self.skillName(skill.skill))
                            .font(Theme.font(.caption, weight: .semibold))
                            .foregroundStyle(Theme.ink)
                        HStack(spacing: 6) {
                            Text("\(Int(((skill.cleanRate ?? 0) * 100).rounded()))%")
                                .font(Theme.font(.caption, weight: .bold))
                                .foregroundStyle(Theme.terracotta)
                            GeometryReader { geometry in
                                ZStack(alignment: .leading) {
                                    Capsule().fill(Theme.line)
                                    Capsule().fill(Theme.terracotta)
                                        .frame(width: geometry.size.width * CGFloat(skill.cleanRate ?? 0))
                                }
                            }
                            .frame(height: 5)
                        }
                    }
                    .accessibilityElement(children: .combine)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .cardBackground()
    }

    private var closingBanner: some View {
        HStack(spacing: 0) {
            Image("illus-sunset")
                .resizable()
                .scaledToFill()
                .frame(width: 110)
                .frame(maxHeight: .infinity)
                .clipped()
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 8) {
                Text("Ești pe drumul cel bun!")
                    .font(Theme.serif(.headline))
                    .foregroundStyle(.white)
                Text("Fiecare lecție te aduce mai aproape de conversații reale.")
                    .font(Theme.font(.caption))
                    .foregroundStyle(.white.opacity(0.85))
                    .fixedSize(horizontal: false, vertical: true)
                Button(action: onContinueJourney) {
                    Label("Continuă călătoria", systemImage: "arrow.right")
                        .labelStyle(TrailingIconLabelStyle())
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(Theme.terracotta, in: Capsule())
                }
                .buttonStyle(NodeButtonStyle())
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(minHeight: 150)
        .background(Theme.deep)
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
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

private struct ProgressActionRow: View {
    let icon: String
    let title: String
    let detail: String
    let action: String
    let onTap: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.terracotta)
                .frame(width: 30, height: 30)
                .background(Theme.blush, in: Circle())
            VStack(alignment: .leading, spacing: 0) {
                Text(title)
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Text(detail)
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 2)
            Button(action: onTap) {
                Text(action)
                    .font(Theme.font(.caption2, weight: .semibold))
                    .foregroundStyle(Theme.terracotta)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(Theme.blush, in: Capsule())
            }
            .buttonStyle(.plain)
        }
    }
}
