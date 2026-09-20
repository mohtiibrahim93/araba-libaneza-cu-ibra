# Offline v1 device and release checks

These checks require a real Mac/iPhone/iPad and approved content. They have not been performed by a successful CI build.

## Learning and saving

- Fresh install in airplane mode: production content loads, no sample fallback.
- Exercise types: text, choices and word order; wrong answer then correction; hint; manual Continue; final summary.
- Close/reopen after a successful save: attempts, mastery, reviews, mistakes, bookmarks, Journey and Speed Drill history remain.
- Inject a storage failure: pending work remains in memory, the retry notice stays visible, and retry saves once. Repeated bookmark taps preserve final intent.
- Force-quit while storage is failing: do not promise pending memory-only work survives.
- Review a due expression from Home/Profile; queue and counts update after saving. Leave the review screen open across a due boundary.
- Check rapid successive actions for missing or duplicated progress.

## Orientation

- Skip, text and choice responses; no intermediate correctness or CEFR labels.
- Close after a saved answer, reopen and continue at the next question.
- Restart the app after a saved answer; verify resume.
- Finish all 24 questions; reopen the saved result.
- Accept the recommendation; verify persisted Journey selection and navigation.
- Explicit restart replaces the orientation only, preserving lesson progress.
- A changed pilot bank rejects the previous checkpoint rather than reusing old scores.

## Speed Drill

- Pause/resume manually; background/foreground; lock/unlock; incoming call.
- Resume only after an explicit tap; paused time does not count.
- No answer is accepted after expiry.
- Leave a nonempty drill early: one partial history entry, no duplicate on return.
- Confirm visible accuracy percentage, correct/minute, streak and response-time values.

## Audio and privacy

- Use approved reference assets; validate 0.6x, 0.8x and normal playback.
- First permission request, denial, later Settings approval, and leaving while permission is unresolved.
- No late recording starts after leaving; repeated taps do not create simultaneous recordings.
- Phone call/headset interruption and backgrounding stop playback and unfinished recording.
- Finish, replay and explicitly delete a learner recording; previous session recordings remain independently addressable within that session.
- No automatic uploads. A cross-session recording library is still not implemented.

## Presentation and distribution

- VoiceOver labels and focus; large Dynamic Type; contrast; reduced motion.
- Small iPhone and iPad, portrait/landscape, keyboard covering actions, empty/error states.
- Teacher calibration and production-content review.
- Final public name, icon and screenshots.
- Developer signing, archive, install, TestFlight and final launch QA.
- Review actual app behavior for privacy and App Store disclosures at submission time.
