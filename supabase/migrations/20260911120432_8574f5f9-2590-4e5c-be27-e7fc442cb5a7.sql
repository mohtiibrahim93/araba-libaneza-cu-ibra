REVOKE SELECT ON public.group_capacities FROM anon, authenticated;

GRANT SELECT (id, form_type, level, format, max_seats, min_seats, updated_at)
  ON public.group_capacities TO anon, authenticated;

GRANT ALL ON public.group_capacities TO service_role;