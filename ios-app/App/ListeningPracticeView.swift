import SwiftUI
import YallaCore

struct ListeningPracticeView: View {
    let items: [ListeningPracticeItem]
    let expressions: [YallaCore.Expression]
    @ObservedObject var progressModel: LearnerProgressModel

    @StateObject private var audio = NativeAudioController()
    @State private var currentIndex = 0
    @State private var runner: ExerciseRunner?
    @State private var answer = ""
    @State private var latestResolution: ExerciseResolution?
    @State private var startedAt = Date()
    @State private var persistedPromptIDs = Set<String>()
    @FocusState private var answerFocused: Bool

    private var currentItem: ListeningPracticeItem? {
        guard currentIndex >= 0, currentIndex < items.count else { return nil }
        return items[currentIndex]
    }

    private var currentExpression: YallaCore.Expression? {
        guard let item = currentItem else { return nil }
        return expressions.first(where: { $0.id == item.expression.id })
    }

    var body: some View {
        Group {
            if items.isEmpty {
                ContentUnavailableView(
                    "Ascultare indisponibilă",
                    systemImage: "ear.badge.exclamationmark",
                    description: Text("Nu există încă exerciții cu audio de referință valid.")
                )
            } else if currentIndex >= items.count {
                completionView
            } else if let item = currentItem {
                exerciseView(item)
            }
        }
        .navigationTitle("Ascultare")
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            audio.stopPlayback()
        }
    }

    private func exerciseView(_ item: ListeningPracticeItem) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                progressHeader

                VStack(alignment: .leading, spacing: 8) {
                    Text(item.mode == .multipleChoice ? "Ce înseamnă ce auzi?" : "Scrie în Arabizi ce auzi.")
                        .font(.title2.bold())

                    if item.revealWrittenLebaneseInitially || latestResolution?.completed == true {
                        Text(item.expression.arabizi)
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                }

                Button {
                    if audio.isPlaying {
                        audio.stopPlayback()
                    } else {
                        audio.playReference(item.audioAsset)
                    }
                } label: {
                    Label(
                        audio.isPlaying ? "Oprește audio" : "Ascultă",
                        systemImage: audio.isPlaying ? "stop.fill" : "speaker.wave.2.fill"
                    )
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                switch item.mode {
                case .multipleChoice:
                    choiceAnswers(item)
                case .freeWrite:
                    freeWriteAnswer
                }

                if let resolution = latestResolution {
                    listeningFeedback(resolution, item: item)
                }

                if latestResolution?.completed == true {
                    Button {
                        advance()
                    } label: {
                        Text(currentIndex == items.count - 1 ? "Vezi rezultatul" : "Continuă")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }

                if let errorMessage = audio.errorMessage {
                    Label(errorMessage, systemImage: "exclamationmark.triangle.fill")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                }
            }
            .padding()
        }
        .onAppear {
            if item.mode == .freeWrite {
                answerFocused = true
            }
        }
    }

    private var progressHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Exercițiul \(min(currentIndex + 1, items.count)) din \(items.count)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(currentIndex) completate")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            ProgressView(
                value: Double(currentIndex),
                total: Double(max(items.count, 1))
            )
        }
    }

    private func choiceAnswers(_ item: ListeningPracticeItem) -> some View {
        VStack(spacing: 10) {
            ForEach(item.choices, id: \.self) { choice in
                Button {
                    submit(choice)
                } label: {
                    HStack {
                        Text(choice)
                            .multilineTextAlignment(.leading)
                        Spacer()
                    }
                    .padding(.vertical, 6)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(.bordered)
                .disabled(latestResolution?.completed == true)
            }
        }
    }

    private var freeWriteAnswer: some View {
        VStack(spacing: 12) {
            TextField("Scrie ce ai auzit", text: $answer)
                .textFieldStyle(.roundedBorder)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($answerFocused)
                .submitLabel(.done)
                .disabled(latestResolution?.completed == true)
                .onSubmit {
                    submitFreeWrite()
                }

            if latestResolution?.completed != true {
                Button {
                    submitFreeWrite()
                } label: {
                    Text(latestResolution?.needsCorrection == true ? "Verifică din nou" : "Verifică")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }

    private func listeningFeedback(
        _ resolution: ExerciseResolution,
        item: ListeningPracticeItem
    ) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Label(
                resolution.completed ? "Corect" : "Mai încearcă",
                systemImage: resolution.completed ? "checkmark.circle.fill" : "arrow.counterclockwise.circle.fill"
            )
            .font(.headline)

            if resolution.completed {
                Text("Ai identificat forma „\(item.expression.arabizi)”.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                Text("Corectează răspunsul înainte să continui. Prima încercare rămâne înregistrată.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var completionView: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
            Text("Sesiune de ascultare terminată")
                .font(.title.bold())
                .multilineTextAlignment(.center)
            Text("Ai parcurs \(items.count) exerciții cu audio de referință.")
                .foregroundStyle(.secondary)
        }
        .padding()
    }

    private func submitFreeWrite() {
        let trimmed = answer.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        submit(trimmed)
    }

    private func submit(_ submittedAnswer: String) {
        guard let item = currentItem,
              let expression = currentExpression,
              latestResolution?.completed != true
        else {
            return
        }

        var activeRunner = runner ?? makeRunner(item: item, expression: expression)
        let responseTime = max(Date().timeIntervalSince(startedAt), 0)
        let resolution = activeRunner.submit(
            submittedAnswer,
            responseTime: responseTime
        )
        runner = activeRunner
        latestResolution = resolution

        if resolution.completed {
            answerFocused = false
            persist(
                resolution,
                item: item
            )
        } else if item.mode == .freeWrite {
            answer = ""
            answerFocused = true
        }
    }

    private func makeRunner(
        item: ListeningPracticeItem,
        expression: YallaCore.Expression
    ) -> ExerciseRunner {
        let type: ExerciseDefinitionType = item.mode == .multipleChoice
            ? .listeningChoice
            : .listeningWrite

        let correctAnswer = item.mode == .multipleChoice
            ? item.expression.meaning
            : expression.canonicalArabizi

        let exercise = ExerciseDefinition(
            id: item.id,
            type: type,
            unitID: "native-listening",
            expressionIDs: [expression.id],
            prompt: ["ro": "Ascultă"],
            answer: correctAnswer,
            wrongAnswers: item.choices.filter { $0 != correctAnswer }
        )

        let spellingVariants = expression.variants
            .filter { $0.kind == .spelling }
            .map(\.value)
        let pronunciationVariants = expression.variants
            .filter { $0.kind == .pronunciation }
            .map(\.value)

        return ExerciseRunner(
            exercise: exercise,
            expressionID: expression.id,
            skill: .listening,
            spellingVariants: item.mode == .freeWrite ? spellingVariants : [],
            pronunciationVariants: item.mode == .freeWrite ? pronunciationVariants : []
        )
    }

    private func persist(
        _ resolution: ExerciseResolution,
        item: ListeningPracticeItem
    ) {
        guard !persistedPromptIDs.contains(item.id) else { return }

        let type: ExerciseDefinitionType = item.mode == .multipleChoice
            ? .listeningChoice
            : .listeningWrite

        guard let durableAttempt = LearningAttemptFactory().make(
            id: UUID().uuidString,
            resolution: resolution,
            occurredAt: Date(),
            skills: type.defaultMasterySkills
        ) else {
            return
        }

        persistedPromptIDs.insert(item.id)
        Task {
            await progressModel.record(durableAttempt)
        }
    }

    private func advance() {
        guard latestResolution?.completed == true else { return }

        audio.stopPlayback()
        currentIndex += 1
        runner = nil
        answer = ""
        latestResolution = nil
        startedAt = Date()

        if currentIndex < items.count,
           items[currentIndex].mode == .freeWrite {
            answerFocused = true
        }
    }
}
