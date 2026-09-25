import SwiftUI
import YallaCore

/// Approved expression as shown on Home, with its best reference recording.
struct HomeExpression: Identifiable, Equatable {
    let id: String
    let arabizi: String
    let meaning: String
    var arabic: String? = nil
    var audio: AudioAsset? = nil
}

/// Acasă, composed from reusable components and real learner state.
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
    let progressDestination: ProgressDashboardView
    @ObservedObject var progressModel: LearnerProgressModel
    @Binding var path: [String]
    let onReviews: () -> Void
    let onContinueJourney: () -> Void
    let onSmartPractice: () -> Void
    let onListening: () -> Void
    let onSpeaking: () -> Void
    let onSpeak: () -> Void
    let onDiscover: () -> Void
    let onProfile: () -> Void

    @AppStorage("learnerName") private var learnerName = ""
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @StateObject private var audio = NativeAudioController()

    var body: some View {
        NavigationStack(path: $path) {
            GeometryReader { proxy in
                let compact = proxy.size.width <= 375
                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Spacing.section) {
                        HomeBrandHeader(
                            learnerName: learnerName,
                            hasUnreadNotification: reviewQueue.dueNowCount > 0,
                            onNotifications: onReviews,
                            onProfile: onProfile
                        )
                        HomeGreeting(
                            name: learnerName,
                            subtitle: "Astăzi e o zi bună pentru încă o conversație.",
                            artwork: "illus-raouche",
                            isCompact: compact
                        )

                        if persistenceError != nil {
                            Label(
                                "Progresul local nu a putut fi încărcat. Datele existente nu au fost șterse.",
                                systemImage: "exclamationmark.triangle.fill"
                            )
                            .font(Theme.font(.subheadline, weight: .semibold))
                            .foregroundStyle(Theme.danger)
                            .padding(Theme.Spacing.lg)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .cardBackground(Theme.dangerBackground)
                        }

                        MetricStrip(items: metrics, allowsGrid: proxy.size.width < 350 || dynamicTypeSize.isAccessibilitySize)
                        FeatureHeroCard(
                            eyebrow: "Sesiune inteligentă",
                            icon: .system("sparkle"),
                            title: "Practica ta de azi",
                            subtitle: heroSubtitle,
                            imageName: "illus-cafe",
                            actionTitle: "Continuă acum",
                            secondaryMeta: smartSessionSize > 0 ? "\(smartSessionSize) exerciții" : nil,
                            action: onSmartPractice
                        )
                        DailyProgressCard(
                            items: dailyItems,
                            onOpen: { path.append("progress") }
                        )
                        ActionBanner(
                            icon: .system("mic.fill"),
                            title: "Vorbește azi",
                            subtitle: "Conversație ghidată: alegi replica și îți înregistrezi vocea.",
                            tint: Theme.terracotta,
                            background: Theme.blushStrong,
                            action: onSpeak
                        )
                        .accessibilityIdentifier("home.speak")

                        HomeBottomCards(stacked: proxy.size.width < 350 || dynamicTypeSize.isAccessibilitySize) {
                            if let expressionOfDay {
                                DailyExpressionCard(
                                    expression: expressionOfDay,
                                    image: "illus-house",
                                    isFavorite: progress.savedExpressionIDs.contains(expressionOfDay.id),
                                    onSpeak: speakAction(for: expressionOfDay),
                                    onFavorite: {
                                        Task { await progressModel.toggleSavedExpressionID(expressionOfDay.id) }
                                    },
                                    onOpen: onDiscover
                                )
                            }
                            SavedPhrasesCard(
                                phrases: savedExpressions,
                                onOpenAll: onDiscover,
                                onSpeak: { phrase in speakAction(for: phrase)?() }
                            )
                        }
                    }
                    .padding(.horizontal, compact ? 16 : Theme.Spacing.screen)
                    .padding(.top, Theme.Spacing.xxs)
                    .padding(.bottom, Theme.Spacing.xl)
                    .frame(maxWidth: Theme.Spacing.maxContentWidth)
                    .frame(maxWidth: .infinity)
                }
            }
            .background(Theme.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: String.self) { id in
                if id == "progress" {
                    progressDestination
                }
            }
            .onDisappear { audio.stopPlayback() }
        }
    }

    private func speakAction(for expression: HomeExpression) -> (() -> Void)? {
        guard let asset = expression.audio else { return nil }
        return { play(asset) }
    }

    private func play(_ asset: AudioAsset) {
        audio.stopPlayback()
        audio.playReference(asset)
    }

    private var metrics: [MetricItem] {
        [
            MetricItem(id: "streak", icon: .system("flame.fill"), value: "\(rewards.streakDays)", label: "zile la rând",
                       tint: rewards.isActiveToday ? Theme.streak : Theme.faint),
            MetricItem(id: "goals", icon: .system("target"), value: "\(goals.completedCount)/\(goals.totalCount)",
                       label: "obiective azi", tint: Theme.terracotta),
            MetricItem(id: "level", icon: .system("chart.bar.fill"), value: journeyLevel.rawValue.uppercased(),
                       label: "nivel actual", tint: Theme.teal),
            MetricItem(id: "points", icon: .system("star.fill"), value: "\(rewards.totalXP)", label: "puncte",
                       tint: Theme.gold)
        ]
    }

    private var dailyItems: [DailyProgressItem] {
        let items = [
            DailyProgressItem(id: "listening", title: "Ascultă", completed: goals.listeningDone ? 1 : 0, total: 1,
                              icon: .system("ear"), tint: Theme.teal, action: onListening),
            DailyProgressItem(id: "speaking", title: "Vorbește", completed: goals.speakingDone ? 1 : 0, total: 1,
                              icon: .system("mic"), tint: Theme.terracotta, action: onSpeaking),
            DailyProgressItem(id: "lesson", title: "Învață", completed: goals.lessonDone ? 1 : 0, total: 1,
                              icon: .system("book"), tint: Theme.teal, action: onContinueJourney),
            DailyProgressItem(id: "review", title: "Repetă", completed: goals.reviewDone ? 1 : 0, total: 1,
                              icon: .system("arrow.triangle.2.circlepath"), tint: Theme.terracotta, action: onReviews)
        ]
        return goals.listeningAvailable ? items : items.filter { $0.id != "listening" }
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

// MARK: - Header and greeting

struct HomeBrandHeader: View {
    let learnerName: String
    let hasUnreadNotification: Bool
    let onNotifications: () -> Void
    let onProfile: () -> Void

    var body: some View {
        HStack(alignment: .center, spacing: Theme.Spacing.xs) {
            BrandHeader(tagline: "Oameni. Vorbe. O altă perspectivă.", twoTone: true)
            Spacer(minLength: Theme.Spacing.xs)
            Button(action: onNotifications) {
                Image(systemName: "bell")
                    .font(.title3.weight(.regular))
                    .foregroundStyle(Theme.ink)
                    .frame(width: 44, height: 44)
                    .overlay(alignment: .topTrailing) {
                        if hasUnreadNotification {
                            Circle()
                                .fill(Theme.terracotta)
                                .frame(width: 8, height: 8)
                                .offset(x: -10, y: 10)
                        }
                    }
            }
            .buttonStyle(.plain)
            .accessibilityLabel(hasUnreadNotification ? "Recapitulări de făcut" : "Recapitulări")
            .accessibilityIdentifier("home.bell")
            Button(action: onProfile) {
                LearnerAvatar(name: learnerName, size: 38)
                    .frame(width: 44, height: 44)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Profil și tutor")
        }
    }
}

struct HomeGreeting: View {
    let name: String
    let subtitle: String
    let artwork: String?
    var isCompact = false

    private var greeting: String {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "Mar7aba!" : "Mar7aba, \(trimmed)!"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
            Text(greeting)
                .yallaFont(.greeting)
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text(subtitle)
                .yallaFont(.body)
                .foregroundStyle(Theme.ink.opacity(0.85))
                .fixedSize(horizontal: false, vertical: true)
                .padding(.trailing, isCompact ? 60 : 110)
            HandDrawnUnderline()
                .stroke(Theme.terracotta, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                .frame(width: 90, height: 8)
                .padding(.top, Theme.Spacing.xs)
                .accessibilityHidden(true)
        }
        .padding(.vertical, Theme.Spacing.sm)
        .frame(maxWidth: .infinity, minHeight: 124, alignment: .leading)
        .background(alignment: .bottomTrailing) {
            if let artwork {
                DecorativeImage(name: artwork, width: isCompact ? 150 : 185, height: 120, fadeTowards: .leading)
                    .opacity(isCompact ? 0.7 : 1)
                    .offset(x: Theme.Spacing.screen)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Metrics

struct MetricItem: Identifiable {
    let id: String
    let icon: YallaIcon
    let value: String
    let label: String
    let tint: Color
}

/// Four equal metrics with hairline separators; a 2 x 2 grid when space is tight.
struct MetricStrip: View {
    let items: [MetricItem]
    var allowsGrid = false

    var body: some View {
        Group {
            if allowsGrid {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.Spacing.md) {
                    ForEach(items) { MetricCell(item: $0) }
                }
                .padding(Theme.Spacing.md)
            } else {
                HStack(spacing: 0) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        if index > 0 {
                            Rectangle()
                                .fill(Theme.cardStroke)
                                .frame(width: 0.75, height: 36)
                        }
                        MetricCell(item: item)
                    }
                }
                .padding(.vertical, Theme.Spacing.sm + 2)
                .padding(.horizontal, Theme.Spacing.xs)
            }
        }
        .cardBackground()
        .accessibilityIdentifier("home.stats")
    }
}

struct MetricCell: View {
    let item: MetricItem

    var body: some View {
        VStack(spacing: 2) {
            HStack(spacing: 5) {
                YallaIconView(item.icon)
                    .font(.system(size: 19, weight: .semibold))
                    .foregroundStyle(item.tint)
                Text(item.value)
                    .yallaFont(.metric)
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            Text(item.label)
                .yallaFont(.caption)
                .foregroundStyle(Theme.muted)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(item.label)
        .accessibilityValue(item.value)
    }
}

// MARK: - Hero

/// Artwork on the right under a cedar gradient, native text and action on the
/// left. Reusable for any recommended next step.
struct FeatureHeroCard: View {
    let eyebrow: String?
    var icon: YallaIcon? = nil
    let title: String
    let subtitle: String
    let imageName: String
    let actionTitle: String
    let secondaryMeta: String?
    let action: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            if let eyebrow {
                HStack(spacing: Theme.Spacing.xs) {
                    if let icon { YallaIconView(icon) }
                    Text(eyebrow)
                }
                .font(Theme.font(.subheadline, weight: .medium))
                .foregroundStyle(.white.opacity(0.92))
            }
            Text(title)
                .yallaFont(.hero)
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: 245, alignment: .leading)
            Text(subtitle)
                .yallaFont(.body)
                .foregroundStyle(.white.opacity(0.94))
                .lineSpacing(2)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: 240, alignment: .leading)
            ViewThatFits(in: .horizontal) {
                HStack(spacing: Theme.Spacing.md) { actionButton; meta }
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) { actionButton; meta }
            }
            .padding(.top, Theme.Spacing.xs)
        }
        .padding(.leading, Theme.Spacing.xl)
        .padding(.trailing, Theme.Spacing.lg)
        .padding(.vertical, 18)
        .frame(maxWidth: .infinity, minHeight: 214, alignment: .leading)
        .background {
            // Artwork on the right, the cedar gradient over it, text above both.
            ZStack(alignment: .trailing) {
                Theme.cedarDeep
                Image(imageName)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 240)
                    .frame(maxHeight: .infinity)
                    .clipped()
                LinearGradient(
                    stops: [
                        .init(color: Theme.cedarDeep, location: 0.00),
                        .init(color: Theme.deep.opacity(0.98), location: 0.40),
                        .init(color: Theme.deep.opacity(0.70), location: 0.56),
                        .init(color: Theme.deep.opacity(0.20), location: 0.72),
                        .init(color: .clear, location: 0.86)
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            }
            .accessibilityHidden(true)
        }
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.feature, style: .continuous))
        .elevation(.hero(.black))
    }

    private var actionButton: some View {
        Button(action: action) {
            Label(actionTitle, systemImage: "play.fill")
                .lineLimit(1)
                .fixedSize()
        }
        .buttonStyle(PillButtonStyle())
        .accessibilityIdentifier("home.continue")
    }

    @ViewBuilder
    private var meta: some View {
        if let secondaryMeta {
            Text(secondaryMeta)
                .font(Theme.font(.footnote, weight: .medium))
                .foregroundStyle(.white.opacity(0.88))
        }
    }
}

// MARK: - Daily progress

struct DailyProgressItem: Identifiable {
    let id: String
    let title: String
    let completed: Int
    let total: Int
    let icon: YallaIcon
    let tint: Color
    let action: () -> Void

    var progress: Double {
        total > 0 ? Double(completed) / Double(total) : 0
    }
}

struct DailyProgressCard: View {
    let items: [DailyProgressItem]
    let onOpen: () -> Void

    private var completed: Int { items.filter { $0.completed >= $0.total }.count }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Button(action: onOpen) {
                HStack(spacing: Theme.Spacing.sm) {
                    Text("Progresul de azi")
                        .yallaFont(.section)
                        .foregroundStyle(Theme.ink)
                    Spacer(minLength: Theme.Spacing.sm)
                    Text("\(completed) din \(items.count) finalizate")
                        .font(Theme.font(.footnote))
                        .foregroundStyle(Theme.muted)
                    Image(systemName: "chevron.right")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(Theme.muted)
                }
                .frame(minHeight: 30)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityHint("Deschide progresul complet")
            .accessibilityIdentifier("home.progress")

            HStack(alignment: .top, spacing: Theme.Spacing.xs) {
                ForEach(items) { ProgressRingItem(item: $0) }
            }
        }
        .padding(Theme.Spacing.lg)
        .cardBackground()
    }
}

struct ProgressRingItem: View {
    let item: DailyProgressItem

    private var done: Bool { item.completed >= item.total }

    var body: some View {
        Button(action: item.action) {
            VStack(spacing: Theme.Spacing.xs) {
                ProgressRing(fraction: item.progress, tint: item.tint, lineWidth: 5) {
                    YallaIconView(done ? .system("checkmark") : item.icon)
                        .font(.system(size: 21, weight: .regular))
                        .foregroundStyle(done ? item.tint : Theme.teal)
                }
                .frame(width: 60, height: 60)
                Text(item.title)
                    .font(Theme.font(.subheadline, weight: .medium))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Text("\(item.completed)/\(item.total)")
                    .font(Theme.font(.footnote))
                    .foregroundStyle(Theme.muted)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(NodeButtonStyle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(item.title)
        .accessibilityValue("\(item.completed) din \(item.total) finalizate")
        .accessibilityAddTraits(.isButton)
        .accessibilityIdentifier("home.goal.\(item.id)")
    }
}

// MARK: - Action banner

/// Tinted full-width prompt with an icon well and a chevron.
struct ActionBanner: View {
    let icon: YallaIcon
    let title: String
    let subtitle: String
    let tint: Color
    let background: Color
    var showsCedar = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.md) {
                YallaIconView(icon)
                    .font(.system(size: 23, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 50, height: 50)
                    .background(tint, in: Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(Theme.font(.title3, weight: .semibold))
                        .foregroundStyle(Theme.terracottaShade)
                    Text(subtitle)
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.muted)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(tint)
                    .frame(width: 38, height: 38)
                    .background(Theme.surface.opacity(0.85), in: Circle())
                    .frame(width: 44, height: 44)
                    .accessibilityHidden(true)
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: .infinity, minHeight: 76)
            .background(alignment: .trailing) {
                if showsCedar {
                    CedarShape()
                        .fill(tint.opacity(0.12))
                        .frame(width: 92, height: 80)
                        .offset(x: -56, y: 14)
                        .accessibilityHidden(true)
                }
            }
            .background(background, in: RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
        }
        .buttonStyle(NodeButtonStyle())
    }
}

// MARK: - Bottom cards

/// Two cards side by side, stacked when the width or text size needs it.
struct HomeBottomCards<Content: View>: View {
    let stacked: Bool
    @ViewBuilder var content: () -> Content

    var body: some View {
        if stacked {
            VStack(spacing: Theme.Spacing.md) { content() }
        } else {
            HStack(alignment: .top, spacing: Theme.Spacing.md) { content() }
        }
    }
}

struct DailyExpressionCard: View {
    let expression: HomeExpression
    let image: String?
    let isFavorite: Bool
    let onSpeak: (() -> Void)?
    let onFavorite: () -> Void
    let onOpen: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack(spacing: Theme.Spacing.xs) {
                Image(systemName: "quote.opening")
                    .foregroundStyle(Theme.terracotta)
                    .accessibilityHidden(true)
                Text("Expresia zilei")
                    .font(Theme.serif(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                    .layoutPriority(1)
                Spacer(minLength: 0)
                CedarSaveButton(
                    isSaved: isFavorite,
                    itemLabel: expression.arabizi,
                    filledBackground: false,
                    action: onFavorite
                )
                .padding(.vertical, -8)
                .padding(.trailing, -8)
            }
            Button(action: onOpen) {
                VStack(alignment: .leading, spacing: 2) {
                    if let arabic = expression.arabic, !arabic.isEmpty {
                        Text(arabic)
                            .font(.system(.title2, design: .default).weight(.semibold))
                            .foregroundStyle(Theme.terracottaShade)
                            .lineLimit(1)
                            .minimumScaleFactor(0.6)
                    }
                    Text(expression.arabizi)
                        .yallaFont(.phrase)
                        .foregroundStyle(Theme.ink)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                    Text(expression.meaning)
                        .font(Theme.font(.footnote))
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityHint("Deschide Descoperă")
            Spacer(minLength: 0)
            if let onSpeak {
                CircularIconButton(
                    icon: .system("speaker.wave.2"),
                    accessibilityLabel: "Redă pronunția",
                    tint: Theme.teal,
                    fill: Theme.mint,
                    diameter: 34,
                    action: onSpeak
                )
                .padding(.leading, -5)
            }
        }
        .padding(Theme.Spacing.md + 2)
        .frame(maxWidth: .infinity, minHeight: 160, alignment: .topLeading)
        .background(alignment: .bottomTrailing) {
            if let image {
                DecorativeImage(name: image, width: 82, height: 96, fadeTowards: .top)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
            }
        }
        .cardBackground()
    }
}

struct SavedPhrasesCard: View {
    let phrases: [HomeExpression]
    let onOpenAll: () -> Void
    let onSpeak: (HomeExpression) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Button(action: onOpenAll) {
                HStack(spacing: Theme.Spacing.xs) {
                    Image(systemName: "bookmark.fill")
                        .foregroundStyle(Theme.deep)
                    Text("Fraze salvate")
                        .font(Theme.serif(.subheadline, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.muted)
                }
                .frame(minHeight: 30)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityHint("Deschide Descoperă")

            if phrases.isEmpty {
                Text("Salvează expresii cu inimioara ca să le repeți aici.")
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(phrases.enumerated()), id: \.element.id) { index, phrase in
                        if index > 0 {
                            Rectangle()
                                .fill(Theme.cardStroke)
                                .frame(height: 0.5)
                        }
                        PhraseRow(
                            primary: phrase.arabizi,
                            secondary: phrase.meaning,
                            onSpeak: phrase.audio == nil ? nil : { onSpeak(phrase) }
                        )
                    }
                }
                .padding(.horizontal, Theme.Spacing.sm)
                .background(Theme.surface.opacity(0.7), in: RoundedRectangle(cornerRadius: Theme.Radius.compact, style: .continuous))
            }
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, minHeight: 160, alignment: .topLeading)
        .cardBackground(Theme.mint)
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
