// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "YallaCore",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "YallaCore", targets: ["YallaCore"])
    ],
    targets: [
        .target(name: "YallaCore"),
        .testTarget(name: "YallaCoreTests", dependencies: ["YallaCore"])
    ]
)
