import Foundation
import SwiftUI
import YallaCore

struct OrientationView: View {
    let package: ContentPackage
    let locale: String
    @ObservedObject var progressModel: LearnerProgressModel
    let onStartJourney: (String) -> Void
    let onChooseJourney: () -> Void
    let onOpenTutor: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var session: OrientationSession?
    @State private var started = false
    @State private var answer = ""
    @State private var failure: String?
    @State private var confirmingExit = false
    @State private var saving = false
    @State private var confirmingRestart = false
    @State private var resumeNotice: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    OrientationProgressHeader(
                        current: progressCurrent,
                        total: progressTotal,
                        label: progressLabel,
                        leadingIcon: .system("xmark"),
                        leadingLabel: "Închide",
                        onLeading: close
                    )
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
                .padding(.horizontal, Theme.Spacing.screen)
                .padding(.vertical, Theme.Spacing.md)
                .frame(maxWidth: Theme.Spacing.maxContentWidth)
                .frame(maxWidth: .infinity)
                .disabled(saving)
            }
            .scrollDismissesKeyboard(.interactively)
            .safeAreaInset(edge: .bottom) { ProgressSaveStatusView(progressModel: progressModel) }
            .background(Theme.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
            .confirmationDialog("Închizi orientarea?", isPresented: $confirmingExit, titleVisibility: .visible) {
                Button("Închide și reia mai târziu") { dismiss() }
                Button("Continuă testul", role: .cancel) {}
            } message: {
                Text("Un test incomplet nu produce o recomandare. Răspunsurile salvate rămân disponibile la redeschidere.")
            }
            .confirmationDialog("Reîncepi orientarea?", isPresented: $confirmingRestart, titleVisibility: .visible) {
                Button("Reîncepe", role: .destructive) { restart() }
                Button("Păstrează progresul", role: .cancel) {}
            } message: {
                Text("Răspunsurile și rezultatul orientării anterioare vor fi înlocuite. Progresul din lecții rămâne păstrat.")
            }
            .interactiveDismissDisabled(started && session?.isFinished == false || saving)
            .task { loadPilot() }
        }
    }

    // MARK: Progress

    /// The test is the second stage after the Welcome screen.
    private var progressTotal: Int { session?.checkpoint.items.count ?? 24 }

    private var progressCurrent: Int { session?.checkpoint.answers.count ?? 0 }

    private var progressLabel: String {
        guard started, let session else { return "Pasul 2 din 2" }
        if session.isFinished { return "Pasul 2 din 2 · gata" }
        return "Pasul 2 din 2 · \(min(progressCurrent + 1, progressTotal))/\(progressTotal)"
    }

    private var startTitle: String {
        if session?.isFinished == true { return "Vezi rezultatul salvat" }
        if session?.checkpoint.answers.isEmpty == false { return "Reia orientarea" }
        return "Începe orientarea"
    }

    private func close() {
        guard !saving else { return }
        if started && session?.isFinished == false {
            confirmingExit = true
        } else {
            dismiss()
        }
    }

    // MARK: Screens

    private var introduction: some View {
        VStack(alignment: .leading, spacing: 18) {
            OrientationIntro(
                title: "De unde începi?",
                subtitle: "24 de întrebări cu variante de răspuns și expresii scurte în Arabizi.",
                artwork: "illus-onb-town"
            )
            VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                Label("Fără cronometru, indicii sau corectare pe parcurs. Poți alege „Nu știu”.", systemImage: "clock.badge.checkmark")
                Label("Rezultatul sugerează un punct de pornire, nu certifică un nivel CEFR. Ascultarea și vorbirea nu sunt evaluate.", systemImage: "info.circle")
                if !progressModel.snapshot.attempts.isEmpty {
                    Label("Ai exersat deja în aplicație. Familiaritatea cu materialele poate influența rezultatul.", systemImage: "lightbulb")
                }
                if let resumeNotice {
                    Label(resumeNotice, systemImage: "arrow.clockwise")
                }
            }
            .font(Theme.font(.subheadline))
            .foregroundStyle(Theme.muted)
            .labelStyle(TintedIconLabelStyle(tint: Theme.teal))
            .padding(Theme.Spacing.lg)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardBackground()

            Button {
                started = true
            } label: {
                Label(startTitle, systemImage: "arrow.right")
                .labelStyle(TrailingIconLabelStyle())
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 54))
            .accessibilityIdentifier("orientation.start")
            .disabled(session == nil)
            if session?.checkpoint.answers.isEmpty == false {
                Button("Reîncepe orientarea") { confirmingRestart = true }
                    .buttonStyle(OutlinePillButtonStyle())
            }
            Button("Aleg singur din Călătorie") { onChooseJourney(); dismiss() }
                .buttonStyle(OutlinePillButtonStyle())
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
        VStack(alignment: .leading, spacing: 18) {
            QuestionSectionHeader(
                number: step.question.questionNumber,
                title: step.question.prompt,
                helper: "Fiecare răspuns contează o singură dată."
            )
            if step.choices.isEmpty {
                HStack(spacing: 10) {
                    Image(systemName: "character.cursor.ibeam")
                        .foregroundStyle(Theme.terracotta)
                    TextField("Răspuns în Arabizi", text: $answer)
                        .accessibilityLabel("Răspuns în Arabizi")
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .submitLabel(.done)
                        .onSubmit { submit(answer, questionID: step.id) }
                }
                .font(Theme.font(.body))
                .padding(.horizontal, 16)
                .frame(minHeight: 50)
                .background(Theme.surface, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 15, style: .continuous).strokeBorder(Theme.cardStroke, lineWidth: 0.75))
                Button {
                    submit(answer, questionID: step.id)
                } label: {
                    Label("Înregistrează răspunsul", systemImage: "arrow.right")
                        .labelStyle(TrailingIconLabelStyle())
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PillButtonStyle(fill: Theme.cedarDeep, pressedFill: Theme.deep, minHeight: 54))
                .disabled(answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            } else {
                VStack(spacing: Theme.Spacing.sm) {
                    ForEach(step.choices, id: \.self) { choice in
                        SingleSelectOptionCard(
                            title: choice,
                            isSelected: false,
                            layout: .row,
                            action: { submit(choice, questionID: step.id) }
                        )
                        .accessibilityIdentifier("orientation.choice")
                    }
                }
            }
            Button("Nu știu") { submit(nil, questionID: step.id) }
                .buttonStyle(OutlinePillButtonStyle())
        }
        .id(step.id)
    }

    private func resultContent(_ result: OrientationResult) -> some View {
        let unit = result.startingJourneyUnit(in: package.units)
        let passedB1 = result.startingPoint == .reviewAndEnrichment
        let actionTitle: String? = unit == nil ? nil : (passedB1 ? "Recapitulează B1 în Călătorie" : "Mergi la Călătorie")
        var action: (() -> Void)?
        if let unit { action = { startJourney(at: unit) } }
        let description: String = passedB1
            ? "Ai trecut banca de orientare pentru materialul B1 disponibil în aplicație. Asta nu este o certificare B2; poți recapitula B1 sau cere o evaluare cu tutorul pentru următorul pas."
            : "Prag provizoriu: 6/8 pe fiecare bandă. Rezultatul sugerează un punct de pornire și nu certifică un nivel CEFR. Ascultarea și vorbirea nu au fost evaluate."
        return VStack(alignment: .leading, spacing: 18) {
            OrientationIntro(
                title: "Punctul tău de pornire",
                subtitle: "Pe baza celor \(progressTotal) de răspunsuri din test."
            )
            RecommendationCard(
                eyebrow: "Recomandarea noastră pentru tine",
                badge: "Personalizat",
                title: recommendation(result.startingPoint),
                description: description,
                actionTitle: actionTitle,
                onAction: action
            ) {
                VStack(spacing: Theme.Spacing.sm) {
                    ForEach([LevelBand.a1, .a2, .b1], id: \.self) { band in
                        let score = result.bandScores[band, default: 0]
                        HStack(spacing: Theme.Spacing.sm) {
                            Text(band.rawValue.uppercased())
                                .font(Theme.font(.caption, weight: .bold))
                                .foregroundStyle(Theme.deep)
                                .frame(width: 26, alignment: .leading)
                            MeterBar(fraction: Double(score) / 8, tint: Theme.deep, track: Theme.surface.opacity(0.8), height: 6)
                            Text("\(score)/8")
                                .font(Theme.font(.caption, weight: .semibold))
                                .monospacedDigit()
                                .foregroundStyle(Theme.ink)
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("\(band.rawValue.uppercased()) orientativ")
                        .accessibilityValue("\(score) din 8")
                    }
                }
                .padding(.vertical, Theme.Spacing.xs)
            }
            if unit == nil {
                Text("Nu există încă o unitate disponibilă pentru recomandare. Poți alege din Călătorie.")
                    .font(Theme.font(.subheadline))
                    .foregroundStyle(Theme.muted)
            }
            if passedB1 {
                Button("Vezi tutorul") {
                    onOpenTutor()
                    dismiss()
                }
                .buttonStyle(OutlinePillButtonStyle())
                .disabled(saving)
            }
            if let error = progressModel.persistenceError {
                Text("Punctul de pornire nu a putut fi salvat: " + error)
                    .font(.caption).foregroundStyle(Theme.muted)
            }
            Button("Aleg singur din Călătorie") { onChooseJourney(); dismiss() }
                .buttonStyle(OutlinePillButtonStyle())
                .disabled(saving)
        }
    }

    private func startJourney(at unit: JourneyUnit) {
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

    private func recommendation(_ point: OrientationStartingPoint) -> String {
        switch point {
        case .a1Foundation: return "Începe cu bazele A1"
        case .a2Consolidation: return "Consolidează materialul A2"
        case .b1AvailableMaterial: return "Explorează materialul B1 disponibil"
        case .reviewAndEnrichment: return "Ai trecut materialul B1 disponibil"
        }
    }

    private func submit(_ answer: String?, questionID: String) {
        guard var current = session, current.record(questionID: questionID, answer: answer) else { return }
        session = current
        self.answer = ""
        saving = true
        Task {
            await progressModel.saveOrientation(current.checkpoint)
            saving = false
        }
    }

    private func restart() {
        guard let items = session?.checkpoint.items,
              let fresh = try? OrientationSession(items: items) else { return }
        session = fresh
        answer = ""
        started = false
        resumeNotice = nil
        saving = true
        Task {
            await progressModel.saveOrientation(nil)
            saving = false
        }
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
            do {
                session = try OrientationSession(items: items, checkpoint: progressModel.snapshot.orientationCheckpoint)
            } catch OrientationSessionError.invalidCheckpoint {
                session = try OrientationSession(items: items)
                resumeNotice = "Întrebările au fost actualizate sau sesiunea salvată nu mai poate fi reluată. Poți începe o orientare nouă."
            }
        } catch {
            failure = error.localizedDescription
        }
    }
}
