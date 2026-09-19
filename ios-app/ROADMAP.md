# Native iOS completion checklist

This is a working checklist, not a claim that the app is release-ready.
Native work stays on yalla-app-ios; main is the separate live website.

## Immediate sequence

- Review queue: show scheduled expressions, reuse ReviewScheduler, launch due practice, preserve saved attempts and correction semantics.
- Close production expression-progress coverage: the current 558 imported drills have empty expressionIDs. Preserve those drills; use the existing ExerciseFactory to supplement them with canonical expression-linked recall. Never guess their linguistic links.
- M6: connect the existing orientation engine to a native pilot flow, then persist the chosen starting Journey unit.
- Finish M7–M9 learner flows and content coverage before starting M10.

## Phase ledger

| Phase | Implemented foundation | Still required |
| --- | --- | --- |
| M0 | Swift core, SwiftUI target, XcodeGen, Linux/macOS CI | Real-device and release verification |
| M1 | Reproducible imported package; 4,315 expressions, 32 units, 558 drills, 14 lexicon collections | Teacher approval/coverage audit, explicit provenance and richer content |
| M2 | Attempts, distinct mastery dimensions, SRS, local progress repository | Production-content integration and device persistence QA |
| M3 | Evaluation, correction retry, mistake preservation, native text response player | Complete appropriate choice/matching/word-order UI; audit exercise-specific presentation and unsupported types |
| M4 | Five tabs and native navigation | Accessibility, Dynamic Type, empty/error states, device UX polish |
| M5 | Adaptive selection and persistent learning signals | Confirm production expressions feed those signals; end-to-end device QA |
| M6 | Validated 24-question orientation scorer | Native flow, answer bank mapping, result-to-Journey, optional onboarding; teacher calibration |
| M7 | Speed Drill, history, progress-aware selection | Device timing/interruptions QA; audio directions depend on M8 |
| M8 | Audio resolver, playback/recording, Listening and Speak & Compare flows | Production audio and listening prompts; real-device microphone/playback/privacy QA |
| M9 | Dictionary, saved expressions, root graph, authored variants/meanings/inflections | Production approved roots/morphology/inflections, context/culture; practical saved/root recall coverage |
| M10 | Planned | Script Bridge |
| M11 | Planned | Controlled AI transfer and approved-answer evaluation |
| M12 | Planned | Accounts, sync, updates, teacher Studio; local guest progress already exists |
| M13 | Planned | Licensed media, transcripts, cultural lessons |
| M14 | Planned | Commerce; verify current Apple rules when implementing |
| M15 | Planned | Distinct tutor/creator roles and platform features |

## Content dependencies

- Production content has no audio assets, listening prompts, roots, morphology links or inflection relations. Engines/UI do not establish content availability.
- public/yalla/plus.js contains an existing 24-question orientation bank, explicitly a teacher-review pilot. Preserve its answers, variants and source references exactly if imported. Do not present it as calibrated or CEFR certification.
- Native OrientationEngine thresholds/results are already defined independently of the legacy web outcome function. Use the native engine, with pilot limitations visible.
- Teacher approval is required for new Lebanese forms, roots, morphology and pedagogical changes. Preserve Ibrahim's Arabizi.

## Release gates

- Final public name and app icon remain undecided.
- Real iPhone/iPad testing: exercise correction, queue refresh, restart persistence, recording permissions, interruptions, accessibility.
- Signing, archive, TestFlight distribution, privacy disclosures and App Store metadata.
- No automatic learner voice uploads; local/private remains default.
- No fallback sample content when production validation fails.
- No fake pronunciation scores, inferred approved morphology, or claims that planned levels are complete.

## Review notes

- Review-session exercise selection must remain frozen while persistence updates the queue.
- Queue time refresh must not reset an active player.
- Home/Profile legacy counts can include removed content IDs whereas queue rows resolve only existing expressions; unify their content-aware counts in a follow-up.
- An unsigned simulator build verifies compilation, not device interaction or release readiness.
