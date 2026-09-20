import Foundation

public enum LocalRecordingLibraryError: Error, Equatable, Sendable {
    case invalidLocator
}

public struct LocalRecordingSummary: Identifiable, Equatable, Sendable {
    public var id: String { recording.localLocator }
    public let recording: LearnerRecording
    public let recordedAt: Date
    public let byteCount: Int64
}

public struct LocalRecordingLibrary: Sendable {
    public let directory: URL
    public init(directory: URL) { self.directory = directory }

    public func recordings() throws -> [LocalRecordingSummary] {
        let manager = FileManager.default
        guard manager.fileExists(atPath: directory.path) else { return [] }
        let files = try manager.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil, options: [.skipsHiddenFiles])
        return files.compactMap { file -> LocalRecordingSummary? in
            guard file.pathExtension.lowercased() == "m4a",
                  let attributes = try? manager.attributesOfItem(atPath: file.path),
                  attributes[.type] as? FileAttributeType == .typeRegular else { return nil }
            return LocalRecordingSummary(
                recording: LearnerRecording(localLocator: "Recordings/" + file.lastPathComponent),
                recordedAt: attributes[.modificationDate] as? Date ?? .distantPast,
                byteCount: (attributes[.size] as? NSNumber)?.int64Value ?? 0
            )
        }.sorted {
            $0.recordedAt == $1.recordedAt ? $0.id < $1.id : $0.recordedAt > $1.recordedAt
        }
    }

    public func url(for recording: LearnerRecording) throws -> URL {
        let prefix = "Recordings/"
        guard recording.localLocator.hasPrefix(prefix) else { throw LocalRecordingLibraryError.invalidLocator }
        let name = String(recording.localLocator.dropFirst(prefix.count))
        guard !name.isEmpty, !name.contains("/"), !name.contains("\\"),
              !name.hasPrefix("."), name.lowercased().hasSuffix(".m4a") else {
            throw LocalRecordingLibraryError.invalidLocator
        }
        let candidate = directory.appendingPathComponent(name)
        let attributes = try FileManager.default.attributesOfItem(atPath: candidate.path)
        guard attributes[.type] as? FileAttributeType == .typeRegular else {
            throw LocalRecordingLibraryError.invalidLocator
        }
        return candidate
    }

    public func delete(_ recording: LearnerRecording) throws {
        try FileManager.default.removeItem(at: url(for: recording))
    }
}
