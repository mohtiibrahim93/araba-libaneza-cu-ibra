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
        app.launchArguments += ["-learnerName", "Ibrahim"]
        app.launch()
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 15))
    }

    func testCaptureLearnerScreens() throws {
        let welcome = app.buttons["welcome.continue"]
        if welcome.waitForExistence(timeout: 6) {
            snap("00-welcome")
            app.swipeUp()
            snap("00a-welcome-lower")
            app.swipeDown()
            let studied = app.buttons["Am mai studiat"]
            if studied.waitForExistence(timeout: 3) {
                // Choosing a level above beginner adds the placement test stage.
                studied.tap()
                snap("00b-welcome-studied")
                welcome.tap()
                let start = app.buttons["orientation.start"]
                if start.waitForExistence(timeout: 6) {
                    snap("00c-orientation-intro")
                    start.tap()
                    snap("00d-orientation-question")
                }
            } else {
                welcome.tap()
                snap("00b-after-welcome")
            }
            app.terminate()
            app.launch()
        }
        XCTAssertTrue(app.tabBars.buttons["Acasă"].waitForExistence(timeout: 10))
        snap("01-home")
        app.swipeUp()
        snap("01b-home-lower")
        app.swipeDown()

        openTab("Călătorie")
        XCTAssertTrue(app.staticTexts["journey.title"].waitForExistence(timeout: 8))
        snap("02-journey")

        let firstUnit = app.buttons.matching(identifier: "journey.unit").firstMatch
        if firstUnit.waitForExistence(timeout: 8) {
            firstUnit.tap()
            snap("03-journey-unit")
            for (tab, name) in [("dialog", "03b-unit-dialog"), ("vocabulary", "03c-unit-vocabulary"), ("culture", "03d-unit-culture")] {
                let button = app.buttons["unit.tab.\(tab)"]
                if button.waitForExistence(timeout: 3) {
                    button.tap()
                    snap(name)
                }
            }
            let exercisesTab = app.buttons["unit.tab.exercises"]
            if exercisesTab.waitForExistence(timeout: 3) { exercisesTab.tap() }
            captureExerciseFlow()
            captureMatchingFlow()
        }

        openTab("Exersează")
        if app.navigationBars["Exersează"].waitForExistence(timeout: 8) {
            snap("20-practice")
            let ai = app.buttons["practice.ai-conversation"]
            scrollTo(ai)
            if ai.exists {
                ai.tap()
                snap("26-ai-conversation")
                goBack()
            }
            app.swipeDown()
            let drill = app.buttons["practice.speed-drill"]
            if drill.waitForExistence(timeout: 4) {
                drill.tap()
                snap("23a-speed-drill-start")
                let start = app.buttons["practice.start"]
                if start.waitForExistence(timeout: 4) { start.tap() }
                snap("23-speed-drill")
                let choice = app.buttons.matching(identifier: "drill.choice").firstMatch
                let reveal = app.buttons["drill.reveal"]
                if choice.waitForExistence(timeout: 3) {
                    choice.tap()
                    Thread.sleep(forTimeInterval: 0.1)
                    snap("24-speed-drill-answer")
                } else if reveal.waitForExistence(timeout: 3) {
                    reveal.tap()
                    snap("24-speed-drill-answer")
                }
                goBack()
                goBack()
            }
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
                if app.keyboards.count > 0 { app.typeText("\n") }
                let ktb = app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", "KTB")).firstMatch
                if ktb.waitForExistence(timeout: 4) {
                    ktb.tap()
                    if app.descendants(matching: .any)["root.core"].waitForExistence(timeout: 6) {
                        snap("21d-root-explorer")
                        let detail = app.buttons["root.detail.save"]
                        scrollTo(detail)
                        snap("21e-root-detail")
                        let places = app.buttons.matching(identifier: "root.filter")
                            .matching(NSPredicate(format: "label CONTAINS[c] %@", "Locuri")).firstMatch
                        if places.exists {
                            places.tap()
                            snap("21f-root-filter")
                        }
                        let help = app.buttons["root.help"]
                        for _ in 0..<4 where !(help.exists && help.isHittable) { app.swipeDown() }
                        if help.waitForExistence(timeout: 3) {
                            help.tap()
                            snap("21g-root-help")
                            app.swipeDown()
                        }
                        let back = app.buttons["root.back"]
                        if back.waitForExistence(timeout: 3) { back.tap() }
                    }
                }
            }
            // The keyboard covers the tab bar; dismiss it before switching tabs.
            if app.keyboards.count > 0 { app.typeText("\n") }
        }

        openTab("Acasă")
        let progressLink = app.buttons["home.progress"]
        scrollTo(progressLink)
        if progressLink.exists {
            progressLink.tap()
            snap("25-progress")
            app.swipeUp()
            snap("25b-progress-lower")
            goBack()
        }

        openTab("Tutor")
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

    private func scrollTo(_ element: XCUIElement) {
        var tries = 0
        while !(element.exists && element.isHittable) && tries < 5 {
            app.swipeUp()
            tries += 1
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
