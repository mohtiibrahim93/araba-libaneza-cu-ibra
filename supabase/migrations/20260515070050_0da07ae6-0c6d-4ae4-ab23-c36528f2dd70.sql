
-- Extensions for cron-based reminders
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Event types (trial / paid)
CREATE TABLE public.booking_event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ro text NOT NULL,
  name_en text NOT NULL,
  description_ro text,
  description_en text,
  duration_min integer NOT NULL,
  buffer_before_min integer NOT NULL DEFAULT 0,
  buffer_after_min integer NOT NULL DEFAULT 0,
  min_notice_hours integer NOT NULL DEFAULT 12,
  max_advance_days integer NOT NULL DEFAULT 30,
  price_cents integer NOT NULL DEFAULT 0,
  requires_payment boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active event types"
  ON public.booking_event_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role manages event types"
  ON public.booking_event_types FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Weekly availability rules (in Europe/Bucharest)
CREATE TABLE public.availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0 = Sunday
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active availability rules"
  ON public.availability_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role manages availability rules"
  ON public.availability_rules FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_slug text NOT NULL REFERENCES public.booking_event_types(slug),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  student_name text NOT NULL,
  student_email text NOT NULL,
  student_phone text,
  format text NOT NULL DEFAULT 'online' CHECK (format IN ('online','physical')),
  notes text,
  google_event_id text,
  meet_link text,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','rescheduled','completed')),
  manage_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  reminder_24h_sent_at timestamptz,
  reminder_1h_sent_at timestamptz,
  cancelled_at timestamptz,
  original_booking_id uuid REFERENCES public.bookings(id),
  language text NOT NULL DEFAULT 'ro' CHECK (language IN ('ro','en')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role manages bookings"
  ON public.bookings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Prevent overlapping confirmed bookings on the same start (safety net)
CREATE UNIQUE INDEX bookings_confirmed_start_uniq
  ON public.bookings (start_at)
  WHERE status = 'confirmed';

CREATE INDEX bookings_start_at_idx ON public.bookings (start_at);
CREATE INDEX bookings_status_idx ON public.bookings (status);
CREATE INDEX bookings_manage_token_idx ON public.bookings (manage_token);

-- updated_at trigger reuse
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER set_updated_at_booking_event_types
  BEFORE UPDATE ON public.booking_event_types
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER set_updated_at_availability_rules
  BEFORE UPDATE ON public.availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed event types
INSERT INTO public.booking_event_types
  (slug, name_ro, name_en, description_ro, description_en, duration_min, buffer_before_min, buffer_after_min, min_notice_hours, max_advance_days, price_cents, requires_payment)
VALUES
  ('trial', 'Lecție de probă gratuită', 'Free trial lesson',
   'O lecție introductivă de 30 de minute, gratuită.', 'A free 30-minute introductory lesson.',
   30, 5, 5, 12, 30, 0, false),
  ('paid', 'Lecție privată (60 min)', 'Private lesson (60 min)',
   'O lecție individuală de 60 de minute.', 'A 60-minute one-on-one lesson.',
   60, 5, 5, 12, 30, 0, true);

-- Seed availability: Mon–Fri 10:00–18:00 (Europe/Bucharest local)
INSERT INTO public.availability_rules (weekday, start_time, end_time)
VALUES (1,'10:00','18:00'),(2,'10:00','18:00'),(3,'10:00','18:00'),(4,'10:00','18:00'),(5,'10:00','18:00');
