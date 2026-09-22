import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('legacy orientation extraction remains readable while production uses the approved native bank', async () => {
  const { extractOrientationPilot } = await import('../orientation-importer.mjs');
  const legacy = fs.readFileSync(new URL('../../../../public/yalla/plus.js', import.meta.url), 'utf8');
  const legacyItems = extractOrientationPilot(legacy);
  assert.equal(legacyItems.length, 24);
  assert.deepEqual(
    ['a1', 'a2', 'b1'].map(band => legacyItems.filter(x => x.internalBand === band).length),
    [8, 8, 8]
  );

  const approved = JSON.parse(
    fs.readFileSync(new URL('../../../ContentReview/APPROVED_ORIENTATION_BANK.json', import.meta.url), 'utf8')
  );
  const bundled = JSON.parse(
    fs.readFileSync(new URL('../../../App/Resources/orientation-pilot.json', import.meta.url), 'utf8')
  );

  assert.deepEqual(bundled, approved);
  assert.equal(approved.length, 24);
  assert.deepEqual(
    ['a1', 'a2', 'b1'].map(band => approved.filter(x => x.internalBand === band).length),
    [8, 8, 8]
  );
  assert.equal(approved[7].answer, 'Wen?');
  assert.deepEqual(approved[7].variants, []);
  assert.equal(approved[16].answer, 'De cât timp lucrezi acolo?');
  assert.equal(approved[23].answer, 'Sunt aici de aproape cinci ani. Îmi place mult jobul.');
});

test('orientation extraction rejects missing or incomplete banks', async () => {
  const { extractOrientationPilot } = await import('../orientation-importer.mjs');
  assert.throws(() => extractOrientationPilot(''), /bank/);
  assert.throws(() => extractOrientationPilot('const bank=[]; const stageNames=[];'), /24/);
});
