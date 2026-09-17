import SwiftUI
import YallaCore

struct JourneyUnitDetailView: View {
    let detail: JourneyUnitDetail
    let expressions: [YallaCore.Expression]
    let locale: String

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text(detail.level.rawValue.uppercased())
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text(detail.description)
                        .font(.body)
                    HStack(spacing: 14) {
                        Label("\(detail.expressions.count) expresii", systemImage: "text.bubble")
                        Label("\(detail.exercises.count) exerciții", systemImage: "checkmark.circle")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            if !detail.exercises.isEmpty {
                Section {
                    NavigationLink {
                        ExerciseSessionView(
                            exercises: detail.exercises,
                            expressions: expressions,
                            locale: locale,
                            title: detail.title
                        )
                    } label: {
                        Label("Începe exercițiile", systemImage: "play.fill")
                            .font(.headline)
                    }
                }
            }

            Section("Expresii") {
                ForEach(detail.expressions) { expression in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(alignment: .firstTextBaseline) {
                            Text(expression.arabizi)
                                .font(.headline)
                            if let arabic = expression.arabicScript {
                                Text(arabic)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        Text(expression.meaning)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 3)
                }
            }

            Section("Exerciții") {
                if detail.exercises.isEmpty {
                    Text("Această unitate nu are încă exerciții native asociate.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(detail.exercises) { exercise in
                        ExercisePreviewRow(exercise: exercise, locale: locale)
                    }
                }
            }
        }
        .navigationTitle(detail.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct PracticeDestinationView: View {
    let destination: PracticeDestination
    let expressions: [YallaCore.Expression]
    let locale: String
    let title: String

    @ViewBuilder
    var body: some View {
        switch destination {
        case let .smartSession(exercises):
            SmartPracticeOverviewView(
                exercises: exercises,
                expressions: expressions,
                locale: locale,
                title: title
            )
        case let .speedDrill(expressions):
            SpeedDrillOverviewView(expressions: expressions, title: title)
        }
    }
}

private struct SmartPracticeOverviewView: View {
    let exercises: [ExerciseDefinition]
    let expressions: [YallaCore.Expression]
    let locale: String
    let title: String

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Sesiune pregătită")
                        .font(.headline)
                    Text("\(exercises.count) exerciții selectate din conținutul disponibil.")
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            if !exercises.isEmpty {
                Section {
                    NavigationLink {
                        ExerciseSessionView(
                            exercises: exercises,
                            expressions: expressions,
                            locale: locale,
                            title: title
                        )
                    } label: {
                        Label("Începe sesiunea", systemImage: "play.fill")
                            .font(.headline)
                    }
                }
            }

            Section("Exerciții") {
                if exercises.isEmpty {
                    Text("Nu există încă exerciții disponibile pentru această sesiune.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(exercises) { exercise in
                        ExercisePreviewRow(exercise: exercise, locale: locale)
                    }
                }
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct SpeedDrillOverviewView: View {
    let expressions: [JourneyExpressionSummary]
    let title: String

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Set de două minute")
                        .font(.headline)
                    Text("\(expressions.count) expresii pregătite pentru reamintire rapidă.")
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            Section("Expresii") {
                ForEach(expressions) { expression in
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(expression.arabizi)
                                .font(.headline)
                            Text(expression.meaning)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        if let arabic = expression.arabicScript {
                            Text(arabic)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 3)
                }
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct ExercisePreviewRow: View {
    let exercise: ExerciseDefinition
    let locale: String

    private var prompt: String {
        exercise.prompt[locale]
            ?? exercise.prompt["ro"]
            ?? exercise.prompt.values.first
            ?? "Exercițiu"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(prompt)
                .font(.headline)
            HStack(spacing: 8) {
                Text(exercise.type.rawValue.replacingOccurrences(of: "-", with: " "))
                if !exercise.expressionIDs.isEmpty {
                    Text("·")
                    Text("\(exercise.expressionIDs.count) expresii")
                }
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 3)
    }
}
