/* Interface language for the game frame.
   The site decides it: YallaGame passes ?lang= on the iframe's src, so the
   game follows whichever language the visitor is reading the site in.

   t(ro, en) keeps the Romanian text in place as the key instead of inventing
   a key registry for ~486 strings. A call site reads as its own translation,
   a string nobody has converted yet simply stays Romanian rather than
   rendering blank, and each conversion is a one-line diff on a game that has
   no test suite around it.

   Card meanings are NOT switched here. 2,748 of the 3,470 cards have no
   English text at all, so the deck stays Romanian until the drafted English
   glosses have been through teacher review. This file is the interface only. */
(function (root) {
  'use strict';
  var lang = 'ro';
  try {
    var q = new URLSearchParams(root.location.search).get('lang');
    if (q === 'en') lang = 'en';
  } catch (e) { /* no URL access: stay Romanian */ }

  root.YallaI18n = {
    lang: lang,
    /** t('Pașaportul meu', 'My passport') */
    t: function (ro, en) { return lang === 'en' && en ? en : ro; },
  };

  try { document.documentElement.lang = lang; } catch (e) { /* not in a document */ }

  /* ?focus=1 — the level test page's "test only" choice: the frame shows the
     test alone, without the game's menu, XP or teacher link. styles.css hides
     them under html.focus; the game itself runs unchanged. */
  try {
    if (new URLSearchParams(root.location.search).get('focus') === '1') {
      document.documentElement.classList.add('focus');
    }
  } catch (e) { /* no URL access: full game */ }
})(window);
