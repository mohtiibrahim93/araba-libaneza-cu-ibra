-- Create a single registrations table for all form types
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL CHECK (form_type IN ('group', 'private', 'kids')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  center TEXT,
  format TEXT,
  child_age TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public registration forms)
CREATE POLICY "Anyone can submit a registration"
  ON public.registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admin) can read
CREATE POLICY "Authenticated users can read registrations"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (true);