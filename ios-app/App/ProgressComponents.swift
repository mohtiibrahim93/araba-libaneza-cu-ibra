import SwiftUI
import YallaCore

// Building blocks of the Progres tab (reference 09). Every figure comes from
// ProgressDashboardSummary or the learner snapshot; nothing is estimated.

/// Journey completion ring, current CEFR band and the next band.
struct ProgressOverviewCard: View {
    let summary: ProgressDashboardSummary
    let level: LevelBand

    private var nextLevel: LevelBand? {
        let all = LevelBand.allCases
        guard let index = all.firstIndex(of: level), index + 1 < all.count else { return nil }
        return all[index + 1]
    }

    var body: some View {
        HStack(spacing: Theme.Spacing.xl) {
            ProgressRing(fraction: summary.journeyFraction, tint: Theme.deep, lineWidth: 11) {
                VStack(spacing: 0) {
                    Text("\(Int((summary.journeyFraction * 100).rounded()))%")
                        .font(Theme.serif(.title))
                        .foregroundStyle(Theme.ink)
                    Text("din Călătorie")
                        .font(Theme.font(.caption2))
                        .foregroundStyle(Theme.muted)
                }
            }
            .frame(width: 120, height: 120)

            VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                Text("Nivel actual")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                Text(level.rawValue.uppercased())
                    .font(Theme.serif(.largeTitle))
                    .foregroundStyle(Theme.ink)
                Text("\(summary.completedLessons) din \(summary.totalLessons) lecții")
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(Theme.teal)
                LevelBars(level: level)
                    .padding(.vertical, Theme.Spacing.xxs)
                if let nextLevel {
                    Text("Urmează: \(nextLevel.rawValue.uppercased())")
                        .font(Theme.font(.caption, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                }
                Text("\(summary.practisedExpressions) expresii exersate")
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.xl)
        .cardBackground()
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("progress.overview")
    }
}

/// One rising bar per CEFR band, filled up to the current band.
struct LevelBars: View {
    let level: LevelBand

    var body: some View {
        let all = LevelBand.allCases
        let current = all.firstIndex(of: level) ?? 0
        HStack(alignment: .bottom, spacing: 4) {
            ForEach(Array(all.enumerated()), id: \.offset) { index, _ in
                RoundedRectangle(cornerRadius: 2, style: .continuous)
                    .fill(index <= current ? Theme.deep : Theme.line)
                    .frame(width: 9, height: CGFloat(10 + index * 5))
            }
        }
        .accessibilityHidden(true)
    }
}

/// Coloured tile for one learning area. Shows first-try accuracy when there
/// is data, a real count when that is the only measure, or "Fără date încă".
struct SkillProgressCard: View {
    let title: String
    let icon: String
    let fill: Color
    let foreground: Color
    /// 0...1 first-try accuracy, or nil.
    let fraction: Double?
    /// Big value when there is no percentage (e.g. a count).
    var countValue: Int? = nil
    let detail: String

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            IconBadge(systemName: icon, tint: foreground, background: foreground.opacity(0.16), size: 36)
            Text(title)
                .font(Theme.serif(.subheadline))
                .foregroundStyle(foreground)
                .lineLimit(1)
                .minimumScaleFactor(0.45)
            if let fraction {
                Text("\(Int((fraction * 100).rounded()))%")
                    .font(Theme.serif(.title3))
                    .foregroundStyle(foreground)
                MeterBar(fraction: fraction, tint: foreground, track: foreground.opacity(0.25), height: 5)
            } else if let countValue {
                Text("\(countValue)")
                    .font(Theme.serif(.title3))
                    .foregroundStyle(foreground)
            }
            Text(detail)
                .font(Theme.font(.caption2))
                .foregroundStyle(foreground.opacity(0.88))
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.md - 2)
        .frame(maxWidth: .infinity, minHeight: 200, alignment: .topLeading)
        .background(fill, in: RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}

struct StreakCard: View {
    let rewards: RewardSummary

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Seria ta actuală")
                .font(Theme.serif(.subheadline))
                .foregroundStyle(Theme.ink)
            Spacer(minLength: 0)
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 38))
                    .foregroundStyle(rewards.isActiveToday ? Theme.streak : Theme.muted)
                    .accessibilityHidden(true)
                Text(RewardText.days(rewards.streakDays))
                    .font(Theme.serif(.title2))
                    .foregroundStyle(Theme.ink)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
            }
            Text(rewards.isActiveToday ? "Continuă așa!" : "Exersează azi ca să păstrezi seria.")
                .font(Theme.font(.caption))
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.lg - 2)
        .frame(maxWidth: .infinity, minHeight: 160, alignment: .topLeading)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }
}

/// Eight weeks of XP, one square per day, with month labels above the columns.
struct ActivityHeatmapCard: View {
    /// Day keys (`yyyy-MM-dd`), oldest first, a multiple of 7.
    let days: [String]
    let xpByDay: [String: Int]
    let lessonsLast30Days: Int
    /// Change against the previous 30 days, when that period had lessons.
    var trendPercent: Int? = nil

    private static let monthNames = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"]

    private var weeks: Int { days.count / 7 }

    /// Month label on the first column of each month.
    private func monthLabel(week: Int) -> String {
        let month = { (key: String) -> Int? in Int(key.dropFirst(5).prefix(2)) }
        guard let current = month(days[week * 7]) else { return "" }
        if week > 0, month(days[(week - 1) * 7]) == current { return "" }
        return Self.monthNames[(current - 1 + 12) % 12]
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Activitatea ta de învățare")
                .font(Theme.serif(.subheadline))
                .foregroundStyle(Theme.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            HStack(alignment: .top, spacing: 3) {
                ForEach(0..<weeks, id: \.self) { week in
                    VStack(alignment: .leading, spacing: 3) {
                        Text(monthLabel(week: week))
                            .font(Theme.font(.caption2))
                            .foregroundStyle(Theme.muted)
                            .fixedSize()
                            .frame(width: 13, height: 14, alignment: .leading)
                        ForEach(0..<7, id: \.self) { weekday in
                            RoundedRectangle(cornerRadius: 2, style: .continuous)
                                .fill(color(for: xpByDay[days[week * 7 + weekday]] ?? 0))
                                .frame(width: 13, height: 13)
                        }
                    }
                }
            }
            .accessibilityHidden(true)
            HStack(spacing: Theme.Spacing.xs) {
                Text("\(lessonsLast30Days) lecții în ultima lună")
                    .font(Theme.font(.caption2, weight: .semibold))
                    .foregroundStyle(Theme.muted)
                if let trendPercent {
                    Spacer(minLength: 0)
                    Label(trendText(trendPercent), systemImage: trendPercent >= 0 ? "arrow.up" : "arrow.down")
                        .font(Theme.font(.caption2, weight: .semibold))
                        .foregroundStyle(trendPercent >= 0 ? Theme.success : Theme.terracottaShade)
                        .accessibilityLabel(trendText(trendPercent) + " față de luna trecută")
                }
            }
        }
        .padding(Theme.Spacing.lg - 2)
        .frame(maxWidth: .infinity, minHeight: 160, alignment: .topLeading)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }

    private func trendText(_ percent: Int) -> String {
        percent >= 0 ? "+\(percent)%" : "\(percent)%"
    }

    private func color(for xp: Int) -> Color {
        switch xp {
        case 0: return Theme.line.opacity(0.7)
        case 1..<15: return Theme.teal.opacity(0.35)
        case 15..<40: return Theme.teal.opacity(0.65)
        default: return Theme.deep
        }
    }
}

/// Titled card with an icon, an optional "Vezi toate" link and rows.
struct ProgressListCard<Content: View>: View {
    let title: String
    let icon: String
    var onSeeAll: (() -> Void)? = nil
    @ViewBuilder var content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: icon)
                    .foregroundStyle(Theme.ink)
                    .accessibilityHidden(true)
                Text(title)
                    .font(Theme.serif(.subheadline))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                    .accessibilityAddTraits(.isHeader)
                Spacer(minLength: 0)
                if let onSeeAll {
                    Button(action: onSeeAll) {
                        HStack(spacing: 2) {
                            Text("Vezi toate")
                            Image(systemName: "chevron.right")
                        }
                        .font(Theme.font(.caption2, weight: .semibold))
                        .foregroundStyle(Theme.muted)
                    }
                    .buttonStyle(.plain)
                }
            }
            content()
        }
        .padding(Theme.Spacing.lg - 2)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .cardBackground()
    }
}

/// Row in "Repetiții programate": icon, count and a pill action.
struct ScheduledReviewRow: View {
    let icon: String
    let title: String
    let detail: String
    let action: String
    let onTap: () -> Void

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            IconBadge(systemName: icon, tint: Theme.terracotta, background: Theme.blush, size: 32)
            VStack(alignment: .leading, spacing: 0) {
                Text(title)
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
                Text(detail)
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 2)
            Button(action: onTap) {
                Text(action)
                    .font(Theme.font(.caption2, weight: .semibold))
                    .foregroundStyle(Theme.terracotta)
                    .padding(.horizontal, Theme.Spacing.sm)
                    .padding(.vertical, 5)
                    .background(Theme.blush, in: Capsule())
            }
            .buttonStyle(.plain)
        }
    }
}

/// Row in "Zone care au nevoie de atenție": a weak skill and its accuracy.
struct AttentionAreaRow: View {
    let icon: String
    let title: String
    let fraction: Double
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: Theme.Spacing.sm) {
                IconBadge(systemName: icon, tint: Theme.terracotta, background: Theme.blush, size: 32)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(Theme.font(.caption, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                    HStack(spacing: 6) {
                        Text("\(Int((fraction * 100).rounded()))%")
                            .font(Theme.font(.caption, weight: .bold))
                            .foregroundStyle(Theme.terracotta)
                        MeterBar(fraction: fraction, tint: Theme.terracotta)
                    }
                }
                Image(systemName: "chevron.right")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Theme.muted)
                    .accessibilityHidden(true)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityHint("Pornește o sesiune de exersare")
    }
}

/// Closing banner: coastal scenery on the left, cedar panel with the next step.
struct JourneyEncouragementBanner: View {
    let action: () -> Void

    var body: some View {
        ZStack(alignment: .trailing) {
            DecorativeImage(name: "illus-raouche", width: 150)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)

            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text("Ești pe drumul cel bun!")
                    .font(Theme.serif(.headline))
                    .foregroundStyle(.white)
                Text("Fiecare lecție te aduce mai aproape de conversații reale.")
                    .font(Theme.font(.caption))
                    .foregroundStyle(.white.opacity(0.88))
                    .fixedSize(horizontal: false, vertical: true)
                Button(action: action) {
                    Label("Continuă călătoria", systemImage: "arrow.right")
                        .labelStyle(TrailingIconLabelStyle())
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .lineLimit(1)
                        .fixedSize()
                }
                .buttonStyle(PillButtonStyle())
                .padding(.top, Theme.Spacing.xxs)
                .accessibilityIdentifier("progress.continue")
            }
            .padding(Theme.Spacing.lg)
            .padding(.leading, Theme.Spacing.md)
            .frame(maxHeight: .infinity)
            .frame(width: 262, alignment: .leading)
            .background(
                Theme.deep,
                in: UnevenRoundedRectangle(topLeadingRadius: 70, bottomLeadingRadius: 0, style: .continuous)
            )
            .overlay(alignment: .topTrailing) {
                CedarShape()
                    .fill(.white.opacity(0.14))
                    .frame(width: 34, height: 32)
                    .padding(Theme.Spacing.md)
                    .accessibilityHidden(true)
            }
        }
        .frame(minHeight: 164)
        .background(Theme.deep)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.feature, style: .continuous))
    }
}
