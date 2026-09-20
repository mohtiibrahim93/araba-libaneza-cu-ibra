import SwiftUI

struct ProgressSaveStatusView: View {
    @ObservedObject var progressModel: LearnerProgressModel

    var body: some View {
        if progressModel.persistenceError != nil {
            VStack(alignment: .leading, spacing: 8) {
                Label("Stocare locală indisponibilă", systemImage: "exclamationmark.triangle")
                    .font(.headline)
                Text("Reîncearcă salvarea înainte să închizi aplicația. Modificările în așteptare sunt păstrate doar cât timp aplicația rămâne deschisă.")
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
