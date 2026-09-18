import AVFoundation
import Foundation
import SwiftUI
import YallaCore

enum NativeAudioError: LocalizedError {
    case referenceNotFound(String)
    case learnerRecordingNotFound(String)
    case microphonePermissionDenied
    case playbackDidNotStart
    case recordingDidNotStart

    var errorDescription: String? {
        switch self {
        case let .referenceNotFound(locator):
            return "Fișierul audio de referință nu a fost găsit: \(locator)"
        case let .learnerRecordingNotFound(locator):
            return "Înregistrarea locală nu a fost găsită: \(locator)"
        case .microphonePermissionDenied:
            return "Accesul la microfon este necesar pentru înregistrare."
        case .playbackDidNotStart:
            return "Redarea audio nu a putut fi pornită."
        case .recordingDidNotStart:
            return "Înregistrarea nu a putut fi pornită."
        }
    }
}

@MainActor
final class NativeAudioController: NSObject, ObservableObject, AVAudioPlayerDelegate {
    @Published private(set) var isPlaying = false
    @Published private(set) var isRecording = false
    @Published private(set) var lastRecording: LearnerRecording?
    @Published private(set) var errorMessage: String?

    private var player: AVAudioPlayer?
    private var recorder: AVAudioRecorder?
    private var activeRecordingLocator: String?
    private let fileManager: FileManager

    init(fileManager: FileManager = .default) {
        self.fileManager = fileManager
        super.init()
    }

    func playReference(
        _ asset: AudioAsset,
        rate: ReferencePlaybackRate = .normal
    ) {
        do {
            let url = try referenceURL(for: asset)
            try startPlayback(url: url, rate: rate)
            errorMessage = nil
        } catch {
            present(error)
        }
    }

    func playLearnerRecording(_ recording: LearnerRecording) {
        do {
            let url = try recordingURL(for: recording)
            try startPlayback(url: url, rate: .normal)
            errorMessage = nil
        } catch {
            present(error)
        }
    }

    func stopPlayback() {
        player?.stop()
        player = nil
        isPlaying = false
    }

    func startRecording() async {
        stopPlayback()

        let granted = await requestMicrophonePermission()
        guard granted else {
            present(NativeAudioError.microphonePermissionDenied)
            return
        }

        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(
                .playAndRecord,
                mode: .spokenAudio,
                options: [.defaultToSpeaker, .allowBluetoothHFP]
            )
            try session.setActive(true)

            let directory = try recordingsDirectory()
            let fileName = UUID().uuidString + ".m4a"
            let locator = "Recordings/" + fileName
            let url = directory.appendingPathComponent(fileName)

            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44_100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            let recorder = try AVAudioRecorder(url: url, settings: settings)
            recorder.prepareToRecord()
            guard recorder.record() else {
                throw NativeAudioError.recordingDidNotStart
            }

            self.recorder = recorder
            activeRecordingLocator = locator
            isRecording = true
            errorMessage = nil
        } catch {
            present(error)
        }
    }

    @discardableResult
    func stopRecording() -> LearnerRecording? {
        guard let recorder, recorder.isRecording,
              let locator = activeRecordingLocator
        else {
            return nil
        }

        recorder.stop()
        self.recorder = nil
        activeRecordingLocator = nil
        isRecording = false

        let recording = LearnerRecording(
            localLocator: locator,
            sharingState: .localOnly
        )
        lastRecording = recording
        return recording
    }

    func clearError() {
        errorMessage = nil
    }

    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        if self.player === player {
            self.player = nil
            isPlaying = false
        }
    }

    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                continuation.resume(returning: granted)
            }
        }
    }

    private func startPlayback(
        url: URL,
        rate: ReferencePlaybackRate
    ) throws {
        stopPlayback()

        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .spokenAudio)
        try session.setActive(true)

        let player = try AVAudioPlayer(contentsOf: url)
        player.enableRate = true
        player.rate = Float(rate.rawValue)
        player.delegate = self
        player.prepareToPlay()
        guard player.play() else {
            throw NativeAudioError.playbackDidNotStart
        }

        self.player = player
        isPlaying = true
    }

    private func referenceURL(for asset: AudioAsset) throws -> URL {
        if let url = URL(string: asset.locator), url.isFileURL,
           fileManager.fileExists(atPath: url.path) {
            return url
        }

        if let bundled = Bundle.main.url(
            forResource: asset.locator,
            withExtension: nil
        ) {
            return bundled
        }

        if let resourceURL = Bundle.main.resourceURL {
            let candidate = resourceURL.appendingPathComponent(asset.locator)
            if fileManager.fileExists(atPath: candidate.path) {
                return candidate
            }
        }

        throw NativeAudioError.referenceNotFound(asset.locator)
    }

    private func recordingURL(for recording: LearnerRecording) throws -> URL {
        let support = try applicationSupportDirectory()
        let candidate = support.appendingPathComponent(recording.localLocator)
        guard fileManager.fileExists(atPath: candidate.path) else {
            throw NativeAudioError.learnerRecordingNotFound(recording.localLocator)
        }
        return candidate
    }

    private func recordingsDirectory() throws -> URL {
        let directory = try applicationSupportDirectory()
            .appendingPathComponent("Recordings", isDirectory: true)
        try fileManager.createDirectory(
            at: directory,
            withIntermediateDirectories: true
        )
        return directory
    }

    private func applicationSupportDirectory() throws -> URL {
        try fileManager.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
    }

    private func present(_ error: Error) {
        recorder?.stop()
        recorder = nil
        activeRecordingLocator = nil
        isRecording = false
        errorMessage = error.localizedDescription
    }
}
