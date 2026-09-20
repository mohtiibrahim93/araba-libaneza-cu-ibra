import Foundation
import Testing
@testable import YallaCore

@Suite("Local recording library")
struct LocalRecordingLibraryTests {
    private func temporaryDirectory() throws -> URL {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }

    @Test("Library reopens existing recordings, orders newest first and excludes unrelated files")
    func inventory() throws {
        let root = try temporaryDirectory()
        defer { try? FileManager.default.removeItem(at: root) }
        let directory = root.appendingPathComponent("Recordings")
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        for (name, time) in [("older.m4a", 100.0), ("newer.m4a", 200.0)] {
            let file = directory.appendingPathComponent(name)
            try Data([1, 2, 3]).write(to: file)
            try FileManager.default.setAttributes([.modificationDate: Date(timeIntervalSince1970: time)], ofItemAtPath: file.path)
        }
        try Data([1]).write(to: directory.appendingPathComponent("notes.txt"))
        try FileManager.default.createDirectory(at: directory.appendingPathComponent("folder.m4a"), withIntermediateDirectories: true)
        let items = try LocalRecordingLibrary(directory: directory).recordings()
        #expect(items.map(\.id) == ["Recordings/newer.m4a", "Recordings/older.m4a"])
        #expect(items.first?.byteCount == 3)
        #expect(items.first?.recording.sharingState == .localOnly)
        try LocalRecordingLibrary(directory: directory).delete(items[0].recording)
        let reopened = try LocalRecordingLibrary(directory: directory).recordings()
        #expect(reopened.map(\.id) == ["Recordings/older.m4a"])
        #expect(FileManager.default.fileExists(atPath: directory.appendingPathComponent("notes.txt").path))
    }

    @Test("Recording deletion cannot traverse outside the recording directory or follow symbolic links")
    func rejectsUnsafeLocator() throws {
        let root = try temporaryDirectory()
        defer { try? FileManager.default.removeItem(at: root) }
        let directory = root.appendingPathComponent("Recordings")
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        let outside = root.appendingPathComponent("outside.m4a")
        try Data([7]).write(to: outside)
        try FileManager.default.createSymbolicLink(at: directory.appendingPathComponent("link.m4a"), withDestinationURL: outside)
        let library = LocalRecordingLibrary(directory: directory)
        #expect(try library.recordings().isEmpty)
        #expect(throws: LocalRecordingLibraryError.invalidLocator) {
            try library.delete(.init(localLocator: "Recordings/../outside.m4a"))
        }
        #expect(throws: LocalRecordingLibraryError.invalidLocator) {
            try library.url(for: .init(localLocator: "Recordings/link.m4a"))
        }
        #expect(FileManager.default.fileExists(atPath: outside.path))
    }

    @Test("A learner without recordings gets an empty library")
    func emptyLibrary() throws {
        let root = try temporaryDirectory()
        defer { try? FileManager.default.removeItem(at: root) }
        #expect(try LocalRecordingLibrary(directory: root.appendingPathComponent("Recordings")).recordings().isEmpty)
    }
}
