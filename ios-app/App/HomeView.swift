import SwiftUI
import YallaCore

struct HomeExpression: Identifiable, Equatable {
    let id: String
    let arabizi: String
    let meaning: String
}

/// Acasă, composed from shared primitives and real learner state.
struct HomeView: View {
    let reviewQueue: ReviewQueueSummary
    let progress: LearnerProgressSnapshot
    let journeyLevel: LevelBand
    let persistenceError: String?
    let rewards: RewardSummary
    let goals: DailyGoalStatus
    let smartSessionSize: Int
    let weakSkills: [MasterySkill]
    let expressionOfDay: HomeExpression?
    let savedExpressions: [HomeExpression]
    let modes: [PracticeModeSummary]
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @Binding var path: [String]
    let onReviews: () -> Void
    let onContinueJourney: () -> Void
    let onSmartPractice: () -> Void
    let onSpeedDrill: () -> Void
    let onSpeak: () -> Void
    let onProgress: () -> Void
    let onDiscover: () -> Void
    let onProfile: () -> Void

    @AppStorage("learnerName") private var learnerName = ""

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                    HomeHeaderBar(
                        learnerName: learnerName,
                        hasDueReviews: reviewQueue.dueNowCount > 0,
                        onReviews: onReviews,
                        onProfile: onProfile
                    )
                    HomeGreeting(learnerName: learnerName)

                    if persistenceError != nil {
                        Label(
                            "Progresul local nu a putut fi încărcat. Datele existente nu au fost șterse.",
                            systemImage: "exclamationmark.triangle.fill"
                        )
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .foregroundStyle(Theme.danger)
                        .padding(Theme.Spacing.m)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardBackground(Theme.dangerBackground)
                    }

                    HomeStatsStrip(rewards: rewards, goals: goals, journeyLevel: journeyLevel)
                    HomeSmartSessionHero(
                        subtitle: heroSubtitle,
                        exerciseCount: smartSessionSize,
                        action: onSmartPractice
                    )
                    HomeDailyProgressCard(
                        goals: goals,
                        onLesson: onContinueJourney,
                        onReview: onReviews,
                        onSpeedDrill: onSpeedDrill,
                        onProgress: onProgress
                    )
                    HomeSpeakBanner(action: onSpeak)
                    NavigationLink(value: "practice") {
                        HomeLinkRow(
                            icon: "bolt.fill",
                            title: "Toate modurile de practică",
                            detail: "Sesiune inteligentă, Speed Drill, ascultare și pronunție"
                        )
                    }
                    .buttonStyle(NodeButtonStyle())
                    .accessibilityIdentifier("home.practice-all")

                    HStack(alignment: .top, spacing: Theme.Spacing.s) {
                        if let expressionOfDay {
                            HomeExpressionCard(
                                expression: expressionOfDay,
                                isSaved: progress.savedExpressionIDs.contains(expressionOfDay.id),
                                onToggleSaved: {
                                    Task { await progressModel.toggleSavedExpressionID(expressionOfDay.id) }
                                }
                            )
                        }
                        HomeSavedPhrasesCard(expressions: savedExpressions, action: onDiscover)
                    }
                }
                .padding(.horizontal, Theme.Spacing.screen)
                .padding(.vertical, Theme.Spacing.s)
            }
            .background(Theme.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: String.self) { id in
                switch id {
                case "practice":
                    PracticeListView(modes: modes, package: package, locale: locale, progressModel: progressModel)
                case "ai-conversation":
                    AIConversationPreviewView()
                default:
                    PracticeModeScreen(modeID: id, modes: modes, package: package, locale: locale, progressModel: progressModel)
                }
            }
        }
    }

    /// Built from the learner's actual review queue, mistakes and weak skills.
    private var heroSubtitle: String {
        var parts: [String] = []
        if reviewQueue.dueNowCount > 0 {
            parts.append(reviewQueue.dueNowCount == 1 ? "1 recapitulare" : "\(reviewQueue.dueNowCount) recapitulări")
        }
        let mistakes = progress.activeMistakeExpressionIDs.count
        if mistakes > 0 {
            parts.append(mistakes == 1 ? "1 greșeală" : "\(mistakes) greșeli")
        }
        parts += weakSkills.prefix(2).map { ProgressDashboardView.skillName($0).lowercased() }
        guard !parts.isEmpty else {
            return "Recapitulări, greșeli și material nou, alese pentru tine."
        }
        return "Bazat pe zonele tale mai slabe: " + parts.joined(separator: ", ") + "."
    }
}

// MARK: - Home components

struct HomeHeaderBar: View {
    let learnerName: String
    let hasDueReviews: Bool
    let onReviews: () -> Void
    let onProfile: () -> Void

    var body: some View {
        HStack(alignment: .center, spacing: Theme.Spacing.s) {
            BrandHeader(tagline: "Oameni. Vorbe. O altă perspectivă.", twoTone: true)
            Spacer(minLength: Theme.Spacing.xs)
            Button(action: onReviews) {
                Image(systemName: "bell")
                    .font(.title3.weight(.medium))
                    .foregroundStyle(Theme.ink)
                    .frame(width: 44, height: 44)
                    .overlay(alignment: .topTrailing) {
                        if hasDueReviews {
                            Circle()
                                .fill(Theme.terracotta)
                                .frame(width: 9, height: 9)
                                .offset(x: -9, y: 9)
                        }
                    }
            }
            .buttonStyle(.plain)
            .accessibilityLabel(hasDueReviews ? "Recapitulări de făcut" : "Recapitulări")
            .accessibilityIdentifier("home.bell")
            Button(action: onProfile) {
                LearnerAvatar(name: learnerName, size: 46)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Profilul meu")
        }
    }
}

struct HomeGreeting: View {
    let learnerName: String

    private var greeting: String {
        let name = learnerName.trimmingCharacters(in: .whitespacesAndNewlines)
        return name.isEmpty ? "Mar7aba!" : "Mar7aba, \(name)!"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text(greeting)
                .font(Theme.serif(.largeTitle))
                .foregroundStyle(Theme.ink)
                .minimumScaleFactor(0.7)
                .lineLimit(1)
            Text("Astăzi e o zi bună pentru încă o conversație.")
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.ink.opacity(0.8))
                .fixedSize(horizontal: false, vertical: true)
            Capsule()
                .fill(Theme.terracotta)
                .frame(width: 64, height: 3)
                .rotationEffect(.degrees(-2))
                .padding(.top, Theme.Spacing.xxs)
                .accessibilityHidden(true)
        }
        .padding(.vertical, Theme.Spacing.s)
        .padding(.trailing, 96)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(alignment: .trailing) {
            DecorativeImage(name: "illus-raouche", width: 180, height: 110, fadeTowards: .leading)
                .offset(x: Theme.Spacing.screen)
        }
    }
}

struct HomeStatsStrip: View {
    let rewards: RewardSummary
    let goals: DailyGoalStatus
    let journeyLevel: LevelBand

    var body: some View {
        HStack(spacing: 0) {
            StatItem(value: "\(rewards.streakDays)", label: "zile la rând", icon: "flame.fill",
                     tint: rewards.isActiveToday ? Theme.streak : Theme.muted)
            divider
            StatItem(value: "\(goals.completedCount)/\(goals.totalCount)", label: "obiective azi", icon: "target", tint: Theme.terracotta)
            divider
            StatItem(value: journeyLevel.rawValue.uppercased(), label: "nivel actual", icon: "chart.bar.fill", tint: Theme.teal)
            divider
            StatItem(value: "\(rewards.totalXP)", label: "puncte", icon: "star.fill", tint: Theme.terracotta)
        }
        .padding(.vertical, Theme.Spacing.m)
        .padding(.horizontal, Theme.Spacing.xs)
        .cardBackground()
        .accessibilityIdentifier("home.stats")
    }

    private var divider: some View {
        Rectangle()
            .fill(Theme.line)
            .frame(width: 1, height: 34)
    }
}

struct HomeSmartSessionHero: View {
    let subtitle: String
    let exerciseCount: Int
    let action: () -> Void

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                Label("Sesiune inteligentă", systemImage: "sparkle")
                    .font(Theme.font(.subheadline, weight: .medium))
                    .foregroundStyle(.white.opacity(0.9))
                Text("Practica ta de azi")
                    .font(Theme.serif(.title))
                    .foregroundStyle(.white)
                    .fixedSize(horizontal: false, vertical: true)
                Text(subtitle)
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(.white.opacity(0.88))
                    .fixedSize(horizontal: false, vertical: true)
                HStack(spacing: Theme.Spacing.s) {
                    Button(action: action) {
                        Label("Continuă acum", systemImage: "play.fill")
                    }
                    .buttonStyle(PillButtonStyle())
                    .accessibilityIdentifier("home.continue")
                    if exerciseCount > 0 {
                        Text("\(exerciseCount) exerciții")
                            .font(Theme.font(.caption, weight: .medium))
                            .foregroundStyle(.white.opacity(0.85))
                    }
                }
                .padding(.top, Theme.Spacing.xxs)
            }
            .padding(Theme.Spacing.l)
            .frame(maxWidth: .infinity, alignment: .leading)

            DecorativeImage(name: "illus-cafe", width: 120, fadeTowards: .leading)
        }
        .background(Theme.deep)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.hero, style: .continuous))
        .elevation(.hero(Theme.deep))
    }
}

struct HomeDailyProgressCard: View {
    let goals: DailyGoalStatus
    let onLesson: () -> Void
    let onReview: () -> Void
    let onSpeedDrill: () -> Void
    let onProgress: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.m) {
            // Opens the Progres tab; the rings below start each goal.
            Button(action: onProgress) {
                SectionHeader(
                    title: "Progresul de azi",
                    trailing: "\(goals.completedCount) din \(goals.totalCount) finalizate",
                    showsChevron: true
                )
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("home.progress")
            HStack(spacing: Theme.Spacing.xs) {
                DailyGoalRing(title: "Lecție", icon: "book", done: goals.lessonDone, tint: Theme.teal, action: onLesson)
                DailyGoalRing(title: "Recapitulare", icon: "arrow.triangle.2.circlepath", done: goals.reviewDone, tint: Theme.terracotta, action: onReview)
                DailyGoalRing(title: "Speed Drill", icon: "bolt", done: goals.speedDrillDone, tint: Theme.goldShade, action: onSpeedDrill)
            }
        }
        .padding(Theme.Spacing.m)
        .cardBackground()
    }
}

struct DailyGoalRing: View {
    let title: String
    let icon: String
    let done: Bool
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: Theme.Spacing.xs) {
                ProgressRing(fraction: done ? 1 : 0, tint: tint, lineWidth: 5) {
                    Image(systemName: done ? "checkmark" : icon)
                        .font(.title3.weight(.medium))
                        .foregroundStyle(done ? tint : Theme.teal)
                }
                .frame(width: 64, height: 64)
                Text(title)
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Text(done ? "1/1" : "0/1")
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(NodeButtonStyle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(title)
        .accessibilityValue(done ? "Finalizat azi" : "Nefinalizat azi")
        .accessibilityAddTraits(.isButton)
    }
}

/// Plain card row that leads to another screen.
struct HomeLinkRow: View {
    let icon: String
    let title: String
    let detail: String

    var body: some View {
        HStack(spacing: Theme.Spacing.m) {
            IconBadge(systemName: icon, tint: Theme.goldShade, background: Theme.variantBackground, size: 46)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.serif(.headline))
                    .foregroundStyle(Theme.ink)
                Text(detail)
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Theme.muted)
                .accessibilityHidden(true)
        }
        .padding(Theme.Spacing.m)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }
}

struct HomeSpeakBanner: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.m) {
                IconBadge(systemName: "mic.fill", tint: .white, background: Theme.terracotta, size: 58)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Vorbește azi")
                        .font(Theme.serif(.title3))
                        .foregroundStyle(Theme.terracotta)
                    Text("Conversație scurtă, cu feedback AI · În curând")
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.ink.opacity(0.85))
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Theme.terracotta)
                    .frame(width: 38, height: 38)
                    .background(Theme.surface.opacity(0.85), in: Circle())
                    .accessibilityHidden(true)
            }
            .padding(Theme.Spacing.m)
            .background(alignment: .trailing) {
                CedarShape()
                    .fill(Theme.terracotta.opacity(0.10))
                    .frame(width: 96, height: 88)
                    .offset(x: -54, y: 12)
                    .accessibilityHidden(true)
            }
            .background(Theme.blush, in: RoundedRectangle(cornerRadius: Theme.Radius.large, style: .continuous))
        }
        .buttonStyle(NodeButtonStyle())
        .accessibilityIdentifier("home.speak")
    }
}

struct HomeExpressionCard: View {
    let expression: HomeExpression
    let isSaved: Bool
    let onToggleSaved: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack {
                Label("Expresia zilei", systemImage: "quote.opening")
                    .font(Theme.serif(.subheadline))
                    .foregroundStyle(Theme.ink)
                    .labelStyle(TintedIconLabelStyle(tint: Theme.terracotta))
                Spacer(minLength: 0)
                Button(action: onToggleSaved) {
                    Image(systemName: isSaved ? "heart.fill" : "heart")
                        .foregroundStyle(Theme.terracotta)
                        .frame(width: 32, height: 32)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(isSaved ? "Elimină din salvate" : "Salvează expresia")
            }
            Text(expression.arabizi)
                .font(Theme.serif(.title2))
                .foregroundStyle(Theme.ink)
                .minimumScaleFactor(0.7)
                .lineLimit(2)
            Text(expression.meaning)
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.m)
        .frame(maxWidth: .infinity, minHeight: 180, alignment: .topLeading)
        .background(alignment: .bottomTrailing) {
            DecorativeImage(name: "illus-house", width: 80, height: 92, fadeTowards: .top)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.medium, style: .continuous))
        }
        .cardBackground()
    }
}

struct HomeSavedPhrasesCard: View {
    let expressions: [HomeExpression]
    let action: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Button(action: action) {
                HStack(spacing: Theme.Spacing.xs) {
                    Image(systemName: "bookmark.fill")
                        .foregroundStyle(Theme.deep)
                    Text("Fraze salvate")
                        .font(Theme.serif(.subheadline))
                        .foregroundStyle(Theme.ink)
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.muted)
                }
            }
            .buttonStyle(.plain)
            if expressions.isEmpty {
                Text("Salvează expresii din Descoperă ca să le repeți aici.")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                ForEach(expressions) { expression in
                    VStack(alignment: .leading, spacing: 1) {
                        Text(expression.arabizi)
                            .font(Theme.font(.subheadline, weight: .semibold))
                            .foregroundStyle(Theme.ink)
                            .lineLimit(1)
                        Text(expression.meaning)
                            .font(Theme.font(.caption2))
                            .foregroundStyle(Theme.muted)
                            .lineLimit(1)
                    }
                    .padding(Theme.Spacing.xs)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Theme.surface, in: RoundedRectangle(cornerRadius: Theme.Radius.small, style: .continuous))
                    .accessibilityElement(children: .combine)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.s)
        .frame(maxWidth: .infinity, minHeight: 180, alignment: .topLeading)
        .background(Theme.mint, in: RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
    }
}

/// Initials in a cedar circle; the cedar alone when no name is set.
struct LearnerAvatar: View {
    let name: String
    var size: CGFloat = 44

    private var initials: String {
        name.split(separator: " ").prefix(2).compactMap(\.first).map(String.init).joined().uppercased()
    }

    var body: some View {
        ZStack {
            Circle().fill(Theme.deep)
            if initials.isEmpty {
                CedarShape()
                    .fill(.white)
                    .frame(width: size * 0.5, height: size * 0.46)
            } else {
                Text(initials)
                    .font(Theme.serif(size > 60 ? .title : .headline))
                    .foregroundStyle(.white)
            }
        }
        .frame(width: size, height: size)
        .overlay(Circle().strokeBorder(Theme.lime.opacity(0.7), lineWidth: 2))
        .accessibilityHidden(true)
    }
}
