# iOS app workspace

This directory is the independent native iOS application workspace on the `yalla-app-ios` branch.

## Status

- `Yalla` / `yalla-app-ios` are internal placeholder names only.
- The public app name is intentionally undecided.
- This workspace is not connected to Lovable.
- The existing website remains a separate product and content source.
- Work in this directory must not be merged into `main` unless Ibrahim explicitly decides to change that policy in the future.

## Architecture principles

- Swift / SwiftUI native app direction.
- Lebanese content has stable IDs independent of learner-facing wording.
- Romanian is the initial learner interface language; additional learner languages are localization layers around the same Lebanese core.
- Learner progress must remain separate from curriculum/content updates.
- Approved Lebanese forms are authoritative; generic MSA rules must not silently replace them.

## Current implementation

The first foundation is a Swift package named `YallaCore` containing content models, localization support, JSON content loading, content-reference validation, and Swift Testing coverage.

Run core tests with:

```bash
swift test
```

An Xcode iOS application shell will be added separately; this environment can compile Swift packages but does not provide Xcode/iOS Simulator tooling.
