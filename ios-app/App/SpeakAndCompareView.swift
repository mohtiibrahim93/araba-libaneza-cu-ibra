@preconcurrency import AVFoundation
import SwiftUI
import UIKit
import YallaCore

struct SpeakAndCompareView: View {
    let destination: SpeakAndCompareDestination

    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.openURL) private var openURL
    @StateObject private var audio = NativeAudioController()
    @State private var session: SpeakAndCompareSession

    private let playbackRates: [ReferencePlaybackRate] = [
        .slow,
        .reduced,
        .normal
    ]

    init(destination: SpeakAndCompareDestination) {
        self.destination = destination
        _session = State(
            initialValue: SpeakAndCompareSession(
                expressionID: destination.expression.id,
                referenceAudioAssetID: destination.referenceAudioAsset.id
            )
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                expressionCard
                referenceSection
                recordingSection
                privacyNote

                if let errorMessage = audio.errorMessage {
                    Label(errorMessage, systemImage: "exclamationmark.triangle.fill")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
                }
            }
            .padding()
        }
        .navigationTitle("Spune și compară")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            audio.refreshMicrophonePermission()
            if let files = try? audio.localRecordings() {
                let existing = Set(files.map(\.id))
                for recording in session.recordingHistory where !existing.contains(recording.localLocator) {
                    session.removeLearnerRecording(localLocator: recording.localLocator)
                }
            }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase != .active {
                audio.stopPlayback()
                audio.cancelRecording()
            } else {
                audio.refreshMicrophonePermission()
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: AVAudioSession.interruptionNotification)) { _ in
            audio.stopPlayback()
            audio.cancelRecording()
        }
        .onDisappear {
            audio.stopPlayback()
            audio.cancelRecording()
        }
    }

    private var expressionCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(destination.expression.arabizi)
                .font(.largeTitle.bold())

            if let arabic = destination.expression.arabicScript {
                Text(arabic)
                    .font(.title2)
                    .foregroundStyle(.secondary)
            }

            Text(destination.expression.meaning)
                .font(.headline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var referenceSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Referință")
                .font(.title2.bold())

            HStack(spacing: 8) {
                ForEach(playbackRates, id: \.self) { rate in
                    rateButton(rate)
                }
            }

            Button {
                if audio.isPlaying {
                    audio.stopPlayback()
                } else {
                    audio.playReference(
                        destination.referenceAudioAsset,
                        rate: session.referencePlaybackRate
                    )
                }
            } label: {
                Label(
                    audio.isPlaying ? "Oprește redarea" : "Ascultă referința",
                    systemImage: audio.isPlaying ? "stop.fill" : "speaker.wave.2.fill"
                )
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(audio.isRecording || audio.isRequestingPermission)
        }
    }

    @ViewBuilder
    private func rateButton(_ rate: ReferencePlaybackRate) -> some View {
        if session.referencePlaybackRate == rate {
            Button(rateLabel(rate)) {
                session.referencePlaybackRate = rate
            }
            .buttonStyle(.borderedProminent)
        } else {
            Button(rateLabel(rate)) {
                session.referencePlaybackRate = rate
            }
            .buttonStyle(.bordered)
        }
    }

    private var recordingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Vocea ta")
                .font(.title2.bold())

            if audio.microphonePermissionDenied {
                Text("Accesul la microfon este dezactivat. Îl poți activa din configurările aplicației.")
                    .font(.callout).foregroundStyle(.secondary)
                Button("Deschide configurările") {
                    if let url = URL(string: UIApplication.openSettingsURLString) { openURL(url) }
                }
                .buttonStyle(.bordered)
            }

            if audio.isRecording {
                Button(role: .destructive) {
                    finishRecording()
                } label: {
                    Label("Oprește înregistrarea", systemImage: "stop.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            } else {
                Button {
                    Task {
                        await audio.startRecording()
                    }
                } label: {
                    Label(audio.isRequestingPermission ? "Se solicită accesul…" : "Înregistrează-te", systemImage: "mic.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(audio.isRequestingPermission)
            }

            NavigationLink {
                RecordingLibraryView()
            } label: {
                Label("Toate înregistrările mele", systemImage: "waveform")
            }
            .disabled(audio.isRecording || audio.isRequestingPermission)

            if let recording = session.learnerRecording {
                Button {
                    audio.playLearnerRecording(recording)
                } label: {
                    Label("Ascultă înregistrarea ta", systemImage: "play.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .disabled(audio.isRecording || audio.isRequestingPermission)

                Button("Șterge înregistrarea", role: .destructive) {
                    if audio.deleteRecording(recording) {
                        session.removeLearnerRecording(localLocator: recording.localLocator)
                    }
                }
                .disabled(audio.isRecording || audio.isRequestingPermission)

                Text("\(session.recordingHistory.count) înregistrări locale în această sesiune")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                Text("Ascultă referința, înregistrează-te și compară manual cele două variante.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var privacyNote: some View {
        Label(
            "Înregistrările rămân locale pe dispozitiv și nu sunt încărcate automat.",
            systemImage: "lock.fill"
        )
        .font(.footnote)
        .foregroundStyle(.secondary)
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private func finishRecording() {
        guard let recording = audio.stopRecording() else { return }
        session.attachLearnerRecording(
            localLocator: recording.localLocator,
            sharingState: recording.sharingState
        )
    }

    private func rateLabel(_ rate: ReferencePlaybackRate) -> String {
        switch rate {
        case .slow: return "0,6×"
        case .reduced: return "0,8×"
        case .normal: return "1×"
        }
    }
}
