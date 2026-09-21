# Offline v1 privacy data inventory

Technical preparation, not a published privacy policy or completed App Store privacy declaration.
Source snapshot: yalla-app-ios at 27854a33602252d79ae2735d9b9117c3e49e5efb.
Scope inspected: native App Swift sources, project.yml and Package.swift.

## Observed data behavior

| Data | Purpose and location | Current user control / limit |
| --- | --- | --- |
| Attempts, mastery, review state, mistakes and reinforcement | Learning progress encoded in a local SwiftData guest-progress record | No account or multi-user selection. No full-progress reset/export control established by this review. |
| Saved expressions and current Journey selection | Stored with local progress | Expressions can be saved/unsaved; Journey selection can change. |
| Speed Drill history | Stored with local progress | Do not promise a complete history-deletion control. |
| Orientation responses and latest result | Stored with local progress for resume and recommendation | Restarting orientation replaces its current session/result; this is not a general progress reset. |
| Learner voice recordings | Local m4a files in Application Support/Recordings | User initiates recording; microphone permission required. Library supports replay and confirmed individual deletion. |
| Microphone authorization status | Checked through the system audio APIs | Denial has a Settings recovery action; text practice does not require microphone access. |

## Network and dependencies observed

- Native App sources contain no URLSession upload, analytics SDK or advertising SDK integration.
- Package.swift declares the local YallaCore library and its tests, with no external package dependencies.
- project.yml declares the local YallaCore dependency and microphone usage description; no cloud capability is configured there.
- Reference playback resolves existing local files or bundled assets. No remote reference download path is implemented in NativeAudioController.
- SwiftData uses ModelConfiguration without an explicit cloudKitDatabase setting. The inspected target does not configure CloudKit entitlements. Recheck the signed target if capabilities change.
- These observations describe the inspected implementation, not a traffic capture of the final signed binary.

## Retention and recovery limits

Saved progress and completed recordings are intended to survive app restarts. Pending progress writes that have failed remain in an in-memory retry queue; they are not guaranteed to survive force-quit.

Recording deletion removes the selected app file. Do not describe it as deletion from every device backup. Backup/restore behavior has not been validated on a device, and this review does not establish an exclusion-from-backup policy.

The app has no implemented account/cloud-sync layer. Do not promise account recovery or multi-device recovery. Do not use “never leaves your phone” in published copy without resolving operating-system backup behavior.

## Proposed user-facing explanation — factual draft

Progresul de învățare este salvat local în aplicație. Versiunea actuală nu necesită un cont și nu oferă sincronizare între dispozitive.

Dacă alegi să te înregistrezi, aplicația îți cere acces la microfon. Înregistrările sunt păstrate local și pot fi ascultate sau șterse individual din biblioteca de înregistrări. Aplicația nu include o funcție de încărcare automată a acestora pe un server.

## Still required for release

- Owner supplies the responsible entity and a real privacy/support contact.
- Owner approves and publishes the final privacy policy at an accessible URL.
- Complete App Store privacy answers against the final signed build and then-current submission questions.
- Review privacy-manifest / required-reason API requirements against the archive; no declaration or exemption is asserted here.
- Confirm permission wording, denial recovery, recording deletion and backup/restore behavior on a device.
- Revisit this inventory before adding analytics, crash-reporting SDKs, accounts, cloud sync or external media.

Evidence files: App/LearnerProgressPersistence.swift; App/LearnerProgressModel.swift; App/NativeAudioController.swift; App/RecordingLibraryView.swift; App/SpeakAndCompareView.swift; project.yml; Package.swift.
