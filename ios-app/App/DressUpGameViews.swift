import SwiftUI
import UIKit
import YallaCore

// MARK: - Store

/// The game's coins, clothes and finished scenes, saved on the phone.
@MainActor
final class DressUpGameStore: ObservableObject {
    static let shared = DressUpGameStore()

    @Published private(set) var state: DressUpGameState
    let items: [WardrobeItem]

    private let fileURL: URL?

    private init() {
        let folder = try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        fileURL = folder?.appendingPathComponent("dress-up-game.json")
        if let fileURL, let data = try? Data(contentsOf: fileURL),
           let saved = try? JSONDecoder().decode(DressUpGameState.self, from: data) {
            state = saved
        } else {
            state = DressUpGameState()
        }
        struct File: Decodable { let items: [WardrobeItem] }
        if let url = Bundle.main.url(forResource: "wardrobe-items", withExtension: "json"),
           let data = try? Data(contentsOf: url),
           let file = try? JSONDecoder().decode(File.self, from: data) {
            items = file.items
        } else {
            items = []
        }
    }

    func update(_ change: (inout DressUpGameState) -> Void) {
        change(&state)
        guard let fileURL, let data = try? JSONEncoder().encode(state) else { return }
        try? data.write(to: fileURL, options: .atomic)
    }

    var equippedItems: [WardrobeSlot: WardrobeItem] {
        var result: [WardrobeSlot: WardrobeItem] = [:]
        for (slot, id) in state.equipped {
            if let item = items.first(where: { $0.id == id }) { result[slot] = item }
        }
        return result
    }
}

// MARK: - Hub

/// "Îmbracă-l pe Ibra": play approved conversations, earn coins, dress the character.
struct DressUpGameView: View {
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @ObservedObject private var store = DressUpGameStore.shared

    private var scenes: [GuidedScenario] {
        GuidedScenario.all(in: package, locale: locale).filter { $0.script != nil }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
                        Text("Îmbracă-l pe Ibra")
                            .font(Theme.serif(.title2))
                            .foregroundStyle(Theme.ink)
                        Text("Răspunde în libaneză, câștigă monede și alege-i hainele.")
                            .font(Theme.font(.subheadline))
                            .foregroundStyle(Theme.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: Theme.Spacing.sm)
                    CoinBadge(coins: store.state.coins)
                }

                GameCharacterView(equipped: store.equippedItems)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.Spacing.md)
                    .cardBackground()

                NavigationLink {
                    WardrobeView(package: package)
                } label: {
                    Label("Garderoba", systemImage: "tshirt.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 52))
                .accessibilityIdentifier("game.wardrobe")

                Text("Scene")
                    .font(Theme.serif(.title3, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                ForEach(scenes) { scene in
                    let done = store.state.completions[scene.unitID, default: 0]
                    NavigationLink {
                        DressUpSceneView(
                            scenario: scene,
                            level: package.units.first { $0.id == scene.unitID }?.level ?? .a1,
                            package: package,
                            locale: locale,
                            progressModel: progressModel
                        )
                    } label: {
                        ScenarioCard(
                            icon: JourneyUnitArt.icon(for: scene.unitID),
                            title: scene.title,
                            subtitle: done == 0
                                ? "\(scene.dialogues.count) replici · +\(GameRewards.firstCompletion) monede la final"
                                : "Terminată de \(done) ori · +\(GameRewards.replayCompletion) monede la final",
                            imageName: JourneyUnitArt.scene(for: scene.unitID)
                        )
                    }
                    .buttonStyle(NodeButtonStyle())
                    .accessibilityIdentifier("game.scene")
                }
                Text("Monedele nu se pot cumpăra deocamdată. Le câștigi doar răspunzând.")
                    .font(Theme.font(.footnote))
                    .foregroundStyle(Theme.muted)
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: Theme.Spacing.maxContentWidth)
            .frame(maxWidth: .infinity)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle("Joc")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct CoinBadge: View {
    let coins: Int

    var body: some View {
        Label("\(coins)", systemImage: "circle.circle.fill")
            .font(Theme.font(.headline, weight: .bold))
            .monospacedDigit()
            .foregroundStyle(Theme.goldShade)
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.xs)
            .background(Theme.variantBackground, in: Capsule())
            .accessibilityLabel("\(coins) monede")
            .accessibilityIdentifier("game.coins")
    }
}

// MARK: - Scene

/// One approved conversation played for coins. Romanian fades with the level.
struct DressUpSceneView: View {
    let scenario: GuidedScenario
    let level: LevelBand
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @ObservedObject private var store = DressUpGameStore.shared

    private struct Done: Identifiable {
        let id: String
        let partner: String
        let partnerRo: String?
        let reply: String
        let replyRo: String?
    }

    @State private var player: ExerciseSessionPlayer?
    @State private var done: [Done] = []
    @State private var wrong: Set<String> = []
    @State private var answered: String?
    @State private var lastReward = 0
    @State private var earnedInScene = 0
    @State private var revealedTurns: Set<Int> = []
    @State private var finishedBonus: Int?
    @State private var startedAt = Date()
    @State private var persistedAttemptCount = 0

    private var policy: GameTranslationPolicy { GameTranslationPolicy(level: level) }
    private var gloss: RomanianGloss { RomanianGloss(package: package, locale: locale) }

    init(scenario: GuidedScenario, level: LevelBand, package: ContentPackage, locale: String, progressModel: LearnerProgressModel) {
        self.scenario = scenario
        self.level = level
        self.package = package
        self.locale = locale
        self.progressModel = progressModel
        _player = State(initialValue: try? ExerciseSessionPlayer(exercises: scenario.dialogues, expressions: package.expressions, locale: locale))
    }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                    HStack {
                        SegmentedStepProgress(current: done.count, total: scenario.dialogues.count)
                        CoinBadge(coins: store.state.coins)
                    }
                    ForEach(done) { turn in
                        ConversationBubble(speaker: .partner, text: turn.partner, caption: turn.partnerRo)
                        ConversationBubble(speaker: .learner, text: turn.reply, caption: turn.replyRo)
                    }
                    if let bonus = finishedBonus {
                        finished(bonus: bonus)
                    } else if let player, let exercise = player.currentExercise {
                        current(exercise: exercise, index: done.count)
                    }
                    Color.clear.frame(height: 1).id("bottom")
                }
                .padding(.horizontal, Theme.Spacing.screen)
                .padding(.vertical, Theme.Spacing.md)
                .frame(maxWidth: Theme.Spacing.maxContentWidth)
                .frame(maxWidth: .infinity)
            }
            .onChange(of: done.count) { _, _ in
                withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo("bottom", anchor: .bottom) }
            }
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle(scenario.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
    }

    @ViewBuilder
    private func current(exercise: ExerciseDefinition, index: Int) -> some View {
        let line = scenario.partnerLine(at: index)
        if let title = scenario.script?.sceneTitle(beforeTurn: index) {
            Text(title)
                .font(Theme.font(.caption, weight: .semibold))
                .foregroundStyle(Theme.muted)
        }
        ConversationBubble(speaker: .partner, text: line?.arabizi ?? "", caption: partnerCaption(line: line, index: index))
        if policy.partnerLine == .tapToReveal, line != nil, !revealedTurns.contains(index) {
            Button {
                var paid = false
                store.update { paid = $0.spend(policy.revealCost) }
                if paid { revealedTurns.insert(index) }
            } label: {
                Label("Arată traducerea (\(policy.revealCost) monedă)", systemImage: "eye")
                    .font(Theme.font(.footnote, weight: .semibold))
            }
            .buttonStyle(.plain)
            .foregroundStyle(Theme.brand)
        }

        if let reply = answered {
            ConversationBubble(speaker: .learner, text: reply, caption: replyRomanian(for: exercise, index: index))
            if lastReward > 0 {
                Label("+\(lastReward) monede", systemImage: "circle.circle.fill")
                    .font(Theme.font(.subheadline, weight: .bold))
                    .foregroundStyle(Theme.goldShade)
            }
            Button {
                advance(exercise: exercise, index: index, reply: reply, line: line)
            } label: {
                Label("Continuă", systemImage: "arrow.right")
                    .labelStyle(TrailingIconLabelStyle())
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 52))
            .accessibilityIdentifier("game.next")
        } else if case let .choices(choices) = NativeExerciseInput(exercise: exercise, expressions: package.expressions, locale: locale) {
            Text("Ce răspunzi?")
                .font(Theme.font(.subheadline, weight: .semibold))
                .foregroundStyle(Theme.ink)
            AdaptiveChoiceGrid(preferredColumns: 2, minimumCardWidth: 150, spacing: Theme.Spacing.sm) {
                ForEach(choices, id: \.self) { choice in
                    GameOptionCard(
                        arabizi: choice,
                        romanian: policy.showsOptionTranslations ? gloss.romanian(for: choice) : nil,
                        isWrong: wrong.contains(choice)
                    ) {
                        pick(choice)
                    }
                }
            }
        }
    }

    private func partnerCaption(line: ConversationScript.Line?, index: Int) -> String? {
        guard let line else { return nil }
        switch policy.partnerLine {
        case .shown: return line.ro
        case .tapToReveal: return revealedTurns.contains(index) ? line.ro : nil
        case .hidden: return nil
        }
    }

    private func replyRomanian(for exercise: ExerciseDefinition, index: Int) -> String? {
        guard policy.partnerLine != .hidden else { return nil }
        return scenario.script?.learnerRo(at: index)
            ?? DialoguePromptText.quotedRomanian(in: exercise.prompt[locale] ?? "")
    }

    private func finished(bonus: Int) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Label("Scenă terminată", systemImage: "checkmark.seal.fill")
                .font(Theme.serif(.title3, weight: .semibold))
                .foregroundStyle(Theme.success)
            Text("Ai câștigat \(earnedInScene + bonus) monede (\(bonus) bonus pentru final).")
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.ink)
            NavigationLink {
                WardrobeView(package: package)
            } label: {
                Label("Mergi la garderobă", systemImage: "tshirt.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 52))
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground(Theme.successBackground)
        .accessibilityIdentifier("game.done")
    }

    private func pick(_ choice: String) {
        guard var player, answered == nil else { return }
        guard let resolution = player.submit(choice, responseTime: max(Date().timeIntervalSince(startedAt), 0)) else { return }
        self.player = player
        if resolution.completed {
            let reward = GameRewards.coins(wrongAttempts: wrong.count)
            lastReward = reward
            earnedInScene += reward
            store.update { $0.earn(reward) }
            answered = player.currentExercise?.answer ?? choice
            persist(resolution, player: player)
        } else {
            wrong.insert(choice)
        }
    }

    private func advance(exercise: ExerciseDefinition, index: Int, reply: String, line: ConversationScript.Line?) {
        guard var player else { return }
        done.append(Done(
            id: exercise.id,
            partner: line?.arabizi ?? "",
            partnerRo: partnerCaption(line: line, index: index),
            reply: reply,
            replyRo: replyRomanian(for: exercise, index: index)
        ))
        guard player.advance() else { return }
        self.player = player
        answered = nil
        wrong = []
        lastReward = 0
        startedAt = Date()
        if player.isFinished {
            var bonus = 0
            store.update { bonus = $0.completeScene(unitID: scenario.unitID) }
            finishedBonus = bonus
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
}

/// A reply option: Arabizi, with small Romanian underneath when the level shows it.
struct GameOptionCard: View {
    let arabizi: String
    let romanian: String?
    let isWrong: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 3) {
                Text(arabizi)
                    .font(Theme.font(.subheadline, weight: .bold))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if let romanian {
                    Text(romanian)
                        .font(Theme.font(.caption))
                        .foregroundStyle(Theme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .multilineTextAlignment(.leading)
            .padding(Theme.Spacing.md)
            .frame(maxWidth: .infinity, minHeight: 64, maxHeight: .infinity, alignment: .topLeading)
            .background(isWrong ? Theme.blush : Theme.surface, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 15, style: .continuous)
                    .strokeBorder(isWrong ? Theme.terracotta : Theme.cardStroke, lineWidth: isWrong ? 1.5 : 0.75)
            )
        }
        .buttonStyle(NodeButtonStyle())
        .accessibilityValue(isWrong ? "Incorect" : "")
        .accessibilityIdentifier("game.option")
    }
}

// MARK: - Wardrobe

struct WardrobeView: View {
    let package: ContentPackage
    @ObservedObject private var store = DressUpGameStore.shared
    @State private var slot: WardrobeSlot = .head

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                HStack {
                    Spacer()
                    CoinBadge(coins: store.state.coins)
                }
                GameCharacterView(equipped: store.equippedItems)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.Spacing.md)
                    .cardBackground()
                Picker("Categorie", selection: $slot) {
                    ForEach(WardrobeSlot.allCases, id: \.self) { slot in
                        Text(slot.title).tag(slot)
                    }
                }
                .pickerStyle(.segmented)
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: Theme.Spacing.sm)], spacing: Theme.Spacing.sm) {
                    ForEach(store.items.filter { $0.slot == slot }) { item in
                        itemCard(item)
                    }
                }
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: Theme.Spacing.maxContentWidth)
            .frame(maxWidth: .infinity)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle("Garderoba")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func itemCard(_ item: WardrobeItem) -> some View {
        let owned = store.state.ownedItemIDs.contains(item.id)
        let worn = store.state.equipped[item.slot] == item.id
        let unlocked = store.state.isUnlocked(item)
        let status: String = {
            if worn { return "Porți" }
            if owned { return "Ai deja · atinge ca să porți" }
            if !unlocked {
                let title = package.units.first { $0.id == item.unlockUnitID }?.localizations["ro"]?.title ?? ""
                return "Se deblochează după: \(title)"
            }
            return item.price == 0 ? "Gratuit" : "\(item.price) monede"
        }()
        return Button {
            store.update { state in
                if owned { state.toggleWearing(item) } else { state.buy(item) }
            }
        } label: {
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(hex: item.placeholderColor))
                    .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Theme.cardStroke))
                    .frame(height: 56)
                Text(item.name)
                    .font(Theme.font(.subheadline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                Text(status)
                    .font(Theme.font(.caption))
                    .foregroundStyle(worn ? Theme.success : Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(Theme.Spacing.md)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(worn ? Theme.successBackground : Theme.surface, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
            .opacity(owned || store.state.canBuy(item) ? 1 : 0.55)
        }
        .buttonStyle(NodeButtonStyle())
        .disabled(!owned && !store.state.canBuy(item))
        .accessibilityIdentifier("game.item")
    }
}

// MARK: - Character

/// The character with the worn clothes. Uses the artwork layer of each item
/// when it exists; otherwise draws simple placeholder shapes.
struct GameCharacterView: View {
    let equipped: [WardrobeSlot: WardrobeItem]

    private let skin = Color(hex: "#D9A77E")

    var body: some View {
        ZStack(alignment: .top) {
            if UIImage(named: "game-character") != nil {
                Image("game-character").resizable().scaledToFit()
                ForEach(WardrobeSlot.allCases, id: \.self) { slot in
                    if let name = equipped[slot]?.imageName, UIImage(named: name) != nil {
                        Image(name).resizable().scaledToFit()
                    }
                }
            } else {
                placeholder
            }
        }
        .frame(width: 160, height: 260)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Personajul tău")
        .accessibilityIdentifier("game.character")
    }

    private func color(_ slot: WardrobeSlot, _ fallback: Color) -> Color {
        equipped[slot].map { Color(hex: $0.placeholderColor) } ?? fallback
    }

    private var placeholder: some View {
        ZStack(alignment: .top) {
            // Legs
            HStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 8).fill(color(.bottom, Color(hex: "#8A8F99"))).frame(width: 30, height: 90)
                RoundedRectangle(cornerRadius: 8).fill(color(.bottom, Color(hex: "#8A8F99"))).frame(width: 30, height: 90)
            }
            .offset(y: 150)
            // Shoes
            HStack(spacing: 8) {
                Capsule().fill(color(.shoes, Color(hex: "#55595F"))).frame(width: 38, height: 16)
                Capsule().fill(color(.shoes, Color(hex: "#55595F"))).frame(width: 38, height: 16)
            }
            .offset(y: 238)
            // Torso and arms
            RoundedRectangle(cornerRadius: 18).fill(color(.top, Color(hex: "#B8BDC4")))
                .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(.black.opacity(0.08)))
                .frame(width: 96, height: 100)
                .offset(y: 62)
            HStack(spacing: 100) {
                Capsule().fill(color(.top, Color(hex: "#B8BDC4"))).frame(width: 20, height: 84)
                Capsule().fill(color(.top, Color(hex: "#B8BDC4"))).frame(width: 20, height: 84)
            }
            .offset(y: 66)
            // Head
            Circle().fill(skin).frame(width: 58, height: 58).offset(y: 2)
            if let head = equipped[.head] {
                Capsule().fill(Color(hex: head.placeholderColor)).frame(width: 64, height: 18).offset(y: 0)
            }
            if let accessory = equipped[.accessory] {
                Circle().fill(Color(hex: accessory.placeholderColor)).frame(width: 18, height: 18).offset(x: 26, y: 80)
            }
        }
    }
}

extension Color {
    /// "#RRGGBB" colours from the wardrobe file.
    init(hex: String) {
        let value = UInt64(hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")), radix: 16) ?? 0x888888
        self.init(
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255
        )
    }
}
