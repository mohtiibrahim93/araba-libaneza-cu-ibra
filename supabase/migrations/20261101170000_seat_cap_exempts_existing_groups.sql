-- The seat caps (8 in person, 6 online) are for new groups. The groups that
-- started before October 2026 really have 10 places (owner, 1 Nov 2026).
--
-- 20260904130000 and 20261007120000 added the caps NOT VALID to grandfather
-- those groups, but NOT VALID only skips the rows already there: every UPDATE
-- is still checked, so any edit to an old group (its schedule text, its status,
-- its "Salvează" in Cohorte grupe) was refused because of its 10 places.
--
-- Same caps, with groups that started before 1 October 2026 exempt in the rule
-- itself. Every existing row then satisfies it, so the constraints are
-- validated. Kids cohorts (format NULL) still pass as before.
alter table public.group_cohorts
  drop constraint if exists group_cohorts_fizic_max_seats;
alter table public.group_cohorts
  add constraint group_cohorts_fizic_max_seats
  check (
    format is distinct from 'fizic'
    or max_seats <= 8
    or start_date < date '2026-10-01'
  );
comment on constraint group_cohorts_fizic_max_seats on public.group_cohorts is
  'In-person groups are capped at 8. Groups that started before 2026-10-01 keep their 10 places (owner, 1 Nov 2026).';

alter table public.group_cohorts
  drop constraint if exists group_cohorts_online_max_seats;
alter table public.group_cohorts
  add constraint group_cohorts_online_max_seats
  check (
    format is distinct from 'online'
    or max_seats <= 6
    or start_date < date '2026-10-01'
  );
comment on constraint group_cohorts_online_max_seats on public.group_cohorts is
  'Online groups are capped at 6. Groups that started before 2026-10-01 keep their 10 places (owner, 1 Nov 2026).';
