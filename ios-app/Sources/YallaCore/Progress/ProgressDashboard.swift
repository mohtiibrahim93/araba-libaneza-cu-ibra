import Foundation

/// First-try accuracy for one mastery skill across all practised expressions.
public struct SkillSummary: Equatable, Sendable {
    public let skill: MasterySkill
    public let attempts: Int
    public let cleanCorrect: Int

    public init(skill: MasterySkill, attempts: Int, cleanCorrect: Int) {
        self.skill = skill
        self.attempts = attempts
        self.cleanCorrect = cleanCorrect
    }

    /// Nil until the skill has been practised.
    public var cleanRate: Double? {
        attempts > 0 ? Double(cleanCorrect) / Double(attempts) : nil
    }
}

/// Figures for the progress dashboard, derived only from stored learner progress.
public struct ProgressDashboardSummary: Equatable, Sendable {
    public let completedLessons: Int
    public let totalLessons: Int
    public let skills: [MasterySkill: SkillSummary]
    public let practisedExpressions: Int
    public let lessonsLast30Days: Int
    /// XP per local day (`yyyy-MM-dd`).
    public let xpByDay: [String: Int]

    public init(
        completedLessons: Int,
        totalLessons: Int,
        skills: [MasterySkill: SkillSummary],
        practisedExpressions: Int,
        lessonsLast30Days: Int,
        xpByDay: [String: Int]
    ) {
        self.completedLessons = completedLessons
        self.totalLessons = totalLessons
        self.skills = skills
        self.practisedExpressions = practisedExpressions
        self.lessonsLast30Days = lessonsLast30Days
        self.xpByDay = xpByDay
    }

    public var journeyFraction: Double {
        totalLessons > 0 ? Double(completedLessons) / Double(totalLessons) : 0
    }

    public func skill(_ skill: MasterySkill) -> SkillSummary {
        skills[skill] ?? SkillSummary(skill: skill, attempts: 0, cleanCorrect: 0)
    }
}

public struct ProgressDashboardBuilder: Sendable {
    private let calendar: Calendar
    private let planner: JourneyLessonPlanner

    public init(calendar: Calendar = .current, planner: JourneyLessonPlanner = JourneyLessonPlanner()) {
        self.calendar = calendar
        self.planner = planner
    }

    public func summary(
        snapshot: LearnerProgressSnapshot,
        lessonCounts: [String: Int],
        at date: Date
    ) -> ProgressDashboardSummary {
        var completed = 0
        var total = 0
        for (unitID, count) in lessonCounts {
            let progress = planner.progress(unitID: unitID, lessonCount: count, completedLessonIDs: snapshot.completedLessonIDs)
            completed += progress.completedCount
            total += progress.totalCount
        }

        var totals: [MasterySkill: (attempts: Int, clean: Int)] = [:]
        for mastery in snapshot.masteryByExpressionID.values {
            for skill in MasterySkill.allCases {
                let progress = mastery.progress(for: skill)
                guard progress.attempts > 0 else { continue }
                let current = totals[skill] ?? (0, 0)
                totals[skill] = (current.attempts + progress.attempts, current.clean + progress.cleanCorrect)
            }
        }
        let skills = Dictionary(uniqueKeysWithValues: totals.map { skill, value in
            (skill, SkillSummary(skill: skill, attempts: value.attempts, cleanCorrect: value.clean))
        })

        let monthAgo = calendar.date(byAdding: .day, value: -30, to: date) ?? date
        let lessonsLast30Days = snapshot.xpEvents.filter {
            $0.source == .lesson && $0.occurredAt > monthAgo && $0.occurredAt <= date
        }.count

        var xpByDay: [String: Int] = [:]
        for event in snapshot.xpEvents {
            xpByDay[event.day, default: 0] += event.amount
        }

        return ProgressDashboardSummary(
            completedLessons: completed,
            totalLessons: total,
            skills: skills,
            practisedExpressions: snapshot.seenExpressionIDs.count,
            lessonsLast30Days: lessonsLast30Days,
            xpByDay: xpByDay
        )
    }

    /// Day keys for the last `weeks` weeks, oldest first, ending today.
    public func recentDays(weeks: Int, endingAt date: Date) -> [String] {
        let day = LearnerDay(calendar: calendar)
        let count = max(weeks, 1) * 7
        return (0..<count).reversed().compactMap { offset in
            calendar.date(byAdding: .day, value: -offset, to: date).map(day.key(for:))
        }
    }
}
