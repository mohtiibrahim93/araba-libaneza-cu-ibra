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
                    AdaptiveRow(spacing: 10) {
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
                            progressModel: progressModel,
                            selectedWordID: entry.id
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
        .creamList()
        .navigationTitle(entry.arabizi)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task {
                        await progressModel.toggleSavedExpressionID(entry.id)
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
