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

/// Splits a unit into lessons without reordering, filtering or generating content.
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
