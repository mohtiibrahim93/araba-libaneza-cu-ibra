import SwiftUI
import YallaCore

@main
struct YallaApp: App {
    private let launchState: AppLaunchState

    init() {
        do {
            let content = try BundledContentLoader().load()
            let store = try SwiftDataLearnerProgressStore()
            let repository = LearnerProgressRepository(store: store)
            launchState = .ready(content, repository)
        } catch {
            launchState = .failed(error.localizedDescription)
        }
    }

    var body: some Scene {
        WindowGroup {
            switch launchState {
            case let .ready(content, repository):
                RootTabView(
                    content: content,
                    progressRepository: repository
                )
            case let .failed(message):
                ContentLoadFailureView(message: message)
            }
        }
    }
}

private enum AppLaunchState {
    case ready(AppContentSnapshot, LearnerProgressRepository)
    case failed(String)
}

private struct ContentLoadFailureView: View {
    let message: String

    var body: some View {
        ContentUnavailableView {
            Label("Conținut indisponibil", systemImage: "exclamationmark.triangle")
        } description: {
            Text(message)
        }
        .padding()
    }
}
