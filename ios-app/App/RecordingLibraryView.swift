@preconcurrency import AVFoundation
import SwiftUI
import YallaCore

struct RecordingLibraryView: View {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var audio = NativeAudioController()
    @State private var recordings: [LocalRecordingSummary] = []
    @State private var loadingError: String?
    @State private var playingID: String?
    @State private var pendingDeletion: LocalRecordingSummary?
    @State private var confirmingDeletion = false

    var body: some View {
        List {
            Section {
                Text("Înregistrările sunt păstrate doar pe acest dispozitiv. Le poți asculta sau șterge; nu sunt încărcate automat.")
                    .font(.callout).foregroundStyle(.secondary)
            }
            if let loadingError {
                Section {
                    Label("Înregistrările nu au putut fi citite.", systemImage: "exclamationmark.triangle")
                    Text(loadingError).font(.caption)
                    Button("Reîncearcă") { reload() }
                }
            } else if recordings.isEmpty {
                ContentUnavailableView(
                    "Nicio înregistrare", systemImage: "mic",
                    description: Text("Înregistrările finalizate în Spune și compară vor apărea aici.")
                )
            }
            if let error = audio.errorMessage {
                Section { Label(error, systemImage: "exclamationmark.triangle") }
            }
            ForEach(recordings) { item in
                VStack(alignment: .leading, spacing: 10) {
                    Text(item.recordedAt, format: .dateTime.day().month().year().hour().minute().second())
                        .font(.headline)
                    Text("\(max(item.byteCount / 1024, 1)) KB · pe dispozitiv")
                        .font(.caption).foregroundStyle(.secondary)
                    HStack {
                        Button {
                            if playingID == item.id && audio.isPlaying {
                                audio.stopPlayback()
                                playingID = nil
                            } else {
                                audio.playLearnerRecording(item.recording)
                                playingID = audio.isPlaying ? item.id : nil
                            }
                        } label: {
                            Label(playingID == item.id && audio.isPlaying ? "Oprește" : "Ascultă",
                                  systemImage: playingID == item.id && audio.isPlaying ? "stop.fill" : "play.fill")
                        }
                        .buttonStyle(.bordered)
                        Spacer()
                        Button("Șterge", role: .destructive) {
                            pendingDeletion = item
                            confirmingDeletion = true
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .creamList()
        .navigationTitle("Înregistrările mele")
        .task { reload() }
        .alert("Ștergi înregistrarea?", isPresented: $confirmingDeletion) {
            Button("Șterge", role: .destructive) {
                if let item = pendingDeletion, audio.deleteRecording(item.recording) {
                    playingID = nil
                    reload()
                }
                pendingDeletion = nil
            }
            Button("Păstrează", role: .cancel) { pendingDeletion = nil }
        } message: {
            Text("Înregistrarea va fi eliminată de pe acest dispozitiv. Acțiunea nu poate fi anulată.")
        }
        .onChange(of: scenePhase) { _, phase in
            if phase != .active { audio.stopPlayback(); playingID = nil }
            else { reload() }
        }
        .onReceive(NotificationCenter.default.publisher(for: AVAudioSession.interruptionNotification)) { _ in
            audio.stopPlayback()
            playingID = nil
        }
        .onDisappear { audio.stopPlayback() }
    }

    private func reload() {
        do {
            recordings = try audio.localRecordings()
            loadingError = nil
        } catch {
            loadingError = error.localizedDescription
        }
    }
}
