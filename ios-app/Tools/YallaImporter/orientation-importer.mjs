import vm from 'node:vm';

// Read-only extraction of the existing teacher-review pilot, not new content.
export function extractOrientationPilot(source) {
  const start = source.indexOf('const bank=[];');
  const end = source.indexOf('const stageNames=', start);
  if (start < 0 || end < start) throw new Error('Orientation bank boundaries missing');
  const bank = JSON.parse(vm.runInNewContext(
    source.slice(start, end) + '; JSON.stringify(bank);', {}, { timeout: 1000 }
  ));
  if (bank.length !== 24) throw new Error('Orientation bank must contain 24 questions');
  const bands = ['a1', 'a2', 'b1'];
  if (bands.some((_, stage) => bank.filter(item => item.stage === stage).length !== 8)) {
    throw new Error('Orientation bank requires 8 questions per band');
  }
  return bank.map((item, index) => ({
    id: item.id,
    ordinal: index + 1,
    internalBand: bands[item.stage],
    prompt: { ro: item.prompt },
    answer: item.answer,
    variants: item.variants ?? [],
    choices: item.wrong ? [item.answer, ...item.wrong] : [],
    source: item.source
  }));
}
