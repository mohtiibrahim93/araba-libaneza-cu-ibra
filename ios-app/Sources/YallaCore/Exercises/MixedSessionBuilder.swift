public struct MixedSessionBuilder: Sendable {
    public init() {}

    public func build(from pool: [ExerciseDefinition], count: Int) -> [ExerciseDefinition] {
        let target = max(count, 0)
        guard target > 0 else { return [] }

        var seenIDs = Set<String>()
        let unique = pool.filter { seenIDs.insert($0.id).inserted }
        guard !unique.isEmpty else { return [] }

        var typeOrder: [ExerciseDefinitionType] = []
        var grouped: [ExerciseDefinitionType: [ExerciseDefinition]] = [:]
        for exercise in unique {
            if grouped[exercise.type] == nil {
                typeOrder.append(exercise.type)
                grouped[exercise.type] = []
            }
            grouped[exercise.type, default: []].append(exercise)
        }

        var offsets = Dictionary(uniqueKeysWithValues: typeOrder.map { ($0, 0) })
        var result: [ExerciseDefinition] = []

        while result.count < min(target, unique.count) {
            var addedInPass = false
            for type in typeOrder where result.count < min(target, unique.count) {
                let index = offsets[type, default: 0]
                guard let exercises = grouped[type], index < exercises.count else { continue }
                result.append(exercises[index])
                offsets[type] = index + 1
                addedInPass = true
            }
            if !addedInPass { break }
        }

        return result
    }
}
