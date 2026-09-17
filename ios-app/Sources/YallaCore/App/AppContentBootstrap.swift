import Foundation

public struct AppContentSnapshot: Equatable, Sendable {
    public let package: ContentPackage
    public let locale: String
    public let shell: LearnerShellModel
    public let discover: DiscoverModel

    public init(
        package: ContentPackage,
        locale: String,
        shell: LearnerShellModel,
        discover: DiscoverModel
    ) {
        self.package = package
        self.locale = locale
        self.shell = shell
        self.discover = discover
    }
}

public struct AppContentBootstrap: Sendable {
    private let decoder: JSONDecoder
    private let validator: ContentValidator
    private let shellBuilder: LearnerShellModelBuilder
    private let discoverBuilder: DiscoverModelBuilder

    public init(
        decoder: JSONDecoder = JSONDecoder(),
        validator: ContentValidator = ContentValidator(),
        shellBuilder: LearnerShellModelBuilder = LearnerShellModelBuilder(),
        discoverBuilder: DiscoverModelBuilder = DiscoverModelBuilder()
    ) {
        self.decoder = decoder
        self.validator = validator
        self.shellBuilder = shellBuilder
        self.discoverBuilder = discoverBuilder
    }

    public func load(data: Data, locale: String? = nil) throws -> AppContentSnapshot {
        let package = try decoder.decode(ContentPackage.self, from: data)
        try validator.validate(package)

        let resolvedLocale = locale ?? package.manifest.defaultLearnerLocale
        let shell = try shellBuilder.build(from: package, locale: resolvedLocale)
        let discover = try discoverBuilder.build(from: package, locale: resolvedLocale)

        return AppContentSnapshot(
            package: package,
            locale: resolvedLocale,
            shell: shell,
            discover: discover
        )
    }
}
