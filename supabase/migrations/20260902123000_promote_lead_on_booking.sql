-- Safety net for the "incomplete" lead status.
--
-- booking-create promotes a registration from 'incomplete' to 'new' once a slot
-- is actually chosen. That promotion lives in an edge function, so it only runs
-- if that particular version is deployed — and the admin's default view hides
-- 'incomplete' rows, which means a lead that did book could sit invisible.
--
-- Do it in the database instead, where it holds for every path that creates a
-- booking: the edge function, an admin-side insert, or a manual backfill. The
-- edge function's own update stays; both are idempotent.
create or replace function public.promote_lead_on_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.registrations
     set lead_status = 'new',
         notes = case when notes like '%NEALES%' then null else notes end
   where id = new.registration_id
     and lead_status = 'incomplete';
  return new;
end;
$$;

drop trigger if exists trg_promote_lead_on_booking on public.bookings;

create trigger trg_promote_lead_on_booking
  after insert on public.bookings
  for each row
  when (new.registration_id is not null)
  execute function public.promote_lead_on_booking();
