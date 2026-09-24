import SwiftUI
import YallaCore

// MARK: - Journey tab

/// Journey as an illustrated map: a winding road with numbered unit stops.
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

    /// Temporary scenes (cropped from the design mockups) shown beside each stop.
    private static let scenes = [
        "illus-house", "illus-cafe", "illus-restaurant", "illus-raouche", "illus-coast",
        "illus-book", "illus-onb-culture", "illus-sunset", "illus-onb-travel", "illus-progress"
    ]

    private struct Stop: Identifiable {
        let unit: JourneyUnitSummary
        let level: LevelBand
        let number: Int
        var id: String { unit.id }
    }

    private var stops: [Stop] {
        var number = 0
        return sections.flatMap { section in
            section.units.map { unit in
                number += 1
                return Stop(unit: unit, level: section.level, number: number)
            }
        }
    }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                let allStops = stops
                VStack(spacing: 0) {
                    header(currentLevel: allStops.first(where: { $0.unit.id == highlightedUnitID })?.level ?? .a1)
                        .padding(.horizontal, 20)
                        .padding(.top, 8)
                        .padding(.bottom, 16)

                    ForEach(Array(allStops.enumerated()), id: \.element.id) { index, stop in
                        if index == 0 || allStops[index - 1].level != stop.level {
                            LevelHeader(
                                level: stop.level,
                                completedUnits: allStops.filter { $0.level == stop.level && progress(for: $0.unit.id).isComplete }.count,
                                totalUnits: allStops.filter { $0.level == stop.level }.count
                            )
                            .padding(.vertical, 10)
                        }
                        mapRow(
                            stop,
                            side: index.isMultiple(of: 2) ? .left : .right,
                            hasPrevious: index > 0 && allStops[index - 1].level == stop.level,
                            hasNext: index + 1 < allStops.count && allStops[index + 1].level == stop.level
                        )
                    }
                }
                .padding(.bottom, 32)
            }
            .background(Theme.canvas.ignoresSafeArea())
            .navigationTitle("Parcurs")
            .navigationBarTitleDisplayMode(.inline)
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

    private func header(currentLevel: LevelBand) -> some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Parcursul tău de învățare")
                    .font(Theme.serif(.title2))
                    .foregroundStyle(Theme.ink)
                Text("De la primele cuvinte la conversații reale, pas cu pas, în ritmul tău.")
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(Theme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
            HStack(spacing: 8) {
                Image(systemName: "chart.bar.fill")
                    .foregroundStyle(Theme.teal)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Nivelul tău")
                        .font(Theme.font(.caption2))
                        .foregroundStyle(Theme.muted)
                    Text(currentLevel.rawValue.uppercased())
                        .font(Theme.serif(.title3))
                        .foregroundStyle(Theme.ink)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Theme.surface, in: Capsule())
            .overlay(Capsule().strokeBorder(Theme.line, lineWidth: 1))
            .accessibilityElement(children: .combine)
        }
        .accessibilityElement(children: .contain)
    }

    private var highlightedUnitID: String? {
        if let current = progressModel.snapshot.currentJourneyUnitID { return current }
        return sections.flatMap(\.units).first { !progress(for: $0.id).isComplete }?.id
    }

    @ViewBuilder
    private func mapRow(_ stop: Stop, side: MapSide, hasPrevious: Bool, hasNext: Bool) -> some View {
        let unit = stop.unit
        let progress = progress(for: unit.id)
        let available = (lessonCounts[unit.id] ?? 0) > 0
        let isCurrent = unit.id == highlightedUnitID && available
        let valueText: String = available
            ? "\(progress.completedCount) din \(progress.totalCount) lecții"
            : "Fără exerciții încă"
        let row = MapStopRow(
            number: stop.number,
            title: unit.title,
            description: unit.description,
            level: stop.level,
            progress: progress,
            isCurrent: isCurrent,
            available: available,
            side: side,
            scene: Self.scenes[(stop.number - 1) % Self.scenes.count]
        )

        Group {
            if available {
                NavigationLink(value: unit.id) { row }
                    .buttonStyle(NodeButtonStyle())
            } else {
                row
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(stop.number). \(unit.title)")
        .accessibilityValue(valueText)
        .accessibilityAddTraits(available ? .isButton : [])
        .accessibilityIdentifier("journey.unit")
        .background(MapRoad(side: side, hasPrevious: hasPrevious, hasNext: hasNext))
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

enum MapSide {
    case left, right
}

/// Horizontal centre of the scene on each side, measured from the edge.
private let mapSceneInset: CGFloat = 16 + 62

/// Dashed road through the scene centres of consecutive stops.
private struct MapRoad: View {
    let side: MapSide
    let hasPrevious: Bool
    let hasNext: Bool

    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            let current = side == .left ? mapSceneInset : width - mapSceneInset
            let other = side == .left ? width - mapSceneInset : mapSceneInset
            let topX = hasPrevious ? (current + other) / 2 : current
            let bottomX = hasNext ? (current + other) / 2 : current
            Path { path in
                path.move(to: CGPoint(x: topX, y: hasPrevious ? 0 : height / 2))
                path.addQuadCurve(
                    to: CGPoint(x: current, y: height / 2),
                    control: CGPoint(x: current, y: height * 0.1)
                )
                path.addQuadCurve(
                    to: CGPoint(x: bottomX, y: hasNext ? height : height / 2),
                    control: CGPoint(x: current, y: height * 0.9)
                )
            }
            .stroke(Theme.gold.opacity(0.7), style: StrokeStyle(lineWidth: 3.5, lineCap: .round, dash: [9, 9]))
        }
        .accessibilityHidden(true)
    }
}

private struct MapStopRow: View {
    let number: Int
    let title: String
    let description: String
    let level: LevelBand
    let progress: JourneyUnitLessonProgress
    let isCurrent: Bool
    let available: Bool
    let side: MapSide
    let scene: String

    var body: some View {
        HStack(spacing: 12) {
            if side == .left {
                sceneView
                card
            } else {
                card
                sceneView
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private var sceneView: some View {
        ZStack(alignment: side == .left ? .topTrailing : .topLeading) {
            Image(scene)
                .resizable()
                .scaledToFill()
                .frame(width: 124, height: 108)
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .strokeBorder(Theme.surface, lineWidth: 3)
                )
                .shadow(color: .black.opacity(0.12), radius: 8, x: 0, y: 4)
                .saturation(available ? 1 : 0.3)
            LevelBadge(level: level, completed: progress.isComplete, locked: !available)
                .offset(x: side == .left ? 10 : -10, y: -10)
        }
        .frame(width: 124, height: 108)
    }

    private var card: some View {
        let foreground: Color = isCurrent ? .white : Theme.ink
        let secondary: Color = isCurrent ? .white.opacity(0.85) : Theme.muted
        return VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text("\(number). \(title)")
                    .font(Theme.serif(.headline))
                    .foregroundStyle(foreground)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 4)
                if isCurrent {
                    Image(systemName: "chevron.right")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(.white)
                }
            }
            Text(description)
                .font(Theme.font(.caption))
                .foregroundStyle(secondary)
                .lineLimit(2)
            if available {
                HStack(spacing: 8) {
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Capsule().fill(isCurrent ? Color.white.opacity(0.3) : Theme.line)
                            Capsule()
                                .fill(isCurrent ? Color.white : Theme.teal)
                                .frame(width: geometry.size.width * CGFloat(progress.fraction))
                        }
                    }
                    .frame(height: 5)
                    if progress.isComplete {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(isCurrent ? .white : Theme.teal)
                    }
                    Text("\(progress.completedCount)/\(progress.totalCount)")
                        .font(Theme.font(.caption2, weight: .semibold))
                        .foregroundStyle(secondary)
                        .monospacedDigit()
                }
            } else {
                Text("În pregătire")
                    .font(Theme.font(.caption2, weight: .semibold))
                    .foregroundStyle(Theme.muted)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(isCurrent ? Theme.terracotta : Theme.surface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(isCurrent ? Theme.lime.opacity(0.6) : Theme.line, lineWidth: isCurrent ? 2 : 1)
        )
        .shadow(color: (isCurrent ? Theme.terracotta : Color.black).opacity(isCurrent ? 0.3 : 0.06), radius: 10, x: 0, y: 5)
    }
}

private struct LevelBadge: View {
    let level: LevelBand
    let completed: Bool
    let locked: Bool

    private var fill: Color {
        if locked { return Theme.lineStrong }
        switch level {
        case .a1: return Theme.teal
        case .a2: return Theme.terracotta
        case .b1: return Theme.deep
        default: return Theme.goldShade
        }
    }

    var body: some View {
        ZStack {
            Circle()
                .fill(fill)
                .frame(width: 40, height: 40)
                .overlay(Circle().strokeBorder(Theme.surface, lineWidth: 3))
                .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
            if completed {
                Image(systemName: "checkmark")
                    .font(.subheadline.weight(.heavy))
                    .foregroundStyle(.white)
            } else {
                Text(level.rawValue.uppercased())
                    .font(Theme.serif(.subheadline))
                    .foregroundStyle(.white)
            }
        }
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
        HStack(spacing: 10) {
            Text(level.rawValue.uppercased())
                .font(Theme.serif(.headline, weight: .heavy))
                .foregroundStyle(Theme.lime)
            Text(subtitle)
                .font(Theme.serif(.subheadline))
                .foregroundStyle(.white)
            Text("\(completedUnits)/\(totalUnits)")
                .font(Theme.font(.caption, weight: .semibold))
                .foregroundStyle(.white.opacity(0.75))
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 10)
        .background(Theme.deep, in: Capsule())
        .shadow(color: Theme.deep.opacity(0.25), radius: 8, x: 0, y: 4)
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
                .font(Theme.serif(.title2))
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
                        xpSource: .lesson,
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
        .creamList()
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
