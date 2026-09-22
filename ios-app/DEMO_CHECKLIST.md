# Demo readiness checklist

Scope: text-first demo on `yalla-app-ios`. Production recordings and approved root/morphology data are intentionally deferred and are not demo blockers.

## Expected visible scope

- Acasă: orientation, current Journey entry point, Smart Practice, two-minute Speed Drill.
- Parcurs: reviewed A1/A2/B1 units, expression lists, matching and supported exercises.
- Practică:
  - Sesiune inteligentă — available.
  - Yalla! Două minute — available.
  - Ascultare — shown as `În curând` until approved recordings are bundled.
  - Spune și compară — shown as `În curând` until approved recordings are bundled.
- Descoperă: dictionary search, expression details, save/unsave and targeted practice.
- Rădăcini: hidden while there is no teacher-approved morphology manifest.
- Eu: local progress, orientation entry/result, recording library and tutor contact as implemented.

## Five-minute demo path

1. Launch the app with the bundled production content.
2. Acasă → De unde încep? Confirm the 24-question orientation opens without a “pilot” label.
3. Return → Parcurs → open an A1 unit → start exercises.
4. Complete one wrong-first-try + retry and one clean first-try item; confirm Continue is manual and the session can finish.
5. Practică → Yalla! Două minute → reveal/score several cards → end early → confirm the summary.
6. Descoperă → search an existing expression → open it → save it → return and confirm saved state.
7. Practică list: verify Ascultare and Spune și compară are no navigation affordance and show `În curând`.
8. Relaunch and confirm the completed progress/current Journey/saved expression remain.

## Do not demonstrate yet

- Production Listening exercises.
- Speak & Compare against a teacher reference.
- Audio Speed Drill.
- Root Explorer / morphology families.
- Any B2–C2 availability claim.
- Any account, cloud-sync or multi-device behavior.

## External dependencies before release, not before this demo

- Teacher recordings and their approval for bundling.
- Teacher-approved root/morphology/inflection data.
- Final privacy-policy URL.
- Apple signing/archive/TestFlight access.
- Real-device iPhone/iPad QA.
- Working GitHub Actions runners.

## Current CI caveat

GitHub Actions is presently creating both iOS jobs and terminating them with failure before any workflow steps are created. Treat this as an infrastructure blocker for automated verification, not as evidence of a code/test failure. Re-run the focused suite and native build once runners execute steps again.
