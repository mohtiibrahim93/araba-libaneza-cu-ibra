/* Deck language. Loads where romanian.js used to, right after content.js.

   romanian.js existed because 722 cards were authored in English and needed a
   Romanian overlay. Every card now carries both meanings — `ro` and `en` — from
   content/yalla-cards.csv, so the overlay runs the other way: for an English
   reader, put the English meaning where the game already reads the meaning from.

   Done as an overlay rather than at the render sites because `c.ro` is read in
   app.js, academy.js, engine.js and synthesis.js — including answer checking, so
   a missed site would mark a correct English answer wrong.

   `roOriginal` keeps the Romanian for anything that needs it (the teacher
   workspace edits Romanian), and `sourceGloss` is untouched: synthesis.js
   references it 225 times. A card with no English keeps its Romanian rather
   than rendering blank. */
(function (root) {
  'use strict';
  if (!root.YALLA || !Array.isArray(root.YALLA.cards)) return;
  if (!root.YallaI18n || root.YallaI18n.lang !== 'en') return;
  // Romanian string -> English, for prose the build could not attach: anything
  // synthesis.js generates in the browser after the bank is loaded.
  const table = root.YALLA_EN || {};
  const say = (value, attached) => attached || table[value] || undefined;

  for (const c of root.YALLA.cards) {
    // `en` is the owner's reviewed meaning. A generated card has none, but it
    // does carry the English it was built from in sourceGloss — without that
    // fallback an English reader met Romanian on every generated card.
    const meaning = c.en || c.sourceGloss;
    if (meaning) { c.roOriginal = c.ro; c.ro = meaning; }
    const note = say(c.note, c.noteEn);
    if (note) { c.noteOriginal = c.note; c.note = note; }
  }
  // The game's prose, not its interface: a grammar round shows the drill's
  // prompt, the answer screen shows its note, and the fill-in shows its
  // context. None of it had any English, so an English player met Romanian the
  // moment they played a round rather than only flipped a card.
  for (const d of root.YALLA.drills || []) {
    const p = say(d.prompt, d.promptEn); if (p) d.prompt = p;
    const n = say(d.note, d.noteEn); if (n) d.note = n;
    const x = say(d.context, d.contextEn); if (x) d.context = x;
  }
  for (const s of root.YALLA.sources || []) {
    if (s.titleEn) s.title = s.titleEn;
    if (s.detailEn) s.detail = s.detailEn;
  }
  for (const n of root.YALLA.notes || []) {
    if (n.reasonEn) n.reason = n.reasonEn;
  }
})(window);
