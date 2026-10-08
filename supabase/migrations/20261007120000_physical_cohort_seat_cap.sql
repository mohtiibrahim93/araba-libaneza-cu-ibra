-- In-person groups are capped at 8 seats, the same rule the admin form has
-- shown all along (MAX_GROUP_SIZE.fizic in src/lib/groupSize.ts) without
-- anything enforcing it. Online already has its cap as a constraint; this is
-- the missing half, written the same way.
--
-- NOT VALID on purpose, exactly as for the online cap: the in-person cohorts
-- already running — A1 and A2 fizic, created with 10 seats — are grandfathered
-- and must keep their places. Every INSERT and every UPDATE from here on is
-- checked, which is what "only future groups get the rule" means. Validate it
-- once those cohorts have finished:
--   alter table group_cohorts validate constraint group_cohorts_fizic_max_seats;
--
-- Until now the cap existed only as the `max` attribute on the "add cohort"
-- field. The edit rows below it carry no max at all, so an existing cohort
-- could be saved with any number of seats and nothing would object.
-- Kids cohorts carry format NULL, and NULL is distinct from 'fizic', so the
-- check passes them untouched -- the same way the online cap leaves them alone.
--
-- Guarded so a re-run does not fail on the constraint already being there.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'group_cohorts_fizic_max_seats'
  ) then
    alter table public.group_cohorts
      add constraint group_cohorts_fizic_max_seats
      check (format is distinct from 'fizic' or max_seats <= 8)
      not valid;

    comment on constraint group_cohorts_fizic_max_seats on public.group_cohorts is
      'In-person groups are capped at 8. NOT VALID on purpose: the A1 and A2 in-person cohorts already running with 10 seats are grandfathered, but every new or edited row is checked. Mirrors group_cohorts_online_max_seats.';
  end if;
end $$;
