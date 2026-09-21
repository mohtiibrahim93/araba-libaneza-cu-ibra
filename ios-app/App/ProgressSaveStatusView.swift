import SwiftUI

struct ProgressSaveStatusView: View {
    @ObservedObject var progressModel: LearnerProgressModel

    var body: some View {
        if progressModel.persistenceError != nil {
            VStack(alignment: .leading, spacing: 8) {
                Label("Stocare locală indisponibilă", systemImage: "exclamationmark.triangle")
                    .font(.headline)
                Text("Reîncearcă salvarea. Operațiile deja puse în coada locală de recuperare pot fi reluate după redeschidere. Dacă însăși coada de recuperare nu poate fi scrisă, evită să închizi aplicația înainte de reîncercare.")
                    .font(.caption)
                Button(progressModel.isSaving ? "Se reîncearcă…" : "Reîncearcă salvarea") {
                    Task { await progressModel.retryPendingSaves() }
                }
                .buttonStyle(.borderedProminent)
                .disabled(progressModel.isSaving)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.regularMaterial)
        } else if progressModel.isSaving {
            ProgressView("Se salvează…")
                .font(.caption)
                .padding(8)
                .frame(maxWidth: .infinity)
                .background(.regularMaterial)
        }
    }
}
