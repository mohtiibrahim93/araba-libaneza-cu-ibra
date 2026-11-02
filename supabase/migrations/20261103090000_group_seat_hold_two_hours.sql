-- Group seats (owner, 2 Nov 2026).
--
-- A seat is taken by a registration that is paid (or free), one the owner
-- added or accepted (lead status qualified/converted: "Adaugă un cursant
-- manual" sets it, so does marking a sign-up Calificat/Convertit), the
-- owner's manual counts and adjustments, and, for a short while, a payment
-- that was started and not finished. Cancelled and refunded registrations
-- never count.
--
-- The hold on a started payment is now 2 hours (was 30 minutes). It is not
-- extended by reopening the payment page, so a seat cannot be kept by
-- reloading; once it runs out a new attempt gets a new hold if a seat is
-- free. booking-reminders (every 15 minutes) emails the "finish your
-- payment" link 15 minutes in, then at the deadline closes the Stripe
-- payment, marks the registration "expired" and emails that the seat was
-- released. The seat itself stops counting at the deadline exactly, here.

alter table public.registrations
  add column if not exists hold_reminder_sent_at timestamptz,
  add column if not exists hold_released_at timestamptz;

comment on column public.registrations.hold_reminder_sent_at is
  'Group payment started and not finished: when the "finish your payment" email went out for the current seat hold.';
comment on column public.registrations.hold_released_at is
  'Group payment not finished in time: when its seat hold was released and the registration marked expired.';

create or replace function public.cohort_seats_taken(p_cohort uuid, p_exclude uuid default null)
returns bigint language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.registrations r
      where r.cohort_id = p_cohort
        and r.canceled_at is null
        and coalesce(r.payment_status, '') <> 'refunded'
        and (r.payment_status in ('paid', 'free')
             or r.lead_status in ('qualified', 'converted')
             or (r.seat_hold_until > now() and r.id is distinct from p_exclude)))
    + coalesce((select c.manual_offset from public.group_cohorts c where c.id = p_cohort), 0)
    + coalesce((select sum(m.count) from public.manual_signups m where m.cohort_id = p_cohort), 0);
$$;
revoke all on function public.cohort_seats_taken(uuid, uuid) from public, anon, authenticated;
grant execute on function public.cohort_seats_taken(uuid, uuid) to service_role;

create or replace function public.hold_group_seat(p_registration uuid, p_minutes integer default 120)
returns boolean language plpgsql security definer set search_path = public as $$
declare r public.registrations%rowtype; c public.group_cohorts%rowtype;
begin
  select * into r from public.registrations where id = p_registration;
  if not found or r.cohort_id is null then return false; end if;
  if r.lead_status in ('qualified', 'converted') or r.payment_status in ('paid', 'free') then
    return true;
  end if;
  -- A hold still running is kept as it is: reopening the page does not
  -- move the deadline the student was told.
  if r.seat_hold_until > now() then return true; end if;
  select * into c from public.group_cohorts where id = r.cohort_id for update;
  if not found then return false; end if;
  if c.max_seats is not null and public.cohort_seats_taken(c.id, r.id) >= c.max_seats then
    return false;
  end if;
  update public.registrations
     set seat_hold_until = now() + make_interval(mins => greatest(1, least(coalesce(p_minutes, 120), 120))),
         hold_reminder_sent_at = null,
         hold_released_at = null
   where id = r.id;
  return true;
end;
$$;
revoke all on function public.hold_group_seat(uuid, integer) from public, anon, authenticated;
grant execute on function public.hold_group_seat(uuid, integer) to service_role;

-- A month the owner gives by private agreement (e.g. a month carried over
-- from a previous course): it covers a month of the course, no money moves,
-- so it is recorded with amount 0 and never counts as revenue.
alter table public.registration_payments
  drop constraint if exists registration_payments_kind_check,
  drop constraint if exists registration_payments_method_check,
  drop constraint if exists registration_payments_amount_lei_check;
alter table public.registration_payments
  add constraint registration_payments_kind_check
    check (kind in ('month', 'full', 'credit')),
  add constraint registration_payments_method_check
    check (method in ('cash', 'transfer', 'credit')),
  add constraint registration_payments_amount_lei_check
    check (
      (kind = 'credit' and method = 'credit' and amount_lei = 0)
      or (kind <> 'credit' and method in ('cash', 'transfer')
          and amount_lei > 0 and amount_lei <= 100000)
    );
