public struct Root: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let arabiziRadicals: [String]
    public let arabicRadicals: String?

    public init(id: String, arabiziRadicals: [String], arabicRadicals: String? = nil) {
        self.id = id
        self.arabiziRadicals = arabiziRadicals
        self.arabicRadicals = arabicRadicals
    }

    public var displayKey: String {
        arabiziRadicals.map { $0.uppercased() }.joined()
    }
}

public enum MorphologicalPatternKind: String, Codable, Equatable, Sendable {
    case verbStem
    case verbalNoun
    case participle
    case agentNoun
    case placeNoun
    case adjective
    case noun
    case plural
    case other
}

public enum PatternProductivity: String, Codable, Equatable, Sendable {
    case productive
    case limited
    case lexicalized
}

public struct MorphologicalPattern: Codable, Equatable, Sendable, Identifiable {
    public let id: String
    public let kind: MorphologicalPatternKind
    public let label: String
    public let productivity: PatternProductivity

    public init(
        id: String,
        kind: MorphologicalPatternKind,
        label: String,
        productivity: PatternProductivity = .limited
    ) {
        self.id = id
        self.kind = kind
        self.label = label
        self.productivity = productivity
    }
}

public struct MorphologyLink: Codable, Equatable, Sendable {
    public let expressionID: String
    public let rootID: String
    public let patternID: String?

    public init(expressionID: String, rootID: String, patternID: String? = nil) {
        self.expressionID = expressionID
        self.rootID = rootID
        self.patternID = patternID
    }
}

public enum InflectionRelationKind: String, Codable, Equatable, Sendable {
    case plural
    case feminine
    case dual
    case conjugatedForm
    case derivedForm
    case other
}

public struct InflectionRelation: Codable, Equatable, Sendable {
    public let sourceExpressionID: String
    public let targetExpressionID: String
    public let kind: InflectionRelationKind
    public let patternID: String?

    public init(
        sourceExpressionID: String,
        targetExpressionID: String,
        kind: InflectionRelationKind,
        patternID: String? = nil
    ) {
        self.sourceExpressionID = sourceExpressionID
        self.targetExpressionID = targetExpressionID
        self.kind = kind
        self.patternID = patternID
    }
}

public struct RootGraphNode: Codable, Equatable, Sendable, Identifiable {
    public enum Kind: String, Codable, Equatable, Sendable {
        case root
        case expression
    }

    public let id: String
    public let kind: Kind
    public let label: String
    public let patternID: String?

    public init(id: String, kind: Kind, label: String, patternID: String? = nil) {
        self.id = id
        self.kind = kind
        self.label = label
        self.patternID = patternID
    }
}

public struct RootGraphEdge: Codable, Equatable, Sendable {
    public let fromNodeID: String
    public let toNodeID: String
    public let patternID: String?

    public init(fromNodeID: String, toNodeID: String, patternID: String? = nil) {
        self.fromNodeID = fromNodeID
        self.toNodeID = toNodeID
        self.patternID = patternID
    }
}

public struct RootFamilyGraph: Codable, Equatable, Sendable {
    public let root: Root
    public let nodes: [RootGraphNode]
    public let edges: [RootGraphEdge]

    public init(root: Root, nodes: [RootGraphNode], edges: [RootGraphEdge]) {
        self.root = root
        self.nodes = nodes
        self.edges = edges
    }
}

public struct RootFamilyGraphBuilder: Sendable {
    public init() {}

    public func build(
        root: Root,
        expressionsByID: [String: Expression],
        links: [MorphologyLink]
    ) -> RootFamilyGraph {
        let rootNodeID = "root-node:\(root.id)"
        var nodes: [RootGraphNode] = [
            RootGraphNode(id: rootNodeID, kind: .root, label: root.displayKey)
        ]
        var edges: [RootGraphEdge] = []

        for link in links where link.rootID == root.id {
            guard let expression = expressionsByID[link.expressionID] else { continue }
            let nodeID = "expression-node:\(expression.id)"
            nodes.append(
                RootGraphNode(
                    id: nodeID,
                    kind: .expression,
                    label: expression.canonicalArabizi,
                    patternID: link.patternID
                )
            )
            edges.append(
                RootGraphEdge(
                    fromNodeID: rootNodeID,
                    toNodeID: nodeID,
                    patternID: link.patternID
                )
            )
        }

        return RootFamilyGraph(root: root, nodes: nodes, edges: edges)
    }
}
