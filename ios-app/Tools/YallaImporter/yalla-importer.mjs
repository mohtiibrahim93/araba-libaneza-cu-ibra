import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const DEFAULT_MODULES = ['content.js', 'romanian.js', 'curriculum.js', 'synthesis.js'];

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
    throw new Error('Usage: node yalla-importer.mjs --source <public/yalla> --output <file> [--level-map <file>] [--content-version <version>]');
  }

  const levelMap = args['level-map']
    ? JSON.parse(fs.readFileSync(args['level-map'], 'utf8'))
    : {};
  const yalla = loadYallaFromDirectory(args.source);
  const output = convertYallaToContentPackage(yalla, {
    contentVersion: args['content-version'] ?? 'imported',
    levelMap
  });

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
