import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const DEFAULT_MODULES = ['content.js', 'romanian.js', 'curriculum.js', 'synthesis.js'];
const DEFAULT_OVERRIDE_PATH = fileURLToPath(
  new URL('../../ContentReview/APPROVED_CONTENT_OVERRIDES.json', import.meta.url)
);

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

  const availableExpressionIDs = new Set(expressions.map((expression) => expression.id));
  const units = contentPackage.units.map((unit) => ({
    ...unit,
    expressionIDs: unit.expressionIDs.filter((id) => availableExpressionIDs.has(id))
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
    throw new Error('Usage: node yalla-importer.mjs --source <public/yalla> --output <file> [--level-map <file>] [--content-version <version>] [--overrides <file>]');
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
  const output = applyApprovedNativeOverrides(imported, overrides);

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
