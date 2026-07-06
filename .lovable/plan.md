## Change

Update all user-facing copy that mentions private-lesson duration from **90 minutes** to **60 minutes**, in both Romanian and English. Group course duration (also 90 min) stays unchanged.

## Files touched

- `src/lib/i18n.tsx` — update the private-lesson strings in both the RO and EN dictionaries:
  - `privateDuration`, `privateFeat3`, `privateDurationV2`, `privatePricePerLesson`
  - `kidsPrivateDuration`, `kidsPrivatePricePerLesson`
  - `pricingPrivatePer`, `pricingPerSessionSuffix`, `pricingPrivateFeat1`
  - `faq5A` (private-lesson FAQ answer)
  - `ctaSchedulePrivateValue`, `mainLeadDetailPrivateValue`
  - `priceLeiPer90Min` → keep the key but change text to "LEI / lecție 60 min" / "LEI / 60-min lesson"
- `src/pages/courses/CursPrivate.tsx` — no code change (it consumes the renamed-in-place `priceLeiPer90Min` string).

## Left unchanged (still 90 min — group format)

- `courseGrupFeat3` ("Two sessions per week (90 min)")
- `curriculumDesc` ("90-min lessons, 2/week…")
- `kidsGroupDuration` ("90 minutes / lesson" — kids group)

## Out of scope

No pricing changes and no database changes — only display copy.
