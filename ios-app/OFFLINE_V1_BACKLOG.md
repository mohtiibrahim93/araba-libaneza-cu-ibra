# Offline v1 remaining work — ordered backlog

This is the single execution order for known remaining work, based on the branch at 9251ff011e0448ebd82178303c12e77129308c01. It is not a claim that a final integration audit cannot uncover defects.

## Working agreement

- Complete one numbered item at a time; report its outcome and move directly to the next unblocked item.
- Inspect and test code related to that item. Do not repeatedly audit completed phases or rerun broad checks for unrelated edits.
- Let mandatory CI run; do not start redundant full-suite runs or poll every small edit. Reserve the full cross-feature/device/release audit for item 11.
- Record newly found unrelated issues here rather than interrupting the active task.
- Keep code, supplied content and release-access dependencies distinct.
- Work only on yalla-app-ios; no main merges/rebases, website edits, .env access or invented Lebanese content.

## Already implemented — do not rebuild

Local progress and failed-save retry; review queue and content-aware counts; canonical linked recall; text/choice/word-order controls; optional orientation with resume/latest result and Journey selection; Speed Drill history/pause/partial saves; dictionary and saved/root recall foundations; reference playback/recording abstractions and recording cancellation/current-session deletion.

## Ordered items

| ID | Work | Completion condition | Dependency/status |
| --- | --- | --- | --- |
| 1 | Remaining exercise presentation | Complete matching interaction using supported approved content; explicitly handle exercise types that cannot yet run. Preserve correction/mistake rules. No new AI-transfer system. | Implemented and verified: Journey matching and per-pair correction/progress |
| 2 | Recording management | Learners can find, replay and delete local recordings after leaving a session; denied microphone access has a clear recovery path. No upload. | Implemented and verified: local library, confirmed deletion and Settings recovery; device interaction remains in 11 |
| 3 | UI/accessibility completion | Consistent navigation, keyboard handling, empty/error states, VoiceOver labels, Dynamic Type, contrast and layouts. Review each relevant screen once. | Code pass compiled successfully: adaptive rows, keyboard/VoiceOver/error presentation; visual/device acceptance remains in 11 |
| 4 | Production curriculum and drill links | Review existing coverage and provenance; supply explicit approved expression mappings for unlinked legacy drills. Keep unavailable levels/features honest. | Inventory/review sheets prepared in ContentReview; teacher decisions needed |
| 5 | Orientation calibration | Teacher approves pilot questions, thresholds and recommended Journey starts. No CEFR-certification claim. | ORIENTATION_REVIEW.md prepared; teacher approval/calibration pending |
| 6 | Production Listening/Speaking | Supply actual approved recordings and expression IDs; integrate bundled assets/listening prompts through reproducible content inputs. | RECORDING_BATCH_01.md prepared from existing content; actual recordings/approval needed |
| 7 | Production dictionary/roots/morphology | Supply approved roots, morphology, inflections, context/grammar/pragmatics; populate existing models and complete saved/root practice coverage. | Approved materials needed |
| 8 | Audio Speed Drill | Connect the existing audio direction to actual reference playback and listening-safe prompts, without revealing the answer. | Item 6 |
| 9 | Public identity and visual finish | Decide public name; finish app icon, launch appearance and coherent final styling. | Name/design decision; implementation follows |
| 10 | Release preparation | Prepare actual-behavior privacy information, App Store copy/screenshots, signing/archive and TestFlight distribution. | Apple developer/Mac access and final identity |
| 11 | One full integration/release pass | Full automated checks plus real iPhone/iPad offline, restart, migration, retry, interruption, permission, accessibility and navigation tests; fix findings and retest affected areas. | Final content/build and devices |

## Separate scope decisions — not automatic offline-v1 blockers

- Historical synthetic drill-ID progress: audit and define handling; preserve history unless a migration is explicitly chosen. New invalid entries are prevented.
- Failed writes across force-quit: current retry queue survives only while the process stays alive. A durable outbox would be an additional reliability feature; do not claim it exists.
- Orientation: only the latest session/result is retained; a full historical results archive is optional.
- First-launch welcome/onboarding presentation: current orientation is optional from Home/Profile. An automatic welcome walkthrough is a separate UX choice.
- Extra fluency content beyond the approved launch curriculum requires teacher materials; audio fluency is item 8.

## Later phases, outside offline v1

M10 Script Bridge; M11 controlled AI transfer; M12 accounts/multiple users/cloud sync/content updates/teacher Studio; M13 licensed media/transcripts/cultural lessons; M14 commerce/payments; M15 tutor/creator platform.

Detailed device scenarios: RELEASE_CHECKLIST.md.
Exact existing audio/content fields: CONTENT_HANDOFF.md.
Phase history and implemented foundations: ROADMAP.md.

## Findings carried forward to the final interaction pass

- Dictionary reference playback currently stops on leaving its screen; explicitly confirm background/audio-interruption behavior alongside the other audio screens.
- Accessibility changes are code-reviewed and compiled, not visually or interactively certified. Confirm readable layouts, keyboard reachability and VoiceOver navigation on real iPhone/iPad sizes.
