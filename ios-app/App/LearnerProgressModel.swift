import Foundation
import SwiftUI
import YallaCore

@MainActor
final class LearnerProgressModel: ObservableObject {
    @Published private(set) var snapshot = LearnerProgressSnapshot()
    @Published private(set) var persistenceError: String?

    private let repository: LearnerProgressRepository

    init(repository: LearnerProgressRepository) {
        self.repository = repository
    }

    func load() async {
        do {
            snapshot = try await repository.load()
            persistenceError = nil
        } catch {
            persistenceError = error.localizedDescription
        }
    }

    func record(_ attempt: LearningAttempt) async {
        do {
            snapshot = try await repository.record(attempt)
            persistenceError = nil
        } catch {
            persistenceError = error.localizedDescription
        }
    }
}
