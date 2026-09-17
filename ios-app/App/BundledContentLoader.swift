import Foundation
import YallaCore

enum BundledContentLoaderError: LocalizedError {
    case missingResource(name: String, extension: String)

    var errorDescription: String? {
        switch self {
        case let .missingResource(name, fileExtension):
            return "Resursa de conținut \(name).\(fileExtension) lipsește din aplicație."
        }
    }
}

struct BundledContentLoader {
    let bundle: Bundle
    let resourceName: String
    let resourceExtension: String
    let bootstrap: AppContentBootstrap

    init(
        bundle: Bundle = .main,
        resourceName: String = "yalla-native-content",
        resourceExtension: String = "json",
        bootstrap: AppContentBootstrap = AppContentBootstrap()
    ) {
        self.bundle = bundle
        self.resourceName = resourceName
        self.resourceExtension = resourceExtension
        self.bootstrap = bootstrap
    }

    func load(locale: String? = nil) throws -> AppContentSnapshot {
        guard let url = bundle.url(forResource: resourceName, withExtension: resourceExtension) else {
            throw BundledContentLoaderError.missingResource(
                name: resourceName,
                extension: resourceExtension
            )
        }

        let data = try Data(contentsOf: url)
        return try bootstrap.load(data: data, locale: locale)
    }
}
