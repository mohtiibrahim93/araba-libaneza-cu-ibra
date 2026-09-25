import SwiftUI

/// A Lebanese saying given by the teacher.
struct DailySaying: Decodable, Equatable {
    let text: String
    let literal: String?
    let meaning: String
}

/// The teacher's sayings, bundled with the app: one per screen each day,
/// rotating through that screen's list, plus fixed sayings per unit.
enum DailySayings {
    enum Screen: String {
        case home, progress, journey
    }

    private struct File: Decodable {
        let screens: [String: [DailySaying]]
        let units: [String: DailySaying]
    }

    private static let file: File? = {
        guard let url = Bundle.main.url(forResource: "daily-sayings", withExtension: "json"),
              let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(File.self, from: data)
    }()

    /// Today's saying for the screen; the same all day, the next one tomorrow.
    static func today(for screen: Screen, date: Date = Date(), calendar: Calendar = .current) -> DailySaying? {
        guard let sayings = file?.screens[screen.rawValue], !sayings.isEmpty else { return nil }
        let day = calendar.ordinality(of: .day, in: .era, for: date) ?? 0
        return sayings[day % sayings.count]
    }

    static func unit(_ unitID: String) -> DailySaying? {
        file?.units[unitID]
    }
}

/// "Kill yom shi jdeed — În fiecare zi, ceva nou." with the literal
/// translation underneath when the saying has one.
struct SayingLine: View {
    let saying: DailySaying
    var textColor: Color = Theme.terracotta
    var meaningColor: Color = Theme.muted

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            (Text(saying.text)
                .font(Theme.serif(.title3, weight: .regular))
                .foregroundColor(textColor)
             + Text("  — \(saying.meaning)")
                .font(Theme.font(.footnote))
                .foregroundColor(meaningColor))
                .fixedSize(horizontal: false, vertical: true)
            if let literal = saying.literal {
                Text("Literal: \(literal)")
                    .font(Theme.font(.caption).italic())
                    .foregroundStyle(meaningColor)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("saying")
    }
}
