-- Holiday breaks on cohort cards.
--
-- The new online A1 cohort runs 16 consecutive weekends from 17 October, which
-- taken literally means teaching on 26-27 December and 2-3 January. The exact
-- break is agreed with each group rather than fixed in advance, so the site
-- carries an estimate and says so, instead of advertising an end date it will
-- not meet or implying classes over the holidays.

alter table group_cohorts
  add column if not exists break_note_ro text,
  add column if not exists break_note_en text,
  add column if not exists end_date_is_estimate boolean not null default false;

comment on column group_cohorts.break_note_ro is
  'Holiday/term break shown on the cohort card, e.g. two weeks around Christmas. Free text because the exact dates are agreed with each group rather than fixed in advance.';
comment on column group_cohorts.end_date_is_estimate is
  'True when end_date already allows for a break whose exact dates are not settled, so the site labels it as an estimate instead of stating it flatly.';

update group_cohorts
set end_date = '2027-02-14',
    end_date_is_estimate = true,
    break_note_ro = 'Pauză de sărbători: aproximativ două săptămâni în jurul Crăciunului și Anului Nou. Datele exacte se stabilesc împreună cu grupa.',
    break_note_en = 'Holiday break: roughly two weeks around Christmas and New Year. The exact dates are agreed with the group.'
where level = 'A1' and format = 'online' and start_date = '2026-10-17';
