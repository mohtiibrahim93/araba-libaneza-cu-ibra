import SwiftUI
import YallaCore

@main
struct YallaApp: App {
    private let launchState: AppLaunchState

    init() {
        do {
            launchState = .ready(try BundledContentLoader().load())
        } catch {
            launchState = .failed(error.localizedDescription)
        }
    }

    var body: some Scene {
        WindowGroup {
            switch launchState {
            case let .ready(content):
                RootTabView(
                    model: content.shell,
                    discoverModel: content.discover
                )
            case let .failed(message):
                ContentLoadFailureView(message: message)
            }
        }
    }
}

private enum AppLaunchState {
    case ready(AppContentSnapshot)
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
