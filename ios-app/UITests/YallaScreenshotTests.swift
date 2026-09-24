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
        XCTAssertTrue(app.tabBars.buttons["Acasă"].waitForExistence(timeout: 10))
        snap("01-home")

        openTab("Parcurs")
        XCTAssertTrue(app.navigationBars["Parcurs"].waitForExistence(timeout: 8))
        snap("02-journey")

        let firstUnit = app.collectionViews.buttons.firstMatch
        if firstUnit.waitForExistence(timeout: 8) {
            firstUnit.tap()
            snap("03-journey-unit")
            captureExerciseFlow()
            captureMatchingFlow()
        }

        openTab("Practică")
        snap("20-practice")

        openTab("Descoperă")
        snap("21-discover")

        openTab("Eu")
        snap("22-profile")
    }

    // MARK: - Flows

    private func captureExerciseFlow() {
        let start = element(identifier: "lesson.start", label: "Începe exercițiile")
        guard start.waitForExistence(timeout: 6) else { return }
        start.tap()
        snap("04-exercise")

        let choices = app.buttons.matching(identifier: "exercise.choice")
        if choices.firstMatch.waitForExistence(timeout: 3) {
            // Try each choice until the exercise completes; capture the first
            // selection, the first feedback and the completed state.
            let count = min(choices.count, 6)
            var capturedFeedback = false
            for index in 0..<count {
                let choice = choices.element(boundBy: index)
                guard choice.exists, choice.isEnabled else { continue }
                choice.tap()
                if index == 0 { snap("05-exercise-selected") }
                let check = element(identifier: "exercise.check", label: "Verifică")
                guard check.waitForExistence(timeout: 2) else { break }
                check.tap()
                if !capturedFeedback {
                    snap("06-exercise-feedback")
                    capturedFeedback = true
                }
                if continueButton.waitForExistence(timeout: 1.5) {
                    snap("07-exercise-correct")
                    break
                }
            }
        } else {
            let field = app.textFields.firstMatch
            if field.waitForExistence(timeout: 3) {
                field.tap()
                field.typeText("salut")
                snap("05-exercise-typed")
                let check = element(identifier: "exercise.check", label: "Verifică")
                if check.exists { check.tap() }
                snap("06-exercise-feedback")
                let hint = element(identifier: "exercise.hint", label: "Indiciu")
                if hint.exists, hint.isEnabled {
                    hint.tap()
                    snap("07-exercise-hint")
                }
            }
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
