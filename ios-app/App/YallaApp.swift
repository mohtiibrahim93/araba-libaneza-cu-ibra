import SwiftUI
import UIKit
import YallaCore

@main
struct YallaApp: App {
    private let launchState: AppLaunchState

    init() {
        Self.configureNavigationTitles()
        do {
            let content = try BundledContentLoader().load()
            let store = try SwiftDataLearnerProgressStore()
            let repository = LearnerProgressRepository(store: store)
            let outboxURL = FileManager.default
                .urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
                .appendingPathComponent("progress-save-outbox-v1.json", isDirectory: false)
            let outbox = JSONFileProgressSaveOutbox(fileURL: outboxURL)
            launchState = .ready(content, repository, outbox)
        } catch {
            launchState = .failed(error.localizedDescription)
        }
    }

    /// Serif navigation titles to match the wordmark.
    private static func configureNavigationTitles() {
        let appearance = UINavigationBar.appearance()
        if let large = UIFont.preferredFont(forTextStyle: .largeTitle).fontDescriptor
            .withDesign(.serif)?.withSymbolicTraits(.traitBold) {
            appearance.largeTitleTextAttributes = [.font: UIFont(descriptor: large, size: 0)]
        }
        if let inline = UIFont.preferredFont(forTextStyle: .headline).fontDescriptor
            .withDesign(.serif)?.withSymbolicTraits(.traitBold) {
            appearance.titleTextAttributes = [.font: UIFont(descriptor: inline, size: 0)]
        }
    }

    var body: some Scene {
        WindowGroup {
            switch launchState {
            case let .ready(content, repository, outbox):
                RootTabView(
                    content: content,
                    progressRepository: repository,
                    progressOutbox: outbox
                )
            case let .failed(message):
                ContentLoadFailureView(message: message)
            }
        }
    }
}

private enum AppLaunchState {
    case ready(AppContentSnapshot, LearnerProgressRepository, any ProgressSaveOutbox)
    case failed(String)
}

private struct ContentLoadFailureView: View {
    let message: String

    var body: some View {
        ContentUnavailableView {
            Label("Aplicație indisponibilă", systemImage: "exclamationmark.triangle")
        } description: {
            Text("Conținutul sau progresul local nu a putut fi încărcat. Încearcă să redeschizi aplicația. Datele nu au fost resetate.")
            Text(message).font(.caption)
        }
        .padding()
    }
}
