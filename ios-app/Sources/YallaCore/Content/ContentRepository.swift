import Foundation

public protocol ContentRepository: Sendable {
    func expression(id: String) throws -> Expression?
    func unit(id: String) throws -> JourneyUnit?
    func expressions(in unitID: String) throws -> [Expression]
}

public struct JSONContentRepository: ContentRepository, Sendable {
    private let expressionsByID: [String: Expression]
    private let unitsByID: [String: JourneyUnit]

    public init(data: Data) throws {
        let decoded = try JSONDecoder().decode(ContentPackage.self, from: data)
        try ContentValidator().validate(decoded)
        self.expressionsByID = Dictionary(uniqueKeysWithValues: decoded.expressions.map { ($0.id, $0) })
        self.unitsByID = Dictionary(uniqueKeysWithValues: decoded.units.map { ($0.id, $0) })
    }

    public func expression(id: String) throws -> Expression? {
        expressionsByID[id]
    }

    public func unit(id: String) throws -> JourneyUnit? {
        unitsByID[id]
    }

    public func expressions(in unitID: String) throws -> [Expression] {
        guard let unit = unitsByID[unitID] else { return [] }
        return unit.expressionIDs.compactMap { expressionsByID[$0] }
    }
}
