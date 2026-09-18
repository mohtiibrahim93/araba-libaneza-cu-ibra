import Foundation
import SwiftData
import YallaCore

@Model
final class LearnerProgressRecord {
    var key: String
    var payload: Data

    init(key: String, payload: Data) {
        self.key = key
        self.payload = payload
    }
}

actor SwiftDataLearnerProgressStore: LearnerProgressStore {
    private let container: ModelContainer
    private let recordKey = "guest-progress"

    init(isStoredInMemoryOnly: Bool = false) throws {
        let schema = Schema([LearnerProgressRecord.self])
        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: isStoredInMemoryOnly
        )
        self.container = try ModelContainer(
            for: schema,
            configurations: [configuration]
        )
    }

    func load() async throws -> LearnerProgressSnapshot {
        let context = ModelContext(container)
        var descriptor = FetchDescriptor<LearnerProgressRecord>()
        descriptor.fetchLimit = 10
        let records = try context.fetch(descriptor)

        guard let record = records.first(where: { $0.key == recordKey }) else {
            return LearnerProgressSnapshot()
        }

        return try JSONDecoder().decode(
            LearnerProgressSnapshot.self,
            from: record.payload
        )
    }

    func save(_ snapshot: LearnerProgressSnapshot) async throws {
        let payload = try JSONEncoder().encode(snapshot)
        let context = ModelContext(container)
        var descriptor = FetchDescriptor<LearnerProgressRecord>()
        descriptor.fetchLimit = 10
        let records = try context.fetch(descriptor)

        if let record = records.first(where: { $0.key == recordKey }) {
            record.payload = payload
        } else {
            context.insert(
                LearnerProgressRecord(
                    key: recordKey,
                    payload: payload
                )
            )
        }

        try context.save()
    }
}
