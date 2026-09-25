import SwiftUI
import YallaCore

struct ReviewQueueView: View {
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @Environment(\.dismiss) private var dismiss
    @State private var sessionExercises: [ExerciseDefinition] = []
    @State private var showingSession = false

    var body: some View {
        NavigationStack {
            TimelineView(.periodic(from: .now, by: 30)) { context in
                queueContent(at: context.date)
            }
            .safeAreaInset(edge: .bottom) { ProgressSaveStatusView(progressModel: progressModel) }
            .background(Theme.canvas.ignoresSafeArea())
            .navigationTitle("Recapitulări")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Închide") { dismiss() }
                }
            }
            .navigationDestination(isPresented: $showingSession) {
                ExerciseSessionView(
                    exercises: sessionExercises,
                    expressions: package.expressions,
                    locale: locale,
                    title: "Recapitulare",
                    progressModel: progressModel,
                    xpSource: .review
                )
            }
        }
        .tint(Theme.brand)
    }

    /// Upcoming items shown before the list is summarised.
    private static let upcomingLimit = 30

    @ViewBuilder
    private func queueContent(at date: Date) -> some View {
        let result = Result {
            try ReviewQueueBuilder().items(
                from: package, progress: progressModel.snapshot, locale: locale, at: date
            )
        }
        switch result {
        case let .success(items):
            let due = items.filter(\.isDue)
            let upcoming = items.filter { !$0.isDue }
            let exercises = ReviewQueueBuilder().practice(
                from: package, progress: progressModel.snapshot, at: date, locale: locale
            )
            ScrollView {
                LazyVStack(alignment: .leading, spacing: Theme.Spacing.section) {
                    if let error = progressModel.persistenceError {
                        Label("Progresul nu a putut fi salvat sau încărcat. (\(error))", systemImage: "exclamationmark.triangle.fill")
                            .yallaFont(.caption)
                            .foregroundStyle(Theme.danger)
                            .padding(Theme.Spacing.lg)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .cardBackground(Theme.dangerBackground)
                    }

                    summaryCard(due: due, upcoming: upcoming, exercises: exercises)

                    if !due.isEmpty {
                        itemsCard(title: "De făcut acum", icon: "clock.badge.exclamationmark", items: due, hiddenCount: 0)
                    }
                    if !upcoming.isEmpty {
                        itemsCard(
                            title: "Programate mai târziu",
                            icon: "calendar",
                            items: Array(upcoming.prefix(Self.upcomingLimit)),
                            hiddenCount: max(upcoming.count - Self.upcomingLimit, 0)
                        )
                    }
                }
                .padding(.horizontal, Theme.Spacing.screen)
                .padding(.vertical, Theme.Spacing.md)
                .frame(maxWidth: Theme.Spacing.maxContentWidth)
                .frame(maxWidth: .infinity)
            }
        case .failure:
            ContentUnavailableView(
                "Recapitulări indisponibile",
                systemImage: "exclamationmark.triangle",
                description: Text("Conținutul nu poate fi afișat în limba selectată.")
            )
        }
    }

    private func summaryCard(
        due: [ReviewQueueItemSummary],
        upcoming: [ReviewQueueItemSummary],
        exercises: [ExerciseDefinition]
    ) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            HStack(spacing: Theme.Spacing.md) {
                IconBadge(systemName: "arrow.triangle.2.circlepath", tint: Theme.terracotta, background: Theme.blush, size: 48)
                VStack(alignment: .leading, spacing: 2) {
                    Text(summaryTitle(dueCount: due.count, total: due.count + upcoming.count))
                        .yallaFont(.section)
                        .foregroundStyle(Theme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(summarySubtitle(dueCount: due.count, upcomingCount: upcoming.count))
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            if !due.isEmpty && !exercises.isEmpty {
                Button {
                    // Freeze the selected session while attempts update the queue.
                    sessionExercises = ReviewQueueBuilder().practice(
                        from: package, progress: progressModel.snapshot, at: Date(), locale: locale
                    )
                    showingSession = !sessionExercises.isEmpty
                } label: {
                    Label("Repetă acum", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PillButtonStyle())
                .accessibilityIdentifier("reviews.start")
                Text("Până la \(exercises.count) expresii cu exerciții în această sesiune.")
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
            }
            if due.contains(where: { !$0.canPractice }) {
                Text("Unele expresii nu au încă un exercițiu disponibil pentru recapitulare.")
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground(radius: Theme.Radius.feature)
    }

    private func summaryTitle(dueCount: Int, total: Int) -> String {
        if total == 0 { return "Nimic de recapitulat încă" }
        if dueCount == 0 { return "Ești la zi cu recapitulările" }
        return dueCount == 1 ? "1 expresie de repetat acum" : "\(dueCount) expresii de repetat acum"
    }

    private func summarySubtitle(dueCount: Int, upcomingCount: Int) -> String {
        if dueCount == 0 && upcomingCount == 0 {
            return "Recapitulările apar după ce exersezi în Călătorie sau Exersează."
        }
        return upcomingCount == 1 ? "1 programată mai târziu" : "\(upcomingCount) programate mai târziu"
    }

    private func itemsCard(title: String, icon: String, items: [ReviewQueueItemSummary], hiddenCount: Int) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Label(title, systemImage: icon)
                .yallaFont(.section)
                .foregroundStyle(Theme.ink)
                .labelStyle(TintedIconLabelStyle(tint: Theme.terracotta))
                .accessibilityAddTraits(.isHeader)
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.vertical, Theme.Spacing.md)
            ForEach(items) { item in
                Divider().padding(.leading, Theme.Spacing.lg)
                row(item)
            }
            if hiddenCount > 0 {
                Divider().padding(.leading, Theme.Spacing.lg)
                Text("și încă \(hiddenCount)")
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
                    .padding(.horizontal, Theme.Spacing.lg)
                    .padding(.vertical, Theme.Spacing.md)
            }
        }
        .cardBackground()
    }

    private func row(_ item: ReviewQueueItemSummary) -> some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            VStack(alignment: .leading, spacing: 2) {
                Text(item.expression.arabizi)
                    .yallaFont(.bodyStrong)
                    .foregroundStyle(Theme.ink)
                Text(item.expression.meaning)
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
                if !item.canPractice {
                    Text("Exercițiu de recapitulare încă indisponibil")
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.terracottaShade)
                }
            }
            Spacer(minLength: Theme.Spacing.sm)
            Text(item.dueAt, format: .dateTime.day().month(.abbreviated).hour().minute())
                .yallaFont(.caption)
                .foregroundStyle(item.isDue ? Theme.terracottaShade : Theme.muted)
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.sm)
        .accessibilityElement(children: .combine)
    }
}
