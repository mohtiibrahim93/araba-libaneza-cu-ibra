import XCTest

/// Walks the main learner screens and saves one PNG per step.
///
/// CI passes `TEST_RUNNER_SCREENSHOT_DIR` (exposed to the runner as
/// `SCREENSHOT_DIR`) and `TEST_RUNNER_SCREENSHOT_PREFIX` (for example `light`
/// or `dark`). The simulator shares the host file system, so the files land
/// directly on the CI machine. Every image is also kept as an XCTest attachment.
@MainActor
final class YallaScreenshotTests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = true
        app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 15))
    }

    func testCaptureLearnerScreens() throws {
        let welcome = app.buttons["welcome.continue"]
        if welcome.waitForExistence(timeout: 6) {
            snap("00-welcome")
            welcome.tap()
            snap("00b-after-welcome")
            app.terminate()
            app.launch()
        }
        XCTAssertTrue(app.tabBars.buttons["Acasă"].waitForExistence(timeout: 10))
        snap("01-home")

        openTab("Parcurs")
        XCTAssertTrue(app.navigationBars["Parcurs"].waitForExistence(timeout: 8))
        snap("02-journey")

        let firstUnit = app.buttons.matching(identifier: "journey.unit").firstMatch
        if firstUnit.waitForExistence(timeout: 8) {
            firstUnit.tap()
            snap("03-journey-unit")
            captureExerciseFlow()
            captureMatchingFlow()
        }

        openTab("Practică")
        snap("20-practice")
        let drill = app.buttons["practice.speed-drill"]
        if drill.waitForExistence(timeout: 4) {
            drill.tap()
            snap("23-speed-drill")
            let reveal = app.buttons["drill.reveal"]
            if reveal.waitForExistence(timeout: 3) {
                reveal.tap()
                snap("24-speed-drill-answer")
            }
            goBack()
        }

        openTab("Descoperă")
        snap("21-discover")
        let search = app.textFields["discover.search"]
        if search.waitForExistence(timeout: 4) {
            search.tap()
            search.typeText("mar7aba")
            snap("21b-discover-search")
            let rootsChip = app.buttons["Rădăcini"]
            if rootsChip.exists {
                let clear = app.buttons["Șterge căutarea"]
                if clear.exists { clear.tap() }
                rootsChip.tap()
                snap("21c-discover-roots")
            }
        }

        openTab("Eu")
        snap("22-profile")
    }

    // MARK: - Flows

    private func captureExerciseFlow() {
        let start = element(identifier: "lesson.start", label: "Începe exercițiile")
        guard start.waitForExistence(timeout: 6) else { return }
        start.tap()
        snap("04-exercise")

        // Work through the first lesson. Choice exercises are solved by trying
        // options in turn; a free-text exercise cannot be solved generically.
        for step in 0..<20 {
            let summaryContinue = app.buttons["summary.continue"]
            if summaryContinue.waitForExistence(timeout: 1) {
                snap("09-lesson-summary")
                summaryContinue.tap()
                snap("10-unit-after-lesson")
                return
            }

            let choices = app.buttons.matching(identifier: "exercise.choice")
            if choices.firstMatch.waitForExistence(timeout: 2) {
                let count = min(choices.count, 6)
                for index in 0..<count {
                    let choice = choices.element(boundBy: index)
                    guard choice.exists, choice.isEnabled else { continue }
                    choice.tap()
                    if step == 0 && index == 0 { snap("05-exercise-selected") }
                    let check = element(identifier: "exercise.check", label: "Verifică")
                    guard check.waitForExistence(timeout: 2) else { break }
                    check.tap()
                    if step == 0 && index == 0 { snap("06-exercise-feedback") }
                    if continueButton.waitForExistence(timeout: 1.5) {
                        if step == 0 { snap("07-exercise-correct") }
                        break
                    }
                }
            } else {
                let field = app.textFields.firstMatch
                if field.waitForExistence(timeout: 2) {
                    field.tap()
                    field.typeText("salut")
                    snap("11-exercise-typed")
                    let check = element(identifier: "exercise.check", label: "Verifică")
                    if check.exists { check.tap() }
                    snap("12-exercise-text-feedback")
                }
                break
            }

            guard continueButton.waitForExistence(timeout: 2) else { break }
            continueButton.tap()
        }

        goBack()
    }

    private func captureMatchingFlow() {
        let matching = element(identifier: "lesson.matching", label: "Potrivește expresiile")
        guard matching.waitForExistence(timeout: 4) else { return }
        if !matching.isHittable { app.swipeUp() }
        matching.tap()
        snap("08-matching")
        goBack()
    }

    // MARK: - Helpers

    private var continueButton: XCUIElement {
        element(identifier: "exercise.continue", label: "Continuă")
    }

    private func element(identifier: String, label: String) -> XCUIElement {
        let byIdentifier = app.buttons[identifier]
        return byIdentifier.exists ? byIdentifier : app.buttons[label]
    }

    private func openTab(_ label: String) {
        let button = app.tabBars.buttons[label]
        if !button.waitForExistence(timeout: 5) {
            goBack()
        }
        if button.waitForExistence(timeout: 5) {
            button.tap()
        }
    }

    private func goBack() {
        let back = app.navigationBars.buttons.element(boundBy: 0)
        if back.waitForExistence(timeout: 3) {
            back.tap()
        }
    }

    private func snap(_ name: String) {
        // Let springs and transitions settle before capturing.
        Thread.sleep(forTimeInterval: 0.9)
        let screenshot = XCUIScreen.main.screenshot()
        let environment = ProcessInfo.processInfo.environment
        let prefix = environment["SCREENSHOT_PREFIX"].map { "\($0)-" } ?? ""
        let fileName = "\(prefix)\(name).png"

        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.name = fileName
        attachment.lifetime = .keepAlways
        add(attachment)

        guard let directory = environment["SCREENSHOT_DIR"], !directory.isEmpty else { return }
        let url = URL(fileURLWithPath: directory, isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
            try screenshot.pngRepresentation.write(to: url.appendingPathComponent(fileName))
        } catch {
            XCTFail("Could not write screenshot \(fileName): \(error)")
        }
    }
}
