import SwiftUI
import YallaCore

@MainActor
struct SpeakAndCompareOverviewView: View {
    let items: [SpeakAndCompareItem]
    let title: String

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Spune și compară")
                        .font(.headline)
                    Text("Ascultă referința, înregistrează-te local și compară manual. Fără scor automat de pronunție.")
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            Section("Expresii cu referință audio") {
                ForEach(items) { item in
                    NavigationLink {
                        SpeakAndCompareView(item: item)
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.lebanese)
                                .font(.headline)
                            Text(item.learnerMeaning)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 3)
                    }
                }
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

@MainActor
private struct SpeakAndCompareView: View {
    let item: SpeakAndCompareItem

    @StateObject private var audioController = NativeAudioController()
    @State private var session: SpeakAndCompareSession
    @State private var playbackRate: ReferencePlaybackRate = .normal

    init(item: SpeakAndCompareItem) {
        self.item = item
        _session = State(
            initialValue: SpeakAndCompareSession(
                expressionID: item.expressionID,
                referenceAudioAssetID: item.referenceAudioAsset.id
            )
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(item.lebanese)
                        .font(.largeTitle.bold())
                    Text(item.learnerMeaning)
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }

                GroupBox("Referință") {
                    VStack(alignment: .leading, spacing: 14) {
                        Picker("Viteză", selection: $playbackRate) {
                            Text("0,6×").tag(ReferencePlaybackRate.slow)
                            Text("0,8×").tag(ReferencePlaybackRate.reduced)
                            Text("1,0×").tag(ReferencePlaybackRate.normal)
                        }
                        .pickerStyle(.segmented)

                        Button {
                            if audioController.isPlaying {
                                audioController.stopPlayback()
                            } else {
                                audioController.playReference(
                                    item.referenceAudioAsset,
                                    rate: playbackRate
                                )
                            }
                        } label: {
                            Label(
                                audioController.isPlaying ? "Oprește referința" : "Ascultă referința",
                                systemImage: audioController.isPlaying ? "stop.fill" : "play.fill"
                            )
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(audioController.isRecording)
                    }
                    .padding(.top, 4)
                }

                GroupBox("Înregistrarea ta") {
                    VStack(alignment: .leading, spacing: 14) {
                        Label(
                            "Înregistrarea rămâne doar pe acest dispozitiv.",
                            systemImage: "lock.fill"
                        )
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                        Button {
                            toggleRecording()
                        } label: {
                            Label(
                                audioController.isRecording ? "Oprește înregistrarea" : "Înregistrează-te",
                                systemImage: audioController.isRecording ? "stop.circle.fill" : "mic.circle.fill"
                            )
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)

                        if let recording = session.learnerRecording {
                            Button {
                                audioController.playLearnerRecording(recording)
                            } label: {
                                Label("Ascultă înregistrarea ta", systemImage: "waveform")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.bordered)
                            .disabled(audioController.isRecording)
                        }

                        if session.recordingHistory.count > 1 {
                            Text("\(session.recordingHistory.count) încercări păstrate în această sesiune.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.top, 4)
                }

                if let errorMessage = audioController.errorMessage {
                    Label(errorMessage, systemImage: "exclamationmark.triangle.fill")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                }

                Text("Compară ritmul, sunetele și fluența cu referința. Aplicația nu inventează un scor de pronunție.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
        .navigationTitle("Spune și compară")
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: playbackRate) { _, newValue in
            session.referencePlaybackRate = newValue
        }
        .onDisappear {
            if audioController.isRecording {
                _ = audioController.stopRecording()
            }
            audioController.stopPlayback()
        }
    }

    private func toggleRecording() {
        if audioController.isRecording {
            if let recording = audioController.stopRecording() {
                session.attachLearnerRecording(
                    localLocator: recording.localLocator,
                    sharingState: .localOnly
                )
            }
        } else {
            Task {
                await audioController.startRecording()
            }
        }
    }
}
