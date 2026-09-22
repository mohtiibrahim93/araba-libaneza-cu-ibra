import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyApprovedAudioContent, applyApprovedNativeOverrides, convertYallaToContentPackage, evaluateYallaSources, loadApprovedNativeOverrides, loadYallaFromDirectory } from '../yalla-importer.mjs';

test('evaluates Yalla data modules in a read-only isolated window context', () => {
  const data = evaluateYallaSources([
    'window.YALLA = {"cards":[{"id":"c1","unit":"u1","ar":"mar7aba","ro":"salut","variants":[]}],"units":[{"id":"u1","title":"Saluturi","desc":"Începe aici","group":"A1"}],"drills":[]};',
    'window.YALLA.cards[0].variants.push("marhaba");'
  ]);

  assert.equal(data.cards[0].ar, 'mar7aba');
  assert.deepEqual(data.cards[0].variants, ['marhaba']);
});

test('converts cards and Journey units while preserving stable IDs and legacy variants', () => {
  const yalla = {
    cards: [
      { id: 'card-hello', unit: 'a1-welcome', ar: 'mar7aba', ro: 'salut', variants: ['marhaba'] },
      { id: 'card-water', unit: 'a1-welcome', ar: 'mayy', ro: 'apă', variants: [] }
    ],
    units: [
      { id: 'a1-welcome', title: 'Saluturi', desc: 'Învață să saluți.', group: 'A1' }
    ],
    drills: []
  };

  const result = convertYallaToContentPackage(yalla, { contentVersion: 'test' });

  assert.equal(result.manifest.schemaVersion, 3);
  assert.equal(result.expressions[0].id, 'card-hello');
  assert.equal(result.expressions[0].canonicalArabizi, 'mar7aba');
  assert.deepEqual(result.expressions[0].variants, [{ value: 'marhaba', kind: 'spelling' }]);
  assert.deepEqual(result.expressions[0].levelTags, ['a1']);
  assert.deepEqual(result.units[0].expressionIDs, ['card-hello', 'card-water']);
  assert.equal(result.units[0].localizations.ro.title, 'Saluturi');
});

test('converts explicit grammar and dialogue drills', () => {
  const yalla = {
    cards: [],
    units: [
      { id: 'a1-dialogue', title: 'Dialog', desc: '', group: 'A1' }
    ],
    drills: [
      { id: 'd1', unit: 'a1-dialogue', prompt: 'Completează', answer: 'baddé', wrong: ['baddak'], dialog: false },
      { id: 'd2', unit: 'a1-dialogue', prompt: 'Răspunde natural', answer: 'mar7aba', wrong: ['bye'], dialog: true }
    ]
  };

  const result = convertYallaToContentPackage(yalla, { contentVersion: 'test' });

  assert.equal(result.exercises[0].type, 'grammar-drill');
  assert.equal(result.exercises[1].type, 'dialogue-response');
  assert.deepEqual(result.exercises[1].prompt, { ro: 'Răspunde natural' });
});


test('applies approved native overrides without modifying legacy source data', () => {
  const source = {
    cards: [
      { id: 'card-hello', unit: 'a1-dialogue', ar: 'mar7aba', ro: 'salut', variants: [] }
    ],
    units: [
      { id: 'a1-dialogue', title: 'Dialog', desc: '', group: 'A1' }
    ],
    drills: [
      {
        id: 'd1',
        unit: 'a1-dialogue',
        prompt: 'Rezolvă provocarea.',
        answer: 'legacy',
        wrong: ['x'],
        context: 'legacy context'
      },
      {
        id: 'd2',
        unit: 'a1-dialogue',
        prompt: 'Răspunde',
        answer: 'keep',
        wrong: ['y']
      }
    ]
  };

  const imported = convertYallaToContentPackage(source, { contentVersion: 'test' });
  const result = applyApprovedNativeOverrides(imported, {
    expressionOverrides: {
      'card-hello': {
        canonicalArabizi: 'approved',
        localizations: { ro: { naturalMeaning: 'formă aprobată' } }
      }
    },
    exerciseOverrides: {
      d1: {
        answer: 'approved',
        context: 'Approved ___ context.',
        expressionIDs: ['card-hello']
      },
      d2: { exclude: true }
    }
  });

  assert.equal(source.cards[0].ar, 'mar7aba');
  assert.equal(source.drills[0].answer, 'legacy');
  assert.equal(result.expressions[0].canonicalArabizi, 'approved');
  assert.equal(result.expressions[0].localizations.ro.naturalMeaning, 'formă aprobată');
  assert.equal(result.exercises.length, 1);
  assert.equal(result.exercises[0].answer, 'approved');
  assert.equal(result.exercises[0].prompt.ro, 'Completează: Approved ___ context.');
  assert.deepEqual(result.exercises[0].expressionIDs, ['card-hello']);
});

test('refuses stale approved overrides and missing expression links', () => {
  const imported = {
    manifest: { schemaVersion: 3, contentVersion: 'test', defaultLearnerLocale: 'ro' },
    expressions: [{ id: 'e1' }],
    units: [],
    exercises: [
      {
        id: 'd1',
        type: 'grammar-drill',
        unitID: 'u1',
        expressionIDs: [],
        prompt: { ro: 'Prompt' },
        answer: 'answer',
        wrongAnswers: []
      }
    ],
    lexiconCollections: []
  };

  assert.throws(
    () => applyApprovedNativeOverrides(imported, {
      exerciseOverrides: { missing: { answer: 'x' } }
    }),
    /missing exercise/
  );
  assert.throws(
    () => applyApprovedNativeOverrides(imported, {
      exerciseOverrides: { d1: { expressionIDs: ['missing-expression'] } }
    }),
    /missing expression/
  );
});


test('real approved overrides produce the reviewed native course decisions', () => {
  const sourceDirectory = fileURLToPath(new URL('../../../../public/yalla', import.meta.url));
  const imported = convertYallaToContentPackage(
    loadYallaFromDirectory(sourceDirectory),
    { contentVersion: 'test' }
  );
  const result = applyApprovedNativeOverrides(imported, loadApprovedNativeOverrides());
  const exercises = new Map(result.exercises.map((exercise) => [exercise.id, exercise]));

  assert.equal(result.exercises.length, imported.exercises.length - 16);
  assert.equal(exercises.get('q76').answer, 'Eza baddak bjiblak mayy.');
  assert.equal(
    exercises.get('q43').prompt.ro,
    'Completează: Es-sabe yalle 3am yedros huwwe 5ayye.'
  );
  assert.equal(
    exercises.get('q52').prompt.ro,
    'Ce formă verbală recunoști în „5arrab”?'
  );
  assert.deepEqual(exercises.get('q31').expressionIDs, ['c977d2bfb47db']);
  assert.equal(
    exercises.get('syn-context-syn-b070e7525663').answer,
    'Addesh sarlak 3am teshte8el huniik?'
  );
  assert.equal(exercises.has('syn-context-syn-9a79f6640456'), false);

  const expressions = new Map(result.expressions.map((expression) => [expression.id, expression]));
  assert.equal(expressions.get('c5987c363bf91').canonicalArabizi, 'Eza baddak bjiblak mayy.');
  assert.equal(
    expressions.get('syn-b070e7525663').canonicalArabizi,
    'Addesh sarlak 3am teshte8el huniik?'
  );
  assert.equal(expressions.has('syn-9a79f6640456'), false);
  assert.equal(
    result.units.some((unit) => unit.expressionIDs.includes('syn-9a79f6640456')),
    false
  );
});

test('approved audio content requires bundled files and explicit distractors', () => {
  const resourceDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'yalla-approved-audio-'));
  const nested = path.join(resourceDirectory, 'ReferenceAudio');
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(path.join(nested, 'expr.hello.m4a'), 'fixture');

  const contentPackage = {
    manifest: { schemaVersion: 3, contentVersion: 'test', defaultLearnerLocale: 'ro' },
    expressions: [
      { id: 'expr.hello', localizations: { ro: { naturalMeaning: 'salut' } } },
      { id: 'expr.thanks', localizations: { ro: { naturalMeaning: 'mulțumesc' } } },
      { id: 'expr.please', localizations: { ro: { naturalMeaning: 'te rog' } } }
    ],
    units: [],
    exercises: [],
    lexiconCollections: []
  };

  try {
    const result = applyApprovedAudioContent(
      contentPackage,
      {
        audioAssets: [
          {
            id: 'audio.expr.hello',
            expressionID: 'expr.hello',
            source: 'ibrahimRecorded',
            locator: 'expr.hello.m4a'
          }
        ],
        listeningPrompts: [
          {
            id: 'listen.expr.hello',
            audioAssetID: 'audio.expr.hello',
            expressionID: 'expr.hello',
            mode: 'multipleChoice',
            choiceExpressionIDs: ['expr.thanks', 'expr.please'],
            revealWrittenLebaneseInitially: false
          }
        ]
      },
      { resourceDirectory }
    );

    assert.equal(result.audioAssets[0].source, 'ibrahimRecorded');
    assert.deepEqual(
      result.listeningPrompts[0].choiceExpressionIDs,
      ['expr.thanks', 'expr.please']
    );

    assert.throws(
      () => applyApprovedAudioContent(
        contentPackage,
        {
          audioAssets: [
            {
              id: 'audio.expr.hello',
              expressionID: 'expr.hello',
              source: 'ibrahimRecorded',
              locator: 'missing.m4a'
            }
          ]
        },
        { resourceDirectory }
      ),
      /missing bundled source file/
    );

    assert.throws(
      () => applyApprovedAudioContent(
        contentPackage,
        {
          audioAssets: [
            {
              id: 'audio.expr.hello',
              expressionID: 'expr.hello',
              source: 'ibrahimRecorded',
              locator: 'expr.hello.m4a'
            }
          ],
          listeningPrompts: [
            {
              id: 'listen.expr.hello',
              audioAssetID: 'audio.expr.hello',
              expressionID: 'expr.hello',
              mode: 'multipleChoice'
            }
          ]
        },
        { resourceDirectory }
      ),
      /must list 2-3 unique distractor/
    );
  } finally {
    fs.rmSync(resourceDirectory, { recursive: true, force: true });
  }
});

test('converts the cross-level vocabulary track into lexicon collections, not Journey levels', () => {
  const yalla = {
    cards: [
      { id: 'word-bird', unit: 'v-nature', ar: '3asfour', ro: 'pasăre', variants: [] }
    ],
    units: [{ id: 'v-nature', title: 'Natura', desc: 'Animale și natură', group: 'Vocabular' }],
    drills: []
  };

  const result = convertYallaToContentPackage(yalla, { contentVersion: 'test' });

  assert.equal(result.units.length, 0);
  assert.equal(result.lexiconCollections[0].id, 'v-nature');
  assert.deepEqual(result.lexiconCollections[0].expressionIDs, ['word-bird']);
  assert.deepEqual(result.expressions[0].levelTags, []);
});

test('refuses an unknown curriculum group instead of silently inventing a level', () => {
  const yalla = {
    cards: [],
    units: [{ id: 'mystery', title: 'Mystery', desc: '', group: 'Unknown Track' }],
    drills: []
  };

  assert.throws(
    () => convertYallaToContentPackage(yalla, { contentVersion: 'test' }),
    /No native level mapping/
  );
});

// Keep the separate pilot resource reproducible from its legacy source.
import './orientation.test.mjs';

