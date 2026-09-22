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

Local progress and durable failed-save retry; review queue and content-aware counts; canonical linked recall; text/choice/word-order controls; optional orientation with resume/latest result and Journey selection; Speed Drill history/pause/partial saves; dictionary and saved/root recall foundations; reference playback/recording abstractions and recording cancellation/current-session deletion.

## Ordered items

| ID | Work | Completion condition | Dependency/status |
| --- | --- | --- | --- |
| 1 | Remaining exercise presentation | Complete matching interaction using supported approved content; explicitly handle exercise types that cannot yet run. Preserve correction/mistake rules. No new AI-transfer system. | Implemented and verified: Journey matching and per-pair correction/progress |
| 2 | Recording management | Learners can find, replay and delete local recordings after leaving a session; denied microphone access has a clear recovery path. No upload. | Implemented and verified: local library, confirmed deletion and Settings recovery; device interaction remains in 11 |
| 3 | UI/accessibility completion | Consistent navigation, keyboard handling, empty/error states, VoiceOver labels, Dynamic Type, contrast and layouts. Review each relevant screen once. | Code pass compiled successfully: adaptive rows, keyboard/VoiceOver/error presentation; visual/device acceptance remains in 11 |
| 4 | Production curriculum and drill links | Review existing coverage and provenance; supply explicit approved expression mappings for unlinked legacy drills. Keep unavailable levels/features honest. | **Completed:** A1/A2/B1 teacher review applied through native-only reproducible overrides; approved drill links integrated; superseded/unsafe generated drills excluded; website remains read-only. |
| 5 | Orientation calibration | Teacher approves pilot questions, thresholds and recommended Journey starts. No CEFR-certification claim. | **Completed:** calibrated 24-question bank approved (8/8/8), 6/8 provisional threshold pinned, explicit A1/A2/B1 Journey starts implemented, all-B1-pass result framed as review + tutor assessment rather than B2 certification. |
| 6 | Production Listening/Speaking | Supply actual approved recordings and expression IDs; integrate bundled assets/listening prompts through reproducible content inputs. | Native ingestion/validation path completed: approved `.m4a` files, expression links, explicit Listening distractors and built-app file checks are enforced. Actual recordings/approval may be supplied after the text demo; Listening/Speaking remain unavailable (`În curând`) until then. |
| 7 | Production dictionary/roots/morphology | Supply approved roots, morphology, inflections, context/grammar/pragmatics; populate existing models and complete saved/root practice coverage. | Native approved-morphology ingestion and strict ID/type validation completed. Teacher-approved root/morphology data still needed; root UI stays hidden when none is supplied and does not block the text demo. |
| 8 | Audio Speed Drill | Connect the existing audio direction to actual reference playback and listening-safe prompts, without revealing the answer. | Blocked only by item 6 recordings; not required for the text demo. |
| 9 | Public identity and visual finish | Decide public name; finish app icon, launch appearance and coherent final styling. | Provisional name approved: Araba libaneza; display name configured. Cedar/conversation icon and adaptive system-background launch screen added; native build and packaged-resource checks passed; final visual/device acceptance remains |
| 10 | Release preparation | Prepare actual-behavior privacy information, App Store copy/screenshots, signing/archive and TestFlight distribution. | Romanian store copy, screenshot plan and technical privacy inventory updated; `PrivacyInfo.xcprivacy` is bundled and packaging-checked; public support contact recorded. Final privacy-policy URL, signed-build review and Apple developer/Mac access remain. |
| 11 | One full integration/release pass | Full automated checks plus real iPhone/iPad offline, restart, migration, retry, interruption, permission, accessibility and navigation tests; fix findings and retest affected areas. | Final content/build and devices |

## Demo readiness

The current text/demo build does **not** require production recordings or root/morphology data. Demo-visible scope is Acasă, Parcurs, text/choice/word-order/matching exercises, review/progress, Orientation, Smart Practice, text Speed Drill, dictionary/search/saved expressions and Profile. Listening and Speak & Compare remain visibly unavailable as `În curând`; the Roots section remains absent until approved root data exists. Do not add generated/TTS placeholder audio just to make those destinations appear available.

## Separate scope decisions — not automatic offline-v1 blockers

- Historical synthetic drill-ID progress: audit and define handling; preserve history unless a migration is explicitly chosen. New invalid entries are prevented.
- Failed writes across force-quit: a durable JSON outbox is implemented for queued progress operations. Replay uses idempotent writes. Automated verification passed in CI run 35570115698 (232 Swift tests plus native build/resource checks); real-device force-quit/relaunch verification remains in item 11. If the outbox itself cannot be written, the app does not claim that unjournaled work will survive termination.
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

- GitHub Actions currently terminates both iOS jobs before any runner steps are created (no step logs); this same infrastructure-level failure occurred on review-only commits before the production-content integration. Restore Actions/runner availability before the final automated release pass.

## Packaging verification

Icon/launch work exposed an existing XcodeGen resource declaration that did not include App/Resources in the target. Fixed in 9400dc984eec93648ecf823663d3fe448c372052. Native CI run 35569170124 passed, including a new built-app check for the display name, iPhone/iPad icon metadata, compiled launch screen and byte-identical bundled content JSON. This is packaging evidence, not a substitute for the final device launch/interaction pass.
