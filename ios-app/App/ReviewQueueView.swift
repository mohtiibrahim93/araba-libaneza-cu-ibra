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
            .navigationTitle("Recapitulări")
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
                    progressModel: progressModel
                )
            }
        }
    }

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
            List {
                if let error = progressModel.persistenceError {
                    Section("Stocare locală") {
                        Label("Progresul nu a putut fi salvat sau încărcat.", systemImage: "exclamationmark.triangle")
                        Text(error).font(.caption).foregroundStyle(.secondary)
                    }
                }
                Section {
                    if due.isEmpty {
                        Text("Nu ai recapitulări de făcut acum.")
                    } else {
                        Text("\(due.count) expresii de repetat")
                        if !exercises.isEmpty {
                            Button {
                                // Freeze the selected session while attempts update the queue.
                                sessionExercises = ReviewQueueBuilder().practice(
                                    from: package, progress: progressModel.snapshot, at: Date(), locale: locale
                                )
                                showingSession = !sessionExercises.isEmpty
                            } label: {
                                Label("Repetă acum", systemImage: "play.fill")
                            }
                            Text("Până la \(exercises.count) expresii cu exerciții disponibile în această sesiune.")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                        if due.contains(where: { !$0.canPractice }) {
                            Text("Unele expresii nu au încă un exercițiu disponibil pentru recapitulare.")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
                if !due.isEmpty {
                    Section("De făcut acum") {
                        ForEach(due) { item in row(item) }
                    }
                }
                if !upcoming.isEmpty {
                    Section("Programate mai târziu") {
                        ForEach(upcoming) { item in row(item) }
                    }
                }
                if items.isEmpty {
                    Text("Recapitulările apar după ce exersezi în Parcurs sau Practică.")
                        .foregroundStyle(.secondary)
                }
            }
        case .failure:
            ContentUnavailableView(
                "Recapitulări indisponibile",
                systemImage: "exclamationmark.triangle",
                description: Text("Conținutul nu poate fi afișat în limba selectată.")
            )
        }
    }

    private func row(_ item: ReviewQueueItemSummary) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(item.expression.arabizi).font(.headline)
            Text(item.expression.meaning).foregroundStyle(.secondary)
            Text(item.dueAt, format: .dateTime.day().month().hour().minute())
                .font(.caption).foregroundStyle(.secondary)
            if !item.canPractice {
                Text("Exercițiu de recapitulare încă indisponibil")
                    .font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
