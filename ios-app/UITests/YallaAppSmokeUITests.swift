import XCTest

@MainActor
final class YallaAppSmokeUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments += ["-hasSeenWelcome", "YES"]
        app.launch()
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 15))
    }

    func testMainNavigationSmoke() throws {
        assertTab("Acasă")
        capture("01-home")

        openTab("Călătorie")
        XCTAssertTrue(app.staticTexts["journey.title"].waitForExistence(timeout: 8))
        capture("02-journey")

        openTab("Acasă")
        XCTAssertTrue(app.buttons["home.continue"].waitForExistence(timeout: 8), "Missing smart session hero")
        let progressLink = app.buttons["home.progress"]
        var tries = 0
        while !(progressLink.exists && progressLink.isHittable) && tries < 5 {
            app.swipeUp()
            tries += 1
        }
        XCTAssertTrue(progressLink.exists, "Missing Home progress entry")
        progressLink.tap()
        XCTAssertTrue(app.staticTexts["Progresul meu"].waitForExistence(timeout: 8))
        app.navigationBars.buttons.element(boundBy: 0).tap()

        openTab("Exersează")
        XCTAssertTrue(app.navigationBars["Exersează"].waitForExistence(timeout: 8))
        XCTAssertTrue(
            app.descendants(matching: .any)
                .matching(NSPredicate(format: "label CONTAINS %@", "Yalla! Două minute"))
                .firstMatch.waitForExistence(timeout: 5)
        )
        XCTAssertTrue(app.staticTexts["În curând"].exists)
        capture("03-practice")

        openTab("Descoperă")
        XCTAssertTrue(app.textFields["discover.search"].waitForExistence(timeout: 8))
        capture("04-discover")

        openTab("Tutor")
        XCTAssertTrue(app.descendants(matching: .any)["tutor.book"].waitForExistence(timeout: 8))
        XCTAssertTrue(app.descendants(matching: .any)["profile.editName"].exists)
        let settings = app.descendants(matching: .any)["profile.settings"]
        XCTAssertTrue(settings.waitForExistence(timeout: 5))
        capture("05-profile")
        // The push can miss a tap made while the Tutor page is still
        // settling; tap once more if Setări has not opened.
        let nameField = app.descendants(matching: .any)["settings.name"]
        settings.tap()
        if !nameField.waitForExistence(timeout: 6), settings.exists, settings.isHittable {
            settings.tap()
        }
        XCTAssertTrue(nameField.waitForExistence(timeout: 10))
    }

    func testJourneyAndRootExplorerSmoke() throws {
        openTab("Călătorie")

        let firstUnitLink = app.buttons.matching(identifier: "journey.unit").firstMatch
        XCTAssertTrue(firstUnitLink.waitForExistence(timeout: 8))
        let unitProgress = firstUnitLink.value as? String ?? ""
        XCTAssertTrue(unitProgress.contains("lecții"), "Unit progress missing: \(unitProgress)")
        XCTAssertFalse(unitProgress.contains("din 0 lecții"), "Unit has no lessons: \(unitProgress)")

        XCTAssertTrue(firstUnitLink.waitForExistence(timeout: 8))
        firstUnitLink.tap()
        XCTAssertTrue(app.navigationBars.firstMatch.waitForExistence(timeout: 8))
        capture("06-journey-unit")

        openTab("Descoperă")
        let rootsChip = app.buttons["Rădăcini"]
        if rootsChip.waitForExistence(timeout: 5) { rootsChip.tap() }
        let rootButton = app.buttons.matching(
            NSPredicate(format: "label CONTAINS[c] %@", "L7M")
        ).firstMatch

        if rootButton.waitForExistence(timeout: 5) {
            rootButton.tap()
            XCTAssertTrue(app.descendants(matching: .any)["root.core"].waitForExistence(timeout: 8))
            let node = app.buttons.matching(identifier: "root.node").element(boundBy: 1)
            XCTAssertTrue(node.waitForExistence(timeout: 5))
            node.tap()
            XCTAssertTrue(app.buttons["root.detail.save"].waitForExistence(timeout: 5))
            capture("07-root-l7m")
            app.buttons["root.back"].tap()
            XCTAssertTrue(app.buttons["Rădăcini"].waitForExistence(timeout: 5))
        }
    }

    private func assertTab(_ label: String) {
        XCTAssertTrue(
            app.tabBars.buttons[label].waitForExistence(timeout: 8),
            "Missing tab: \(label)"
        )
    }

    private func openTab(_ label: String) {
        let button = app.tabBars.buttons[label]
        XCTAssertTrue(button.waitForExistence(timeout: 8), "Missing tab: \(label)")
        button.tap()
    }

    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
