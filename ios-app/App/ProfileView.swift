import SwiftUI
import YallaCore

/// Tutor tab: the learner's profile, the teacher (Ibra), goals and tools.
/// Learner data is local; teacher text comes from centruldearabalibaneza.com.
struct ProfileView: View {
    let reviewQueue: ReviewQueueSummary
    let progress: LearnerProgressSnapshot
    let level: LevelBand
    let recordingCount: Int
    let persistenceError: String?
    let onReviews: () -> Void
    let onOrientation: () -> Void

    @AppStorage("learnerName") private var learnerName = ""
    @AppStorage("learnerGoals") private var storedGoals = ""
    @State private var editingName = false
    @State private var editingGoals = false

    private var rewards: RewardSummary {
        RewardCalculator().summary(events: progress.xpEvents, at: Date())
    }

    private var goals: [WelcomeView.Goal] {
        storedGoals.split(separator: ",").compactMap { WelcomeView.Goal(rawValue: String($0)) }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: Theme.Spacing.section) {
                    BrandHeader()
                        .padding(.top, Theme.Spacing.sm)

                    LearnerProfileCard(
                        name: learnerName,
                        level: level,
                        rewards: rewards,
                        bio: LearnerGoalText.bio(for: goals),
                        onEditName: { editingName = true }
                    )

                    ProfileMetricsRow(metrics: [
                        ProfileMetric(icon: "bookmark.fill", value: progress.savedExpressionIDs.count, label: "expresii salvate"),
                        ProfileMetric(icon: "book.fill", value: progress.completedLessonIDs.count, label: "lecții terminate"),
                        ProfileMetric(icon: "waveform", value: recordingCount, label: "înregistrări")
                    ])

                    TutorModule()

                    CurrentGoalCard(goals: goals, onEdit: { editingGoals = true })

                    toolsCard

                    if let persistenceError {
                        Label(
                            "Încărcarea sau salvarea progresului nu a reușit. Folosește butonul de reîncercare; datele locale nu au fost resetate. (\(persistenceError))",
                            systemImage: "exclamationmark.triangle.fill"
                        )
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.terracottaShade)
                    }

                    Text("Progresul este păstrat local pe dispozitiv și funcționează fără cont.")
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                }
                .padding(.horizontal, Theme.Spacing.screen)
                .padding(.bottom, Theme.Spacing.xxl)
                .frame(maxWidth: Theme.Spacing.maxContentWidth)
                .frame(maxWidth: .infinity)
            }
            .background(Theme.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
            .sheet(isPresented: $editingName) { NameEditor(name: $learnerName) }
            .sheet(isPresented: $editingGoals) { GoalEditor(storedGoals: $storedGoals) }
        }
    }

    private var fluency: SpeedDrillProgressSummary { progress.speedDrillProgress }

    private var toolsCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            toolRow(icon: "signpost.right", title: "Orientare", detail: "Refă testul de nivel", action: onOrientation)
            Divider().padding(.leading, 56)
            NavigationLink {
                RecordingLibraryView()
            } label: {
                toolLabel(icon: "waveform", title: "Înregistrările mele", detail: "\(recordingCount) înregistrări pe acest telefon")
            }
            .buttonStyle(.plain)
            Divider().padding(.leading, 56)
            toolRow(icon: "clock.arrow.circlepath", title: "Recapitulări", detail: reviewDetail, action: onReviews)
            if fluency.sessionCount > 0 {
                Divider().padding(.leading, 56)
                toolLabel(icon: "bolt.fill", title: "Speed Drill", detail: fluencyDetail)
            }
        }
        .cardBackground()
    }

    private var reviewDetail: String {
        if reviewQueue.dueNowCount > 0 { return "\(reviewQueue.dueNowCount) de făcut acum" }
        if reviewQueue.upcomingCount > 0 { return "\(reviewQueue.upcomingCount) programate mai târziu" }
        return "Ești la zi"
    }

    private var fluencyDetail: String {
        let best = fluency.bestCorrectPerMinute.formatted(.number.precision(.fractionLength(1)))
        return "\(fluency.sessionCount) sesiuni · cel mai bun ritm \(best) corecte/min"
    }

    private func toolRow(icon: String, title: String, detail: String, action: @escaping () -> Void) -> some View {
        Button(action: action) { toolLabel(icon: icon, title: title, detail: detail) }
            .buttonStyle(.plain)
    }

    private func toolLabel(icon: String, title: String, detail: String) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            IconBadge(systemName: icon, tint: Theme.brand, background: Theme.mint, size: 36)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .yallaFont(.bodyStrong)
                    .foregroundStyle(Theme.ink)
                Text(detail)
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right")
                .font(.caption.weight(.bold))
                .foregroundStyle(Theme.muted)
                .accessibilityHidden(true)
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.md)
        .contentShape(Rectangle())
    }
}

// MARK: - Learner

enum LearnerGoalText {
    static func short(_ goal: WelcomeView.Goal) -> String {
        switch goal {
        case .conversation: return "conversație"
        case .arabizi: return "a citi Arabizi"
        case .travel: return "călătorii"
        case .culture: return "cultură"
        }
    }

    /// "Învăț araba libaneză pentru conversație și călătorii." from the goals
    /// chosen at Welcome; nil when none were chosen.
    static func bio(for goals: [WelcomeView.Goal]) -> String? {
        let parts = WelcomeView.Goal.allCases.filter(goals.contains).map(short)
        guard !parts.isEmpty else { return nil }
        let list = parts.count == 1
            ? parts[0]
            : parts.dropLast().joined(separator: ", ") + " și " + parts[parts.count - 1]
        return "Învăț araba libaneză pentru \(list)."
    }
}

struct LearnerProfileCard: View {
    let name: String
    let level: LevelBand
    let rewards: RewardSummary
    let bio: String?
    let onEditName: () -> Void

    private var displayName: String {
        name.isEmpty ? "Profilul meu" : name
    }

    private var statusLine: String {
        "Nivel \(level.rawValue.uppercased()) · \(RewardText.days(rewards.streakDays)) la rând"
    }

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.lg) {
            LearnerAvatar(name: name, size: 88)
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                HStack(spacing: Theme.Spacing.xxs) {
                    Text(displayName)
                        .yallaFont(.hero)
                        .foregroundStyle(Theme.ink)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                    CircularIconButton(
                        icon: .system("pencil"),
                        accessibilityLabel: "Editează numele",
                        tint: Theme.muted,
                        fill: .clear,
                        diameter: 30,
                        action: onEditName
                    )
                    .accessibilityIdentifier("profile.editName")
                }
                Label(statusLine, systemImage: "flame.fill")
                    .yallaFont(.captionStrong)
                    .foregroundStyle(rewards.isActiveToday ? Theme.streak : Theme.muted)
                if let bio {
                    Text("„\(bio)”")
                        .font(.system(.subheadline, design: .serif).italic())
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(alignment: .bottomTrailing) {
            DecorativeImage(name: "illus-house", width: 110, height: 76, fadeTowards: .leading)
                .opacity(0.55)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.feature, style: .continuous))
        }
        .cardBackground(radius: Theme.Radius.feature)
    }
}

struct ProfileMetric: Identifiable {
    let icon: String
    let value: Int
    let label: String
    var id: String { label }
}

struct ProfileMetricsRow: View {
    let metrics: [ProfileMetric]
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        let layout = dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(spacing: Theme.Spacing.sm))
            : AnyLayout(HStackLayout(spacing: Theme.Spacing.sm))
        layout {
            ForEach(metrics) { metric in
                HStack(spacing: Theme.Spacing.sm) {
                    IconBadge(systemName: metric.icon, tint: Theme.terracotta, background: Theme.blush, size: 34)
                    VStack(alignment: .leading, spacing: 0) {
                        Text("\(metric.value)")
                            .yallaFont(.metric)
                            .foregroundStyle(Theme.ink)
                        Text(metric.label)
                            .yallaFont(.caption)
                            .foregroundStyle(Theme.muted)
                            .lineLimit(2)
                            .minimumScaleFactor(0.8)
                    }
                    Spacer(minLength: 0)
                }
                .padding(Theme.Spacing.md)
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardBackground()
                .accessibilityElement(children: .combine)
            }
        }
    }
}

// MARK: - Tutor

/// Ibra's card. Booking and voice notes open WhatsApp: the app has no booking
/// calendar or upload of its own, so nothing is simulated.
struct TutorModule: View {
    private static let whatsappNumber = "40763124514"
    private static let bookingMessage = "Bună, Ibra! Aș vrea să programez o sesiune de arabă libaneză."

    private var bookingURL: URL {
        let text = Self.bookingMessage.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        return URL(string: "https://wa.me/\(Self.whatsappNumber)?text=\(text)")!
    }

    private let chatURL = URL(string: "https://wa.me/40763124514")!
    private let preplyURL = URL(string: "https://preply.com/en/tutor/471612")!

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: Theme.Spacing.lg) {
                    portrait.frame(width: 132, height: 150)
                    identity
                }
                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    portrait.frame(height: 190)
                    identity
                }
            }

            Text("Cursurile mele combină conversația practică cu perspective culturale autentice — de la expresii de zi cu zi până la tradițiile culinare libaneze.")
                .yallaFont(.body)
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 0) {
                tutorStat("10+ ani", "în București")
                tutorStat("5+ ani", "experiență predare")
                tutorStat("5.0★", "rating Preply")
            }

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text("Disponibilitate pentru sesiuni live")
                    .yallaFont(.section)
                    .foregroundStyle(Theme.ink)
                Text("Program flexibil, pe bază de programare.")
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
            }

            ViewThatFits(in: .horizontal) {
                HStack(spacing: Theme.Spacing.sm) { bookButton; voiceButton }
                VStack(spacing: Theme.Spacing.sm) { bookButton; voiceButton }
            }

            HStack {
                Link(destination: preplyURL) {
                    Label("Profil Preply", systemImage: "star.fill")
                }
                Spacer()
                Link(destination: URL(string: "tel:+40763124514")!) {
                    Label("+40 763 124 514", systemImage: "phone.fill")
                }
                .accessibilityIdentifier("tutor.contact")
            }
            .yallaFont(.captionStrong)
            .foregroundStyle(Theme.brand)
        }
        .padding(Theme.Spacing.lg)
        .cardBackground(radius: Theme.Radius.feature)
    }

    private var portrait: some View {
        Image("tutor-ibra")
            .resizable()
            .scaledToFill()
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
            .accessibilityLabel("Fotografia lui Ibra")
    }

    private var identity: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text("PROFESORUL TĂU")
                .yallaFont(.captionStrong)
                .foregroundStyle(Theme.brand)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Theme.mint, in: Capsule())
            Text("Ibra")
                .yallaFont(.hero)
                .foregroundStyle(Theme.ink)
            Text("Vorbitor nativ de arabă libaneză, stabilit în București de peste 10 ani.")
                .yallaFont(.caption)
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
            FlowLayout(spacing: 6, lineSpacing: 6) {
                ForEach(["Conversație", "Cultură", "Expresii de zi cu zi"], id: \.self) { chip in
                    Text(chip)
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.ink)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(Theme.recommendationSurface, in: Capsule())
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func tutorStat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .yallaFont(.bodyStrong)
                .foregroundStyle(Theme.ink)
            Text(label)
                .yallaFont(.caption)
                .foregroundStyle(Theme.muted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
    }

    private var bookButton: some View {
        Link(destination: bookingURL) {
            Label("Programează o sesiune", systemImage: "video.fill")
                .yallaFont(.bodyStrong)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 56)
                .background(Theme.terracotta, in: RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
        }
        .accessibilityHint("Deschide WhatsApp cu un mesaj pentru Ibra")
        .accessibilityIdentifier("tutor.book")
    }

    private var voiceButton: some View {
        Link(destination: chatURL) {
            HStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "mic.fill")
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Trimite mesaj vocal")
                        .yallaFont(.bodyStrong)
                    Text("Pe WhatsApp")
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                }
            }
            .foregroundStyle(Theme.ink)
            .frame(maxWidth: .infinity, minHeight: 56)
            .background(Theme.surface, in: RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).strokeBorder(Theme.lineStrong, lineWidth: 1))
        }
        .accessibilityIdentifier("tutor.voice")
    }
}

// MARK: - Goals

struct CurrentGoalCard: View {
    let goals: [WelcomeView.Goal]
    let onEdit: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack {
                IconBadge(systemName: "scope", tint: Theme.terracotta, background: Theme.blush, size: 34)
                Text("Obiectivele mele")
                    .yallaFont(.section)
                    .foregroundStyle(Theme.ink)
                    .accessibilityAddTraits(.isHeader)
                Spacer()
                Button(action: onEdit) {
                    HStack(spacing: 4) {
                        Text("Editează")
                        Image(systemName: "arrow.right")
                    }
                    .yallaFont(.captionStrong)
                    .foregroundStyle(Theme.brand)
                    .frame(minHeight: 44)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("profile.editGoals")
            }
            if goals.isEmpty {
                Text("Alege ce vrei să obții cu araba libaneză.")
                    .yallaFont(.body)
                    .foregroundStyle(Theme.muted)
            } else {
                ForEach(goals) { goal in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(goal.title)
                            .yallaFont(.bodyStrong)
                            .foregroundStyle(Theme.ink)
                        Text(goal.subtitle)
                            .yallaFont(.caption)
                            .foregroundStyle(Theme.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .accessibilityElement(children: .combine)
                }
            }
        }
        .padding(Theme.Spacing.lg)
        .padding(.trailing, 60)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(alignment: .bottomTrailing) {
            DecorativeImage(name: "illus-coast", width: 120, height: 80, fadeTowards: .leading)
                .opacity(0.6)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
        }
        .cardBackground()
    }
}

private struct NameEditor: View {
    @Binding var name: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                TextField("Numele tău", text: $name)
                    .textInputAutocapitalization(.words)
                    .autocorrectionDisabled()
                    .accessibilityIdentifier("profile.name")
                Text("Numele rămâne doar pe acest telefon.")
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
            }
            .creamList()
            .navigationTitle("Numele tău")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Gata") { dismiss() }
                }
            }
        }
        .tint(Theme.brand)
        .presentationDetents([.medium])
    }
}

private struct GoalEditor: View {
    @Binding var storedGoals: String
    @Environment(\.dismiss) private var dismiss
    @State private var goals: Set<WelcomeView.Goal> = []

    var body: some View {
        NavigationStack {
            ScrollView {
                AdaptiveChoiceGrid(preferredColumns: 2, minimumCardWidth: 150, spacing: 10) {
                    ForEach(WelcomeView.Goal.allCases) { goal in
                        MultiSelectIllustratedCard(
                            imageName: goal.image,
                            title: goal.title,
                            subtitle: goal.subtitle,
                            isSelected: goals.contains(goal),
                            action: {
                                if goals.contains(goal) { goals.remove(goal) } else { goals.insert(goal) }
                            }
                        )
                    }
                }
                .padding(Theme.Spacing.screen)
            }
            .background(Theme.canvas.ignoresSafeArea())
            .navigationTitle("Obiectivele mele")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salvează") {
                        storedGoals = goals.map(\.rawValue).sorted().joined(separator: ",")
                        dismiss()
                    }
                }
                ToolbarItem(placement: .cancellationAction) {
                    Button("Renunță") { dismiss() }
                }
            }
        }
        .tint(Theme.brand)
        .onAppear {
            goals = Set(storedGoals.split(separator: ",").compactMap { WelcomeView.Goal(rawValue: String($0)) })
        }
    }
}
