# Approved content needed for the offline app

No new Lebanese forms, audio, roots or morphology are inferred by the app.

## Reference recordings

Provide the original recording files and identify each with an existing expression ID from App/Resources/yalla-native-content.json. Preserve the exact teacher-approved expression. Recordings must be approved for use in the app.

The existing AudioAsset model uses:
- id: stable asset identifier
- expressionID: the exact existing expression identifier
- source: ibrahimRecorded or approvedNative, according to the actual source
- locator: bundled file path

Keep originals and approval/provenance notes. A path or metadata entry alone does not make audio available; the actual file must be bundled and tested.

## Listening prompts

The existing ListeningPrompt model uses id, audioAssetID, expressionID, mode (multipleChoice or freeWrite), and revealWrittenLebaneseInitially. Identify which recorded expressions should be listening exercises. The default is no written Lebanese before listening.

## Roots, morphology and richer entries

Supply explicit teacher-reviewed root memberships, morphology relations, inflections and usage/context notes tied to existing expression IDs. Do not derive approval from similar spelling or generic MSA rules. Preserve Ibrahim's Arabizi and grammatical distinctions.

## Content integration gate

After materials arrive: validate identifiers and provenance, extend the approved importer inputs, regenerate the native bundle reproducibly, bundle recording files, rerun tests/builds, and perform listening/recording tests on device.

The current production bundle has no reference audio/listening prompts or approved root/morphology/inflection layer. Their existing UI and engines are not a substitute for these materials.
