-- In-person groups take at most 8 people, online groups at most 6 (the
-- owner's rule, October 2026). The online cap already exists
-- (group_cohorts_online_max_seats); this adds the in-person one.
--
-- NOT VALID for the same reason as the online cap: a cohort created earlier
-- with more seats is grandfathered, but every new or edited row is checked.
alter table group_cohorts
  add constraint group_cohorts_fizic_max_seats
  check (format is distinct from 'fizic' or max_seats <= 8)
  not valid;

comment on constraint group_cohorts_fizic_max_seats on group_cohorts is
  'In-person groups are capped at 8 (online at 6). A group starts once half its places are taken. NOT VALID on purpose: older cohorts are grandfathered, new or edited rows are checked.';
