import SwiftUI
import YallaCore

/// A unit's approved dialogue drills, played as a conversation.
struct GuidedScenario: Identifiable {
    let unitID: String
    let title: String
    let dialogues: [ExerciseDefinition]
    var id: String { unitID }

    /// Units that have dialogue drills, in Journey order.
    static func all(in package: ContentPackage, locale: String) -> [GuidedScenario] {
        let byUnit = Dictionary(grouping: package.exercises.filter { $0.type == .dialogueResponse }, by: \.unitID)
        return package.units.compactMap { unit in
            guard let dialogues = byUnit[unit.id], !dialogues.isEmpty,
                  let title = unit.localizations[locale]?.title else { return nil }
            return GuidedScenario(unitID: unit.id, title: title, dialogues: dialogues)
        }
    }
}

/// Scenario picker: one card per unit with dialogue drills.
struct GuidedConversationListView: View {
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    var body: some View {
        let scenarios = GuidedScenario.all(in: package, locale: locale)
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                Text("Alege o situație. Răspunzi cu replici din lecții și îți poți înregistra vocea.")
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
                ForEach(scenarios) { scenario in
                    NavigationLink {
                        GuidedConversationView(
                            scenario: scenario,
                            expressions: package.expressions,
                            audioAssets: package.audioAssets,
                            locale: locale,
                            progressModel: progressModel
                        )
                    } label: {
                        ScenarioCard(
                            icon: JourneyUnitArt.icon(for: scenario.unitID),
                            title: scenario.title,
                            subtitle: "\(scenario.dialogues.count) replici",
                            imageName: JourneyUnitArt.scene(for: scenario.unitID)
                        )
                    }
                    .buttonStyle(NodeButtonStyle())
                    .accessibilityIdentifier("conversation.scenario")
                }
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: Theme.Spacing.maxContentWidth)
            .frame(maxWidth: .infinity)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle("Conversație ghidată")
        .navigationBarTitleDisplayMode(.inline)
    }
}

/// Plays a scenario's dialogue drills turn by turn on the shared exercise
/// engine, so answers, attempts, mastery and reviews behave as in lessons.
/// The microphone only records locally for self-comparison; nothing is scored.
struct GuidedConversationView: View {
    let scenario: GuidedScenario
    let expressions: [YallaCore.Expression]
    let audioAssets: [AudioAsset]
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    private struct DoneTurn: Identifiable {
        let id: String
        let prompt: String
        let reply: String
        let recording: LearnerRecording?
    }

    @StateObject private var audio = NativeAudioController()
    @State private var player: ExerciseSessionPlayer?
    @State private var turns: [DoneTurn] = []
    @State private var wrongReplies: Set<String> = []
    @State private var chosenReply: String?
    @State private var typedReply = ""
    @State private var isTyping = false
    @State private var currentRecording: LearnerRecording?
    @State private var startedAt = Date()
    @State private var persistedAttemptCount = 0
    @State private var earnedXP = 0
    @FocusState private var fieldFocused: Bool

    init(
        scenario: GuidedScenario,
        expressions: [YallaCore.Expression],
        audioAssets: [AudioAsset],
        locale: String,
        progressModel: LearnerProgressModel
    ) {
        self.scenario = scenario
        self.expressions = expressions
        self.audioAssets = audioAssets
        self.locale = locale
        self.progressModel = progressModel
        _player = State(initialValue: try? ExerciseSessionPlayer(
            exercises: scenario.dialogues,
            expressions: expressions,
            locale: locale
        ))
    }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.section) {
                    HStack(spacing: Theme.Spacing.md) {
                        SegmentedStepProgress(current: turns.count + (isCurrentCompleted ? 1 : 0), total: scenario.dialogues.count)
                        Text("\(min(turns.count + 1, scenario.dialogues.count)) / \(scenario.dialogues.count)")
                            .font(Theme.font(.caption))
                            .monospacedDigit()
                            .foregroundStyle(Theme.muted)
                    }
                    ScenarioCard(
                        icon: JourneyUnitArt.icon(for: scenario.unitID),
                        title: "Scenariu: \(scenario.title)",
                        subtitle: "Conversație ghidată, cu replici din lecții.",
                        imageName: JourneyUnitArt.scene(for: scenario.unitID)
                    )

                    ForEach(turns) { turn in
                        ConversationBubble(speaker: .partner, text: turn.prompt)
                        ConversationBubble(speaker: .learner, text: turn.reply) {
                            if let recording = turn.recording {
                                Button {
                                    toggle(recording)
                                } label: {
                                    Label("Ascultă-te", systemImage: "play.fill")
                                        .font(Theme.font(.caption, weight: .semibold))
                                        .foregroundStyle(Theme.teal)
                                }
                                .buttonStyle(.plain)
                                .frame(minHeight: 44)
                            }
                        }
                    }

                    if let player, player.isFinished {
                        completion
                    } else if let player, let exercise = player.currentExercise {
                        current(exercise: exercise)
                    } else {
                        ContentUnavailableView("Dialog indisponibil", systemImage: "exclamationmark.triangle")
                    }

                    Color.clear.frame(height: 1).id("bottom")
                }
                .padding(.horizontal, Theme.Spacing.screen)
                .padding(.vertical, Theme.Spacing.md)
                .frame(maxWidth: Theme.Spacing.maxContentWidth)
                .frame(maxWidth: .infinity)
            }
            .scrollDismissesKeyboard(.interactively)
            .onChange(of: turns.count) { _, _ in
                withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo("bottom", anchor: .bottom) }
            }
        }
        .background(Theme.canvas.ignoresSafeArea())
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if player?.isFinished != true {
                ConversationInputDock(
                    state: microphoneState,
                    isTyping: isTyping,
                    onKeyboard: {
                        isTyping.toggle()
                        fieldFocused = isTyping
                    },
                    onMicrophone: toggleRecording
                )
            }
        }
        .navigationTitle("Conversație ghidată")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .onAppear { audio.refreshMicrophonePermission() }
        .onDisappear {
            audio.stopPlayback()
            if audio.isRecording { audio.cancelRecording() }
        }
    }

    // MARK: Current turn

    private var isCurrentCompleted: Bool { player?.isCurrentExerciseCompleted == true }

    @ViewBuilder
    private func current(exercise: ExerciseDefinition) -> some View {
        let prompt = exercise.prompt[locale] ?? exercise.prompt["ro"] ?? ""
        ConversationBubble(speaker: .partner, text: prompt)

        if isCurrentCompleted, let reply = chosenReply {
            ConversationBubble(speaker: .learner, text: reply)
            PronunciationCompareCard(
                phrase: reply,
                hasLearnerRecording: currentRecording != nil,
                hasTeacherRecording: teacherAudio(for: reply) != nil,
                isPlaying: audio.isPlaying,
                onPlayLearner: { if let currentRecording { toggle(currentRecording) } },
                onPlayTeacher: { if let asset = teacherAudio(for: reply) { audio.stopPlayback(); audio.playReference(asset) } }
            )
            Button {
                advance(prompt: prompt, reply: reply)
            } label: {
                Label(isLastTurn ? "Termină conversația" : "Următoarea replică", systemImage: "arrow.right")
                    .labelStyle(TrailingIconLabelStyle())
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 54))
            .accessibilityIdentifier("conversation.next")
        } else {
            replies(for: exercise)
        }
    }

    @ViewBuilder
    private func replies(for exercise: ExerciseDefinition) -> some View {
        let input = NativeExerciseInput(exercise: exercise, expressions: expressions, locale: locale)
        Text("Alege un răspuns sau scrie-l:")
            .font(Theme.font(.subheadline, weight: .semibold))
            .foregroundStyle(Theme.ink)
        if case let .choices(choices) = input, !isTyping {
            AdaptiveChoiceGrid(preferredColumns: 2, minimumCardWidth: 150, spacing: Theme.Spacing.sm) {
                ForEach(choices, id: \.self) { choice in
                    SuggestedReplyCard(
                        title: choice,
                        state: wrongReplies.contains(choice) ? .incorrect : .idle,
                        action: { submit(choice) }
                    )
                }
            }
        } else {
            HStack(spacing: Theme.Spacing.sm) {
                TextField("Scrie răspunsul în Arabizi", text: $typedReply)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .focused($fieldFocused)
                    .submitLabel(.send)
                    .onSubmit { submit(typedReply) }
                    .padding(.horizontal, Theme.Spacing.lg)
                    .frame(minHeight: 50)
                    .background(Theme.surface, in: Capsule())
                    .overlay(Capsule().strokeBorder(Theme.cardStroke, lineWidth: 0.75))
                    .accessibilityIdentifier("conversation.field")
                CircularIconButton(
                    icon: .system("arrow.up"),
                    accessibilityLabel: "Trimite",
                    tint: .white,
                    fill: Theme.cedarDeep,
                    diameter: 44
                ) {
                    submit(typedReply)
                }
                .disabled(typedReply.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            if !wrongReplies.isEmpty {
                Text("Nu e replica potrivită. Mai încearcă.")
                    .font(Theme.font(.footnote))
                    .foregroundStyle(Theme.terracottaShade)
            }
        }
    }

    private var completion: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Label("Conversație încheiată", systemImage: "checkmark.seal.fill")
                .font(Theme.serif(.title3, weight: .semibold))
                .foregroundStyle(Theme.success)
            Text("\(turns.count) replici · \(player?.sessionState.cleanFirstTryCount ?? 0) din prima" + (earnedXP > 0 ? " · +\(earnedXP) puncte" : ""))
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.ink)
            Text("Înregistrările tale rămân pe telefon, în „Înregistrările mele”.")
                .font(Theme.font(.footnote))
                .foregroundStyle(Theme.muted)
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground(Theme.successBackground)
        .accessibilityIdentifier("conversation.done")
    }

    private var isLastTurn: Bool { turns.count + 1 >= scenario.dialogues.count }

    private var microphoneState: MicrophoneDockState {
        if audio.microphonePermissionDenied { return .denied }
        if audio.isRecording { return .recording }
        return isCurrentCompleted ? .idle : .disabled
    }

    // MARK: Actions

    private func submit(_ text: String) {
        let reply = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !reply.isEmpty, var player else { return }
        let elapsed = max(Date().timeIntervalSince(startedAt), 0)
        guard let resolution = player.submit(reply, responseTime: elapsed) else { return }
        self.player = player
        if resolution.completed {
            chosenReply = player.currentExercise?.answer ?? reply
            fieldFocused = false
            persist(resolution, player: player)
        } else {
            wrongReplies.insert(reply)
            typedReply = ""
        }
    }

    private func persist(_ resolution: ExerciseResolution, player: ExerciseSessionPlayer) {
        guard player.attempts.count > persistedAttemptCount else { return }
        persistedAttemptCount = player.attempts.count
        if let result = player.exerciseResult(id: UUID().uuidString, resolution: resolution, occurredAt: Date()) {
            Task { await progressModel.recordExerciseResult(result) }
        }
        guard let attempt = player.learningAttempt(id: UUID().uuidString, resolution: resolution, occurredAt: Date()) else { return }
        Task { await progressModel.record(attempt) }
    }

    private func advance(prompt: String, reply: String) {
        guard var player else { return }
        audio.stopPlayback()
        turns.append(DoneTurn(id: player.currentExercise?.id ?? UUID().uuidString, prompt: prompt, reply: reply, recording: currentRecording))
        guard player.advance() else { return }
        self.player = player
        chosenReply = nil
        wrongReplies = []
        typedReply = ""
        currentRecording = nil
        startedAt = Date()
        if player.isFinished { awardXP(player.sessionState) }
    }

    private func awardXP(_ state: LearningSessionState) {
        let amount = XPRewardPolicy().xp(for: state)
        guard amount > 0 else { return }
        let now = Date()
        earnedXP = amount
        let event = XPEvent(id: UUID().uuidString, day: LearnerDay().key(for: now), amount: amount, occurredAt: now, source: .practice)
        Task { await progressModel.recordXP(event) }
    }

    private func toggleRecording() {
        if audio.isRecording {
            if let recording = audio.stopRecording() { currentRecording = recording }
        } else {
            audio.stopPlayback()
            Task { await audio.startRecording() }
        }
    }

    private func toggle(_ recording: LearnerRecording) {
        if audio.isPlaying { audio.stopPlayback() } else { audio.playLearnerRecording(recording) }
    }

    /// The teacher's approved recording for the reply, once recordings are bundled.
    private func teacherAudio(for reply: String) -> AudioAsset? {
        let target = AnswerNormalizer.normalize(reply)
        guard let expression = expressions.first(where: { AnswerNormalizer.normalize($0.canonicalArabizi) == target }) else {
            return nil
        }
        return AudioAssetResolver().bestAsset(for: expression.id, from: audioAssets)
    }
}
