import SwiftUI
import YallaCore

// MARK: - Journey tab

/// Journey as a winding path of units grouped by level.
struct JourneyPathView: View {
    let sections: [JourneySectionSummary]
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    @Binding var path: [String]
    /// Lessons per unit, computed once at launch.
    let lessonCounts: [String: Int]

    private let navigationBuilder = LearningNavigationBuilder()
    private let planner = JourneyLessonPlanner()

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(sections) { section in
                        LevelHeader(
                            level: section.level,
                            completedUnits: section.units.filter { progress(for: $0.id).isComplete }.count,
                            totalUnits: section.units.count
                        )
                        .padding(.horizontal, 20)
                        .padding(.top, 20)
                        .padding(.bottom, 12)

                        ForEach(Array(section.units.enumerated()), id: \.element.id) { index, unit in
                            unitNode(unit, index: index)
                                .padding(.vertical, 12)
                        }
                    }
                }
                .padding(.bottom, 32)
            }
            .background(Theme.canvas.ignoresSafeArea())
            .navigationTitle("Parcurs")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    TimelineView(.periodic(from: .now, by: 60)) { context in
                        RewardBadges(
                            summary: RewardCalculator().summary(
                                events: progressModel.snapshot.xpEvents,
                                at: context.date
                            )
                        )
                    }
                }
            }
            .navigationDestination(for: String.self) { unitID in
                if let detail = detail(for: unitID) {
                    JourneyUnitDetailView(
                        detail: detail,
                        expressions: package.expressions,
                        locale: locale,
                        progressModel: progressModel
                    )
                } else {
                    ContentUnavailableView("Unitate indisponibilă", systemImage: "exclamationmark.triangle")
                }
            }
        }
    }

    private var highlightedUnitID: String? {
        if let current = progressModel.snapshot.currentJourneyUnitID { return current }
        return sections.flatMap(\.units).first { !progress(for: $0.id).isComplete }?.id
    }

    @ViewBuilder
    private func unitNode(_ unit: JourneyUnitSummary, index: Int) -> some View {
        let progress = progress(for: unit.id)
        let isHighlighted = unit.id == highlightedUnitID
        let available = (lessonCounts[unit.id] ?? 0) > 0
        let style: PathNode.Style = !available ? .locked
            : progress.isComplete ? .done
            : isHighlighted ? .active
            : .idle
        let valueText: String = available
            ? "\(progress.completedCount) din \(progress.totalCount) lecții"
            : "Fără exerciții încă"

        VStack(spacing: 8) {
            if isHighlighted && available {
                PathBubble(text: progress.completedCount > 0 ? "Continuă" : "Începe")
            }
            Group {
                if available {
                    NavigationLink(value: unit.id) {
                        PathNode(style: style, symbol: symbol(for: style), progress: progress.fraction, size: 78)
                    }
                    .buttonStyle(NodeButtonStyle())
                } else {
                    PathNode(style: style, symbol: symbol(for: style), progress: 0, size: 78)
                }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(unit.title)
            .accessibilityValue(valueText)
            .accessibilityAddTraits(available ? .isButton : [])
            .accessibilityIdentifier("journey.unit")

            VStack(spacing: 2) {
                Text(unit.title)
                    .font(Theme.font(.subheadline, weight: .bold))
                    .foregroundStyle(style == .locked ? Theme.muted : Theme.ink)
                    .multilineTextAlignment(.center)
                if available && progress.totalCount > 0 {
                    Text("\(progress.completedCount)/\(progress.totalCount) lecții")
                        .font(Theme.font(.caption, weight: .semibold))
                        .foregroundStyle(Theme.muted)
                }
            }
            .frame(maxWidth: 180)
            .accessibilityHidden(true)
        }
        .frame(maxWidth: .infinity)
        .offset(x: PathNode.zigzagOffset(index))
    }

    private func symbol(for style: PathNode.Style) -> String {
        switch style {
        case .done: return "checkmark"
        case .active: return "star.fill"
        case .idle: return "book.fill"
        case .locked: return "lock.fill"
        }
    }

    private func progress(for unitID: String) -> JourneyUnitLessonProgress {
        planner.progress(
            unitID: unitID,
            lessonCount: lessonCounts[unitID] ?? 0,
            completedLessonIDs: progressModel.snapshot.completedLessonIDs
        )
    }

    private func detail(for unitID: String) -> JourneyUnitDetail? {
        try? navigationBuilder.journeyUnit(id: unitID, from: package, locale: locale)
    }
}

private struct LevelHeader: View {
    let level: LevelBand
    let completedUnits: Int
    let totalUnits: Int

    private var subtitle: String {
        switch level {
        case .a1: return "Primele conversații"
        case .a2: return "Mai multă independență"
        case .b1: return "Explică și argumentează"
        case .b2: return "Conversează cu nuanță"
        case .c1: return "Înțelege dincolo de cuvinte"
        case .c2: return "Exprimă-te cu precizie"
        }
    }

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            Text(level.rawValue.uppercased())
                .font(Theme.font(.title, weight: .heavy))
                .foregroundStyle(Theme.lime)
            VStack(alignment: .leading, spacing: 2) {
                Text(subtitle)
                    .font(Theme.font(.headline, weight: .bold))
                    .foregroundStyle(.white)
                Text("\(completedUnits) din \(totalUnits) unități finalizate")
                    .font(Theme.font(.caption, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.75))
            }
            Spacer(minLength: 0)
        }
        .padding(18)
        .background(Theme.deep, in: RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Unit screen

struct JourneyUnitDetailView: View {
    let detail: JourneyUnitDetail
    let expressions: [YallaCore.Expression]
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    private let planner = JourneyLessonPlanner()

    var body: some View {
        let lessons = planner.lessons(unitID: detail.id, exercises: detail.exercises)
        let statuses = planner.statuses(for: lessons, completedLessonIDs: progressModel.snapshot.completedLessonIDs)
        let completedCount = statuses.filter { $0 == .completed }.count
        let matching = MatchingExerciseBuilder().practice(
            expressionIDs: detail.expressions.map(\.id),
            expressions: expressions, unitID: detail.id, locale: locale
        )

        return ScrollViewReader { proxy in
            ScrollView {
                VStack(spacing: 20) {
                    unitHeader(completed: completedCount, total: lessons.count)

                    AdaptiveRow(spacing: 12) {
                        if let matching {
                            NavigationLink {
                                ExerciseSessionView(
                                    exercises: [matching], expressions: expressions, locale: locale,
                                    title: "Potrivește expresiile", progressModel: progressModel
                                )
                            } label: {
                                ShortcutCard(title: "Potrivește", subtitle: "Până la 6 expresii", icon: "square.grid.2x2.fill")
                            }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("lesson.matching")
                        }
                        NavigationLink {
                            UnitContentsView(detail: detail, locale: locale)
                        } label: {
                            ShortcutCard(title: "Expresii", subtitle: "\(detail.expressions.count) în unitate", icon: "text.bubble.fill")
                        }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("unit.contents")
                    }

                    if lessons.isEmpty {
                        Text("Această unitate nu are încă exerciții native asociate.")
                            .font(Theme.font(.subheadline))
                            .foregroundStyle(Theme.muted)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    } else {
                        VStack(spacing: 22) {
                            ForEach(Array(zip(lessons, statuses)), id: \.0.id) { lesson, status in
                                lessonNode(lesson, status: status)
                                    .id(lesson.id)
                            }
                        }
                        .padding(.top, 8)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
            }
            .onAppear {
                if let index = statuses.firstIndex(of: .current), index > 2 {
                    proxy.scrollTo(lessons[index].id, anchor: .center)
                }
            }
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle(detail.title)
        .navigationBarTitleDisplayMode(.inline)
        .task(id: detail.id) {
            await progressModel.setCurrentJourneyUnitID(detail.id)
        }
    }

    private func unitHeader(completed: Int, total: Int) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(detail.level.rawValue.uppercased())
                .font(Theme.font(.caption, weight: .heavy))
                .kerning(0.8)
                .foregroundStyle(Theme.lime)
            Text(detail.title)
                .font(Theme.font(.title2, weight: .heavy))
                .foregroundStyle(.white)
            Text(detail.description)
                .font(Theme.font(.subheadline))
                .foregroundStyle(.white.opacity(0.8))
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: 10) {
                GeometryReader { geometry in
                    let fraction = CGFloat(total > 0 ? Double(completed) / Double(total) : 0)
                    ZStack(alignment: .leading) {
                        Capsule().fill(.white.opacity(0.2))
                        Capsule().fill(Theme.lime)
                            .frame(width: geometry.size.width * fraction)
                    }
                }
                .frame(height: 10)
                Text("\(completed)/\(total) lecții")
                    .font(Theme.font(.caption, weight: .bold))
                    .foregroundStyle(.white)
            }
            .padding(.top, 4)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.deep, in: RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
        .accessibilityElement(children: .combine)
    }

    @ViewBuilder
    private func lessonNode(_ lesson: JourneyLesson, status: JourneyLessonStatus) -> some View {
        let style = lessonStyle(status)
        let symbol = lessonSymbol(status)
        let valueText: String = status == .completed ? "Finalizată, o poți relua" : "Următoarea lecție"
        let model = progressModel
        let lessonID = lesson.id

        VStack(spacing: 8) {
            if status == .current {
                PathBubble(text: lesson.number == 1 ? "Începe" : "Continuă")
            }
            if status == .locked {
                PathNode(style: style, symbol: symbol, progress: 0, size: 68)
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel("Lecția \(lesson.number), blocată")
            } else {
                NavigationLink {
                    ExerciseSessionView(
                        exercises: lesson.exercises,
                        expressions: expressions,
                        locale: locale,
                        title: "Lecția \(lesson.number)",
                        progressModel: progressModel,
                        onComplete: {
                            Task { await model.markLessonCompleted(lessonID) }
                        }
                    )
                } label: {
                    PathNode(style: style, symbol: symbol, progress: status == .completed ? 1 : 0, size: 68)
                }
                .buttonStyle(NodeButtonStyle())
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("Lecția \(lesson.number)")
                .accessibilityValue(valueText)
                .accessibilityAddTraits(.isButton)
                .accessibilityIdentifier(status == .current ? "lesson.start" : "lesson.completed")
            }
            Text("Lecția \(lesson.number) · \(lesson.exercises.count) exerciții")
                .font(Theme.font(.caption, weight: .semibold))
                .foregroundStyle(status == .locked ? Theme.muted.opacity(0.7) : Theme.muted)
                .accessibilityHidden(true)
        }
        .frame(maxWidth: .infinity)
        .offset(x: PathNode.zigzagOffset(lesson.number - 1))
    }

    private func lessonStyle(_ status: JourneyLessonStatus) -> PathNode.Style {
        switch status {
        case .completed: return .done
        case .current: return .active
        case .locked: return .locked
        }
    }

    private func lessonSymbol(_ status: JourneyLessonStatus) -> String {
        switch status {
        case .completed: return "checkmark"
        case .current: return "play.fill"
        case .locked: return "lock.fill"
        }
    }
}

private struct ShortcutCard: View {
    let title: String
    let subtitle: String
    let icon: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3.weight(.bold))
                .foregroundStyle(Theme.teal)
                .frame(width: 40, height: 40)
                .background(Theme.mint, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.font(.headline, weight: .bold))
                    .foregroundStyle(Theme.ink)
                Text(subtitle)
                    .font(Theme.font(.caption))
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
        .contentShape(Rectangle())
    }
}

/// Full expression and exercise listing for a unit.
struct UnitContentsView: View {
    let detail: JourneyUnitDetail
    let locale: String

    var body: some View {
        List {
            Section("Expresii · \(detail.expressions.count)") {
                ForEach(detail.expressions) { expression in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(alignment: .firstTextBaseline) {
                            Text(expression.arabizi)
                                .font(.headline)
                            if let arabic = expression.arabicScript {
                                Text(arabic)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        Text(expression.meaning)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 3)
                }
            }

            Section("Exerciții · \(detail.exercises.count)") {
                if detail.exercises.isEmpty {
                    Text("Această unitate nu are încă exerciții native asociate.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(detail.exercises) { exercise in
                        ExercisePreviewRow(exercise: exercise, locale: locale)
                    }
                }
            }
        }
        .navigationTitle(detail.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Path components

struct PathNode: View {
    enum Style: Equatable {
        case done
        case active
        case idle
        case locked
    }

    let style: Style
    let symbol: String
    /// Ring fill from 0 to 1.
    let progress: Double
    var size: CGFloat = 72

    static func zigzagOffset(_ index: Int) -> CGFloat {
        let pattern: [CGFloat] = [0, 48, 72, 48, 0, -48, -72, -48]
        return pattern[((index % pattern.count) + pattern.count) % pattern.count]
    }

    var body: some View {
        let ring = size + 18
        ZStack {
            Circle()
                .stroke(Theme.line, lineWidth: 7)
                .frame(width: ring, height: ring)
            Circle()
                .trim(from: 0, to: CGFloat(min(max(progress, 0), 1)))
                .stroke(style == .done ? Theme.gold : Theme.teal, style: StrokeStyle(lineWidth: 7, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .frame(width: ring, height: ring)
            Circle()
                .fill(edge)
                .frame(width: size, height: size)
                .offset(y: 5)
            Circle()
                .fill(face)
                .overlay(
                    Circle().strokeBorder(style == .idle ? Theme.line : .clear, lineWidth: 2)
                )
                .frame(width: size, height: size)
            Image(systemName: symbol)
                .font(.system(size: size * 0.36, weight: .heavy, design: .rounded))
                .foregroundStyle(foreground)
        }
        .frame(width: ring, height: ring + 5)
    }

    private var face: Color {
        switch style {
        case .done: return Theme.gold
        case .active: return Theme.teal
        case .idle: return Theme.surface
        case .locked: return Theme.line
        }
    }

    private var edge: Color {
        switch style {
        case .done: return Theme.goldShade
        case .active: return Theme.tealShade
        case .idle: return Theme.line
        case .locked: return Theme.lineStrong
        }
    }

    private var foreground: Color {
        switch style {
        case .done, .active: return .white
        case .idle: return Theme.teal
        case .locked: return Theme.muted
        }
    }
}

/// Presses a path node down onto its lower edge.
struct NodeButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .offset(y: configuration.isPressed ? 4 : 0)
            .animation(.easeOut(duration: 0.08), value: configuration.isPressed)
    }
}

/// "Start here" callout above the current node.
struct PathBubble: View {
    let text: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var lifted = false

    var body: some View {
        VStack(spacing: 0) {
            Text(text)
                .font(Theme.font(.subheadline, weight: .heavy))
                .textCase(.uppercase)
                .kerning(0.6)
                .foregroundStyle(Theme.teal)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(Theme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Theme.line, lineWidth: 2)
                )
            Image(systemName: "triangle.fill")
                .font(.system(size: 10))
                .rotationEffect(.degrees(180))
                .foregroundStyle(Theme.line)
                .offset(y: -2)
        }
        .offset(y: lifted ? -4 : 0)
        .accessibilityHidden(true)
        .onAppear {
            guard !reduceMotion else { return }
            withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) {
                lifted = true
            }
        }
    }
}
