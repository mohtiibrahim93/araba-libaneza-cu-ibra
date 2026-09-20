@preconcurrency import AVFoundation
import Foundation
import SwiftUI
import YallaCore

struct ListeningPracticeView: View {
    let items: [ListeningPracticeItem]
    let title: String
    @ObservedObject var progressModel: LearnerProgressModel

    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var audio = NativeAudioController()
    @State private var currentIndex = 0
    @State private var selectedChoice: String?
    @State private var freeWriteAnswer = ""
    @State private var submissionCount = 0
    @State private var currentCompleted = false
    @State private var feedbackMessage: String?
    @State private var feedbackIsCorrect = false
    @State private var revealWrittenLebanese = false
    @State private var usedReveal = false
    @State private var startedAt = Date()
    @State private var completedCount = 0

    private var currentItem: ListeningPracticeItem? {
        guard currentIndex >= 0, currentIndex < items.count else { return nil }
        return items[currentIndex]
    }

    private var isFinished: Bool {
        currentIndex >= items.count
    }

    var body: some View {
        Group {
            if isFinished {
                finishedView
            } else if let item = currentItem {
                practiceView(item)
            } else {
                ContentUnavailableView(
                    "Ascultare indisponibilă",
                    systemImage: "ear.badge.exclamationmark"
                )
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: scenePhase) { _, phase in
            if phase != .active { audio.stopPlayback() }
        }
        .onReceive(NotificationCenter.default.publisher(for: AVAudioSession.interruptionNotification)) { _ in
            audio.stopPlayback()
        }
        .onDisappear {
            audio.stopPlayback()
        }
    }

    private func practiceView(_ item: ListeningPracticeItem) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                progressHeader

                VStack(alignment: .leading, spacing: 10) {
                    Text(item.mode == .multipleChoice
                         ? "Ce înseamnă ce auzi?"
                         : "Scrie în Arabizi ce auzi.")
                        .font(.title2.bold())

                    Text("Ascultă înainte să răspunzi. Poți reda fraza de mai multe ori.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Button {
                    if audio.isPlaying {
                        audio.stopPlayback()
                    } else {
                        audio.playReference(item.audioAsset)
                    }
                } label: {
                    Label(
                        audio.isPlaying ? "Oprește redarea" : "Ascultă",
                        systemImage: audio.isPlaying ? "stop.fill" : "speaker.wave.2.fill"
                    )
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                writtenLebaneseSection(item)

                if item.mode == .multipleChoice {
                    multipleChoiceSection(item)
                } else {
                    freeWriteSection
                }

                if let feedbackMessage {
                    Label(
                        feedbackMessage,
                        systemImage: feedbackIsCorrect
                            ? "checkmark.circle.fill"
                            : "arrow.counterclockwise.circle.fill"
                    )
                    .font(.subheadline.weight(.semibold))
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
                }

                if currentCompleted {
                    Button {
                        advance()
                    } label: {
                        Text(currentIndex == items.count - 1 ? "Vezi rezultatul" : "Continuă")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                } else {
                    Button {
                        verify(item)
                    } label: {
                        Text(submissionCount > 0 ? "Verifică din nou" : "Verifică")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(!answerIsReady(for: item))
                }

                if let error = audio.errorMessage {
                    Label(error, systemImage: "exclamationmark.triangle.fill")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .padding()
        }
    }

    private var progressHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Ascultarea \(min(currentIndex + 1, items.count)) din \(items.count)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(completedCount) completate")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            ProgressView(
                value: Double(currentIndex),
                total: Double(max(items.count, 1))
            )
        }
    }

    @ViewBuilder
    private func writtenLebaneseSection(_ item: ListeningPracticeItem) -> some View {
        if item.revealWrittenLebaneseInitially || revealWrittenLebanese {
            VStack(alignment: .leading, spacing: 5) {
                Text(item.expression.arabizi)
                    .font(.headline)
                if let arabic = item.expression.arabicScript {
                    Text(arabic)
                        .foregroundStyle(.secondary)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
        } else {
            Button {
                revealWrittenLebanese = true
                usedReveal = true
            } label: {
                Label("Arată forma scrisă", systemImage: "text.viewfinder")
            }
            .buttonStyle(.bordered)
            .disabled(currentCompleted)
        }
    }

    private func multipleChoiceSection(_ item: ListeningPracticeItem) -> some View {
        VStack(spacing: 10) {
            ForEach(item.choices, id: \.self) { choice in
                Button {
                    selectedChoice = choice
                } label: {
                    HStack {
                        Text(choice)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        if selectedChoice == choice {
                            Image(systemName: "checkmark.circle.fill")
                        }
                    }
                }
                .buttonStyle(.bordered)
                .disabled(currentCompleted)
            }
        }
    }

    private var freeWriteSection: some View {
        TextField("Scrie ce auzi în Arabizi", text: $freeWriteAnswer)
            .textFieldStyle(.roundedBorder)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .disabled(currentCompleted)
    }

    private var finishedView: some View {
        ContentUnavailableView {
            Label("Sesiune terminată", systemImage: "checkmark.circle.fill")
        } description: {
            Text("Ai completat \(completedCount) exerciții de ascultare.")
        }
        .padding()
    }

    private func answerIsReady(for item: ListeningPracticeItem) -> Bool {
        switch item.mode {
        case .multipleChoice:
            return selectedChoice != nil
        case .freeWrite:
            return !freeWriteAnswer
                .trimmingCharacters(in: .whitespacesAndNewlines)
                .isEmpty
        }
    }

    private func verify(_ item: ListeningPracticeItem) {
        guard !currentCompleted else { return }

        submissionCount += 1
        let submittedAnswer: String
        let correct: Bool

        switch item.mode {
        case .multipleChoice:
            submittedAnswer = selectedChoice ?? ""
            correct = submittedAnswer.compare(
                item.expression.meaning,
                options: [.caseInsensitive, .diacriticInsensitive]
            ) == .orderedSame

        case .freeWrite:
            submittedAnswer = freeWriteAnswer
            let evaluation = AnswerEvaluator().evaluate(
                answer: submittedAnswer,
                canonical: item.expression.arabizi,
                spellingVariants: item.spellingVariants,
                pronunciationVariants: item.pronunciationVariants
            )
            correct = evaluation != .incorrect
        }

        if correct {
            currentCompleted = true
            feedbackIsCorrect = true
            feedbackMessage = submissionCount == 1 && !usedReveal
                ? "Corect din prima."
                : "Corect. Prima încercare rămâne păstrată dacă ai avut nevoie de corectare."

            let elapsed = max(Date().timeIntervalSince(startedAt), 0)
            let attempt = LearningAttempt(
                id: UUID().uuidString,
                expressionID: item.expression.id,
                skills: [.listening],
                submittedAnswer: submittedAnswer,
                firstTryCorrect: submissionCount == 1,
                completedCorrectly: true,
                usedHint: usedReveal,
                retryCount: max(submissionCount - 1, 0),
                responseTimeMilliseconds: Int((elapsed * 1_000).rounded()),
                occurredAt: Date()
            )

            Task {
                await progressModel.record(attempt)
            }
        } else {
            feedbackIsCorrect = false
            feedbackMessage = "Mai încearcă. Răspunsul inițial rămâne parte din evidența sesiunii."
            if item.mode == .freeWrite {
                freeWriteAnswer = ""
            }
        }
    }

    private func advance() {
        guard currentCompleted else { return }

        audio.stopPlayback()
        completedCount += 1
        currentIndex += 1
        selectedChoice = nil
        freeWriteAnswer = ""
        submissionCount = 0
        currentCompleted = false
        feedbackMessage = nil
        feedbackIsCorrect = false
        revealWrittenLebanese = false
        usedReveal = false
        startedAt = Date()
    }
}
