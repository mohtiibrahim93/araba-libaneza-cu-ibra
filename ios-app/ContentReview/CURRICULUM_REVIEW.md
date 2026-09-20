# Curriculum review for Ibrahim

Source: App/Resources/yalla-native-content.json at ea4204b3504866f7c2fe3b1356b2e7915a4fc002. This report records existing data; it does not approve, rewrite or extend Lebanese content.

## What the bundle contains

- 4,315 expressions; 32 Journey units; 558 imported drills; 14 lexicon collections.
- Journey: 23 A1 units, 7 A2 units and 2 B1 units. No B2/C1/C2 Journey units are bundled. Vocabulary collections are separate from Journey progression.
- 102 grammar drills and 456 dialogue-response drills. All 558 have empty expressionIDs.
- Unit expression counts range from 24 to 401; approve this granularity or identify units to split before claiming a calibrated progression.
- No production audio/listening, roots, morphology or inflection arrays.
- No per-expression source/approval metadata is emitted in the current native JSON.

## Provenance and approval distinction

The current importer evaluates existing public/yalla modules: content.js, romanian.js, curriculum.js and synthesis.js. Import reproducibility is established separately by CI. Inclusion in these source modules does not establish individual teacher sign-off or calibration. Review the existing generated-source contribution as part of curriculum approval; no new generated Lebanese content is added by this work.

## Decisions needed

1. Approve the launch Journey units and their current expression sets, or identify specific corrections/reordering/splits.
2. Review DRILL_REVIEW.md. For each relevant drill choose:
   - Session-only: retain it without expression mastery/SRS credit.
   - Linked: supply exact existing expression IDs whose skills it assesses; identify the primary target.
   - Exclude/revise: identify the approved replacement or exclusion.
3. Do not force conceptual questions (for example Arabizi digit questions) to an unrelated expression.
4. Approve richer content and recordings separately. Existing canonically linked recall and matching already provide expression-based practice where a legacy drill has no link.
5. Review orientation questions/thresholds separately; pilot scoring is not a CEFR certification.

## Unit inventory

Expression counts are membership counts, not a claim of teaching load or unique vocabulary.

| Unit ID | Level | Existing title | Expressions | Imported drills |
| --- | --- | --- | ---: | ---: |
| a1-welcome | A1 | Salută și prezintă-te | 401 | 34 |
| a1-questions | A1 | Întreabă și spune ce vrei | 184 | 22 |
| a1-family | A1 | Familia și lucrurile mele | 291 | 36 |
| a1-home | A1 | Acasă | 81 | 0 |
| a1-description | A1 | Culori și descrieri | 49 | 2 |
| a1-numbers | A1 | Numără și cere | 119 | 0 |
| a1-time | A1 | Zile, ore și date | 50 | 0 |
| a1-meeting | A1 | Stabilește o întâlnire | 32 | 0 |
| a1-weather | A1 | Vremea și anotimpurile | 38 | 0 |
| a1-needs | A1 | Am, vreau, pot | 214 | 7 |
| a1-actions | A1 | Ce faci acum? | 83 | 26 |
| a1-restaurant | A1 | La restaurant | 162 | 31 |
| a1-city | A1 | Găsește drumul | 126 | 28 |
| a1-shopping | A1 | La cumpărături | 124 | 24 |
| a1-clothes | A1 | Haine și aspect | 24 | 0 |
| a1-health | A1 | Corpul și sănătatea | 24 | 0 |
| a1-work | A1 | Munca și studiile | 107 | 27 |
| a1-leisure | A1 | Timpul liber | 52 | 0 |
| a1-plans | A1 | Planuri și sărbători | 115 | 38 |
| a1-daily | A1 | Ziua mea | 117 | 0 |
| a1-polite | A1 | Cere politicos | 54 | 0 |
| a1-frequency | A1 | Relații, ordine și frecvență | 39 | 0 |
| a1-review | A1 | Pune totul împreună | 169 | 61 |
| a2-roots | A2 | De la rădăcină la expresie | 24 | 0 |
| a2-verbs | A2 | Verbe pentru fiecare persoană | 301 | 0 |
| a2-weak | A2 | Verbe cu forme speciale | 129 | 0 |
| a2-past | A2 | Ce s-a întâmplat? | 79 | 28 |
| a2-opinions | A2 | Preferințe și opinii | 68 | 30 |
| a2-modals | A2 | Obligații și posibilități | 67 | 26 |
| a2-connections | A2 | Condiții și legături între idei | 157 | 54 |
| b1-experiences | B1 | Experiențe, opinii și planuri | 43 | 42 |
| b1-conversation | B1 | Conversații la muncă | 42 | 42 |

No content or links were changed during preparation of this report.
