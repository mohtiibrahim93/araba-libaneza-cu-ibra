## Backlog status

All eight items from the last batch (Option 1 + Option 2) shipped and typechecked cleanly. Nothing else from the accumulated SEO/Semrush discussion is outstanding — the only items I've explicitly deferred and NOT queued are:

- Semrush multi-year trend pull (blocked on you approving the connect modal)
- GSC disavow file upload (`public/disavow.txt` exists; upload is a manual GSC step you own)

Those are waiting on you, not on me.

## This turn: update the German page's teaching-language claim

Currently `src/pages/de/ArabischLernen.tsx` says twice that lessons run in "Englisch oder Rumänisch" (FAQ answer + "Warum uns wählen" list). That undersells your language range for German visitors.

Change to: **Englisch, Französisch, Arabisch oder Rumänisch** (plus simple explanations possible in German).

### Edits (single file: `src/pages/de/ArabischLernen.tsx`)

1. FAQ item about the teacher (~line 31): replace "Unterricht auf Englisch oder Rumänisch; einfache Erklärungen auf Deutsch sind möglich." with "Unterricht auf Englisch, Französisch, Arabisch oder Rumänisch — such dir die Sprache aus, in der du dich am wohlsten fühlst. Einfache Erklärungen auf Deutsch sind ebenfalls möglich."
2. "Warum uns wählen" bullet (~line 189): replace "Unterrichtssprache: Englisch oder Rumänisch. Einfache Erklärungen auf Deutsch möglich." with "Unterrichtssprache: Englisch, Französisch, Arabisch oder Rumänisch — plus einfache Erklärungen auf Deutsch."
3. Add one new short FAQ item near the top of the `FAQ` array: **Q:** "In welcher Sprache findet der Unterricht statt?" **A:** explains the four fluent languages + basic German support, and that the student picks. This also feeds the existing `FAQPage` JSON-LD so it earns a rich-result slot for the multilingual angle.

No routes, sitemap, or other files change. Build should stay clean.
