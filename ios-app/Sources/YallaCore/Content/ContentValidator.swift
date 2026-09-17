public enum ContentValidationError: Error, Equatable, Sendable {
    case duplicateExpressionID(String)
    case duplicateUnitID(String)
    case missingExpressionReference(unitID: String, expressionID: String)
    case missingDefaultLocalization(expressionID: String, locale: String)
}

public struct ContentValidator: Sendable {
    public init() {}

    public func validate(_ package: ContentPackage) throws {
        var expressionIDs = Set<String>()
        for expression in package.expressions {
            guard expressionIDs.insert(expression.id).inserted else {
                throw ContentValidationError.duplicateExpressionID(expression.id)
            }
            guard expression.localizations[package.manifest.defaultLearnerLocale] != nil else {
                throw ContentValidationError.missingDefaultLocalization(
                    expressionID: expression.id,
                    locale: package.manifest.defaultLearnerLocale
                )
            }
        }

        var unitIDs = Set<String>()
        for unit in package.units {
            guard unitIDs.insert(unit.id).inserted else {
                throw ContentValidationError.duplicateUnitID(unit.id)
            }
            for expressionID in unit.expressionIDs where !expressionIDs.contains(expressionID) {
                throw ContentValidationError.missingExpressionReference(
                    unitID: unit.id,
                    expressionID: expressionID
                )
            }
        }
    }
}
