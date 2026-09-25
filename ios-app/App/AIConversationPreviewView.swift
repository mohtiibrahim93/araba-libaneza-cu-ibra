import SwiftUI

/// Visual shell for AI conversation practice (planned for M11). It shows the
/// planned layout without any dialogue, scores or feedback that do not exist yet.
struct AIConversationPreviewView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                ConversationScenarioCard(
                    icon: "fork.knife",
                    title: "Scenarii de conversație",
                    detail: "Situații din viața reală: restaurant, piață, drum, prezentări.",
                    image: "illus-restaurant"
                )

                HStack(spacing: Theme.Spacing.s) {
                    IconBadge(systemName: "hourglass", tint: Theme.terracotta, background: Theme.blush, size: 40)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("În curând")
                            .font(Theme.serif(.headline))
                            .foregroundStyle(Theme.ink)
                        Text("Vei purta conversații scurte în libaneză, cu răspunsuri sugerate și feedback. Dialogurile vor folosi doar expresii aprobate de profesor.")
                            .font(Theme.font(.caption))
                            .foregroundStyle(Theme.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(Theme.Spacing.m)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Theme.blush, in: RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
                .accessibilityElement(children: .combine)

                VStack(spacing: Theme.Spacing.m) {
                    ConversationBubblePlaceholder(speaker: .tutor, lines: [0.55, 0.8])
                    ConversationBubblePlaceholder(speaker: .learner, lines: [0.7, 0.5])
                    ConversationBubblePlaceholder(speaker: .tutor, lines: [0.65, 0.4])
                }

                PronunciationFeedbackPlaceholder()
                SuggestedRepliesPlaceholder()
            }
            .padding(.horizontal, Theme.Spacing.screen)
            .padding(.vertical, Theme.Spacing.s)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .safeAreaInset(edge: .bottom, spacing: 0) {
            ConversationControlBar()
                .background(Theme.canvas.ignoresSafeArea(edges: .bottom))
        }
        .navigationTitle("Conversație AI")
        .navigationBarTitleDisplayMode(.inline)
        .accessibilityIdentifier("ai.preview")
    }
}
