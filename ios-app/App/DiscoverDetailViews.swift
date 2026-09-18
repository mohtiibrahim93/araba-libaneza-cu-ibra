import SwiftUI
import YallaCore

struct DictionaryEntryDetailView: View {
    let entry: DictionaryEntrySummary
    let model: DiscoverModel
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    @StateObject private var audio = NativeAudioController()

    private var isSaved: Bool {
        progressModel.snapshot.savedExpressionIDs.contains(entry.id)
    }

    private var targetedExercises: [ExerciseDefinition] {
        LearningNavigationBuilder().targetedPractice(
            expressionIDs: [entry.id],
            from: package,
            count: 12
        )
    }

    private var wasPracticed: Bool {
        progressModel.snapshot.seenExpressionIDs.contains(entry.id)
    }

    private var needsReview: Bool {
        progressModel.snapshot.activeMistakeExpressionIDs.contains(entry.id)
    }

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .firstTextBaseline, spacing: 10) {
                        Text(entry.arabizi)
                            .font(.largeTitle.bold())
                        if let arabicScript = entry.arabicScript {
                            Text(arabicScript)
                                .font(.title2)
                                .foregroundStyle(.secondary)
                        }
                    }

                    Text(entry.meaning)
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 6)
            }

            if entry.literalMeaning != nil || entry.pragmaticMeaning != nil {
                Section("Sens și folosire") {
                    if let literalMeaning = entry.literalMeaning {
                        LabeledContent("Literal", value: literalMeaning)
                    }
                    if let pragmaticMeaning = entry.pragmaticMeaning {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("În context")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.secondary)
                            Text(pragmaticMeaning)
                        }
                        .padding(.vertical, 2)
                    }
                }
            }

            if !entry.spellingVariants.isEmpty || !entry.pronunciationVariants.isEmpty {
                Section("Variante") {
                    if !entry.spellingVariants.isEmpty {
                        LabeledContent(
                            "Scriere",
                            value: entry.spellingVariants.joined(separator: " · ")
                        )
                    }
                    if !entry.pronunciationVariants.isEmpty {
                        LabeledContent(
                            "Pronunție",
                            value: entry.pronunciationVariants.joined(separator: " · ")
                        )
                    }
                }
            }

            if wasPracticed || needsReview {
                Section("Progres") {
                    if wasPracticed {
                        Label("Ai exersat această expresie", systemImage: "checkmark.circle.fill")
                    }
                    if needsReview {
                        Label("Are o greșeală activă de revăzut", systemImage: "arrow.counterclockwise.circle.fill")
                    }
                }
            }

            if !targetedExercises.isEmpty {
                Section("Practică") {
                    NavigationLink {
                        ExerciseSessionView(
                            exercises: targetedExercises,
                            expressions: package.expressions,
                            locale: locale,
                            title: "Practică: \(entry.arabizi)",
                            progressModel: progressModel
                        )
                    } label: {
                        Label("Practică acest cuvânt", systemImage: "bolt.fill")
                    }
                }
            }

            if let audioAsset = entry.preferredAudioAsset {
                Section("Audio") {
                    Button {
                        if audio.isPlaying {
                            audio.stopPlayback()
                        } else {
                            audio.playReference(audioAsset)
                        }
                    } label: {
                        Label(
                            audio.isPlaying ? "Oprește redarea" : "Ascultă pronunția",
                            systemImage: audio.isPlaying ? "stop.fill" : "speaker.wave.2.fill"
                        )
                    }

                    if let errorMessage = audio.errorMessage {
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            if let rootID = entry.rootID,
               let root = model.roots.first(where: { $0.id == rootID }),
               let graph = model.rootGraph(rootID: rootID) {
                Section("Rădăcină") {
                    NavigationLink {
                        RootExplorerView(
                            graph: graph,
                            model: model,
                            package: package,
                            locale: locale,
                            progressModel: progressModel
                        )
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(root.displayKey)
                                    .font(.headline)
                                if let arabicRadicals = root.arabicRadicals {
                                    Text(arabicRadicals)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                            Text("\(root.memberCount) forme")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }

            if !entry.inflectionRelations.isEmpty {
                Section("Forme și relații aprobate") {
                    ForEach(entry.inflectionRelations) { relation in
                        if let relatedEntry = model.entries.first(where: { $0.id == relation.relatedExpressionID }) {
                            NavigationLink {
                                DictionaryEntryDetailView(
                                    entry: relatedEntry,
                                    model: model,
                                    package: package,
                                    locale: locale,
                                    progressModel: progressModel
                                )
                            } label: {
                                InflectionRelationRow(relation: relation)
                            }
                        } else {
                            InflectionRelationRow(relation: relation)
                        }
                    }
                }
            }

            if !entry.levels.isEmpty || !entry.topics.isEmpty {
                Section("Etichete") {
                    if !entry.levels.isEmpty {
                        LabeledContent(
                            "Nivel",
                            value: entry.levels.map { $0.rawValue.uppercased() }.joined(separator: " · ")
                        )
                    }
                    if !entry.topics.isEmpty {
                        LabeledContent("Teme", value: entry.topics.joined(separator: " · "))
                    }
                }
            }
        }
        .navigationTitle(entry.arabizi)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task {
                        await progressModel.setExpressionSaved(
                            entry.id,
                            saved: !isSaved
                        )
                    }
                } label: {
                    Image(systemName: isSaved ? "bookmark.fill" : "bookmark")
                }
                .accessibilityLabel(isSaved ? "Elimină din salvate" : "Salvează expresia")
            }
        }
        .onDisappear {
            audio.stopPlayback()
        }
    }
}

struct RootExplorerView: View {
    let graph: RootExplorerSummary
    let model: DiscoverModel
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    private var memberIDs: Set<String> {
        Set(graph.members.map(\.id))
    }

    private var targetedExercises: [ExerciseDefinition] {
        LearningNavigationBuilder().targetedPractice(
            expressionIDs: memberIDs,
            from: package,
            count: 12
        )
    }

    private var familyProgress: ExpressionGroupProgress {
        progressModel.snapshot.expressionGroupProgress(
            expressionIDs: memberIDs,
            at: Date()
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Familia rădăcinii")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                LazyVGrid(
                    columns: [GridItem(.flexible()), GridItem(.flexible())],
                    spacing: 10
                ) {
                    RootProgressMetric(
                        value: "\(familyProgress.practicedCount)/\(familyProgress.totalCount)",
                        label: "exersate"
                    )
                    RootProgressMetric(
                        value: "\(familyProgress.unseenCount)",
                        label: "noi"
                    )
                    RootProgressMetric(
                        value: "\(familyProgress.dueCount)",
                        label: "de repetat"
                    )
                    RootProgressMetric(
                        value: "\(familyProgress.mistakeCount)",
                        label: "greșeli active"
                    )
                }

                if !targetedExercises.isEmpty {
                    NavigationLink {
                        ExerciseSessionView(
                            exercises: targetedExercises,
                            expressions: package.expressions,
                            locale: locale,
                            title: "Practică rădăcina \(graph.centerLabel)",
                            progressModel: progressModel
                        )
                    } label: {
                        Label("Practică această rădăcină", systemImage: "bolt.fill")
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
                    }
                    .buttonStyle(.plain)
                }

                let layoutPositions = RootGraphLayoutPlanner().positions(
                    memberCount: graph.members.count
                )

                GeometryReader { proxy in
                    let size = proxy.size
                    let center = CGPoint(x: size.width / 2, y: size.height / 2)
                    let ringCount = max(
                        (layoutPositions.map(\.ringIndex).max() ?? 0) + 1,
                        1
                    )
                    let minDimension = min(size.width, size.height)
                    let innerRadius = max(minDimension * 0.20, 72)
                    let outerRadius = max(minDimension * 0.40, innerRadius)

                    ZStack {
                        ForEach(layoutPositions, id: \.memberIndex) { position in
                            let member = graph.members[position.memberIndex]
                            let radius = ringRadius(
                                ringIndex: position.ringIndex,
                                ringCount: ringCount,
                                innerRadius: innerRadius,
                                outerRadius: outerRadius
                            )
                            let angle = position.angleTurns * (Double.pi * 2) - Double.pi / 2
                            let x = center.x + CGFloat(cos(angle)) * radius
                            let y = center.y + CGFloat(sin(angle)) * radius

                            Path { path in
                                path.move(to: center)
                                path.addLine(to: CGPoint(x: x, y: y))
                            }
                            .stroke(.secondary.opacity(0.35), lineWidth: 1.5)

                            memberNode(member)
                                .position(x: x, y: y)
                        }

                        Text(graph.centerLabel)
                            .font(.title2.bold())
                            .padding(22)
                            .background(.regularMaterial, in: Circle())
                            .overlay(Circle().stroke(.secondary.opacity(0.25)))
                            .position(center)
                    }
                }
                .frame(height: graphHeight)

                DisclosureGroup("Gramatică și tipare") {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(graph.members) { member in
                            HStack(alignment: .top) {
                                Text(member.label)
                                    .fontWeight(.semibold)
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text(member.patternLabel ?? "fără tipar aprobat")
                                        .font(.caption.weight(.semibold))
                                    if let metadata = patternMetadata(for: member) {
                                        Text(metadata)
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .multilineTextAlignment(.trailing)
                            }
                        }
                    }
                    .padding(.top, 8)
                }
            }
            .padding()
        }
        .navigationTitle(graph.centerLabel)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var graphHeight: CGFloat {
        switch graph.members.count {
        case ...8:
            return 360
        case ...16:
            return 440
        default:
            return 520
        }
    }

    private func ringRadius(
        ringIndex: Int,
        ringCount: Int,
        innerRadius: CGFloat,
        outerRadius: CGFloat
    ) -> CGFloat {
        guard ringCount > 1 else {
            return (innerRadius + outerRadius) / 2
        }

        let progress = CGFloat(ringIndex) / CGFloat(ringCount - 1)
        return innerRadius + ((outerRadius - innerRadius) * progress)
    }

    @ViewBuilder
    private func memberNode(_ member: RootExplorerMember) -> some View {
        if let entry = model.entries.first(where: { $0.id == member.id }) {
            NavigationLink {
                DictionaryEntryDetailView(
                    entry: entry,
                    model: model,
                    package: package,
                    locale: locale,
                    progressModel: progressModel
                )
            } label: {
                memberLabel(member)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("\(member.label), deschide intrarea din dicționar")
        } else {
            memberLabel(member)
        }
    }

    private func memberLabel(_ member: RootExplorerMember) -> some View {
        HStack(spacing: 5) {
            Text(member.label)
                .font(.subheadline.weight(.semibold))

            if progressModel.snapshot.activeMistakeExpressionIDs.contains(member.id) {
                Image(systemName: "arrow.counterclockwise.circle.fill")
                    .font(.caption2)
            } else if progressModel.snapshot.seenExpressionIDs.contains(member.id) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.caption2)
            }

            if progressModel.snapshot.savedExpressionIDs.contains(member.id) {
                Image(systemName: "bookmark.fill")
                    .font(.caption2)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.thinMaterial, in: Capsule())
    }

    private func patternMetadata(for member: RootExplorerMember) -> String? {
        let values = [
            member.patternKind.map(patternKindLabel),
            member.patternProductivity.map(productivityLabel)
        ].compactMap { $0 }

        return values.isEmpty ? nil : values.joined(separator: " · ")
    }

    private func patternKindLabel(_ kind: MorphologicalPatternKind) -> String {
        switch kind {
        case .verbStem: return "tipar verbal"
        case .verbalNoun: return "substantiv verbal"
        case .participle: return "participiu"
        case .agentNoun: return "nume de agent"
        case .placeNoun: return "nume de loc"
        case .adjective: return "adjectiv"
        case .noun: return "substantiv"
        case .plural: return "plural"
        case .other: return "alt tipar"
        }
    }

    private func productivityLabel(_ productivity: PatternProductivity) -> String {
        switch productivity {
        case .productive: return "productiv"
        case .limited: return "limitat"
        case .lexicalized: return "lexicalizat"
        }
    }
}


private struct InflectionRelationRow: View {
    let relation: DictionaryInflectionRelationSummary

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: relation.direction == .outgoing ? "arrow.right.circle" : "arrow.left.circle")
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 3) {
                Text(relation.relatedArabizi)
                    .font(.headline)

                Text(metadata)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 2)
    }

    private var metadata: String {
        var values = [relationKindLabel(relation.kind)]
        if let patternLabel = relation.patternLabel {
            values.append(patternLabel)
        }
        values.append(relation.direction == .outgoing ? "formă asociată" : "formă de bază asociată")
        return values.joined(separator: " · ")
    }

    private func relationKindLabel(_ kind: InflectionRelationKind) -> String {
        switch kind {
        case .plural: return "plural"
        case .feminine: return "feminin"
        case .dual: return "dual"
        case .conjugatedForm: return "formă conjugată"
        case .derivedForm: return "formă derivată"
        case .other: return "relație aprobată"
        }
    }
}

private struct RootProgressMetric: View {
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(value)
                .font(.headline)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
