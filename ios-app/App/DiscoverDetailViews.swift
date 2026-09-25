import SwiftUI
import YallaCore

/// Dictionary word page: the entry card, lesson examples, related forms,
/// root family, similar entries and practice for this word.
struct DictionaryEntryDetailView: View {
    let entry: DictionaryEntrySummary
    let model: DiscoverModel
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel

    @StateObject private var audio = NativeAudioController()

    private var savedIDs: Set<String> {
        progressModel.snapshot.savedExpressionIDs
    }

    private var isSaved: Bool {
        entry.expressionIDs.contains(where: savedIDs.contains)
    }

    private var targetedExercises: [ExerciseDefinition] {
        LearningNavigationBuilder().targetedPractice(
            expressionIDs: Set(entry.expressionIDs),
            from: package,
            count: 12
        )
    }

    private var wasPracticed: Bool {
        entry.expressionIDs.contains(where: progressModel.snapshot.seenExpressionIDs.contains)
    }

    private var needsReview: Bool {
        entry.expressionIDs.contains(where: progressModel.snapshot.activeMistakeExpressionIDs.contains)
    }

    private var root: RootSummary? {
        entry.rootID.flatMap { id in model.roots.first { $0.id == id } }
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Theme.Spacing.section) {
                DictionaryEntryCard(
                    entry: entry,
                    examples: model.examples(for: entry),
                    isSaved: isSaved,
                    isPlaying: audio.isPlaying,
                    onToggleSaved: { toggleSaved(entry) },
                    onPlayAudio: playAudio
                ) {
                    if !entry.spellingVariants.isEmpty || !entry.pronunciationVariants.isEmpty {
                        Divider().overlay(Theme.line)
                        variants
                    }
                    if wasPracticed || needsReview {
                        progressNotes
                    }
                    if let errorMessage = audio.errorMessage {
                        Text(errorMessage)
                            .yallaFont(.caption)
                            .foregroundStyle(Theme.muted)
                    }
                }

                if !targetedExercises.isEmpty {
                    NavigationLink {
                        ExerciseSessionView(
                            exercises: targetedExercises,
                            expressions: package.expressions,
                            locale: locale,
                            title: "Exersează: \(entry.arabizi)",
                            progressModel: progressModel
                        )
                    } label: {
                        Label(practiceTitle, systemImage: "bolt.fill")
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(PillButtonStyle())
                    .accessibilityIdentifier("dictionary.practice")
                }

                if let root, let graph = model.rootGraph(rootID: root.id) {
                    rootCard(root: root, graph: graph)
                }

                if !entry.inflectionRelations.isEmpty {
                    relatedForms
                }

                let family = entry.isSingleWord ? model.rootFamily(of: entry) : []
                if !family.isEmpty {
                    DictionaryListCard(
                        title: "Din aceeași rădăcină",
                        icon: "leaf.fill",
                        entries: Array(family.prefix(4)),
                        isSaved: { $0.expressionIDs.contains(where: savedIDs.contains) },
                        onToggleSaved: toggleSaved,
                        destination: detail(for:)
                    )
                }

                let relatedByMeaning = entry.isSingleWord ? model.relatedByMeaning(of: entry) : []
                if !relatedByMeaning.isEmpty {
                    DictionaryListCard(
                        title: "Înrudite ca sens",
                        icon: "arrow.triangle.branch",
                        entries: Array(relatedByMeaning.prefix(4)),
                        isSaved: { $0.expressionIDs.contains(where: savedIDs.contains) },
                        onToggleSaved: toggleSaved,
                        destination: detail(for:)
                    )
                }

                let similar = model.similar(to: entry).filter { candidate in
                    !family.contains(candidate) && !relatedByMeaning.contains(candidate)
                }
                if !similar.isEmpty {
                    DictionaryListCard(
                        title: entry.isSingleWord ? "Din aceeași temă" : "Expresii similare",
                        icon: "lightbulb.max.fill",
                        entries: similar,
                        isSaved: { $0.expressionIDs.contains(where: savedIDs.contains) },
                        onToggleSaved: toggleSaved,
                        destination: detail(for:)
                    )
                }
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.md)
            .frame(maxWidth: Theme.Spacing.maxContentWidth)
            .frame(maxWidth: .infinity)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle(entry.arabizi)
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            audio.stopPlayback()
        }
    }

    private var practiceTitle: String {
        entry.isSingleWord ? "Exersează acest cuvânt" : "Exersează această expresie"
    }

    private var playAudio: (() -> Void)? {
        guard let asset = entry.preferredAudioAsset else { return nil }
        return {
            if audio.isPlaying { audio.stopPlayback() } else { audio.playReference(asset) }
        }
    }

    private var variants: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xxs) {
            Text("Variante acceptate")
                .yallaFont(.captionStrong)
                .foregroundStyle(Theme.terracottaShade)
            if !entry.spellingVariants.isEmpty {
                Text(entry.spellingVariants.joined(separator: " · "))
                    .yallaFont(.body)
                    .foregroundStyle(Theme.ink)
            }
            if !entry.pronunciationVariants.isEmpty {
                Text("Pronunție: " + entry.pronunciationVariants.joined(separator: " · "))
                    .yallaFont(.caption)
                    .foregroundStyle(Theme.muted)
            }
        }
    }

    private var progressNotes: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            if wasPracticed {
                Label("Ai exersat acest cuvânt", systemImage: "checkmark.circle.fill")
                    .foregroundStyle(Theme.success)
            }
            if needsReview {
                Label("Are o greșeală de revăzut", systemImage: "arrow.counterclockwise.circle.fill")
                    .foregroundStyle(Theme.terracottaShade)
            }
        }
        .yallaFont(.captionStrong)
    }

    private func rootCard(root: RootSummary, graph: RootExplorerSummary) -> some View {
        NavigationLink {
            RootExplorerView(
                graph: graph,
                model: model,
                package: package,
                locale: locale,
                progressModel: progressModel,
                selectedWordID: entry.id
            )
        } label: {
            HStack(spacing: Theme.Spacing.md) {
                VStack(spacing: 0) {
                    if let arabic = root.arabicRadicals {
                        Text(arabic)
                            .font(.headline)
                    }
                    Text(root.displayKey)
                        .font(.system(.caption, design: .serif).weight(.bold))
                }
                .foregroundStyle(.white)
                .frame(width: 58, height: 58)
                .background(Theme.rootCore, in: Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text("Rădăcina \(root.displayKey)")
                        .yallaFont(.bodyStrong)
                        .foregroundStyle(Theme.ink)
                    Text("\(root.memberCount) cuvinte din aceeași familie")
                        .yallaFont(.caption)
                        .foregroundStyle(Theme.muted)
                }
                Spacer(minLength: 0)
                Text("Vezi familia")
                    .yallaFont(.captionStrong)
                    .foregroundStyle(Theme.brand)
                Image(systemName: "chevron.right")
                    .foregroundStyle(Theme.muted)
            }
            .padding(Theme.Spacing.lg)
            .cardBackground()
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("dictionary.root")
    }

    private var relatedForms: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Forme înrudite")
                .yallaFont(.section)
                .foregroundStyle(Theme.ink)
                .accessibilityAddTraits(.isHeader)
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.vertical, Theme.Spacing.md)
            ForEach(entry.inflectionRelations) { relation in
                Divider().padding(.leading, Theme.Spacing.lg)
                Group {
                    if let related = model.entry(forExpressionID: relation.relatedExpressionID) {
                        NavigationLink {
                            detail(for: related)
                        } label: {
                            InflectionRelationRow(relation: relation)
                        }
                        .buttonStyle(.plain)
                    } else {
                        InflectionRelationRow(relation: relation)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.vertical, Theme.Spacing.sm)
            }
        }
        .cardBackground()
    }

    private func detail(for related: DictionaryEntrySummary) -> DictionaryEntryDetailView {
        DictionaryEntryDetailView(
            entry: related,
            model: model,
            package: package,
            locale: locale,
            progressModel: progressModel
        )
    }

    private func toggleSaved(_ target: DictionaryEntrySummary) {
        let saved = !target.expressionIDs.contains(where: savedIDs.contains)
        Task {
            for id in target.expressionIDs {
                await progressModel.setExpressionSaved(id, saved: saved)
            }
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
