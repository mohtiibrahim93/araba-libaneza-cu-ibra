import SwiftUI
import YallaCore

struct SpeakAndCompareView: View {
    let destination: SpeakAndCompareDestination

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
        .onDisappear {
            audio.stopPlayback()
            if audio.isRecording {
                _ = audio.stopRecording()
            }
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
            .disabled(audio.isRecording)
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
                    Label("Înregistrează-te", systemImage: "mic.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            }

            if let recording = session.learnerRecording {
                Button {
                    audio.playLearnerRecording(recording)
                } label: {
                    Label("Ascultă înregistrarea ta", systemImage: "play.circle.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .disabled(audio.isRecording)

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
