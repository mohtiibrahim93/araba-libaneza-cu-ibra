public enum AudioSource: String, Codable, Equatable, Sendable {
    case approvedNative
    case ibrahimRecorded
    case curatedGenerated
    case phraseOverrideTTS
    case genericFallback

    public var priority: Int {
        switch self {
        case .approvedNative: return 0
        case .ibrahimRecorded: return 1
        case .curatedGenerated: return 2
        case .phraseOverrideTTS: return 3
        case .genericFallback: return 4
        }
    }
}

public struct AudioAsset: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let expressionID: String?
    public let source: AudioSource
    public let locator: String

    public init(id: String, expressionID: String? = nil, source: AudioSource, locator: String) {
        self.id = id
        self.expressionID = expressionID
        self.source = source
        self.locator = locator
    }
}

public struct AudioAssetResolver: Sendable {
    public init() {}

    public func bestAsset(for expressionID: String, from assets: [AudioAsset]) -> AudioAsset? {
        assets
            .filter { $0.expressionID == expressionID }
            .sorted {
                if $0.source.priority == $1.source.priority { return $0.id < $1.id }
                return $0.source.priority < $1.source.priority
            }
            .first
    }
}

public enum ListeningMode: String, Codable, Equatable, Sendable {
    case multipleChoice
    case freeWrite
}

public struct ListeningPrompt: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let audioAssetID: String
    public let expressionID: String
    public let mode: ListeningMode
    public let choiceExpressionIDs: [String]
    public let revealWrittenLebaneseInitially: Bool

    public init(
        id: String,
        audioAssetID: String,
        expressionID: String,
        mode: ListeningMode,
        choiceExpressionIDs: [String] = [],
        revealWrittenLebaneseInitially: Bool = false
    ) {
        self.id = id
        self.audioAssetID = audioAssetID
        self.expressionID = expressionID
        self.mode = mode
        self.choiceExpressionIDs = choiceExpressionIDs
        self.revealWrittenLebaneseInitially = revealWrittenLebaneseInitially
    }

    private enum CodingKeys: String, CodingKey {
        case id, audioAssetID, expressionID, mode, choiceExpressionIDs
        case revealWrittenLebaneseInitially
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        audioAssetID = try container.decode(String.self, forKey: .audioAssetID)
        expressionID = try container.decode(String.self, forKey: .expressionID)
        mode = try container.decode(ListeningMode.self, forKey: .mode)
        choiceExpressionIDs = try container.decodeIfPresent([String].self, forKey: .choiceExpressionIDs) ?? []
        revealWrittenLebaneseInitially = try container.decodeIfPresent(
            Bool.self,
            forKey: .revealWrittenLebaneseInitially
        ) ?? false
    }
}

public enum RecordingSharingState: String, Codable, Equatable, Sendable {
    case localOnly
    case sharedByLearner
}

public struct LearnerRecording: Codable, Equatable, Sendable {
    public let localLocator: String
    public let sharingState: RecordingSharingState

    public init(localLocator: String, sharingState: RecordingSharingState = .localOnly) {
        self.localLocator = localLocator
        self.sharingState = sharingState
    }
}

public enum ReferencePlaybackRate: Double, Codable, Equatable, Hashable, Sendable {
    case slow = 0.6
    case reduced = 0.8
    case normal = 1.0
}

public struct SpeakAndCompareSession: Codable, Equatable, Sendable {
    public let expressionID: String
    public let referenceAudioAssetID: String
    public private(set) var recordingHistory: [LearnerRecording]
    public var referencePlaybackRate: ReferencePlaybackRate

    public init(
        expressionID: String,
        referenceAudioAssetID: String,
        recordingHistory: [LearnerRecording] = [],
        referencePlaybackRate: ReferencePlaybackRate = .normal
    ) {
        self.expressionID = expressionID
        self.referenceAudioAssetID = referenceAudioAssetID
        self.recordingHistory = recordingHistory
        self.referencePlaybackRate = referencePlaybackRate
    }

    public var learnerRecording: LearnerRecording? {
        recordingHistory.last
    }

    public mutating func removeLearnerRecording(localLocator: String) {
        recordingHistory.removeAll { $0.localLocator == localLocator }
    }

    public mutating func attachLearnerRecording(
        localLocator: String,
        sharingState: RecordingSharingState = .localOnly
    ) {
        recordingHistory.append(
            LearnerRecording(localLocator: localLocator, sharingState: sharingState)
        )
    }
}
