import Foundation
import SwiftUI
import YallaCore

struct ExerciseSessionView: View {
    let locale: String
    let title: String
    let expressions: [YallaCore.Expression]
    @ObservedObject var progressModel: LearnerProgressModel

    @State private var player: ExerciseSessionPlayer?
    @State private var answer = ""
    @State private var selectedLeftID: String?
    @State private var selectedRightID: String?
    @State private var wordOrder: WordOrderState?
    @State private var latestResolution: ExerciseResolution?
    @State private var hintVisible = false
    @State private var exerciseStartedAt = Date()
    @State private var persistedAttemptCount = 0
    @FocusState private var answerFieldFocused: Bool

    init(
        exercises: [ExerciseDefinition],
        expressions: [YallaCore.Expression],
        locale: String,
        title: String,
        progressModel: LearnerProgressModel
    ) {
        self.locale = locale
        self.title = title
        self.expressions = expressions
        self.progressModel = progressModel
        let supportsAll = exercises.allSatisfy { NativeExerciseInput(exercise: $0, expressions: expressions, locale: locale) != .unavailable }
        _player = State(
            initialValue: supportsAll ? (try? ExerciseSessionPlayer(
                exercises: exercises,
                expressions: expressions,
                locale: locale
            )) : nil
        )
        if let first = exercises.first, case let .wordOrder(state) = NativeExerciseInput(exercise: first, expressions: expressions, locale: locale) {
            _wordOrder = State(initialValue: state)
        }
    }

    var body: some View {
        Group {
            if let player {
                if player.isFinished {
                    SessionSummaryView(state: player.sessionState)
                } else if let exercise = player.currentExercise {
                    exerciseBody(exercise: exercise, player: player)
                } else {
                    ContentUnavailableView(
                        "Exercițiu indisponibil",
                        systemImage: "exclamationmark.triangle",
                        description: Text("Sesiunea nu conține un exercițiu care poate fi afișat.")
                    )
                }
            } else {
                ContentUnavailableView(
                    "Sesiune indisponibilă",
                    systemImage: "exclamationmark.triangle",
                    description: Text("Unele tipuri de exerciții din această sesiune nu sunt încă suportate de playerul nativ.")
                )
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }

    private func exerciseBody(
        exercise: ExerciseDefinition,
        player: ExerciseSessionPlayer
    ) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                progressHeader(player: player)

                VStack(alignment: .leading, spacing: 10) {
                    Text(prompt(for: exercise))
                        .font(.title2.bold())

                    if hintVisible {
                        Label("Indiciu: \(hint(for: exercise))", systemImage: "lightbulb.fill")
                            .font(.subheadline.weight(.semibold))
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                    }
                }

                answerControls(exercise: exercise, completed: player.isCurrentExerciseCompleted)

                if let latestResolution {
                    FeedbackCard(resolution: latestResolution)
                }

                AdaptiveRow(spacing: 12) {
                    if !player.isCurrentExerciseCompleted {
                        Button {
                            useHint()
                        } label: {
                            Label("Indiciu", systemImage: "lightbulb")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        .disabled(hintVisible)
                        .accessibilityIdentifier("exercise.hint")

                        Button {
                            submitAnswer()
                        } label: {
                            Text(latestResolution?.needsCorrection == true ? "Verifică din nou" : "Verifică")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(!canSubmit(exercise))
                        .accessibilityIdentifier("exercise.check")
                    } else {
                        Button {
                            advance()
                        } label: {
                            Text(isLastExercise(player: player) ? "Vezi rezultatul" : "Continuă")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .accessibilityIdentifier("exercise.continue")
                    }
                }
            }
            .padding()
        }
        .scrollDismissesKeyboard(.interactively)
        .onAppear {
            answerFieldFocused = NativeExerciseInput(exercise: exercise, expressions: expressions, locale: locale) == .text
        }
    }

    @ViewBuilder
    private func answerControls(exercise: ExerciseDefinition, completed: Bool) -> some View {
        switch NativeExerciseInput(exercise: exercise, expressions: expressions, locale: locale) {
        case .text:
            TextField(exercise.type == .freeProduction ? "Scrie răspunsul în Arabizi" : "Scrie răspunsul", text: $answer)
                .accessibilityLabel("Răspunsul tău")
                .accessibilityIdentifier("exercise.answerField")
                .textFieldStyle(.roundedBorder)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($answerFieldFocused)
                .submitLabel(.done)
                .disabled(completed)
                .onSubmit { if !completed && canSubmit(exercise) { submitAnswer() } }
        case let .choices(choices):
            VStack(spacing: 10) {
                ForEach(choices, id: \.self) { choice in
                    Button { answer = choice } label: {
                        HStack {
                            Text(choice).frame(maxWidth: .infinity, alignment: .leading)
                            if answer == choice { Image(systemName: "checkmark.circle.fill") }
                        }
                    }
                    .buttonStyle(.bordered)
                    .disabled(completed)
                    .accessibilityIdentifier("exercise.choice")
                    .accessibilityAddTraits(answer == choice ? .isSelected : [])
                }
            }
        case .wordOrder:
            if let state = wordOrder {
                VStack(alignment: .leading, spacing: 14) {
                    Text(state.selectedTokens.isEmpty ? "Alege cuvintele în ordine" : state.submittedAnswer)
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))]) {
                        ForEach(state.remainingTokens) { token in
                            Button(token.value) {
                                guard var state = wordOrder else { return }
                                state.select(tokenID: token.id)
                                wordOrder = state
                                answer = state.submittedAnswer
                            }
                            .buttonStyle(.bordered)
                            .disabled(completed)
                        }
                    }
                    Button("Anulează ultimul cuvânt") {
                        guard var state = wordOrder else { return }
                        state.undoLastSelection()
                        wordOrder = state
                        answer = state.submittedAnswer
                    }
                    .disabled(completed || state.selectedTokens.isEmpty)
                }
            }
        case .matching:
            if let state = player?.currentMatchingState {
                matchingControls(state)
            }
        case .unavailable:
            Text("Acest tip de exercițiu nu este încă disponibil aici.")
        }
    }

    private func hint(for exercise: ExerciseDefinition) -> String {
        if let state = player?.currentMatchingState {
            return state.pairs.filter { !state.matchedPairIDs.contains($0.id) }
                .map { "\($0.left) → \($0.right)" }.joined(separator: "\n")
        }
        return exercise.answer
    }

    private func matchingControls(_ state: MatchingState) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Alege o expresie și sensul ei, apoi verifică perechea.")
                .font(.subheadline)
            Text("\(state.matchedPairIDs.count) din \(state.pairs.count) perechi potrivite")
                .font(.caption).foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 8) {
                Text("Libaneză").font(.headline)
                ForEach(state.pairs) { pair in
                    matchingButton(pair, state: state, isLeft: true)
                }
            }
            VStack(alignment: .leading, spacing: 8) {
                Text("Sens").font(.headline)
                ForEach(Array(state.pairs.reversed())) { pair in
                    matchingButton(pair, state: state, isLeft: false)
                }
            }
        }
    }

    private func matchingButton(_ pair: MatchingPair, state: MatchingState, isLeft: Bool) -> some View {
        let matched = state.matchedPairIDs.contains(pair.id)
        let selected = (isLeft ? selectedLeftID : selectedRightID) == pair.id
        return Button {
            if isLeft { selectedLeftID = pair.id } else { selectedRightID = pair.id }
        } label: {
            HStack {
                Text(isLeft ? pair.left : pair.right).frame(maxWidth: .infinity, alignment: .leading)
                if matched { Image(systemName: "checkmark.circle.fill") }
                else if selected { Image(systemName: "circle.inset.filled") }
            }
        }
        .buttonStyle(.bordered)
        .disabled(matched)
        .accessibilityAddTraits(selected ? .isSelected : [])
        .accessibilityValue(matched ? "Potrivit" : selected ? "Selectat" : "Nepotrivit încă")
    }

    private func canSubmit(_ exercise: ExerciseDefinition) -> Bool {
        switch NativeExerciseInput(exercise: exercise, expressions: expressions, locale: locale) {
        case .matching: return selectedLeftID != nil && selectedRightID != nil
        case .wordOrder: return wordOrder?.remainingTokens.isEmpty == true && !answer.isEmpty
        case .unavailable: return false
        default: return !answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
    }

    private func resetInput(for exercise: ExerciseDefinition?) {
        answer = ""
        selectedLeftID = nil
        selectedRightID = nil
        wordOrder = nil
        guard let exercise else { answerFieldFocused = false; return }
        let input = NativeExerciseInput(exercise: exercise, expressions: expressions, locale: locale)
        if case let .wordOrder(state) = input { wordOrder = state }
        answerFieldFocused = input == .text
    }

    private func progressHeader(player: ExerciseSessionPlayer) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            AdaptiveRow {
                Text("\(player.sessionState.completedCount) din \(player.sessionState.targetCount) răspunsuri completate")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(player.sessionState.cleanFirstTryCount) din prima")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            ProgressView(
                value: Double(player.sessionState.completedCount),
                total: Double(max(player.sessionState.targetCount, 1))
            )
        }
    }

    private func prompt(for exercise: ExerciseDefinition) -> String {
        exercise.prompt[locale]
            ?? exercise.prompt["ro"]
            ?? exercise.prompt.values.first
            ?? "Răspunde în libaneză"
    }

    private func isLastExercise(player: ExerciseSessionPlayer) -> Bool {
        player.sessionState.completedCount >= player.sessionState.targetCount
    }

    private func submitAnswer() {
        guard var player else { return }
        let elapsed = max(Date().timeIntervalSince(exerciseStartedAt), 0)
        let submitted: ExerciseResolution?
        if let left = selectedLeftID, let right = selectedRightID, player.currentMatchingState != nil {
            submitted = player.submitMatch(leftPairID: left, rightPairID: right, responseTime: elapsed)
            selectedRightID = nil
        } else {
            submitted = player.submit(answer, responseTime: elapsed)
        }
        guard let resolution = submitted else { return }

        self.player = player
        latestResolution = resolution

        if resolution.completed {
            selectedLeftID = nil
            selectedRightID = nil
            exerciseStartedAt = Date()
            answerFieldFocused = false
            persistCompletedAttempt(
                resolution: resolution,
                player: player
            )
        } else if player.currentMatchingState == nil {
            resetInput(for: player.currentExercise)
        }
    }

    private func persistCompletedAttempt(
        resolution: ExerciseResolution,
        player: ExerciseSessionPlayer
    ) {
        guard player.attempts.count > persistedAttemptCount else { return }
        persistedAttemptCount = player.attempts.count

        guard let durableAttempt = player.learningAttempt(
            id: UUID().uuidString,
            resolution: resolution,
            occurredAt: Date()
        ) else {
            return
        }

        Task {
            await progressModel.record(durableAttempt)
        }
    }

    private func useHint() {
        guard var player else { return }
        guard player.useHint() else { return }
        self.player = player
        hintVisible = true
        answerFieldFocused = player.currentExercise.map { NativeExerciseInput(exercise: $0, expressions: expressions, locale: locale) == .text } ?? false
    }

    private func advance() {
        guard var player else { return }
        guard player.advance() else { return }

        self.player = player
        answer = ""
        latestResolution = nil
        hintVisible = false
        exerciseStartedAt = Date()
        resetInput(for: player.currentExercise)
    }
}

private struct FeedbackCard: View {
    let resolution: ExerciseResolution

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(message)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private var icon: String {
        resolution.completed ? "checkmark.circle.fill" : "arrow.counterclockwise.circle.fill"
    }

    private var title: String {
        switch resolution.evaluation {
        case .exact:
            return "Corect"
        case .acceptedSpellingVariant:
            return "Variantă acceptată"
        case .acceptedPronunciationVariant:
            return "Pronunție acceptată"
        case .incorrect:
            return "Mai încearcă"
        }
    }

    private var message: String {
        if resolution.needsCorrection {
            return "Corectează răspunsul înainte să continui. Prima încercare rămâne înregistrată."
        }
        if resolution.mistake != nil {
            return "Corectarea este bună. Prima încercare rămâne păstrată în istoricul sesiunii."
        }
        switch resolution.evaluation {
        case .acceptedSpellingVariant:
            return "Forma introdusă este o variantă de scriere aprobată."
        case .acceptedPronunciationVariant:
            return "Forma introdusă este o variantă de pronunție aprobată."
        case .exact:
            return "Răspunsul corespunde formei de referință."
        case .incorrect:
            return "Încearcă din nou."
        }
    }
}

private struct SessionSummaryView: View {
    let state: LearningSessionState

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 42))
                    Text("Sesiune terminată")
                        .font(.largeTitle.bold())
                    Text("Ai parcurs toate exercițiile pregătite pentru această sesiune.")
                        .foregroundStyle(.secondary)
                }

                AdaptiveRow(spacing: 12) {
                    SummaryMetric(value: state.completedCount, label: "completate")
                    SummaryMetric(value: state.cleanFirstTryCount, label: "din prima")
                }

                AdaptiveRow(spacing: 12) {
                    SummaryMetric(value: state.hintedCount, label: "cu indiciu")
                    SummaryMetric(value: state.mistakes.count, label: "greșeli inițiale")
                }

                if !state.mistakes.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("De revăzut")
                            .font(.title2.bold())
                        ForEach(Array(state.mistakes.enumerated()), id: \.offset) { _, mistake in
                            VStack(alignment: .leading, spacing: 3) {
                                Text(mistake.submittedAnswer)
                                    .font(.headline)
                                Text("→ \(mistake.correctAnswer)")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 3)
                        }
                    }
                }
            }
            .padding()
        }
    }
}

private struct SummaryMetric: View {
    let value: Int
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(value)")
                .font(.title.bold())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .accessibilityElement(children: .combine)
    }
}

