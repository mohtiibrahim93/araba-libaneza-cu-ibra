-- The early-start request at sign-up (owner, 17 November 2026: "fix this";
-- see 20261117120000_early_start_request.sql and _shared/early-start.ts).
--
-- A group that starts within the 14-day withdrawal period is joined only
-- with the student's request for the lessons to start in that time. The
-- card checkout already asks for it; this asks for it at sign-up too, so a
-- student who pays by cash, transfer or at the centre makes it as well.
--
-- On every new sign-up:
--   * a request sent with it is stamped with the database's own time, never
--     the visitor's clock;
--   * a sign-up from the website (not the admin, which uses the service role)
--     to a group that starts on or before day 14 is refused without it. The
--     form shows the box when this happens.
--
-- Additive: one function and one trigger; no row changes. Written so it can
-- run again.

create or replace function public.require_early_start_request()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  starts date;
begin
  if NEW.early_start_requested_at is not null then
    NEW.early_start_requested_at := now();
  end if;
  if NEW.form_type is distinct from 'group'
     or NEW.cohort_id is null
     or coalesce(auth.role(), '') = 'service_role' then
    return NEW;
  end if;
  select start_date into starts from public.group_cohorts where id = NEW.cohort_id;
  if starts is not null
     and starts <= ((now() at time zone 'Europe/Bucharest')::date + 14)
     and NEW.early_start_requested_at is null then
    raise exception 'early_start_required: the group starts within the 14-day withdrawal period'
      using errcode = '23514';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_require_early_start_request on public.registrations;
create trigger trg_require_early_start_request
  before insert on public.registrations
  for each row execute function public.require_early_start_request();
