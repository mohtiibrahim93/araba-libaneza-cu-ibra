-- Language of instruction, on both sides of the match.
--
-- Trials already recorded it: bookings.language is set from the site language
-- the visitor booked in. Course enrolments did not, so someone who read the
-- English pages, registered in English and expected an English-language class
-- arrived in the system indistinguishable from a Romanian speaker — there was
-- nothing to notice before putting them in a Romanian cohort.
--
-- Two columns, one on each side:
--   registrations.language        what the student needs
--   group_cohorts.teaching_language  what the cohort delivers
-- The picker only offers a student cohorts whose teaching_language matches.
--
-- Note this is the language the class is EXPLAINED in. The language being
-- taught is always Lebanese Arabic.

alter table registrations
  add column if not exists language text
  check (language is null or language in ('ro','en'));

comment on column registrations.language is
  'Language of instruction the student needs (ro|en), captured from the site language they registered in. Trials already recorded this on bookings.language; enrolments did not, so an English-speaking registrant was indistinguishable from a Romanian one.';

-- Everyone who registered before this column existed came through the Romanian
-- site: the /en/ pages existed but no cohort was ever taught in English.
update registrations set language = 'ro' where language is null;

alter table group_cohorts
  add column if not exists teaching_language text not null default 'ro'
  check (teaching_language in ('ro','en'));

comment on column group_cohorts.teaching_language is
  'Language the cohort is taught in (ro|en). Defaults to ro: every cohort so far has been Romanian-language. A student is only offered cohorts matching registrations.language.';

create index if not exists idx_registrations_language on registrations (language);
create index if not exists idx_group_cohorts_teaching_language on group_cohorts (teaching_language);
