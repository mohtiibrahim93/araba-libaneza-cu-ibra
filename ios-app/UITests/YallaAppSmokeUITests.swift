import XCTest

final class YallaAppSmokeUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 15))
    }

    func testMainNavigationSmoke() throws {
        assertTab("Acasă")
        capture("01-home")

        openTab("Parcurs")
        XCTAssertTrue(app.navigationBars["Parcurs"].waitForExistence(timeout: 8))
        capture("02-journey")

        openTab("Practică")
        XCTAssertTrue(app.navigationBars["Practică"].waitForExistence(timeout: 8))
        XCTAssertTrue(app.staticTexts["Yalla! Două minute"].exists)
        XCTAssertTrue(app.staticTexts["În curând"].exists)
        capture("03-practice")

        openTab("Descoperă")
        XCTAssertTrue(app.navigationBars["Descoperă"].waitForExistence(timeout: 8))
        XCTAssertTrue(
            app.searchFields.firstMatch.waitForExistence(timeout: 8) ||
            app.textFields.firstMatch.waitForExistence(timeout: 2)
        )
        capture("04-discover")

        openTab("Eu")
        XCTAssertTrue(app.navigationBars["Eu"].waitForExistence(timeout: 8))
        XCTAssertTrue(app.staticTexts["Progres local"].exists)
        capture("05-profile")
    }

    func testJourneyAndRootExplorerSmoke() throws {
        openTab("Parcurs")

        let firstUnitLink = app.collectionViews.buttons.firstMatch.exists
            ? app.collectionViews.buttons.firstMatch
            : app.buttons.firstMatch

        XCTAssertTrue(firstUnitLink.waitForExistence(timeout: 8))
        firstUnitLink.tap()
        XCTAssertTrue(app.navigationBars.firstMatch.waitForExistence(timeout: 8))
        capture("06-journey-unit")

        openTab("Descoperă")
        let rootButton = app.buttons.matching(
            NSPredicate(format: "label CONTAINS[c] %@", "L7M")
        ).firstMatch

        if rootButton.waitForExistence(timeout: 5) {
            rootButton.tap()
            XCTAssertTrue(app.navigationBars.firstMatch.waitForExistence(timeout: 8))
            capture("07-root-l7m")
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
