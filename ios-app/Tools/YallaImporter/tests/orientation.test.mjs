import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('orientation pilot preserves the existing authored bank exactly', async () => {
  const { extractOrientationPilot } = await import('../orientation-importer.mjs');
  const legacy = fs.readFileSync(new URL('../../../../public/yalla/plus.js', import.meta.url), 'utf8');
  const items = extractOrientationPilot(legacy);
  assert.equal(items.length, 24);
  assert.deepEqual(['a1', 'a2', 'b1'].map(band => items.filter(x => x.internalBand === band).length), [8, 8, 8]);
  assert.equal(items[0].answer, 'Cum te cheamă?');
  assert.deepEqual(items[4].variants, ['badde may']);
  assert.equal(items[23].answer, 'Maktabe');
  const bundled = JSON.parse(fs.readFileSync(new URL('../../../App/Resources/orientation-pilot.json', import.meta.url), 'utf8'));
  assert.deepEqual(bundled, items);
});

test('orientation extraction rejects missing or incomplete banks', async () => {
  const { extractOrientationPilot } = await import('../orientation-importer.mjs');
  assert.throws(() => extractOrientationPilot(''), /bank/);
  assert.throws(() => extractOrientationPilot('const bank=[]; const stageNames=[];'), /24/);
});
