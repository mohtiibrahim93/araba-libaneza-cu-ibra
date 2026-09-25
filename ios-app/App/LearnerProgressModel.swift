import Foundation
import SwiftUI
import YallaCore

@MainActor
final class LearnerProgressModel: ObservableObject {
    @Published private(set) var snapshot = LearnerProgressSnapshot()
    @Published private(set) var persistenceError: String?
    @Published private(set) var pendingSaveCount = 0
    @Published private(set) var isSaving = false

    private let repository: LearnerProgressRepository
    private let saveQueue: ProgressSaveQueue

    init(
        repository: LearnerProgressRepository,
        outbox: any ProgressSaveOutbox = InMemoryProgressSaveOutbox()
    ) {
        self.repository = repository
        self.saveQueue = ProgressSaveQueue(outbox: outbox)
    }

    func saveOrientation(_ checkpoint: OrientationCheckpoint?) async {
        await perform(.orientation(checkpoint))
    }

    func load() async { await perform(.reload) }

    func setCurrentJourneyUnitID(_ unitID: String?) async {
        await perform(.journeyUnit(unitID))
    }

    func setExpressionSaved(_ expressionID: String, saved: Bool) async {
        await perform(.savedExpression(expressionID, saved))
    }

    func toggleSavedExpressionID(_ expressionID: String) async {
        let desired = !saveQueue.isExpressionSaved(expressionID, in: snapshot)
        await perform(.savedExpression(expressionID, desired))
    }

    func markLessonCompleted(_ lessonID: String, fingerprint: String) async {
        await perform(.lessonCompletedWithFingerprint(lessonID, fingerprint))
    }

    func recordXP(_ event: XPEvent) async {
        await perform(.xp(event))
    }

    func recordSpeedDrill(_ entry: SpeedDrillHistoryEntry) async {
        await perform(.speedDrill(entry))
    }

    func record(_ attempt: LearningAttempt) async {
        await perform(.attempt(attempt))
    }

    func recordExerciseResult(_ result: ExerciseResult) async {
        await perform(.exerciseResult(result))
    }

    func retryPendingSaves() async {
        isSaving = true
        do {
            try await saveQueue.flush(using: repository)
            persistenceError = nil
        } catch {
            persistenceError = error.localizedDescription
        }
        if let saved = saveQueue.latestSnapshot { snapshot = saved }
        pendingSaveCount = saveQueue.pendingCount
        isSaving = saveQueue.isSaving
    }

    private func perform(_ operation: ProgressSaveQueue.Operation) async {
        saveQueue.enqueue(operation)
        pendingSaveCount = saveQueue.pendingCount
        await retryPendingSaves()
    }
}
