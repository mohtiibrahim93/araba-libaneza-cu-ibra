import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const DEFAULT_MODULES = ['content.js', 'romanian.js', 'curriculum.js', 'synthesis.js'];
const DEFAULT_OVERRIDE_PATH = fileURLToPath(
  new URL('../../ContentReview/APPROVED_CONTENT_OVERRIDES.json', import.meta.url)
);

const DEFAULT_AUDIO_MANIFEST_PATH = fileURLToPath(
  new URL('../../ContentReview/APPROVED_AUDIO_CONTENT.json', import.meta.url)
);
const DEFAULT_AUDIO_RESOURCE_DIR = fileURLToPath(
  new URL('../../App/Resources', import.meta.url)
);
const DEFAULT_MORPHOLOGY_MANIFEST_PATH = fileURLToPath(
  new URL('../../ContentReview/APPROVED_MORPHOLOGY_CONTENT.json', import.meta.url)
);
const APPROVED_AUDIO_SOURCES = new Set(['approvedNative', 'ibrahimRecorded']);
const APPROVED_AUDIO_EXTENSIONS = new Set(['.m4a']);
const LISTENING_MODES = new Set(['multipleChoice', 'freeWrite']);

export function evaluateYallaSources(sources) {
  const context = {};
  context.window = context;
  vm.createContext(context);

  for (const source of sources) {
    vm.runInContext(source, context, { timeout: 5_000 });
  }

  if (!context.YALLA || typeof context.YALLA !== 'object') {
    throw new Error('Yalla source modules did not produce window.YALLA.');
  }

  return JSON.parse(JSON.stringify(context.YALLA));
}

function resolveLevel(unit, levelMap = {}) {
  const mapped = levelMap[unit.id] ?? levelMap[unit.group];
  if (mapped) return mapped;

  const group = String(unit.group ?? '').toUpperCase();
  if (group.includes('A1')) return 'a1';
  if (group.includes('A2')) return 'a2';
  if (group.includes('B1')) return 'b1';
  if (group.includes('B2')) return 'b2';
  if (group.includes('C1')) return 'c1';
  if (group.includes('C2')) return 'c2';

  throw new Error(
    `No native level mapping for unit "${unit.id}" (group "${unit.group ?? ''}"). ` +
    'Add it to the importer level map instead of guessing.'
  );
}

function isLexiconUnit(unit) {
  return String(unit.group ?? '').trim().toUpperCase() === 'VOCABULAR';
}

function localizationForCard(card) {
  const currentMeaning = String(card.ro ?? '').trim();
  const localizations = {
    ro: { naturalMeaning: currentMeaning }
  };

  if (card.lang === 'en' && currentMeaning) {
    localizations.en = { naturalMeaning: currentMeaning };
  }

  return localizations;
}

export function convertYallaToContentPackage(
  yalla,
  { contentVersion = 'imported', defaultLearnerLocale = 'ro', levelMap = {} } = {}
) {
  const cards = Array.isArray(yalla.cards) ? yalla.cards : [];
  const units = Array.isArray(yalla.units) ? yalla.units : [];
  const drills = Array.isArray(yalla.drills) ? yalla.drills : [];
  const unitsByID = new Map(units.map((unit) => [String(unit.id), unit]));

  for (const unit of units) {
    if (!isLexiconUnit(unit)) resolveLevel(unit, levelMap);
  }

  const expressions = cards.map((card) => {
    const sourceUnit = unitsByID.get(String(card.unit));
    const levelTags = sourceUnit && !isLexiconUnit(sourceUnit)
      ? [resolveLevel(sourceUnit, levelMap)]
      : [];

    return {
      id: String(card.id),
      canonicalArabizi: String(card.ar ?? ''),
      ...(card.arabicScript || card.arabic ? { arabicScript: String(card.arabicScript ?? card.arabic) } : {}),
      variants: (Array.isArray(card.variants) ? card.variants : [])
        .filter((value) => typeof value === 'string' && value.trim())
        .map((value) => ({ value: value.trim(), kind: 'spelling' })),
      levelTags,
      topics: [],
      localizations: localizationForCard(card)
    };
  });

  const expressionIDsByUnit = new Map();
  for (const card of cards) {
    if (!card.unit) continue;
    const ids = expressionIDsByUnit.get(String(card.unit)) ?? [];
    ids.push(String(card.id));
    expressionIDsByUnit.set(String(card.unit), ids);
  }

  const journeyUnits = units
    .filter((unit) => !isLexiconUnit(unit))
    .map((unit) => ({
      id: String(unit.id),
      level: resolveLevel(unit, levelMap),
      expressionIDs: expressionIDsByUnit.get(String(unit.id)) ?? [],
      localizations: {
        ro: {
          title: String(unit.title ?? unit.id),
          description: String(unit.desc ?? '')
        }
      }
    }));

  const lexiconCollections = units
    .filter(isLexiconUnit)
    .map((unit) => ({
      id: String(unit.id),
      expressionIDs: expressionIDsByUnit.get(String(unit.id)) ?? [],
      localizations: {
        ro: {
          title: String(unit.title ?? unit.id),
          description: String(unit.desc ?? '')
        }
      }
    }));

  const journeyUnitIDs = new Set(journeyUnits.map((unit) => unit.id));
  const exercises = drills.map((drill) => {
    const unitID = String(drill.unit);
    if (!journeyUnitIDs.has(unitID)) {
      throw new Error(`Exercise "${drill.id}" references non-Journey unit "${unitID}".`);
    }
    return {
      id: String(drill.id),
      type: drill.dialog ? 'dialogue-response' : 'grammar-drill',
      unitID,
      expressionIDs: Array.isArray(drill.expressionIDs) ? drill.expressionIDs.map(String) : [],
      prompt: { ro: String(drill.prompt ?? '') },
      answer: String(drill.answer ?? ''),
      wrongAnswers: (Array.isArray(drill.wrong) ? drill.wrong : []).map(String)
    };
  });

  return {
    manifest: {
      schemaVersion: 3,
      contentVersion,
      defaultLearnerLocale
    },
    expressions,
    units: journeyUnits,
    exercises,
    lexiconCollections
  };
}


export function applyApprovedNativeOverrides(contentPackage, overrideDocument = {}) {
  const expressionDirectives = overrideDocument.expressionOverrides ?? {};
  const exerciseDirectives = overrideDocument.exerciseOverrides ?? {};
  const expressionsByID = new Map(contentPackage.expressions.map((expression) => [expression.id, expression]));
  const exercisesByID = new Map(contentPackage.exercises.map((exercise) => [exercise.id, exercise]));

  for (const id of Object.keys(expressionDirectives)) {
    if (!expressionsByID.has(id)) {
      throw new Error(`Approved override references missing expression "${id}".`);
    }
  }
  for (const id of Object.keys(exerciseDirectives)) {
    if (!exercisesByID.has(id)) {
      throw new Error(`Approved override references missing exercise "${id}".`);
    }
  }

  const excludedExpressionIDs = new Set(
    Object.entries(expressionDirectives)
      .filter(([, directive]) => directive.exclude === true)
      .map(([id]) => id)
  );

  const expressions = contentPackage.expressions.flatMap((expression) => {
    const directive = expressionDirectives[expression.id];
    if (directive?.exclude === true) return [];

    const localizations = directive?.localizations
      ? Object.fromEntries(
          Object.entries(expression.localizations).map(([locale, localization]) => [
            locale,
            { ...localization, ...(directive.localizations[locale] ?? {}) }
          ])
        )
      : expression.localizations;

    return [{
      ...expression,
      ...(directive?.canonicalArabizi !== undefined
        ? { canonicalArabizi: String(directive.canonicalArabizi) }
        : {}),
      ...(directive?.variants !== undefined ? { variants: directive.variants } : {}),
      localizations
    }];
  });

  const unitsByID = new Map(contentPackage.units.map((unit) => [unit.id, unit]));
  const supplementalIDsByUnit = new Map();
  for (const raw of overrideDocument.unitExpressionAdditions ?? []) {
    const id = String(raw.id ?? '').trim();
    const unitID = String(raw.unitID ?? '').trim();
    const arabizi = String(raw.canonicalArabizi ?? '').trim();
    const meaning = String(raw.localizations?.ro?.naturalMeaning ?? '').trim();
    const unit = unitsByID.get(unitID);
    if (!id) throw new Error('Approved unit expression addition is missing an id.');
    if (expressionsByID.has(id) || expressions.some((expression) => expression.id === id)) {
      throw new Error(`Duplicate approved unit expression id "${id}".`);
    }
    if (!unit) throw new Error(`Approved unit expression "${id}" references missing unit "${unitID}".`);
    if (!arabizi) throw new Error(`Approved unit expression "${id}" has no Arabizi form.`);
    if (!meaning) throw new Error(`Approved unit expression "${id}" has no Romanian meaning.`);
    expressions.push({
      id,
      canonicalArabizi: arabizi,
      variants: Array.isArray(raw.variants) ? raw.variants : [],
      levelTags: [unit.level],
      topics: [],
      localizations: raw.localizations
    });
    const ids = supplementalIDsByUnit.get(unitID) ?? [];
    ids.push(id);
    supplementalIDsByUnit.set(unitID, ids);
  }

  const availableExpressionIDs = new Set(expressions.map((expression) => expression.id));
  const units = contentPackage.units.map((unit) => ({
    ...unit,
    expressionIDs: [
      ...unit.expressionIDs.filter((id) => availableExpressionIDs.has(id)),
      ...(supplementalIDsByUnit.get(unit.id) ?? [])
    ]
  }));
  const lexiconCollections = contentPackage.lexiconCollections.map((collection) => ({
    ...collection,
    expressionIDs: collection.expressionIDs.filter((id) => availableExpressionIDs.has(id))
  }));

  for (const link of contentPackage.morphologyLinks ?? []) {
    if (excludedExpressionIDs.has(link.expressionID)) {
      throw new Error(
        `Cannot exclude expression "${link.expressionID}" while it is referenced by morphology.`
      );
    }
  }
  for (const relation of contentPackage.inflectionRelations ?? []) {
    if (
      excludedExpressionIDs.has(relation.sourceExpressionID) ||
      excludedExpressionIDs.has(relation.targetExpressionID)
    ) {
      throw new Error('Cannot exclude an expression while it is referenced by an inflection relation.');
    }
  }
  for (const audio of contentPackage.audioAssets ?? []) {
    if (audio.expressionID && excludedExpressionIDs.has(audio.expressionID)) {
      throw new Error(
        `Cannot exclude expression "${audio.expressionID}" while it is referenced by audio.`
      );
    }
  }
  for (const listening of contentPackage.listeningPrompts ?? []) {
    if (excludedExpressionIDs.has(listening.expressionID)) {
      throw new Error(
        `Cannot exclude expression "${listening.expressionID}" while it is referenced by listening content.`
      );
    }
  }

  const exercises = [];
  for (const exercise of contentPackage.exercises) {
    const directive = exerciseDirectives[exercise.id];
    if (directive?.exclude === true) continue;

    const expressionIDsForExercise = (directive?.expressionIDs ?? exercise.expressionIDs).map(String);
    for (const expressionID of expressionIDsForExercise) {
      if (!availableExpressionIDs.has(expressionID)) {
        throw new Error(
          `Approved override for "${exercise.id}" references missing or excluded expression "${expressionID}".`
        );
      }
    }

    let prompt = directive?.prompt ?? exercise.prompt;
    if (typeof directive?.context === 'string' && directive.context.trim()) {
      const context = directive.context.trim();
      prompt = {
        ...prompt,
        ro: /^q(?:5[2-9]|6[01])$/.test(exercise.id)
          ? `Ce formă verbală recunoști în „${context}”?`
          : `Completează: ${context}`
      };
    }

    exercises.push({
      ...exercise,
      ...(directive?.answer !== undefined ? { answer: String(directive.answer) } : {}),
      ...(directive?.wrongAnswers !== undefined
        ? { wrongAnswers: directive.wrongAnswers.map(String) }
        : {}),
      expressionIDs: expressionIDsForExercise,
      prompt
    });
  }

  return { ...contentPackage, expressions, units, exercises, lexiconCollections };
}

export function loadApprovedNativeOverrides(overridePath = DEFAULT_OVERRIDE_PATH) {
  if (!overridePath || !fs.existsSync(overridePath)) return {};
  const parsed = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
  if (parsed.formatVersion !== 1) {
    throw new Error(`Unsupported approved override format version "${parsed.formatVersion}".`);
  }
  return parsed;
}


function indexedResourceFiles(resourceDirectory) {
  const filesByName = new Map();
  if (!resourceDirectory || !fs.existsSync(resourceDirectory)) return filesByName;

  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile()) {
        const matches = filesByName.get(entry.name) ?? [];
        matches.push(entryPath);
        filesByName.set(entry.name, matches);
      }
    }
  };

  visit(resourceDirectory);
  return filesByName;
}

export function applyApprovedAudioContent(
  contentPackage,
  audioDocument = {},
  { resourceDirectory = DEFAULT_AUDIO_RESOURCE_DIR, verifyFiles = true } = {}
) {
  const assetDirectives = Array.isArray(audioDocument.audioAssets)
    ? audioDocument.audioAssets
    : [];
  const promptDirectives = Array.isArray(audioDocument.listeningPrompts)
    ? audioDocument.listeningPrompts
    : [];

  if (assetDirectives.length === 0 && promptDirectives.length === 0) {
    return contentPackage;
  }

  const expressionsByID = new Map(
    contentPackage.expressions.map((expression) => [expression.id, expression])
  );
  const defaultLocale = contentPackage.manifest.defaultLearnerLocale;
  const resourceFiles = verifyFiles ? indexedResourceFiles(resourceDirectory) : new Map();

  const audioAssets = [];
  const audioByID = new Map();

  for (const raw of assetDirectives) {
    const id = String(raw.id ?? '').trim();
    const expressionID = String(raw.expressionID ?? '').trim();
    const source = String(raw.source ?? '').trim();
    const locator = String(raw.locator ?? '').trim();

    if (!id) throw new Error('Approved audio asset is missing an id.');
    if (audioByID.has(id)) throw new Error('Duplicate approved audio asset id "' + id + '".');
    if (!expressionID || !expressionsByID.has(expressionID)) {
      throw new Error('Approved audio asset "' + id + '" references missing expression "' + expressionID + '".');
    }
    if (!APPROVED_AUDIO_SOURCES.has(source)) {
      throw new Error(
        'Approved audio asset "' + id + '" uses non-production source "' + source +
        '". Only approvedNative and ibrahimRecorded are accepted here.'
      );
    }
    if (
      !locator ||
      locator !== path.basename(locator) ||
      !APPROVED_AUDIO_EXTENSIONS.has(path.extname(locator).toLowerCase())
    ) {
      throw new Error(
        'Approved audio asset "' + id +
        '" must use a unique .m4a filename locator, not a path or URL.'
      );
    }

    if (verifyFiles) {
      const matches = resourceFiles.get(locator) ?? [];
      if (matches.length === 0) {
        throw new Error(
          'Approved audio asset "' + id + '" is missing bundled source file "' + locator + '".'
        );
      }
      if (matches.length > 1) {
        throw new Error(
          'Approved audio locator "' + locator +
          '" is ambiguous in App/Resources; filenames must be unique.'
        );
      }
    }

    const asset = { id, expressionID, source, locator };
    audioAssets.push(asset);
    audioByID.set(id, asset);
  }

  const listeningPrompts = [];
  const promptIDs = new Set();

  for (const raw of promptDirectives) {
    const id = String(raw.id ?? '').trim();
    const audioAssetID = String(raw.audioAssetID ?? '').trim();
    const expressionID = String(raw.expressionID ?? '').trim();
    const mode = String(raw.mode ?? '').trim();
    const choiceExpressionIDs = Array.isArray(raw.choiceExpressionIDs)
      ? raw.choiceExpressionIDs.map(String)
      : [];
    const revealWrittenLebaneseInitially = raw.revealWrittenLebaneseInitially === true;

    if (!id) throw new Error('Approved listening prompt is missing an id.');
    if (promptIDs.has(id)) throw new Error('Duplicate approved listening prompt id "' + id + '".');
    promptIDs.add(id);

    const audio = audioByID.get(audioAssetID);
    if (!audio) {
      throw new Error(
        'Approved listening prompt "' + id +
        '" references missing audio asset "' + audioAssetID + '".'
      );
    }
    if (!expressionsByID.has(expressionID)) {
      throw new Error(
        'Approved listening prompt "' + id +
        '" references missing expression "' + expressionID + '".'
      );
    }
    if (audio.expressionID !== expressionID) {
      throw new Error(
        'Approved listening prompt "' + id +
        '" mismatches audio expression "' + audio.expressionID +
        '" and prompt expression "' + expressionID + '".'
      );
    }
    if (!LISTENING_MODES.has(mode)) {
      throw new Error(
        'Approved listening prompt "' + id +
        '" uses unsupported mode "' + mode + '".'
      );
    }

    if (mode === 'multipleChoice') {
      const uniqueChoices = new Set(choiceExpressionIDs);
      if (
        choiceExpressionIDs.length < 2 ||
        choiceExpressionIDs.length > 3 ||
        uniqueChoices.size !== choiceExpressionIDs.length ||
        uniqueChoices.has(expressionID)
      ) {
        throw new Error(
          'Approved multiple-choice listening prompt "' + id +
          '" must list 2-3 unique distractor expression IDs, excluding its target.'
        );
      }

      const meanings = new Set();
      const targetMeaning = expressionsByID.get(expressionID)?.localizations?.[defaultLocale]?.naturalMeaning;
      if (targetMeaning) meanings.add(String(targetMeaning).trim().toLocaleLowerCase());

      for (const choiceID of choiceExpressionIDs) {
        const choice = expressionsByID.get(choiceID);
        if (!choice) {
          throw new Error(
            'Approved listening prompt "' + id +
            '" references missing choice expression "' + choiceID + '".'
          );
        }
        const meaning = choice.localizations?.[defaultLocale]?.naturalMeaning;
        if (!meaning) {
          throw new Error(
            'Approved listening choice "' + choiceID +
            '" has no "' + defaultLocale + '" meaning.'
          );
        }
        const normalizedMeaning = String(meaning).trim().toLocaleLowerCase();
        if (meanings.has(normalizedMeaning)) {
          throw new Error(
            'Approved listening prompt "' + id + '" contains duplicate visible meanings.'
          );
        }
        meanings.add(normalizedMeaning);
      }
    } else if (choiceExpressionIDs.length > 0) {
      throw new Error(
        'Approved free-write listening prompt "' + id +
        '" must not define choiceExpressionIDs.'
      );
    }

    listeningPrompts.push({
      id,
      audioAssetID,
      expressionID,
      mode,
      choiceExpressionIDs,
      revealWrittenLebaneseInitially
    });
  }

  return { ...contentPackage, audioAssets, listeningPrompts };
}

export function loadApprovedAudioContent(audioManifestPath = DEFAULT_AUDIO_MANIFEST_PATH) {
  if (!audioManifestPath || !fs.existsSync(audioManifestPath)) return {};
  const parsed = JSON.parse(fs.readFileSync(audioManifestPath, 'utf8'));
  if (parsed.formatVersion !== 1) {
    throw new Error(
      'Unsupported approved audio manifest format version "' + parsed.formatVersion + '".'
    );
  }
  if (parsed.approvalStatus !== 'teacher-approved') {
    throw new Error(
      'Production audio manifest must have approvalStatus "teacher-approved".'
    );
  }
  return parsed;
}

export function applyApprovedMorphologyContent(contentPackage, morphologyDocument = {}) {
  const supplementalExpressions = Array.isArray(morphologyDocument.supplementalExpressions)
    ? morphologyDocument.supplementalExpressions
    : [];
  const roots = Array.isArray(morphologyDocument.roots) ? morphologyDocument.roots : [];
  const morphologicalPatterns = Array.isArray(morphologyDocument.morphologicalPatterns)
    ? morphologyDocument.morphologicalPatterns
    : [];
  const morphologyLinks = Array.isArray(morphologyDocument.morphologyLinks)
    ? morphologyDocument.morphologyLinks
    : [];
  const inflectionRelations = Array.isArray(morphologyDocument.inflectionRelations)
    ? morphologyDocument.inflectionRelations
    : [];

  if (
    supplementalExpressions.length === 0 &&
    roots.length === 0 &&
    morphologicalPatterns.length === 0 &&
    morphologyLinks.length === 0 &&
    inflectionRelations.length === 0
  ) {
    return contentPackage;
  }

  const existingExpressionIDs = new Set(contentPackage.expressions.map((expression) => expression.id));
  const normalizedSupplementalExpressions = [];
  const supplementalExpressionIDs = new Set();

  for (const raw of supplementalExpressions) {
    const id = String(raw.id ?? '').trim();
    const canonicalArabizi = String(raw.canonicalArabizi ?? '').trim();
    const naturalMeaning = String(raw.localizations?.ro?.naturalMeaning ?? '').trim();

    if (!id) throw new Error('Approved supplemental morphology expression is missing an id.');
    if (existingExpressionIDs.has(id) || supplementalExpressionIDs.has(id)) {
      throw new Error('Duplicate supplemental morphology expression id "' + id + '".');
    }
    if (!canonicalArabizi) {
      throw new Error('Approved supplemental morphology expression "' + id + '" has no Arabizi form.');
    }
    if (!naturalMeaning) {
      throw new Error(
        'Approved supplemental morphology expression "' + id + '" has no Romanian meaning.'
      );
    }

    const variants = (Array.isArray(raw.variants) ? raw.variants : []).map((variant) => {
      const value = String(variant?.value ?? '').trim();
      const kind = String(variant?.kind ?? '').trim();
      if (!value || !['spelling', 'pronunciation'].includes(kind)) {
        throw new Error(
          'Approved supplemental morphology expression "' + id +
          '" has an invalid variant.'
        );
      }
      return { value, kind };
    });

    normalizedSupplementalExpressions.push({
      id,
      canonicalArabizi,
      ...(raw.arabicScript ? { arabicScript: String(raw.arabicScript) } : {}),
      variants,
      levelTags: [],
      topics: [],
      localizations: {
        ro: {
          naturalMeaning,
          ...(raw.localizations?.ro?.literalMeaning
            ? { literalMeaning: String(raw.localizations.ro.literalMeaning) }
            : {}),
          ...(raw.localizations?.ro?.pragmaticMeaning
            ? { pragmaticMeaning: String(raw.localizations.ro.pragmaticMeaning) }
            : {})
        }
      }
    });
    supplementalExpressionIDs.add(id);
  }

  const expressions = [
    ...contentPackage.expressions,
    ...normalizedSupplementalExpressions
  ];
  const expressionsByID = new Map(
    expressions.map((expression) => [expression.id, expression])
  );
  const rootIDs = new Set();
  for (const root of roots) {
    const id = String(root.id ?? '').trim();
    const radicals = Array.isArray(root.arabiziRadicals)
      ? root.arabiziRadicals.map((value) => String(value).trim()).filter(Boolean)
      : [];
    if (!id) throw new Error('Approved morphology root is missing an id.');
    if (rootIDs.has(id)) throw new Error('Duplicate approved root id "' + id + '".');
    if (radicals.length < 2 || radicals.length > 4) {
      throw new Error(
        'Approved root "' + id + '" must contain 2-4 explicit Arabizi radicals.'
      );
    }
    rootIDs.add(id);
  }
  for (const root of roots) {
    for (const relatedID of Array.isArray(root.relatedRootIDs) ? root.relatedRootIDs : []) {
      if (!rootIDs.has(String(relatedID)) || String(relatedID) === String(root.id)) {
        throw new Error('Approved root "' + root.id + '" has an invalid related root "' + relatedID + '".');
      }
    }
  }

  const allowedPatternKinds = new Set([
    'verbStem', 'verbalNoun', 'participle', 'agentNoun', 'placeNoun',
    'adjective', 'noun', 'plural', 'other'
  ]);
  const allowedProductivity = new Set(['productive', 'limited', 'lexicalized']);
  const patternIDs = new Set();

  for (const pattern of morphologicalPatterns) {
    const id = String(pattern.id ?? '').trim();
    const kind = String(pattern.kind ?? '').trim();
    const productivity = String(pattern.productivity ?? '').trim();
    if (!id) throw new Error('Approved morphology pattern is missing an id.');
    if (patternIDs.has(id)) throw new Error('Duplicate approved morphology pattern id "' + id + '".');
    if (!allowedPatternKinds.has(kind)) {
      throw new Error('Approved morphology pattern "' + id + '" has unsupported kind "' + kind + '".');
    }
    if (!allowedProductivity.has(productivity)) {
      throw new Error(
        'Approved morphology pattern "' + id +
        '" has unsupported productivity "' + productivity + '".'
      );
    }
    if (!String(pattern.label ?? '').trim()) {
      throw new Error('Approved morphology pattern "' + id + '" is missing a label.');
    }
    patternIDs.add(id);
  }

  const seenLinks = new Set();
  for (const link of morphologyLinks) {
    const expressionID = String(link.expressionID ?? '').trim();
    const rootID = String(link.rootID ?? '').trim();
    const patternID = link.patternID == null ? null : String(link.patternID).trim();

    if (!expressionsByID.has(expressionID)) {
      throw new Error(
        'Approved morphology link references missing expression "' + expressionID + '".'
      );
    }
    if (!rootIDs.has(rootID)) {
      throw new Error('Approved morphology link references missing root "' + rootID + '".');
    }
    if (patternID && !patternIDs.has(patternID)) {
      throw new Error(
        'Approved morphology link references missing pattern "' + patternID + '".'
      );
    }

    const key = expressionID + '|' + rootID + '|' + (patternID ?? '');
    if (seenLinks.has(key)) {
      throw new Error('Duplicate approved morphology link "' + key + '".');
    }
    seenLinks.add(key);
  }

  const allowedRelationKinds = new Set([
    'plural', 'feminine', 'dual', 'conjugatedForm', 'derivedForm', 'other'
  ]);
  const seenRelations = new Set();

  for (const relation of inflectionRelations) {
    const sourceExpressionID = String(relation.sourceExpressionID ?? '').trim();
    const targetExpressionID = String(relation.targetExpressionID ?? '').trim();
    const kind = String(relation.kind ?? '').trim();
    const patternID = relation.patternID == null ? null : String(relation.patternID).trim();

    if (!expressionsByID.has(sourceExpressionID)) {
      throw new Error(
        'Approved inflection relation references missing source expression "' +
        sourceExpressionID + '".'
      );
    }
    if (!expressionsByID.has(targetExpressionID)) {
      throw new Error(
        'Approved inflection relation references missing target expression "' +
        targetExpressionID + '".'
      );
    }
    if (sourceExpressionID === targetExpressionID) {
      throw new Error('Approved inflection relation cannot point an expression to itself.');
    }
    if (!allowedRelationKinds.has(kind)) {
      throw new Error('Approved inflection relation uses unsupported kind "' + kind + '".');
    }
    if (patternID && !patternIDs.has(patternID)) {
      throw new Error(
        'Approved inflection relation references missing pattern "' + patternID + '".'
      );
    }

    const key =
      sourceExpressionID + '|' + targetExpressionID + '|' + kind + '|' + (patternID ?? '');
    if (seenRelations.has(key)) {
      throw new Error('Duplicate approved inflection relation "' + key + '".');
    }
    seenRelations.add(key);
  }

  return {
    ...contentPackage,
    expressions,
    roots,
    morphologicalPatterns,
    morphologyLinks,
    inflectionRelations
  };
}

export function loadApprovedMorphologyContent(
  morphologyManifestPath = DEFAULT_MORPHOLOGY_MANIFEST_PATH
) {
  if (!morphologyManifestPath || !fs.existsSync(morphologyManifestPath)) return {};
  const parsed = JSON.parse(fs.readFileSync(morphologyManifestPath, 'utf8'));
  if (parsed.formatVersion !== 1) {
    throw new Error(
      'Unsupported approved morphology manifest format version "' +
      parsed.formatVersion + '".'
    );
  }
  if (parsed.approvalStatus !== 'teacher-approved') {
    throw new Error(
      'Production morphology manifest must have approvalStatus "teacher-approved".'
    );
  }
  return parsed;
}

export function loadYallaFromDirectory(sourceDirectory, modules = DEFAULT_MODULES) {
  const sources = [];
  for (const moduleName of modules) {
    const modulePath = path.join(sourceDirectory, moduleName);
    if (fs.existsSync(modulePath)) {
      sources.push(fs.readFileSync(modulePath, 'utf8'));
    }
  }
  return evaluateYallaSources(sources);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error('Arguments must be provided as --name value pairs.');
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function runCLI() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source || !args.output) {
    throw new Error('Usage: node yalla-importer.mjs --source <public/yalla> --output <file> [--level-map <file>] [--content-version <version>] [--overrides <file>] [--audio-manifest <file>] [--audio-resources <directory>] [--morphology-manifest <file>]');
  }

  const levelMap = args['level-map']
    ? JSON.parse(fs.readFileSync(args['level-map'], 'utf8'))
    : {};
  const yalla = loadYallaFromDirectory(args.source);
  const imported = convertYallaToContentPackage(yalla, {
    contentVersion: args['content-version'] ?? 'imported',
    levelMap
  });
  const overrides = loadApprovedNativeOverrides(args.overrides ?? DEFAULT_OVERRIDE_PATH);
  const reviewed = applyApprovedNativeOverrides(imported, overrides);
  const approvedAudio = loadApprovedAudioContent(
    args['audio-manifest'] ?? DEFAULT_AUDIO_MANIFEST_PATH
  );
  const audioIntegrated = applyApprovedAudioContent(reviewed, approvedAudio, {
    resourceDirectory: args['audio-resources'] ?? DEFAULT_AUDIO_RESOURCE_DIR,
    verifyFiles: true
  });
  const approvedMorphology = loadApprovedMorphologyContent(
    args['morphology-manifest'] ?? DEFAULT_MORPHOLOGY_MANIFEST_PATH
  );
  const output = applyApprovedMorphologyContent(audioIntegrated, approvedMorphology);

  const outputPath = path.resolve(args.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    runCLI();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
