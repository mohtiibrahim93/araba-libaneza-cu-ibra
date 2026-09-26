import Foundation

/// Where a piece of clothing goes on the character.
public enum WardrobeSlot: String, Codable, CaseIterable, Sendable {
    case head, top, bottom, shoes, accessory

    public var title: String {
        switch self {
        case .head: return "Cap"
        case .top: return "Sus"
        case .bottom: return "Jos"
        case .shoes: return "Pantofi"
        case .accessory: return "Accesorii"
        }
    }
}

/// A piece of clothing the learner can buy with coins. `imageName` is the
/// transparent artwork layer; until it exists the app draws a placeholder
/// in `placeholderColor`.
public struct WardrobeItem: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let slot: WardrobeSlot
    public let name: String
    public let price: Int
    /// Finishing this conversation unit unlocks the item.
    public let unlockUnitID: String?
    public let placeholderColor: String
    public let imageName: String?

    public init(
        id: String,
        slot: WardrobeSlot,
        name: String,
        price: Int,
        unlockUnitID: String? = nil,
        placeholderColor: String = "#888888",
        imageName: String? = nil
    ) {
        self.id = id
        self.slot = slot
        self.name = name
        self.price = price
        self.unlockUnitID = unlockUnitID
        self.placeholderColor = placeholderColor
        self.imageName = imageName
    }
}

/// Coins earned in the game, up to a daily limit. Coins are separate from
/// XP and cannot be bought for now.
public enum GameRewards {
    /// Most coins the game gives in one day.
    public static let dailyLimit = 30

    public static let firstTry = 3
    public static let secondTry = 1
    public static let firstCompletion = 10
    public static let replayCompletion = 2

    /// Coins for a reply answered after `wrongAttempts` wrong picks.
    public static func coins(wrongAttempts: Int) -> Int {
        switch wrongAttempts {
        case 0: return firstTry
        case 1: return secondTry
        default: return 0
        }
    }
}

/// The learner's game progress, saved on the phone.
public struct DressUpGameState: Codable, Equatable, Sendable {
    public private(set) var coins: Int
    public private(set) var ownedItemIDs: Set<String>
    public private(set) var equipped: [WardrobeSlot: String]
    /// How many times each conversation unit was finished.
    public private(set) var completions: [String: Int]
    /// Coins earned on `earnedDay` (a LearnerDay key), for the daily limit.
    public private(set) var earnedToday: Int
    public private(set) var earnedDay: String

    public init(
        coins: Int = 0,
        ownedItemIDs: Set<String> = [],
        equipped: [WardrobeSlot: String] = [:],
        completions: [String: Int] = [:],
        earnedToday: Int = 0,
        earnedDay: String = ""
    ) {
        self.coins = coins
        self.ownedItemIDs = ownedItemIDs
        self.equipped = equipped
        self.completions = completions
        self.earnedToday = earnedToday
        self.earnedDay = earnedDay
    }

    private enum CodingKeys: String, CodingKey {
        case coins, ownedItemIDs, equipped, completions, earnedToday, earnedDay
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        coins = try container.decode(Int.self, forKey: .coins)
        ownedItemIDs = try container.decode(Set<String>.self, forKey: .ownedItemIDs)
        equipped = try container.decode([WardrobeSlot: String].self, forKey: .equipped)
        completions = try container.decode([String: Int].self, forKey: .completions)
        earnedToday = try container.decodeIfPresent(Int.self, forKey: .earnedToday) ?? 0
        earnedDay = try container.decodeIfPresent(String.self, forKey: .earnedDay) ?? ""
    }

    /// Coins already earned on `day`.
    public func earned(on day: String) -> Int {
        earnedDay == day ? earnedToday : 0
    }

    /// Adds coins up to what is left of the day's limit and returns how many
    /// were actually added.
    @discardableResult
    public mutating func earn(_ amount: Int, day: String) -> Int {
        if earnedDay != day {
            earnedDay = day
            earnedToday = 0
        }
        let granted = min(max(amount, 0), max(GameRewards.dailyLimit - earnedToday, 0))
        earnedToday += granted
        coins += granted
        return granted
    }

    /// Pays coins (e.g. to reveal a translation). Returns false when there are not enough.
    @discardableResult
    public mutating func spend(_ amount: Int) -> Bool {
        guard amount >= 0, coins >= amount else { return false }
        coins -= amount
        return true
    }

    /// Records a finished scene and returns the bonus actually earned
    /// (within the day's limit).
    @discardableResult
    public mutating func completeScene(unitID: String, day: String) -> Int {
        let bonus = completions[unitID, default: 0] == 0 ? GameRewards.firstCompletion : GameRewards.replayCompletion
        completions[unitID, default: 0] += 1
        return earn(bonus, day: day)
    }

    public func isUnlocked(_ item: WardrobeItem) -> Bool {
        guard let unitID = item.unlockUnitID else { return true }
        return completions[unitID, default: 0] > 0
    }

    public func canBuy(_ item: WardrobeItem) -> Bool {
        !ownedItemIDs.contains(item.id) && isUnlocked(item) && coins >= item.price
    }

    /// Buys and wears the item. Returns false when it cannot be bought.
    @discardableResult
    public mutating func buy(_ item: WardrobeItem) -> Bool {
        guard canBuy(item) else { return false }
        coins -= item.price
        ownedItemIDs.insert(item.id)
        equipped[item.slot] = item.id
        return true
    }

    /// Wears an owned item, or takes it off when it is already worn.
    public mutating func toggleWearing(_ item: WardrobeItem) {
        guard ownedItemIDs.contains(item.id) else { return }
        equipped[item.slot] = equipped[item.slot] == item.id ? nil : item.id
    }
}

/// How much Romanian the game shows at each level: everything at A1, less
/// as the learner advances, none from B2.
public struct GameTranslationPolicy: Equatable, Sendable {
    public enum PartnerLine: Equatable, Sendable { case shown, tapToReveal, hidden }

    public let partnerLine: PartnerLine
    public let showsOptionTranslations: Bool
    /// Coins it costs to reveal a hidden line.
    public let revealCost: Int

    public init(level: LevelBand) {
        switch level {
        case .a1:
            self.init(partnerLine: .shown, options: true)
        case .a2:
            self.init(partnerLine: .shown, options: false)
        case .b1:
            self.init(partnerLine: .tapToReveal, options: false)
        case .b2, .c1, .c2:
            self.init(partnerLine: .hidden, options: false)
        }
    }

    private init(partnerLine: PartnerLine, options: Bool) {
        self.partnerLine = partnerLine
        self.showsOptionTranslations = options
        self.revealCost = partnerLine == .tapToReveal ? 1 : 0
    }
}

/// Romanian for an Arabizi reply, from approved content only: the quoted
/// Romanian of dialogue exercises first, then expression meanings.
public struct RomanianGloss: Sendable {
    private let byKey: [String: String]

    public init(package: ContentPackage, locale: String = "ro") {
        var map: [String: String] = [:]
        for exercise in package.exercises where exercise.type == .dialogueResponse {
            let key = AnswerNormalizer.normalize(exercise.answer)
            guard map[key] == nil,
                  let ro = DialoguePromptText.quotedRomanian(in: exercise.prompt[locale] ?? "") else { continue }
            map[key] = ro
        }
        for expression in package.expressions {
            let key = AnswerNormalizer.normalize(expression.canonicalArabizi)
            guard map[key] == nil, let meaning = expression.localizations[locale]?.naturalMeaning else { continue }
            map[key] = meaning
        }
        byKey = map
    }

    public func romanian(for arabizi: String) -> String? {
        byKey[AnswerNormalizer.normalize(arabizi)]
    }
}
