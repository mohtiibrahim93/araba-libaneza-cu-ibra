# Approved content needed after the text demo

The text-first demo does not require production recordings or root/morphology data. These inputs can be supplied later without changing the website source.

No new Lebanese forms, audio, roots or morphology are inferred by the app.

## Reference recordings

Provide the original recording files and identify each with an existing expression ID from `App/Resources/yalla-native-content.json`. Preserve the exact teacher-approved expression. Recordings must be approved for use in the app.

Production audio ingestion is native-only and reproducible. Each approved asset uses:
- `id`: stable asset identifier;
- `expressionID`: exact existing expression identifier;
- `source`: `ibrahimRecorded` or `approvedNative`;
- `locator`: one unique bundled `.m4a` filename.

The importer rejects:
- missing expression IDs;
- missing physical files;
- paths/URLs instead of a bundled filename;
- duplicate/ambiguous filenames;
- unapproved audio-source types.

Keep originals and approval/provenance notes. Metadata alone does not make audio available; the actual `.m4a` file must be bundled and is checked again in the built `.app`.

The first practical teacher batch remains in `ContentReview/RECORDING_BATCH_01.md`.

## Listening prompts

Approved Listening content is supplied through the native audio manifest after recordings exist.

Each prompt uses:
- `id`;
- `audioAssetID`;
- `expressionID`;
- `mode`: `multipleChoice` or `freeWrite`;
- `choiceExpressionIDs`: for multiple choice, exactly 2–3 explicitly approved distractor expression IDs;
- `revealWrittenLebaneseInitially`: normally `false`.

The target expression and audio asset must match. Multiple-choice distractors are never generated from arbitrary dictionary entries anymore. Free-write prompts must not define distractors.

Until at least one valid approved prompt and its real recording are bundled, **Ascultare** remains `În curând`.

## Speak & Compare

Speaking becomes available automatically only when at least one expression has a valid expression-linked reference recording. Learner recordings remain local and are not automatically uploaded.

Until a real approved reference exists, **Spune și compară** remains `În curând`.

## Roots, morphology and richer entries

Approved morphology is also native-only and reproducible. Supply explicit teacher-reviewed data tied to existing expression IDs:

- `roots`: stable root ID plus explicit Arabizi radicals and optional Arabic radicals;
- `morphologicalPatterns`: stable ID, kind, label, productivity;
- `morphologyLinks`: expression → root, optionally with an approved pattern;
- `inflectionRelations`: explicit source expression → target expression with relation kind and optional pattern.

The importer validates all IDs and supported types. It does **not** derive a root from spelling, generic MSA morphology or semantic similarity.

While no approved root data is supplied, the Roots section stays absent from Discover. This does not block the text demo.

## Demo-safe behavior before these materials arrive

The current demo scope remains:
- Acasă;
- Parcurs A1/A2/B1;
- supported text/choice/word-order/matching exercises;
- review/progress;
- Orientation;
- Smart Practice;
- text Speed Drill;
- dictionary/search/saved expressions;
- Profile.

Do not add generated/TTS placeholder recordings just to make audio destinations appear available.

## Integration gate after materials arrive

1. Validate expression IDs and teacher approval/provenance.
2. Convert recordings to unique app-ready `.m4a` files while keeping originals.
3. Add the approved native audio and/or morphology manifest.
4. Regenerate `yalla-native-content.json` through the importer.
5. Bundle the recording files.
6. Run importer/core tests and native build/resource verification.
7. Perform real-device listening/playback/microphone/interruption checks.

Website `public/yalla/**` remains read-only throughout this flow.
