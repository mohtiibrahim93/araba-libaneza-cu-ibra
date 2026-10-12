-- Student accounts (October 2026, the owner's option B).
--
-- Optional: anyone still plays and takes the level test without an account.
-- A student who signs in (email link or Google) gets their Yalla progress
-- saved here, so it follows them to every device, and the owner sees it in
-- admin. The game itself still keeps its state in localStorage; the site
-- merges that with this row and keeps both in step (src/lib/studentSync.ts).
--
-- One row per signed-in user. `state` is the game's own progress object
-- (the same shape the game exports as yalla-progress-v1); the other columns
-- are a summary written alongside it, so admin can list students without
-- reading every state blob.

create table if not exists public.student_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  state jsonb not null default '{}'::jsonb,
  placement jsonb,
  xp integer not null default 0,
  rounds integer not null default 0,
  items_seen integer not null default 0,
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The game refuses progress files over 3 MB; the same ceiling here.
  constraint student_progress_state_size check (octet_length(state::text) < 3000000)
);

alter table public.student_progress enable row level security;

-- A student reads and writes only their own row. Admin reads all rows through
-- the admin-registrations function (service role), never through these.
drop policy if exists "Students read own progress" on public.student_progress;
create policy "Students read own progress"
  on public.student_progress for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Students insert own progress" on public.student_progress;
create policy "Students insert own progress"
  on public.student_progress for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Students update own progress" on public.student_progress;
create policy "Students update own progress"
  on public.student_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Students delete own progress" on public.student_progress;
create policy "Students delete own progress"
  on public.student_progress for delete to authenticated
  using (auth.uid() = user_id);
