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
    /// First approved phrase of each unit, shown on its signboard.
    var signboards: [String: String] = [:]
    var onProfile: () -> Void = {}
    var onLevel: () -> Void = {}

    @AppStorage("learnerName") private var learnerName = ""
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var didRevealCurrent = false

    private let navigationBuilder = LearningNavigationBuilder()
    private let planner = JourneyLessonPlanner()

    /// Temporary scenery per level, cropped from the design mockups, until the
    /// Journey scenery strips exist.
    private static let scenesByLevel: [LevelBand: [String]] = [
        .a1: ["illus-house", "illus-onb-town", "illus-cafe", "illus-book", "illus-onb-conv"],
        .a2: ["illus-restaurant", "illus-onb-culture", "illus-cafe"],
        .b1: ["illus-raouche", "illus-coast"],
        .b2: ["illus-onb-travel"],
        .c1: ["illus-progress"],
        .c2: ["illus-sunset"]
    ]

    private struct Stop {
        let unit: JourneyUnitSummary
        let level: LevelBand
        let number: Int
        let indexInLevel: Int
    }

    private enum Node: Identifiable {
        case milestone(LevelBand, completed: Int, total: Int)
        case unit(Stop)

        var id: String {
            switch self {
            case let .milestone(level, _, _): return "level-" + level.rawValue
            case let .unit(stop): return stop.unit.id
            }
        }
    }

    /// Every CEFR band in order; bands without units become "În curând".
    private var nodes: [Node] {
        var result: [Node] = []
        var number = 0
        for level in LevelBand.allCases {
            let units = sections.first { $0.level == level }?.units ?? []
            let completed = units.filter { progress(for: $0.id).isComplete }.count
            result.append(.milestone(level, completed: completed, total: units.count))
            for (index, unit) in units.enumerated() {
                number += 1
                result.append(.unit(Stop(unit: unit, level: level, number: number, indexInLevel: index)))
            }
        }
        return result
    }

    private var isLargeText: Bool { dynamicTypeSize.isAccessibilitySize }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                        header
                        titleBar
                        map
                    }
                    .padding(.top, Theme.Spacing.xxs)
                    .padding(.bottom, Theme.Spacing.xxl)
                    .frame(maxWidth: Theme.Spacing.maxContentWidth)
                    .frame(maxWidth: .infinity)
                }
                .background(Theme.canvas.ignoresSafeArea())
                .toolbar(.hidden, for: .navigationBar)
                .onAppear {
                    // Reveal the current unit once; later visits keep the scroll position.
                    guard !didRevealCurrent else { return }
                    didRevealCurrent = true
                    guard let current = highlightedUnitID, current != sections.first?.units.first?.id else { return }
                    Task { @MainActor in
                        proxy.scrollTo(current, anchor: UnitPoint(x: 0.5, y: 0.45))
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

    // MARK: Header

    private var header: some View {
        HStack(spacing: Theme.Spacing.sm) {
            BrandHeader(tagline: "O limbă. O cultură. Mai aproape de oameni.")
            Spacer(minLength: Theme.Spacing.sm)
            Button(action: onProfile) {
                LearnerAvatar(name: learnerName, size: 40)
                    .frame(width: 44, height: 44)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Profil și tutor")
        }
        .padding(.horizontal, Theme.Spacing.screen)
    }

    private var titleBar: some View {
        let level = currentLevel.rawValue.uppercased()
        let titleBlock = VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
            Text("Parcursul tău de învățare")
                .font(.system(.title2, design: .serif).weight(.bold))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(.isHeader)
                .accessibilityIdentifier("journey.title")
            Text("De la primele cuvinte la conversații reale, pas cu pas, în ritmul tău.")
                .font(Theme.font(.subheadline))
                .foregroundStyle(Theme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        return ViewThatFits(in: .horizontal) {
            HStack(alignment: .top, spacing: Theme.Spacing.md) {
                titleBlock
                    .frame(maxWidth: 230, alignment: .leading)
                Spacer(minLength: 0)
                CurrentLevelPill(level: level, onTap: onLevel)
            }
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                titleBlock
                CurrentLevelPill(level: level, onTap: onLevel)
            }
        }
        .padding(.horizontal, Theme.Spacing.screen)
    }

    // MARK: Map

    private var map: some View {
        let allNodes = nodes
        return VStack(spacing: 0) {
            ForEach(Array(allNodes.enumerated()), id: \.element.id) { index, node in
                switch node {
                case let .milestone(level, completed, total):
                    milestoneRow(level: level, completed: completed, total: total)
                case let .unit(stop):
                    unitRow(stop, leading: index.isMultiple(of: 2))
                }
            }
        }
        .overlayPreferenceValue(JourneyAnchorKey.self) { anchors in
            GeometryReader { proxy in
                let segments: [(CGPoint, CGPoint)] = zip(allNodes, allNodes.dropFirst()).compactMap { pair in
                    guard let start = anchors[pair.0.id + ".bottom"], let end = anchors[pair.1.id + ".top"] else { return nil }
                    return (proxy[start], proxy[end])
                }
                JourneyPathShape(segments: segments)
                    .stroke(
                        Theme.journeyPath,
                        style: StrokeStyle(lineWidth: 3.5, lineCap: .round, lineJoin: .round, dash: [8, 8])
                    )
            }
            .allowsHitTesting(false)
            .accessibilityHidden(true)
        }
    }

    private func milestoneRow(level: LevelBand, completed: Int, total: Int) -> some View {
        let state = milestoneState(level: level, completed: completed, total: total)
        let status: String = total == 0 ? "În curând" : "\(completed) din \(total) unități"
        return VStack(spacing: Theme.Spacing.xs) {
            JourneyMilestoneBadge(level: level.rawValue.uppercased(), state: state)
            Text(Self.levelSubtitle(level))
                .font(Theme.serif(.subheadline, weight: .semibold))
                .foregroundStyle(total == 0 ? Theme.muted : Theme.ink)
            Text(status)
                .font(Theme.font(.caption, weight: .medium))
                .foregroundStyle(Theme.muted)
                .padding(.horizontal, Theme.Spacing.sm)
                .padding(.vertical, 3)
                .background(Theme.surface.opacity(0.9), in: Capsule())
        }
        .padding(.vertical, Theme.Spacing.xs)
        .journeyAnchor("level-" + level.rawValue)
        .frame(maxWidth: .infinity)
        .padding(.vertical, Theme.Spacing.md)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Nivel \(level.rawValue.uppercased()), \(Self.levelSubtitle(level))")
        .accessibilityValue(status)
        .accessibilityAddTraits(.isHeader)
    }

    @ViewBuilder
    private func unitRow(_ stop: Stop, leading: Bool) -> some View {
        let unit = stop.unit
        let progress = progress(for: unit.id)
        let state = unitState(unit.id, progress: progress)
        let available = state != .preparing
        let valueText: String = available
            ? "\(progress.completedCount) din \(progress.totalCount) lecții"
            : "În pregătire, fără exerciții încă"
        let card = JourneyLessonCard(
            number: stop.number,
            title: unit.title,
            subtitle: unit.description,
            completed: progress.completedCount,
            total: progress.totalCount,
            state: state
        )
        .frame(width: isLargeText ? nil : CGFloat(state == .current ? 232 : 196))
        .frame(maxWidth: isLargeText ? CGFloat.infinity : nil)
        .journeyAnchor(unit.id)

        let link = Group {
            if available {
                NavigationLink(value: unit.id) { card }
                    .buttonStyle(NodeButtonStyle())
            } else {
                card
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(stop.number). \(unit.title)")
        .accessibilityValue(valueText)
        .accessibilityHint(available ? "Deschide unitatea" : "")
        .accessibilityAddTraits(available ? .isButton : [])
        .accessibilityIdentifier("journey.unit")

        HStack(alignment: .center, spacing: Theme.Spacing.sm) {
            if isLargeText {
                link
            } else if leading {
                link
                scenery(for: stop, state: state, tilt: 2)
            } else {
                scenery(for: stop, state: state, tilt: -2)
                link
            }
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.lg)
        .id(unit.id)
    }

    private func scenery(for stop: Stop, state: JourneyUnitState, tilt: Double) -> some View {
        let scenes = Self.scenesByLevel[stop.level] ?? ["illus-house"]
        return ZStack(alignment: .bottom) {
            JourneyScenery(imageName: scenes[stop.indexInLevel % scenes.count], faded: state == .preparing)
                .frame(height: 132)
            if let phrase = signboards[stop.unit.id] {
                JourneyScenicLabel(arabizi: phrase, tilt: tilt)
                    .offset(y: 6)
            }
        }
        .frame(maxWidth: .infinity)
        .accessibilityHidden(true)
    }

    // MARK: State

    private var highlightedUnitID: String? {
        if let current = progressModel.snapshot.currentJourneyUnitID { return current }
        return sections.flatMap(\.units).first { (lessonCounts[$0.id] ?? 0) > 0 && !progress(for: $0.id).isComplete }?.id
    }

    private var currentLevel: LevelBand {
        guard let id = highlightedUnitID else { return .a1 }
        return sections.first { $0.units.contains { $0.id == id } }?.level ?? .a1
    }

    private func unitState(_ unitID: String, progress: JourneyUnitLessonProgress) -> JourneyUnitState {
        guard (lessonCounts[unitID] ?? 0) > 0 else { return .preparing }
        if unitID == highlightedUnitID { return .current }
        return progress.isComplete ? .completed : .available
    }

    private func milestoneState(level: LevelBand, completed: Int, total: Int) -> JourneyMilestoneState {
        if total == 0 { return .comingSoon }
        if level == currentLevel { return .current }
        return completed == total ? .completed : .available
    }

    private static func levelSubtitle(_ level: LevelBand) -> String {
        switch level {
        case .a1: return "Primele conversații"
        case .a2: return "Mai multă independență"
        case .b1: return "Explică și argumentează"
        case .b2: return "Conversează cu nuanță"
        case .c1: return "Înțelege dincolo de cuvinte"
        case .c2: return "Exprimă-te cu precizie"
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
