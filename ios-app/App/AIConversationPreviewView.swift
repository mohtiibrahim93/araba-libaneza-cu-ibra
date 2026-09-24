import SwiftUI

/// Visual shell for AI conversation practice (planned for M11). It shows the
/// planned layout without any dialogue, scores or feedback that do not exist yet.
struct AIConversationPreviewView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack(spacing: 14) {
                    Image(systemName: "fork.knife")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.white)
                        .frame(width: 56, height: 56)
                        .background(Theme.terracotta, in: Circle())
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Scenarii de conversație")
                            .font(Theme.serif(.headline))
                            .foregroundStyle(Theme.ink)
                        Text("Situații din viața reală: restaurant, piață, drum, prezentări.")
                            .font(Theme.font(.caption))
                            .foregroundStyle(Theme.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 0)
                    Image("illus-restaurant")
                        .resizable()
                        .scaledToFill()
                        .frame(width: 84, height: 70)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .accessibilityHidden(true)
                }
                .padding(14)
                .cardBackground()

                VStack(spacing: 12) {
                    Image(systemName: "bubble.left.and.bubble.right.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(Theme.teal)
                    Text("În curând")
                        .font(Theme.serif(.title2))
                        .foregroundStyle(Theme.ink)
                    Text("Aici vei purta conversații scurte în libaneză, cu răspunsuri sugerate și feedback. Dialogurile vor folosi doar expresii aprobate de profesor.")
                        .font(Theme.font(.subheadline))
                        .foregroundStyle(Theme.muted)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(24)
                .frame(maxWidth: .infinity)
                .background(Theme.mint, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

                HStack(spacing: 28) {
                    ControlCircle(icon: "keyboard", size: 54, fill: Theme.surface, tint: Theme.muted)
                    ControlCircle(icon: "mic.fill", size: 78, fill: Theme.terracotta.opacity(0.45), tint: .white)
                    ControlCircle(icon: "character.book.closed", size: 54, fill: Theme.surface, tint: Theme.muted)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 8)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("Controalele de conversație nu sunt încă disponibile")
            }
            .padding(20)
        }
        .background(Theme.canvas.ignoresSafeArea())
        .navigationTitle("Conversație AI")
        .navigationBarTitleDisplayMode(.inline)
        .accessibilityIdentifier("ai.preview")
    }
}

private struct ControlCircle: View {
    let icon: String
    let size: CGFloat
    let fill: Color
    let tint: Color

    var body: some View {
        Image(systemName: icon)
            .font(.system(size: size * 0.36, weight: .semibold))
            .foregroundStyle(tint)
            .frame(width: size, height: size)
            .background(fill, in: Circle())
            .overlay(Circle().strokeBorder(Theme.line, lineWidth: 1))
    }
}
