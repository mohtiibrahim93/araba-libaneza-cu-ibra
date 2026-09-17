import test from 'node:test';
import assert from 'node:assert/strict';
import { convertYallaToContentPackage, evaluateYallaSources } from '../yalla-importer.mjs';

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
