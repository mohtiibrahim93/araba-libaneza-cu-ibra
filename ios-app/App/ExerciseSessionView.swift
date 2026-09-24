import Foundation
import SwiftUI
import YallaCore

struct ExerciseSessionView: View {
    let locale: String
    let title: String
    let expressions: [YallaCore.Expression]
    @ObservedObject var progressModel: LearnerProgressModel
    /// Called once when the learner finishes the last exercise.
    private let onComplete: (() -> Void)?
    /// Which daily goal a finished session counts toward.
    private let xpSource: XPSource

    @State private var player: ExerciseSessionPlayer?
    @State private var answer = ""
    @State private var selectedLeftID: String?
    @State private var selectedRightID: String?
    @State private var mismatchedPairIDs: Set<String> = []
    @State private var wordOrder: WordOrderState?
    @State private var latestResolution: ExerciseResolution?
    @State private var hintVisible = false
    @State private var exerciseStartedAt = Date()
    @State private var persistedAttemptCount = 0
    @State private var earnedXP = 0
    @FocusState private var answerFieldFocused: Bool

    init(
        exercises: [ExerciseDefinition],
        expressions: [YallaCore.Expression],
        locale: String,
        title: String,
        progressModel: LearnerProgressModel,
        xpSource: XPSource = .practice,
        onComplete: (() -> Void)? = nil
    ) {
        self.onComplete = onComplete
        self.xpSource = xpSource
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
                    SessionSummaryView(
                        state: player.sessionState,
                        earnedXP: earnedXP,
                        rewards: RewardCalculator().summary(events: progressModel.snapshot.xpEvents, at: Date())
                    )
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
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
    }

    // MARK: - Exercise layout

    private func exerciseBody(
        exercise: ExerciseDefinition,
        player: ExerciseSessionPlayer
    ) -> some View {
        let input = NativeExerciseInput(exercise: exercise, expressions: expressions, locale: locale)
        return ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                progressHeader(player: player)

                promptCard(exercise: exercise, input: input)

                if hintVisible {
                    Label {
                        Text("Indiciu: \(hint(for: exercise))")
                    } icon: {
                        Image(systemName: "lightbulb.fill")
                            .foregroundStyle(Theme.gold)
                    }
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cardBackground(Theme.variantBackground)
                    .transition(.scale(scale: 0.96).combined(with: .opacity))
                }

                answerControls(exercise: exercise, input: input, completed: player.isCurrentExerciseCompleted)
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 28)
        }
        .scrollDismissesKeyboard(.interactively)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            actionBar(exercise: exercise, input: input, player: player)
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: latestResolution)
        .animation(.easeInOut(duration: 0.2), value: hintVisible)
        .sensoryFeedback(trigger: latestResolution) { _, resolution in
            guard let resolution else { return nil }
            return resolution.completed ? SensoryFeedback.success : SensoryFeedback.error
        }
        .onAppear {
            answerFieldFocused = input == .text
        }
    }

    private func progressHeader(player: ExerciseSessionPlayer) -> some View {
        let state = player.sessionState
        return HStack(spacing: 12) {
            LessonProgressBar(
                value: Double(state.completedCount) / Double(max(state.targetCount, 1))
            )
            Label("\(state.cleanFirstTryCount)", systemImage: "bolt.fill")
                .font(Theme.font(.subheadline, weight: .bold))
                .foregroundStyle(Theme.gold)
                .accessibilityLabel("\(state.cleanFirstTryCount) din prima")
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(state.completedCount) din \(state.targetCount) răspunsuri completate, \(state.cleanFirstTryCount) din prima")
    }

    private func promptCard(exercise: ExerciseDefinition, input: NativeExerciseInput) -> some View {
        let kind = kindLabel(exercise: exercise, input: input)
        return VStack(alignment: .leading, spacing: 12) {
            Label(kind.title, systemImage: kind.icon)
                .font(Theme.font(.caption, weight: .bold))
                .textCase(.uppercase)
                .kerning(0.8)
                .foregroundStyle(Theme.teal)
            Text(prompt(for: exercise))
                .font(Theme.serif(.title2))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(.isHeader)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func kindLabel(exercise: ExerciseDefinition, input: NativeExerciseInput) -> (title: String, icon: String) {
        switch input {
        case .choices: return ("Alege răspunsul", "hand.tap.fill")
        case .wordOrder: return ("Ordonează cuvintele", "text.word.spacing")
        case .matching: return ("Potrivește perechile", "square.grid.2x2.fill")
        case .text:
            return exercise.type == .freeProduction
                ? ("Scrie în libaneză", "keyboard.fill")
                : ("Scrie răspunsul", "keyboard.fill")
        case .unavailable: return ("Exercițiu", "questionmark.circle")
        }
    }

    // MARK: - Answer controls

    @ViewBuilder
    private func answerControls(exercise: ExerciseDefinition, input: NativeExerciseInput, completed: Bool) -> some View {
        switch input {
        case .text:
            textControls(exercise: exercise, completed: completed)
        case let .choices(choices):
            choiceControls(choices: choices, completed: completed)
        case .wordOrder:
            if let state = wordOrder {
                wordOrderControls(state: state, completed: completed)
            }
        case .matching:
            if let state = player?.currentMatchingState {
                matchingControls(state)
            }
        case .unavailable:
            Text("Acest tip de exercițiu nu este încă disponibil aici.")
                .foregroundStyle(Theme.muted)
        }
    }

    private func textControls(exercise: ExerciseDefinition, completed: Bool) -> some View {
        let borderColor: Color = {
            if completed { return Theme.success }
            if latestResolution?.needsCorrection == true { return Theme.danger }
            return answerFieldFocused ? Theme.teal : Theme.line
        }()
        return TextField(exercise.type == .freeProduction ? "Scrie răspunsul în Arabizi" : "Scrie răspunsul", text: $answer)
            .accessibilityLabel("Răspunsul tău")
            .accessibilityIdentifier("exercise.answerField")
            .font(Theme.font(.title3, weight: .semibold))
            .foregroundStyle(Theme.ink)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .focused($answerFieldFocused)
            .submitLabel(.done)
            .disabled(completed)
            .onSubmit { if !completed && canSubmit(exercise) { submitAnswer() } }
            .padding(16)
            .frame(minHeight: 64, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous)
                    .fill(Theme.surface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous)
                    .strokeBorder(borderColor, lineWidth: 2)
            )
            .animation(.easeInOut(duration: 0.15), value: answerFieldFocused)
    }

    private func choiceControls(choices: [String], completed: Bool) -> some View {
        VStack(spacing: 12) {
            ForEach(Array(choices.enumerated()), id: \.element) { index, choice in
                Button {
                    answer = choice
                } label: {
                    HStack(spacing: 14) {
                        Text("\(index + 1)")
                            .font(Theme.font(.caption, weight: .bold))
                            .frame(width: 26, height: 26)
                            .overlay(
                                RoundedRectangle(cornerRadius: 7, style: .continuous)
                                    .strokeBorder(Theme.line, lineWidth: 1.5)
                            )
                            .accessibilityHidden(true)
                        Text(choice)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .buttonStyle(TileButtonStyle(state: choiceLook(choice, completed: completed)))
                .disabled(completed)
                .accessibilityIdentifier("exercise.choice")
                .accessibilityAddTraits(answer == choice ? .isSelected : [])
            }
        }
    }

    private func choiceLook(_ choice: String, completed: Bool) -> TileButtonStyle.Look {
        if completed {
            return answer == choice ? .correct : .muted
        }
        if answer == choice { return .selected }
        if let latestResolution, latestResolution.needsCorrection, latestResolution.submittedAnswer == choice {
            return .wrong
        }
        return .normal
    }

    private func wordOrderControls(state: WordOrderState, completed: Bool) -> some View {
        VStack(alignment: .leading, spacing: 22) {
            HStack(alignment: .top, spacing: 10) {
                FlowLayout(spacing: 8, lineSpacing: 10) {
                    ForEach(state.selectedTokens) { token in
                        Text(token.value)
                            .font(Theme.font(.body, weight: .semibold))
                            .foregroundStyle(completed ? Theme.success : Theme.ink)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .cardBackground(completed ? Theme.successBackground : Theme.surface)
                            .transition(.scale(scale: 0.8).combined(with: .opacity))
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 104, alignment: .topLeading)
                .overlay(alignment: .topLeading) {
                    if state.selectedTokens.isEmpty {
                        Text("Alege cuvintele în ordine")
                            .font(Theme.font(.body))
                            .foregroundStyle(Theme.muted)
                            .padding(.top, 8)
                    }
                }
                .background(alignment: .top) {
                    VStack(spacing: 44) {
                        Rectangle().fill(Theme.line).frame(height: 2)
                        Rectangle().fill(Theme.line).frame(height: 2)
                    }
                    .padding(.top, 46)
                }

                Button {
                    guard var state = wordOrder else { return }
                    state.undoLastSelection()
                    wordOrder = state
                    answer = state.submittedAnswer
                } label: {
                    Image(systemName: "delete.backward")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(Theme.muted)
                        .frame(width: 44, height: 44)
                }
                .disabled(completed || state.selectedTokens.isEmpty)
                .accessibilityLabel("Anulează ultimul cuvânt")
            }
            .animation(.spring(response: 0.3, dampingFraction: 0.8), value: state.selectedTokenIDs)

            FlowLayout(spacing: 10, lineSpacing: 12) {
                ForEach(state.remainingTokens) { token in
                    Button(token.value) {
                        guard var state = wordOrder else { return }
                        state.select(tokenID: token.id)
                        wordOrder = state
                        answer = state.submittedAnswer
                    }
                    .buttonStyle(TileButtonStyle(state: .normal, alignment: .center, compact: true))
                    .disabled(completed)
                }
            }
            .frame(maxWidth: .infinity)
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
        VStack(alignment: .leading, spacing: 14) {
            Text("Atinge o expresie, apoi sensul ei.")
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.muted)
            Text("\(state.matchedPairIDs.count) din \(state.pairs.count) perechi potrivite")
                .font(Theme.font(.caption, weight: .semibold))
                .foregroundStyle(Theme.teal)
            AdaptiveRow(spacing: 12) {
                VStack(spacing: 10) {
                    ForEach(state.pairs) { pair in
                        matchingButton(pair, state: state, isLeft: true)
                    }
                }
                .frame(maxWidth: .infinity)
                .accessibilityElement(children: .contain)
                .accessibilityLabel("Libaneză")
                VStack(spacing: 10) {
                    ForEach(Array(state.pairs.reversed())) { pair in
                        matchingButton(pair, state: state, isLeft: false)
                    }
                }
                .frame(maxWidth: .infinity)
                .accessibilityElement(children: .contain)
                .accessibilityLabel("Sens")
            }
        }
    }

    private func matchingButton(_ pair: MatchingPair, state: MatchingState, isLeft: Bool) -> some View {
        let matched = state.matchedPairIDs.contains(pair.id)
        let selected = (isLeft ? selectedLeftID : selectedRightID) == pair.id
        let mismatched = mismatchedPairIDs.contains((isLeft ? "L:" : "R:") + pair.id)
        let look: TileButtonStyle.Look = matched ? .muted : mismatched ? .wrong : selected ? .selected : .normal
        return Button {
            mismatchedPairIDs = []
            if isLeft { selectedLeftID = pair.id } else { selectedRightID = pair.id }
            if selectedLeftID != nil && selectedRightID != nil {
                submitAnswer()
            }
        } label: {
            Text(isLeft ? pair.left : pair.right)
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(TileButtonStyle(state: look, alignment: .center))
        .disabled(matched)
        .accessibilityAddTraits(selected ? .isSelected : [])
        .accessibilityValue(matched ? "Potrivit" : selected ? "Selectat" : "Nepotrivit încă")
    }

    // MARK: - Bottom action bar

    private func actionBar(
        exercise: ExerciseDefinition,
        input: NativeExerciseInput,
        player: ExerciseSessionPlayer
    ) -> some View {
        let completed = player.isCurrentExerciseCompleted
        let isMatching = player.currentMatchingState != nil
        let tone = latestResolution.map { FeedbackTone(resolution: $0) }
        let showsFeedback = latestResolution != nil && (!isMatching || completed)

        return VStack(alignment: .leading, spacing: 14) {
            if showsFeedback, let latestResolution {
                FeedbackBanner(
                    resolution: latestResolution,
                    referenceAnswer: isMatching ? nil : exercise.answer
                )
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            AdaptiveRow(spacing: 12) {
                if !completed {
                    Button {
                        useHint()
                    } label: {
                        Image(systemName: "lightbulb.fill")
                            .accessibilityLabel("Indiciu")
                    }
                    .buttonStyle(ChunkyButtonStyle(kind: .secondary))
                    .frame(maxWidth: isMatching ? CGFloat.infinity : 76)
                    .disabled(hintVisible)
                    .accessibilityIdentifier("exercise.hint")

                    if !isMatching {
                        Button {
                            submitAnswer()
                        } label: {
                            Text(latestResolution?.needsCorrection == true ? "Verifică din nou" : "Verifică")
                        }
                        .buttonStyle(ChunkyButtonStyle(kind: latestResolution?.needsCorrection == true ? .danger : .primary))
                        .disabled(!canSubmit(exercise))
                        .accessibilityIdentifier("exercise.check")
                    }
                } else {
                    Button {
                        advance()
                    } label: {
                        Text(isLastExercise(player: player) ? "Vezi rezultatul" : "Continuă")
                    }
                    .buttonStyle(ChunkyButtonStyle(kind: .primary))
                    .accessibilityIdentifier("exercise.continue")
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 16)
        .padding(.bottom, 8)
        .frame(maxWidth: .infinity)
        .background {
            (showsFeedback ? tone?.background ?? Theme.surface : Theme.surface)
                .ignoresSafeArea(edges: .bottom)
        }
        .overlay(alignment: .top) {
            Rectangle()
                .fill(showsFeedback ? .clear : Theme.line)
                .frame(height: 1.5)
        }
    }

    // MARK: - Session logic

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
        mismatchedPairIDs = []
        wordOrder = nil
        guard let exercise else { answerFieldFocused = false; return }
        let input = NativeExerciseInput(exercise: exercise, expressions: expressions, locale: locale)
        if case let .wordOrder(state) = input { wordOrder = state }
        answerFieldFocused = input == .text
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
        var attemptedMatch: (left: String, right: String)?
        if let left = selectedLeftID, let right = selectedRightID, player.currentMatchingState != nil {
            submitted = player.submitMatch(leftPairID: left, rightPairID: right, responseTime: elapsed)
            attemptedMatch = (left, right)
            selectedRightID = nil
        } else {
            submitted = player.submit(answer, responseTime: elapsed)
        }
        guard let resolution = submitted else { return }

        self.player = player
        latestResolution = resolution

        if let attemptedMatch, !resolution.completed {
            mismatchedPairIDs = ["L:" + attemptedMatch.left, "R:" + attemptedMatch.right]
        }

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

    private func awardSessionXP(_ state: LearningSessionState) {
        let amount = XPRewardPolicy().xp(for: state)
        guard amount > 0 else { return }
        let now = Date()
        let event = XPEvent(
            id: UUID().uuidString,
            day: LearnerDay().key(for: now),
            amount: amount,
            occurredAt: now,
            source: xpSource
        )
        earnedXP = amount
        Task {
            await progressModel.recordXP(event)
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
        if player.isFinished {
            awardSessionXP(player.sessionState)
            onComplete?()
        }
    }
}

// MARK: - Feedback

private enum FeedbackTone {
    case success
    case variant
    case retry

    init(resolution: ExerciseResolution) {
        if resolution.needsCorrection || !resolution.completed {
            self = .retry
        } else {
            switch resolution.evaluation {
            case .acceptedSpellingVariant, .acceptedPronunciationVariant:
                self = .variant
            case .exact, .incorrect:
                self = .success
            }
        }
    }

    var color: Color {
        switch self {
        case .success: return Theme.success
        case .variant: return Theme.variant
        case .retry: return Theme.danger
        }
    }

    var background: Color {
        switch self {
        case .success: return Theme.successBackground
        case .variant: return Theme.variantBackground
        case .retry: return Theme.dangerBackground
        }
    }

    var icon: String {
        switch self {
        case .success: return "checkmark"
        case .variant: return "checkmark"
        case .retry: return "arrow.counterclockwise"
        }
    }
}

private struct FeedbackBanner: View {
    let resolution: ExerciseResolution
    /// Shown after an accepted variant so the learner also sees the reference form.
    let referenceAnswer: String?

    private var tone: FeedbackTone { FeedbackTone(resolution: resolution) }

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: tone.icon)
                .font(.system(.title3, design: .rounded).weight(.heavy))
                .foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(tone.color, in: Circle())
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(Theme.font(.title3, weight: .bold))
                    .foregroundStyle(tone.color)
                Text(message)
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if tone == .variant, let referenceAnswer {
                    Text("Forma de referință: \(referenceAnswer)")
                        .font(Theme.font(.subheadline, weight: .semibold))
                        .foregroundStyle(tone.color)
                }
            }
            Spacer(minLength: 0)
        }
        .accessibilityElement(children: .combine)
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

// MARK: - Summary

private struct SessionSummaryView: View {
    let state: LearningSessionState
    let earnedXP: Int
    let rewards: RewardSummary
    @Environment(\.dismiss) private var dismiss
    @State private var appeared = false

    private var accuracy: Double {
        guard state.completedCount > 0 else { return 0 }
        return Double(state.cleanFirstTryCount) / Double(state.completedCount)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 26) {
                VStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(Theme.mint)
                            .frame(width: 132, height: 132)
                        Circle()
                            .trim(from: 0, to: CGFloat(appeared ? accuracy : 0))
                            .stroke(Theme.teal, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                            .frame(width: 132, height: 132)
                        Image(systemName: "checkmark")
                            .font(.system(size: 50, weight: .heavy, design: .rounded))
                            .foregroundStyle(Theme.teal)
                            .scaleEffect(appeared ? 1 : 0.4)
                    }
                    .accessibilityHidden(true)

                    Text("Sesiune terminată")
                        .font(Theme.serif(.largeTitle))
                        .foregroundStyle(Theme.ink)
                        .multilineTextAlignment(.center)
                    Text("Ai parcurs toate exercițiile pregătite pentru această sesiune.")
                        .font(Theme.font(.body))
                        .foregroundStyle(Theme.muted)
                        .multilineTextAlignment(.center)

                    if earnedXP > 0 {
                        HStack(spacing: 10) {
                            Label("+\(earnedXP) XP", systemImage: "bolt.fill")
                                .foregroundStyle(Theme.goldShade)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(Theme.gold.opacity(0.18), in: Capsule())
                            if rewards.streakDays > 0 {
                                Label("Serie: \(RewardText.days(rewards.streakDays))", systemImage: "flame.fill")
                                    .foregroundStyle(Theme.streak)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background(Theme.streak.opacity(0.14), in: Capsule())
                            }
                        }
                        .font(Theme.font(.headline, weight: .heavy))
                        .scaleEffect(appeared ? 1 : 0.6)
                        .opacity(appeared ? 1 : 0)
                        .accessibilityElement(children: .combine)
                        .accessibilityIdentifier("summary.xp")
                    }
                }
                .padding(.top, 12)

                AdaptiveRow(spacing: 12) {
                    SummaryMetric(value: "\(state.completedCount)", label: "completate", icon: "checkmark.circle.fill", color: Theme.teal)
                    SummaryMetric(value: "\(state.cleanFirstTryCount)", label: "din prima", icon: "bolt.fill", color: Theme.gold)
                }

                AdaptiveRow(spacing: 12) {
                    SummaryMetric(value: "\(state.hintedCount)", label: "cu indiciu", icon: "lightbulb.fill", color: Theme.variant)
                    SummaryMetric(value: "\(state.mistakes.count)", label: "greșeli inițiale", icon: "arrow.counterclockwise", color: Theme.danger)
                }

                if !state.mistakes.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("De revăzut")
                            .font(Theme.font(.title2, weight: .bold))
                            .foregroundStyle(Theme.ink)
                        ForEach(Array(state.mistakes.enumerated()), id: \.offset) { _, mistake in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(mistake.submittedAnswer)
                                    .font(Theme.font(.headline))
                                    .strikethrough(color: Theme.danger)
                                    .foregroundStyle(Theme.danger)
                                Text("→ \(mistake.correctAnswer)")
                                    .font(Theme.font(.headline, weight: .bold))
                                    .foregroundStyle(Theme.success)
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .cardBackground()
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            Button("Continuă") { dismiss() }
                .buttonStyle(ChunkyButtonStyle(kind: .primary))
                .accessibilityIdentifier("summary.continue")
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(Theme.canvas.ignoresSafeArea(edges: .bottom))
        }
        .sensoryFeedback(.success, trigger: appeared)
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.7).delay(0.15)) {
                appeared = true
            }
        }
    }
}

private struct SummaryMetric: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(label, systemImage: icon)
                .font(Theme.font(.caption, weight: .bold))
                .textCase(.uppercase)
                .foregroundStyle(color)
            Text(value)
                .font(Theme.font(.title, weight: .heavy))
                .foregroundStyle(Theme.ink)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .cardBackground()
        .accessibilityElement(children: .combine)
    }
}
