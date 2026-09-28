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
  for (const c of root.YALLA.cards) {
    if (!c.en) continue;
    c.roOriginal = c.ro;
    c.ro = c.en;
  }
})(window);
