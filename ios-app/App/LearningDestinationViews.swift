import SwiftUI
import YallaCore

struct PracticeDestinationView: View {
    let destination: PracticeDestination
    let expressions: [YallaCore.Expression]
    let locale: String
    let title: String
    @ObservedObject var progressModel: LearnerProgressModel

    @ViewBuilder
    var body: some View {
        switch destination {
        case let .smartSession(exercises):
            SmartPracticeOverviewView(
                exercises: exercises,
                expressions: expressions,
                locale: locale,
                title: title,
                progressModel: progressModel
            )
        case let .speedDrill(summaries):
            SpeedDrillOverviewView(
                expressions: summaries,
                lexicon: expressions,
                title: title,
                progressModel: progressModel
            )
        case let .listening(items):
            ListeningPracticeView(
                items: items,
                title: title,
                progressModel: progressModel
            )
        case let .speakAndCompare(speaking):
            SpeakAndCompareView(destination: speaking)
        }
    }
}

private struct SmartPracticeOverviewView: View {
    let exercises: [ExerciseDefinition]
    let expressions: [YallaCore.Expression]
    let locale: String
    let title: String
    @ObservedObject var progressModel: LearnerProgressModel

    var body: some View {
        PracticeLaunchLayout(
            icon: "sparkles",
            kicker: "Sesiune inteligentă",
            title: "Sesiune pregătită",
            subtitle: "\(exercises.count) exerciții din recapitulări, greșeli, puncte slabe și material nou.",
            startLabel: "Începe sesiunea",
            canStart: !exercises.isEmpty,
            previewTitle: "Exerciții",
            emptyText: "Nu există încă exerciții disponibile pentru această sesiune.",
            destination: {
                ExerciseSessionView(
                    exercises: exercises,
                    expressions: expressions,
                    locale: locale,
                    title: title,
                    progressModel: progressModel
                )
            },
            rows: exercises.prefix(8).map { exercise in
                PracticePreviewRow(
                    id: exercise.id,
                    title: exercise.prompt[locale] ?? exercise.prompt["ro"] ?? exercise.prompt.values.first ?? "Exercițiu",
                    subtitle: nil,
                    trailing: nil
                )
            },
            remainingCount: max(exercises.count - 8, 0)
        )
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct SpeedDrillOverviewView: View {
    let expressions: [JourneyExpressionSummary]
    /// Full expressions, for the approved spelling variants typed answers may use.
    let lexicon: [YallaCore.Expression]
    let title: String
    @ObservedObject var progressModel: LearnerProgressModel

    @State private var mode: SpeedDrillMode = .choice
    @State private var direction: SpeedDrillDirection = .lebaneseToLearnerLanguage

    var body: some View {
        PracticeLaunchLayout(
            icon: "bolt.fill",
            kicker: "Speed Drill · două minute",
            title: "Răspunde cât mai repede!",
            subtitle: "\(expressions.count) expresii pregătite. Alege cum răspunzi și în ce direcție.",
            startLabel: "Pornește cronometrul",
            canStart: !expressions.isEmpty,
            previewTitle: "Expresii",
            emptyText: "Nu există încă expresii disponibile pentru acest mod.",
            destination: {
                SpeedDrillView(
                    expressions: expressions,
                    lexicon: lexicon,
                    progressModel: progressModel,
                    direction: direction,
                    mode: mode
                )
            },
            rows: expressions.prefix(8).map { expression in
                PracticePreviewRow(
                    id: expression.id,
                    title: expression.arabizi,
                    subtitle: expression.meaning,
                    trailing: expression.arabicScript
                )
            },
            remainingCount: max(expressions.count - 8, 0),
            options: AnyView(settings)
        )
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var settings: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            QuestionSectionHeader(number: 1, title: "Cum răspunzi?")
            AdaptiveChoiceGrid(preferredColumns: 3, minimumCardWidth: 100, spacing: Theme.Spacing.sm) {
                ForEach(SpeedDrillMode.allCases) { option in
                    SingleSelectOptionCard(
                        icon: .system(option.icon),
                        iconTint: option == .choice ? Theme.terracotta : Theme.teal,
                        title: option.title,
                        subtitle: option.subtitle,
                        isSelected: mode == option,
                        action: { mode = option }
                    )
                }
            }

            QuestionSectionHeader(number: 2, title: "În ce direcție?")
            if mode == .write {
                Text("În modul „Scrie” răspunzi mereu în libaneză, cu Arabizi.")
                    .font(Theme.font(.footnote))
                    .foregroundStyle(Theme.muted)
            } else {
                VStack(spacing: Theme.Spacing.sm) {
                    SingleSelectOptionCard(
                        title: "Libaneză → Română",
                        subtitle: "Vezi expresia, alegi sensul.",
                        isSelected: direction == .lebaneseToLearnerLanguage,
                        layout: .row,
                        action: { direction = .lebaneseToLearnerLanguage }
                    )
                    SingleSelectOptionCard(
                        title: "Română → Libaneză",
                        subtitle: "Vezi sensul, răspunzi în libaneză.",
                        isSelected: direction == .learnerLanguageToLebanese,
                        layout: .row,
                        action: { direction = .learnerLanguageToLebanese }
                    )
                }
            }
        }
    }
}

private struct PracticePreviewRow: Identifiable {
    let id: String
    let title: String
    let subtitle: String?
    let trailing: String?
}

/// Start screen shared by practice modes: hero card with a start button,
/// then a preview of what the session contains.
private struct PracticeLaunchLayout<Destination: View>: View {
    let icon: String
    let kicker: String
    let title: String
    let subtitle: String
    let startLabel: String
    let canStart: Bool
    let previewTitle: String
    let emptyText: String
    @ViewBuilder let destination: () -> Destination
    let rows: [PracticePreviewRow]
    let remainingCount: Int
    /// Settings shown between the start card and the preview.
    var options: AnyView? = nil

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 12) {
                    Label(kicker, systemImage: icon)
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .foregroundStyle(Theme.lime)
                    Text(title)
                        .font(Theme.serif(.title))
                        .foregroundStyle(.white)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(subtitle)
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(.white.opacity(0.85))
                        .fixedSize(horizontal: false, vertical: true)
                    if canStart {
                        NavigationLink {
                            destination()
                        } label: {
                            Label(startLabel, systemImage: "play.fill")
                                .font(Theme.font(.headline, weight: .semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 22)
                                .padding(.vertical, 13)
                                .background(Theme.terracotta, in: Capsule())
                        }
                        .buttonStyle(NodeButtonStyle())
                        .accessibilityIdentifier("practice.start")
                        .padding(.top, 4)
                    }
                }
                .padding(22)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(alignment: .bottomTrailing) {
                    CedarShape()
                        .fill(.white.opacity(0.08))
                        .frame(width: 140, height: 130)
                        .offset(x: 18, y: 16)
                        .accessibilityHidden(true)
                }
                .background(Theme.deep)
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .shadow(color: Theme.deep.opacity(0.25), radius: 14, x: 0, y: 8)

                if let options {
                    options
                }

                VStack(alignment: .leading, spacing: 0) {
                    Text(previewTitle)
                        .font(Theme.serif(.headline))
                        .foregroundStyle(Theme.ink)
                        .padding(16)
                    if rows.isEmpty {
                        Text(emptyText)
                            .font(Theme.font(.subheadline))
                            .foregroundStyle(Theme.muted)
                            .padding([.horizontal, .bottom], 16)
                    } else {
                        ForEach(rows) { row in
                            Divider().padding(.leading, 16)
                            HStack(alignment: .firstTextBaseline) {
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(row.title)
                                        .font(Theme.font(.headline, weight: .semibold))
                                        .foregroundStyle(Theme.ink)
                                    if let subtitle = row.subtitle {
                                        Text(subtitle)
                                            .font(Theme.font(.subheadline))
                                            .foregroundStyle(Theme.muted)
                                    }
                                }
                                Spacer()
                                if let trailing = row.trailing {
                                    Text(trailing)
                                        .foregroundStyle(Theme.muted)
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 11)
                            .accessibilityElement(children: .combine)
                        }
                        if remainingCount > 0 {
                            Divider().padding(.leading, 16)
                            Text("și încă \(remainingCount)")
                                .font(Theme.font(.subheadline, weight: .semibold))
                                .foregroundStyle(Theme.muted)
                                .padding(16)
                        }
                    }
                }
                .cardBackground()
            }
            .padding(20)
        }
        .background(Theme.canvas.ignoresSafeArea())
    }
}

struct ExercisePreviewRow: View {
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
