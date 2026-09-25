import SwiftUI
import YallaCore

// Building blocks of the lesson player (reference "La restaurant"). The
// player's logic stays in ExerciseSessionView and ExerciseSessionPlayer;
// these views only present its state.

/// Where a lesson sits, shown above the exercises when the player is opened
/// from a Journey unit.
struct LessonContext {
    let title: String
    let subtitle: String
    let icon: String
    let sceneImage: String?
    /// For example "Lecția 2 din 6".
    let lessonLabel: String
}

/// Icons and temporary scenery per Journey unit. The content has no unit
/// categories, so the mapping lives here, keyed by unit ID prefix.
enum JourneyUnitArt {
    static func icon(for unitID: String) -> String {
        let key = unitID.split(separator: "-").dropFirst().joined(separator: "-")
        switch key {
        case "welcome", "meeting", "polite": return "hand.wave"
        case "questions", "conversation": return "bubble.left.and.bubble.right"
        case "family": return "figure.2.and.child.holdinghands"
        case "home": return "house"
        case "description", "clothes": return "tshirt"
        case "numbers", "frequency": return "number"
        case "time", "daily": return "clock"
        case "weather": return "cloud.sun"
        case "needs", "shopping": return "bag"
        case "actions", "verbs", "weak", "past": return "figure.walk"
        case "restaurant": return "fork.knife"
        case "city": return "tram"
        case "health": return "cross.case"
        case "work": return "briefcase"
        case "leisure", "plans": return "sparkles"
        case "roots": return "leaf"
        case "opinions", "experiences": return "text.bubble"
        case "modals", "connections": return "link"
        default: return "book"
        }
    }

    static func scene(for unitID: String) -> String {
        let key = unitID.split(separator: "-").dropFirst().joined(separator: "-")
        switch key {
        case "restaurant", "shopping", "needs": return "illus-restaurant"
        case "welcome", "questions", "meeting", "conversation": return "illus-cafe"
        case "family", "home": return "illus-house"
        case "city", "work": return "illus-onb-town"
        case "weather", "leisure", "plans", "experiences": return "illus-coast"
        case "numbers", "time", "frequency", "roots", "verbs", "weak", "past": return "illus-book"
        default: return "illus-raouche"
        }
    }

    /// Blog posts that fit the unit, most specific first.
    static func cultureSlugs(for unitID: String) -> [String] {
        let key = unitID.split(separator: "-").dropFirst().joined(separator: "-")
        var slugs: [String]
        switch key {
        case "welcome", "meeting", "polite": slugs = ["cum-saluti-in-libaneza", "primele-20-de-expresii-libaneze"]
        case "family": slugs = ["lebanese-family-vocabulary"]
        case "numbers", "frequency": slugs = ["numere-in-araba-libaneza"]
        case "restaurant", "shopping": slugs = ["cultura-libaneza-obiceiuri-mancare-traditii"]
        case "daily", "questions", "conversation": slugs = ["lebanese-arabic-phrases"]
        case "roots", "verbs", "weak", "past", "modals": slugs = ["gramatica-arabei-libaneze"]
        default: slugs = []
        }
        for general in ["cultura-libaneza-obiceiuri-mancare-traditii", "limbile-vorbite-in-liban", "ce-este-arabizi"]
        where !slugs.contains(general) {
            slugs.append(general)
        }
        return slugs
    }
}

/// "Lecția 2 din 6" (or the session name), progress bar and percentage.
struct LessonProgressHeader: View {
    let label: String
    let progress: Double
    let cleanFirstTries: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(label)
                    .font(Theme.font(.footnote, weight: .medium))
                    .foregroundStyle(Theme.muted)
                Spacer(minLength: Theme.Spacing.sm)
                Label("\(cleanFirstTries)", systemImage: "bolt.fill")
                    .font(Theme.font(.footnote, weight: .bold))
                    .foregroundStyle(Theme.gold)
                    .accessibilityLabel("\(cleanFirstTries) din prima")
            }
            HStack(spacing: Theme.Spacing.md) {
                MeterBar(fraction: progress, tint: Theme.deep, track: Theme.ringTrack, height: 8)
                Text("\(Int((progress * 100).rounded()))%")
                    .font(Theme.font(.footnote, weight: .semibold))
                    .monospacedDigit()
                    .foregroundStyle(Theme.muted)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

/// Unit icon, title and subtitle with the unit's scenery on the right.
struct LessonIdentityHeader: View {
    let context: LessonContext

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            IconBadge(systemName: context.icon, tint: .white, background: Theme.terracotta, size: 52)
            VStack(alignment: .leading, spacing: 2) {
                Text(context.title)
                    .font(.system(.title2, design: .serif).weight(.bold))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Text(context.subtitle)
                    .font(Theme.font(.footnote))
                    .foregroundStyle(Theme.muted)
                    .lineLimit(2)
            }
            Spacer(minLength: 0)
        }
        .padding(.trailing, context.sceneImage == nil ? 0 : 70)
        .frame(minHeight: 72)
        .background(alignment: .trailing) {
            if let scene = context.sceneImage {
                DecorativeImage(name: scene, width: 120, height: 82, fadeTowards: .leading)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
            }
        }
        .accessibilityElement(children: .combine)
    }
}

/// Compact result state next to the hint and retry actions.
struct FeedbackStatusPill: View {
    enum Tone { case correct, variant, retry }

    let title: String
    let tone: Tone

    private var tint: Color {
        switch tone {
        case .correct: return Theme.success
        case .variant: return Theme.variant
        case .retry: return Theme.terracotta
        }
    }

    private var background: Color {
        switch tone {
        case .correct: return Theme.successBackground
        case .variant: return Theme.variantBackground
        case .retry: return Theme.blush
        }
    }

    var body: some View {
        Label(title, systemImage: tone == .retry ? "arrow.counterclockwise" : "checkmark.circle")
            .font(Theme.font(.subheadline, weight: .semibold))
            .foregroundStyle(tint)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
            .padding(.horizontal, Theme.Spacing.md)
            .frame(minHeight: 44)
            .background(background, in: Capsule())
    }
}

/// Warm capsule action such as "Indiciu" or "Încearcă din nou".
struct LessonSoftButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Theme.font(.subheadline, weight: .semibold))
            .foregroundStyle(Theme.terracottaShade)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
            .padding(.horizontal, Theme.Spacing.md)
            .frame(minHeight: 44)
            .background(configuration.isPressed ? Theme.blushStrong : Theme.blush, in: Capsule())
    }
}

/// Recordings are not bundled yet; the player slot says so instead of faking audio.
struct AudioComingSoonRow: View {
    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            Image(systemName: "play.fill")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Theme.faint)
                .frame(width: 44, height: 44)
                .background(Theme.surface, in: Circle())
                .overlay(Circle().strokeBorder(Theme.cardStroke, lineWidth: 0.75))
            HStack(alignment: .center, spacing: 3) {
                ForEach(0..<22, id: \.self) { index in
                    Capsule()
                        .fill(Theme.progressInactive)
                        .frame(width: 2.5, height: CGFloat([8, 14, 20, 12, 24, 16, 10][index % 7]))
                }
            }
            .accessibilityHidden(true)
            Spacer(minLength: 0)
            Text("Audio · În curând")
                .font(Theme.font(.caption, weight: .medium))
                .foregroundStyle(Theme.muted)
        }
        .padding(.horizontal, Theme.Spacing.sm)
        .padding(.vertical, Theme.Spacing.xs)
        .background(Theme.canvas.opacity(0.6), in: RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Pronunția audio va fi disponibilă în curând")
    }
}

/// Icon, title and helper above the answer area.
struct ExercisePromptHeader: View {
    let icon: String
    let title: String
    let helper: String?

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            Image(systemName: icon)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(Theme.deep)
                .frame(width: 30)
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(Theme.serif(.headline, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                if let helper {
                    Text(helper)
                        .font(Theme.font(.footnote))
                        .foregroundStyle(Theme.muted)
                }
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

enum AnswerOptionState {
    case idle, selected, correct, incorrect, muted
}

/// One answer as a full-width card with a trailing state indicator.
struct AnswerOptionCard: View {
    let title: String
    var subtitle: String? = nil
    let state: AnswerOptionState

    private var fill: Color {
        switch state {
        case .selected: return Theme.mint
        case .correct: return Theme.successBackground
        case .incorrect: return Theme.blush
        case .idle, .muted: return Theme.surface
        }
    }

    private var border: Color {
        switch state {
        case .selected: return Theme.deep
        case .correct: return Theme.success
        case .incorrect: return Theme.terracotta
        case .idle, .muted: return Theme.cardStroke
        }
    }

    var body: some View {
        HStack(spacing: Theme.Spacing.md) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.serif(.body, weight: .semibold))
                    .foregroundStyle(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if let subtitle {
                    Text(subtitle)
                        .font(Theme.font(.footnote))
                        .foregroundStyle(Theme.muted)
                }
            }
            Spacer(minLength: 0)
            indicator
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.md)
        .frame(maxWidth: .infinity, minHeight: 58, alignment: .leading)
        .background(fill, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 15, style: .continuous)
                .strokeBorder(border, lineWidth: state == .idle || state == .muted ? 0.75 : 1.5)
        )
        .opacity(state == .muted ? 0.6 : 1)
        .contentShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
    }

    @ViewBuilder
    private var indicator: some View {
        switch state {
        case .correct:
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 23))
                .foregroundStyle(Theme.success)
        case .incorrect:
            Image(systemName: "xmark.circle.fill")
                .font(.system(size: 23))
                .foregroundStyle(Theme.terracotta)
        case .selected:
            SelectionIndicator(isSelected: true, tint: Theme.deep)
        case .idle, .muted:
            SelectionIndicator(isSelected: false)
        }
    }
}

/// Script display: Arabizi is what the content uses; Arabic script is announced.
struct ScriptModeControls: View {
    var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: Theme.Spacing.sm) { arabizi; arabic }
            VStack(spacing: Theme.Spacing.sm) { arabizi; arabic }
        }
    }

    private var arabizi: some View {
        control(glyph: "Aa", title: "Arabizi", detail: "activ", active: true)
            .accessibilityLabel("Arabizi, afișat")
    }

    private var arabic: some View {
        control(glyph: "ض", title: "Alfabet arab", detail: "În curând", active: false)
            .accessibilityLabel("Alfabet arab, în curând")
    }

    private func control(glyph: String, title: String, detail: String, active: Bool) -> some View {
        HStack(spacing: Theme.Spacing.sm) {
            Text(glyph)
                .font(.system(.title3, design: .serif).weight(.bold))
                .foregroundStyle(active ? Theme.deep : Theme.faint)
            VStack(alignment: .leading, spacing: 0) {
                Text(title)
                    .font(Theme.font(.footnote, weight: .semibold))
                    .foregroundStyle(active ? Theme.ink : Theme.muted)
                Text(detail)
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
            }
            Spacer(minLength: 0)
            Circle()
                .fill(active ? Theme.deep : Theme.progressInactive)
                .frame(width: 10, height: 10)
        }
        .padding(.horizontal, Theme.Spacing.md)
        .frame(maxWidth: .infinity, minHeight: 52)
        .background(active ? Theme.mint : Theme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .accessibilityElement(children: .ignore)
    }
}

// MARK: - Unit tabs

struct LessonModeTab: Identifiable, Hashable {
    let id: String
    let title: String
    let icon: String
}

/// Cedar capsule for the active section, cream for the others; scrolls
/// horizontally when the labels do not fit.
struct LessonModeTabs: View {
    let items: [LessonModeTab]
    @Binding var selectedID: String

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.sm) {
                ForEach(items) { item in
                    let selected = item.id == selectedID
                    Button {
                        selectedID = item.id
                    } label: {
                        Label(item.title, systemImage: item.icon)
                            .font(Theme.font(.subheadline, weight: selected ? .semibold : .regular))
                            .foregroundStyle(selected ? .white : Theme.ink)
                            .padding(.horizontal, Theme.Spacing.lg)
                            .frame(minHeight: 44)
                            .background(selected ? Theme.deep : Theme.surface, in: Capsule())
                            .overlay(Capsule().strokeBorder(selected ? .clear : Theme.cardStroke, lineWidth: 0.75))
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(selected ? [.isButton, .isSelected] : .isButton)
                    .accessibilityIdentifier("unit.tab.\(item.id)")
                }
            }
            .padding(.vertical, 2)
        }
    }
}

// MARK: - Culture

struct CulturePost: Decodable, Identifiable {
    let slug: String
    let title: String
    let description: String
    let readingMinutes: Int
    let tag: String

    var id: String { slug }
    var url: URL? { URL(string: "https://centruldearabalibaneza.com/blog/\(slug)") }

    /// Index of the posts on centruldearabalibaneza.com, bundled with the app.
    static let all: [CulturePost] = {
        struct File: Decodable { let posts: [CulturePost] }
        guard let url = Bundle.main.url(forResource: "culture-posts", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let file = try? JSONDecoder().decode(File.self, from: data) else { return [] }
        return file.posts
    }()
}

/// Blog post card that opens the full article on the website.
struct CulturePostCard: View {
    let post: CulturePost

    var body: some View {
        let card = VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack(spacing: Theme.Spacing.sm) {
                Text(post.tag.uppercased())
                    .font(Theme.font(.caption2, weight: .bold))
                    .kerning(0.6)
                    .foregroundStyle(Theme.terracotta)
                Text("· \(post.readingMinutes) min")
                    .font(Theme.font(.caption2))
                    .foregroundStyle(Theme.muted)
                Spacer(minLength: 0)
                Image(systemName: "arrow.up.right")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(Theme.muted)
            }
            Text(post.title)
                .font(Theme.serif(.headline, weight: .semibold))
                .foregroundStyle(Theme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text(post.description)
                .font(Theme.font(.footnote))
                .foregroundStyle(Theme.muted)
                .lineLimit(3)
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()

        if let url = post.url {
            Link(destination: url) { card }
                .buttonStyle(.plain)
                .accessibilityHint("Deschide articolul pe centruldearabalibaneza.com")
        } else {
            card
        }
    }
}
