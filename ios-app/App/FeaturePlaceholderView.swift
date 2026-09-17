import SwiftUI

struct FeaturePlaceholderView: View {
    let title: String
    let subtitle: String
    let systemImage: String

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: systemImage)
                .font(.system(size: 44, weight: .semibold))

            VStack(spacing: 8) {
                Text(title)
                    .font(.title2.bold())
                    .multilineTextAlignment(.center)

                Text(subtitle)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(28)
    }
}
