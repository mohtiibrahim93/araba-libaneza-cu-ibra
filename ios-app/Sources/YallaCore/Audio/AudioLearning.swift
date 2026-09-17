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

public enum ListeningMode: String, Codable, Equatable, Sendable {
    case multipleChoice
    case freeWrite
}

public struct ListeningPrompt: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let audioAssetID: String
    public let expressionID: String
    public let mode: ListeningMode
    public let revealWrittenLebaneseInitially: Bool

    public init(
        id: String,
        audioAssetID: String,
        expressionID: String,
        mode: ListeningMode,
        revealWrittenLebaneseInitially: Bool = false
    ) {
        self.id = id
        self.audioAssetID = audioAssetID
        self.expressionID = expressionID
        self.mode = mode
        self.revealWrittenLebaneseInitially = revealWrittenLebaneseInitially
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

public enum ReferencePlaybackRate: Double, Codable, Equatable, Sendable {
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

    public mutating func attachLearnerRecording(
        localLocator: String,
        sharingState: RecordingSharingState = .localOnly
    ) {
        recordingHistory.append(
            LearnerRecording(localLocator: localLocator, sharingState: sharingState)
        )
    }
}
