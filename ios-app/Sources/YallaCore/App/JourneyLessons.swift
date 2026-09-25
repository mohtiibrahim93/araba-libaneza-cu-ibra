import Foundation

/// A short, finishable slice of a Journey unit's existing exercises.
public struct JourneyLesson: Equatable, Sendable, Identifiable {
    public let id: String
    public let unitID: String
    /// 1-based position inside the unit.
    public let number: Int
    public let exercises: [ExerciseDefinition]

    public init(id: String, unitID: String, number: Int, exercises: [ExerciseDefinition]) {
        self.id = id
        self.unitID = unitID
        self.number = number
        self.exercises = exercises
    }
}

public enum JourneyLessonStatus: Equatable, Sendable {
    case completed
    case current
    case locked
}

public struct JourneyUnitLessonProgress: Equatable, Sendable {
    public let completedCount: Int
    public let totalCount: Int

    public init(completedCount: Int, totalCount: Int) {
        self.completedCount = completedCount
        self.totalCount = totalCount
    }

    public var fraction: Double {
        totalCount > 0 ? Double(completedCount) / Double(totalCount) : 0
    }

    public var isComplete: Bool {
        totalCount > 0 && completedCount >= totalCount
    }
}

/// Splits a unit's composed exercise sequence (see `JourneyLessonComposer`) into lessons.
/// Lesson IDs are positional (`<unitID>.lesson.<n>`), so completion survives
/// content updates that keep the unit's lesson count.
public struct JourneyLessonPlanner: Sendable {
    public static let defaultLessonSize = 12

    public let lessonSize: Int

    public init(lessonSize: Int = JourneyLessonPlanner.defaultLessonSize) {
        self.lessonSize = max(1, lessonSize)
    }

    public func lessons(unitID: String, exercises: [ExerciseDefinition]) -> [JourneyLesson] {
        stride(from: 0, to: exercises.count, by: lessonSize).enumerated().map { offset, start in
            JourneyLesson(
                id: lessonID(unitID: unitID, number: offset + 1),
                unitID: unitID,
                number: offset + 1,
                exercises: Array(exercises[start..<min(start + lessonSize, exercises.count)])
            )
        }
    }

    public func lessonCount(exerciseCount: Int) -> Int {
        exerciseCount <= 0 ? 0 : (exerciseCount + lessonSize - 1) / lessonSize
    }

    /// Lesson counts for every unit in one pass, matching the exercises that
    /// `LearningNavigationBuilder.journeyUnit` would produce for each unit.
    public func lessonCounts(in package: ContentPackage, locale: String) -> [String: Int] {
        let expressionsByID = Dictionary(package.expressions.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        let exercisesByUnit = Dictionary(grouping: package.exercises, by: \.unitID)
        let composer = JourneyLessonComposer(lessonSize: lessonSize)
        var counts: [String: Int] = [:]
        for unit in package.units where counts[unit.id] == nil {
            let exercises = composer.exercises(
                for: unit,
                authored: exercisesByUnit[unit.id] ?? [],
                expressionsByID: expressionsByID,
                locale: locale
            )
            counts[unit.id] = lessonCount(exerciseCount: exercises.count)
        }
        return counts
    }

    /// Stable fingerprint of a lesson's exercises (FNV-1a over their IDs).
    public func fingerprint(for lesson: JourneyLesson) -> String {
        var hash: UInt64 = 0xcbf29ce484222325
        for byte in lesson.exercises.map(\.id).joined(separator: "|").utf8 {
            hash ^= UInt64(byte)
            hash = hash &* 0x100000001b3
        }
        return String(hash, radix: 16)
    }

    /// A finished lesson whose exercises changed since it was finished.
    /// Lessons finished before fingerprints were stored are never flagged.
    public func isUpdatedSinceCompletion(_ lesson: JourneyLesson, fingerprints: [String: String]) -> Bool {
        guard let stored = fingerprints[lesson.id] else { return false }
        return stored != fingerprint(for: lesson)
    }

    public func lessonID(unitID: String, number: Int) -> String {
        "\(unitID).lesson.\(number)"
    }

    /// Completed lessons stay replayable; the first unfinished lesson is current
    /// and later unfinished lessons are locked.
    public func statuses(
        for lessons: [JourneyLesson],
        completedLessonIDs: Set<String>
    ) -> [JourneyLessonStatus] {
        var foundCurrent = false
        return lessons.map { lesson in
            if completedLessonIDs.contains(lesson.id) { return .completed }
            if foundCurrent { return .locked }
            foundCurrent = true
            return .current
        }
    }

    public func progress(
        unitID: String,
        lessonCount: Int,
        completedLessonIDs: Set<String>
    ) -> JourneyUnitLessonProgress {
        let completed = (0..<max(lessonCount, 0)).filter {
            completedLessonIDs.contains(lessonID(unitID: unitID, number: $0 + 1))
        }.count
        return JourneyUnitLessonProgress(completedCount: completed, totalCount: max(lessonCount, 0))
    }
}
