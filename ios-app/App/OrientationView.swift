import Foundation
import SwiftUI
import YallaCore

struct OrientationView: View {
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    let onStartJourney: (String) -> Void
    let onChooseJourney: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var session: OrientationSession?
    @State private var started = false
    @State private var answer = ""
    @State private var failure: String?
    @State private var confirmingExit = false
    @State private var saving = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    if let failure {
                        ContentUnavailableView(
                            "Orientare indisponibilă", systemImage: "exclamationmark.triangle",
                            description: Text(failure)
                        )
                    } else if !started {
                        introduction
                    } else if let session {
                        sessionContent(session)
                    }
                }
                .padding()
            }
            .navigationTitle("Orientare · pilot")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Închide") {
                        if started && session?.isFinished == false {
                            confirmingExit = true
                        } else {
                            dismiss()
                        }
                    }
                    .disabled(saving)
                }
            }
            .confirmationDialog("Renunți la orientare?", isPresented: $confirmingExit, titleVisibility: .visible) {
                Button("Renunță", role: .destructive) { dismiss() }
                Button("Continuă testul", role: .cancel) {}
            } message: {
                Text("Un test incomplet nu produce o recomandare. La redeschidere începi de la prima întrebare.")
            }
            .interactiveDismissDisabled(started && session?.isFinished == false || saving)
            .task { loadPilot() }
        }
    }

    private var introduction: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("De unde începi?").font(.largeTitle.bold())
            Text("24 de întrebări cu variante de răspuns și expresii scurte în Arabizi.")
            Text("Fără cronometru, indicii sau corectare pe parcurs. Poți alege „Nu știu”.")
            Text("Bancă pilot: rezultatul sugerează un punct de pornire, nu certifică un nivel CEFR. Ascultarea și vorbirea nu sunt evaluate.")
                .foregroundStyle(.secondary)
            if !progressModel.snapshot.attempts.isEmpty {
                Text("Ai exersat deja în aplicație. Familiaritatea cu materialele poate influența rezultatul.")
                    .font(.callout).foregroundStyle(.secondary)
            }
            Button("Începe orientarea") { started = true }
                .buttonStyle(.borderedProminent)
                .disabled(session == nil)
            Button("Aleg singur din Parcurs") { onChooseJourney(); dismiss() }
                .buttonStyle(.bordered)
        }
    }

    @ViewBuilder
    private func sessionContent(_ session: OrientationSession) -> some View {
        let outcome = Result { try session.result() }
        switch outcome {
        case let .success(result?):
            resultContent(result)
        case .success(nil):
            let current = Result { try session.current(locale: locale) }
            switch current {
            case let .success(step?):
                questionContent(step)
            case .success(nil), .failure:
                ContentUnavailableView("Întrebare indisponibilă", systemImage: "exclamationmark.triangle")
            }
        case .failure:
            ContentUnavailableView("Rezultat indisponibil", systemImage: "exclamationmark.triangle")
        }
    }

    private func questionContent(_ step: OrientationStepPresentation) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Întrebarea \(step.question.questionNumber) din \(step.question.totalQuestions)")
                .font(.caption).foregroundStyle(.secondary)
            ProgressView(value: Double(step.question.questionNumber - 1), total: Double(step.question.totalQuestions))
            Text(step.question.prompt).font(.title2.bold())
            if step.choices.isEmpty {
                TextField("Răspuns în Arabizi", text: $answer)
                    .textFieldStyle(.roundedBorder)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .submitLabel(.done)
                    .onSubmit { submit(answer, questionID: step.id) }
                Button("Înregistrează răspunsul") { submit(answer, questionID: step.id) }
                    .buttonStyle(.borderedProminent)
                    .disabled(answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            } else {
                ForEach(step.choices, id: \.self) { choice in
                    Button { submit(choice, questionID: step.id) } label: {
                        Text(choice).frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .buttonStyle(.bordered)
                }
            }
            Button("Nu știu") { submit(nil, questionID: step.id) }
            Text("Fiecare răspuns contează o singură dată.")
                .font(.caption).foregroundStyle(.secondary)
        }
        .id(step.id)
    }

    private func resultContent(_ result: OrientationResult) -> some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Punctul tău de pornire").font(.largeTitle.bold())
            Text(recommendation(result.startingPoint)).font(.title2)
            ForEach([LevelBand.a1, .a2, .b1], id: \.self) { band in
                LabeledContent(band.rawValue.uppercased() + " · orientativ", value: "\(result.bandScores[band, default: 0])/8")
            }
            Text("Praguri pilot, nevalidate CEFR. Pentru stabilirea nivelului este necesară și o conversație cu Ibrahim. Ascultarea și vorbirea nu au fost evaluate.")
                .foregroundStyle(.secondary)
            if let unit = result.startingJourneyUnit(in: package.units) {
                Button("Începe parcursul de aici") {
                    saving = true
                    Task {
                        await progressModel.setCurrentJourneyUnitID(unit.id)
                        saving = false
                        if progressModel.persistenceError == nil {
                            onStartJourney(unit.id)
                            dismiss()
                        }
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(saving)
            } else {
                Text("Nu există încă o unitate disponibilă pentru recomandare. Poți alege din Parcurs.")
            }
            if let error = progressModel.persistenceError {
                Text("Punctul de pornire nu a putut fi salvat: " + error)
                    .font(.caption).foregroundStyle(.secondary)
            }
            Button("Aleg singur din Parcurs") { onChooseJourney(); dismiss() }
                .disabled(saving)
        }
    }

    private func recommendation(_ point: OrientationStartingPoint) -> String {
        switch point {
        case .a1Foundation: return "Începe cu bazele A1"
        case .a2Consolidation: return "Consolidează materialul A2"
        case .b1AvailableMaterial: return "Explorează materialul B1 disponibil"
        case .reviewAndEnrichment: return "Recapitulare și aprofundare"
        }
    }

    private func submit(_ answer: String?, questionID: String) {
        guard var current = session, current.record(questionID: questionID, answer: answer) else { return }
        session = current
        self.answer = ""
    }

    private func loadPilot() {
        guard session == nil, failure == nil else { return }
        do {
            guard let url = Bundle.main.url(forResource: "orientation-pilot", withExtension: "json") else {
                throw BundledContentLoaderError.missingResource(name: "orientation-pilot", extension: "json")
            }
            let items = try JSONDecoder().decode([OrientationPilotItem].self, from: Data(contentsOf: url))
            // Preflight every localization before the learner starts.
            for item in items {
                guard item.prompt[locale] != nil else { throw LocalizationError.missingLocale(locale) }
            }
            session = try OrientationSession(items: items)
        } catch {
            failure = error.localizedDescription
        }
    }
}
