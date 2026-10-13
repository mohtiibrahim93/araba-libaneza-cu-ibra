/** Validate the stored group, never a client-supplied replacement. */
export async function groupEnrolmentError(
  db: any,
  reg: {
    id?: string | null;
    form_type?: string | null;
    cohort_id?: string | null;
    level?: string | null;
    format?: string | null;
    lead_status?: string | null;
  },
): Promise<string | null> {
  if (reg.form_type !== "group") return null;
  if (!reg.cohort_id) return "Select a group before continuing";
  const { data: cohort, error } = await db
    .from("group_cohorts")
    .select("id,form_type,level,format,status,is_active,max_seats")
    .eq("id", reg.cohort_id)
    .maybeSingle();
  if (error || !cohort || cohort.is_active !== true)
    return "The selected group is unavailable";
  if (
    cohort.form_type !== "group" ||
    cohort.level !== reg.level ||
    (cohort.format && cohort.format !== reg.format)
  )
    return "The selected group does not match the course";
  if (
    !["forming", "minimum_reached", "confirmed", "in_progress"].includes(
      cohort.status,
    )
  )
    return "The selected group is not open for registration";
  // A seat is taken once the student is accepted or has paid. Someone already
  // holding one keeps it; anyone else gets a 30-minute hold on a free seat
  // while they pay (hold_group_seat locks the group, so two last-seat payments
  // are decided one after the other), or is told the group is full.
  if (reg.lead_status === "qualified" || reg.lead_status === "converted")
    return null;
  if (!reg.id) return "The selected group is unavailable";
  const { data: held, error: holdError } = await db.rpc("hold_group_seat", {
    p_registration: reg.id,
    p_minutes: 30,
  });
  if (holdError) return "The selected group is unavailable";
  if (held !== true) return "The selected group is full";
  return null;
}
