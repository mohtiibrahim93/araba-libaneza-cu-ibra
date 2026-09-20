# Native iOS completion checklist

This is a working checklist, not a claim that the app is release-ready.
Native work stays on yalla-app-ios; main is the separate live website.

## Immediate sequence

- Implemented: review queue with scheduled expressions, ReviewScheduler dates, due practice, saved attempts and preserved correction semantics.
- Implemented: canonical expression-linked recall supplements the 558 imported drills, which have empty expressionIDs. Journey, Smart Practice, saved/targeted practice and due review reuse ExerciseFactory. Legacy drills are preserved, with no guessed links.
- Implemented M6 pilot: optional Home/Profile entry, 24-question blind flow, native scoring, cancellation and persisted chosen starting Journey unit, resumable answers and the latest result. Teacher calibration and device QA remain.
- Finish M7–M9 learner flows and content coverage before starting M10.

## Phase ledger

| Phase | Implemented foundation | Still required |
| --- | --- | --- |
| M0 | Swift core, SwiftUI target, XcodeGen, Linux/macOS CI | Real-device and release verification |
| M1 | Reproducible imported package; 4,315 expressions, 32 units, 558 drills, 14 lexicon collections | Teacher approval/coverage audit, explicit provenance and richer content |
| M2 | Attempts, distinct mastery dimensions, SRS, local progress repository | Production-content integration and device persistence QA |
| M3 | Evaluation, correction retry, mistake preservation, native text, authored choice, word-order and per-expression matching controls | Dedicated transfer presentation remains later scope; device interaction QA |
| M4 | Five tabs and native navigation | Accessibility, Dynamic Type, empty/error states, device UX polish |
| M5 | Adaptive selection and persistent learning signals | Confirm production expressions feed those signals; end-to-end device QA |
| M6 | Validated scorer; exact legacy pilot bank; native optional flow; result-to-Journey; saved answers and latest result across restarts | Teacher calibration and device QA; complete historical results archive is not implemented |
| M7 | Speed Drill, history, progress-aware selection, active-time pause/resume and partial-session save | Device timing/interruptions QA; audio directions depend on M8 |
| M8 | Audio resolver, playback/recording, Listening and Speak & Compare, recording cancellation and explicit local deletion | Production audio and listening prompts; real-device microphone/playback/privacy QA |
| M9 | Dictionary, saved expressions, root graph, authored variants/meanings/inflections | Production approved roots/morphology/inflections, context/culture; practical saved/root recall coverage |
| M10 | Planned | Script Bridge |
| M11 | Planned | Controlled AI transfer and approved-answer evaluation |
| M12 | Planned | Accounts, sync, updates, teacher Studio; local guest progress already exists |
| M13 | Planned | Licensed media, transcripts, cultural lessons |
| M14 | Planned | Commerce; verify current Apple rules when implementing |
| M15 | Planned | Distinct tutor/creator roles and platform features |

## Content dependencies

- Production content has no audio assets, listening prompts, roots, morphology links or inflection relations. Engines/UI do not establish content availability.
- public/yalla/plus.js contains an existing 24-question orientation bank, explicitly a teacher-review pilot. Preserve its answers, variants and source references exactly in the imported orientation-pilot.json. An importer test verifies exact reproducibility. It is not calibrated or CEFR certification.
- Native OrientationEngine thresholds/results are already defined independently of the legacy web outcome function. Use the native engine, with pilot limitations visible.
- Teacher approval is required for new Lebanese forms, roots, morphology and pedagogical changes. Preserve Ibrahim's Arabizi.

## Release gates

- Final public name and app icon remain undecided.
- Real iPhone/iPad testing: exercise correction, queue refresh, restart persistence, recording permissions, interruptions, accessibility.
- Signing, archive, TestFlight distribution, privacy disclosures and App Store metadata.
- No automatic learner voice uploads; local/private remains default.
- No fallback sample content when production validation fails.
- No fake pronunciation scores, inferred approved morphology, or claims that planned levels are complete.

## Remaining order after this continuation

1. M3/M4/M5: device verification of the real-content learning loop, correct exercise-specific controls, persistence failure handling and queue/navigation refresh. These were previously overstated as complete.
2. M6: validate the pilot with Ibrahim, test cancellation and starting-point persistence on device. Answers and the latest result now survive successful saves and restarts. Checkpoint restoration validates the exact pilot bank; outdated or invalid checkpoints require a new orientation.
3. M7: verify timed drill foreground/background and interruption behavior on device.
4. M8: supply reference recordings/listening prompts, then verify playback, permissions, recording and local-only privacy.
5. M9: add explicit approved roots/morphology/inflections, contextual meanings and culture. Dictionary/saved/root practice can now use canonical recall where no authored linked exercise exists.
6. Complete branding, accessibility and TestFlight gates before calling the offline v1 ready. M10–M15 remain future work.

## Review notes

- Review-session exercise selection must remain frozen while persistence updates the queue.
- Queue time refresh must not reset an active player.
- Home/Profile review counts now include only current content IDs, matching resolved queue rows. Both refresh every 30 seconds using the existing scheduler; historical records remain unchanged.
- An unsigned simulator build verifies compilation, not device interaction or release readiness.

- Native session persistence now requires an explicit expression link that resolves in the content. Unlinked legacy drills retain session feedback but create no new synthetic expression mastery/SRS records. Historical synthetic drill-ID records are preserved; a content-aware audit/migration remains follow-up work.
- Choice and word-order controls preserve correction retries and initial mistakes; unsupported dedicated types fail session preflight explicitly.

- Persistence recovery implemented: learner actions drain through one ordered queue; failed operations remain pending and have an explicit retry banner. Stable attempt IDs and explicit bookmark values prevent duplicate credit or inverted toggles on retry. The pending queue is memory-only; failed saves cannot be promised across force-quit or process termination.

## Latest completion work

- M6 checkpoints use progress schema v5. Older snapshots migrate without discarding attempts, bookmarks, Journey position or drill history. Only the latest orientation is retained, and it never awards mastery/SRS credit.
- M7 pauses on inactive/background transitions and requires explicit resume. Paused time is excluded from response time and drill duration. Navigating away ends and saves a nonempty partial session. Accuracy now renders a percentage.
- M8 permission completions are invalidated when canceled; repeated permission requests are blocked. Listening playback stops on interruption. Unfinished recordings are canceled when leaving or interrupting Speak & Compare; the learner can explicitly delete completed recordings from the current session.
- Native recording files are local. A cross-session library is now available from Profile and Speak & Compare, with replay and confirmed deletion. Real-device AVAudioSession permission/interruption tests remain mandatory.
- Independent review could not run because the reviewer hit its usage limit. Changes received direct code review plus core/importer tests and native build validation.

## Next release pass

1. Run the device checklist in RELEASE_CHECKLIST.md, including forced storage failure, permission denial, backgrounding and rotation. CI builds do not replace device interaction checks.
2. Supply approved reference recordings and explicit audio-to-expression mappings; supply reviewed roots/morphology only where authored. CONTENT_HANDOFF.md lists the existing fields.
3. Resolve any device findings, finish accessibility and visual polish, then finalize name/icon, signing and TestFlight.
4. Do not label M6–M9 or the offline release complete until these gates pass. M10–M15 remain outside this offline-v1 pass.

- Matching is available from Journey unit details using up to six existing, unambiguous expression/meaning pairs. Each completed pair records recognition for its own expression, preserves initial mistakes/hints, rejects duplicate taps, and must be corrected before the whole board can advance. Missing/ambiguous authored boards fail preflight. No production content JSON or mastery/SRS rules changed.

- Recording management uses the existing local files, including recordings made before the library UI existed. Only regular m4a files in the Recordings directory can be replayed/deleted; path traversal and symbolic links are rejected. Microphone denial has a Settings recovery action. Device verification remains in the final release pass.
