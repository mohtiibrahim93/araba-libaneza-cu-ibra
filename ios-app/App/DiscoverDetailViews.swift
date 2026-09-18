import SwiftUI
import YallaCore

struct DictionaryEntryDetailView: View {
    let entry: DictionaryEntrySummary
    let model: DiscoverModel

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

            if let rootID = entry.rootID,
               let root = model.roots.first(where: { $0.id == rootID }),
               let graph = model.rootGraph(rootID: rootID) {
                Section("Rădăcină") {
                    NavigationLink {
                        RootExplorerView(graph: graph, model: model)
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
    }
}

struct RootExplorerView: View {
    let graph: RootExplorerSummary
    let model: DiscoverModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                Text("Familia rădăcinii")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                GeometryReader { proxy in
                    let size = proxy.size
                    let center = CGPoint(x: size.width / 2, y: size.height / 2)
                    let radius = max(min(size.width, size.height) * 0.34, 90)

                    ZStack {
                        ForEach(Array(graph.members.enumerated()), id: \.element.id) { index, member in
                            let angle = (Double(index) / Double(max(graph.members.count, 1))) * (Double.pi * 2) - Double.pi / 2
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
                .frame(height: 360)

                DisclosureGroup("Gramatică și tipare") {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(graph.members) { member in
                            HStack {
                                Text(member.label)
                                    .fontWeight(.semibold)
                                Spacer()
                                Text(member.patternID ?? "fără tipar etichetat")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
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

    @ViewBuilder
    private func memberNode(_ member: RootExplorerMember) -> some View {
        if let entry = model.entries.first(where: { $0.id == member.id }) {
            NavigationLink {
                DictionaryEntryDetailView(entry: entry, model: model)
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
        Text(member.label)
            .font(.subheadline.weight(.semibold))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.thinMaterial, in: Capsule())
    }
}
