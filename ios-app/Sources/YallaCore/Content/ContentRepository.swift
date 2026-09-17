import Foundation

public protocol ContentRepository: Sendable {
    func expression(id: String) throws -> Expression?
    func unit(id: String) throws -> JourneyUnit?
    func exercise(id: String) throws -> ExerciseDefinition?
    func lexiconCollection(id: String) throws -> LexiconCollection?
    func expressions(in unitID: String) throws -> [Expression]
    func expressions(inLexiconCollection collectionID: String) throws -> [Expression]
    func exercises(in unitID: String) throws -> [ExerciseDefinition]
    func searchExpressions(query: String, locale: String) throws -> [Expression]
    func searchExpressions(query: String, locale: String, filter: LexiconFilter) throws -> [Expression]
    func usage(for expressionID: String) throws -> ExpressionUsage
}

public struct JSONContentRepository: ContentRepository, Sendable {
    private let expressionsByID: [String: Expression]
    private let unitsByID: [String: JourneyUnit]
    private let exercisesByID: [String: ExerciseDefinition]
    private let lexiconCollectionsByID: [String: LexiconCollection]
    private let exercisesByUnitID: [String: [ExerciseDefinition]]

    public init(data: Data) throws {
        let decoded = try JSONDecoder().decode(ContentPackage.self, from: data)
        try ContentValidator().validate(decoded)
        self.expressionsByID = Dictionary(uniqueKeysWithValues: decoded.expressions.map { ($0.id, $0) })
        self.unitsByID = Dictionary(uniqueKeysWithValues: decoded.units.map { ($0.id, $0) })
        self.exercisesByID = Dictionary(uniqueKeysWithValues: decoded.exercises.map { ($0.id, $0) })
        self.lexiconCollectionsByID = Dictionary(uniqueKeysWithValues: decoded.lexiconCollections.map { ($0.id, $0) })
        self.exercisesByUnitID = Dictionary(grouping: decoded.exercises, by: \.unitID)
    }

    public func expression(id: String) throws -> Expression? { expressionsByID[id] }
    public func unit(id: String) throws -> JourneyUnit? { unitsByID[id] }
    public func exercise(id: String) throws -> ExerciseDefinition? { exercisesByID[id] }
    public func lexiconCollection(id: String) throws -> LexiconCollection? { lexiconCollectionsByID[id] }

    public func expressions(in unitID: String) throws -> [Expression] {
        guard let unit = unitsByID[unitID] else { return [] }
        return unit.expressionIDs.compactMap { expressionsByID[$0] }
    }

    public func expressions(inLexiconCollection collectionID: String) throws -> [Expression] {
        guard let collection = lexiconCollectionsByID[collectionID] else { return [] }
        return collection.expressionIDs.compactMap { expressionsByID[$0] }
    }

    public func exercises(in unitID: String) throws -> [ExerciseDefinition] {
        exercisesByUnitID[unitID] ?? []
    }

    public func searchExpressions(query: String, locale: String) throws -> [Expression] {
        try searchExpressions(query: query, locale: locale, filter: LexiconFilter())
    }

    public func searchExpressions(query: String, locale: String, filter: LexiconFilter) throws -> [Expression] {
        let needle = normalize(query, locale: locale)
        let normalizedTopics = Set(filter.topics.map { normalize($0, locale: locale) })

        let collectionSearchTermsByExpressionID: [String: [String]] = lexiconCollectionsByID.values.reduce(into: [:]) { result, collection in
            let localization = collection.localizations[locale]
            let terms = [localization?.title, localization?.description].compactMap { $0 }
            for expressionID in collection.expressionIDs {
                result[expressionID, default: []].append(contentsOf: terms)
            }
        }

        return expressionsByID.values
            .filter { expression in
                if !filter.levels.isEmpty && filter.levels.isDisjoint(with: expression.levelTags) {
                    return false
                }
                if !normalizedTopics.isEmpty {
                    let expressionTopics = Set(expression.topics.map { normalize($0, locale: locale) })
                    if normalizedTopics.isDisjoint(with: expressionTopics) { return false }
                }
                if needle.isEmpty { return true }

                var candidates = [expression.canonicalArabizi]
                candidates.append(contentsOf: expression.variants.map(\.value))
                if let arabicScript = expression.arabicScript { candidates.append(arabicScript) }
                candidates.append(contentsOf: expression.topics)
                if let localization = expression.localizations[locale] {
                    candidates.append(localization.naturalMeaning)
                    if let literal = localization.literalMeaning { candidates.append(literal) }
                    if let pragmatic = localization.pragmaticMeaning { candidates.append(pragmatic) }
                }
                candidates.append(contentsOf: collectionSearchTermsByExpressionID[expression.id] ?? [])
                return candidates.contains { normalize($0, locale: locale).contains(needle) }
            }
            .sorted { $0.id < $1.id }
    }

    public func usage(for expressionID: String) throws -> ExpressionUsage {
        let journeyUnitIDs = unitsByID.values
            .filter { $0.expressionIDs.contains(expressionID) }
            .map(\.id)
            .sorted()
        let lexiconCollectionIDs = lexiconCollectionsByID.values
            .filter { $0.expressionIDs.contains(expressionID) }
            .map(\.id)
            .sorted()
        let exerciseIDs = exercisesByID.values
            .filter { $0.expressionIDs.contains(expressionID) }
            .map(\.id)
            .sorted()
        return ExpressionUsage(
            journeyUnitIDs: journeyUnitIDs,
            lexiconCollectionIDs: lexiconCollectionIDs,
            exerciseIDs: exerciseIDs
        )
    }

    private func normalize(_ value: String, locale: String) -> String {
        let folded = value
            .folding(options: [.caseInsensitive, .diacriticInsensitive, .widthInsensitive], locale: Locale(identifier: locale))
            .trimmingCharacters(in: .whitespacesAndNewlines)

        let scalars = folded.unicodeScalars.filter { scalar in
            let value = scalar.value
            let isArabicMark = (0x064B...0x065F).contains(value) || value == 0x0670 || (0x06D6...0x06ED).contains(value)
            return !isArabicMark
        }
        return String(String.UnicodeScalarView(scalars))
    }
}
