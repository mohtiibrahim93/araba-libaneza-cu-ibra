/** Validate the stored group, never a client-supplied replacement. */
export async function groupEnrolmentError(db: any, reg: { form_type?: string | null; cohort_id?: string | null; level?: string | null; format?: string | null; lead_status?: string | null }): Promise<string | null> {
  if (reg.form_type !== "group") return null;
  if (!reg.cohort_id) return "Select a group before continuing";
  const { data: cohort, error } = await db.from("group_cohorts").select("id,form_type,level,format,status,is_active,max_seats").eq("id", reg.cohort_id).maybeSingle();
  if (error || !cohort || cohort.is_active !== true) return "The selected group is unavailable";
  if (cohort.form_type !== "group" || cohort.level !== reg.level || (cohort.format && cohort.format !== reg.format)) return "The selected group does not match the course";
  if (!["forming", "minimum_reached", "confirmed", "in_progress"].includes(cohort.status)) return "The selected group is not open for registration";
  // A seat is taken once the student is accepted or has paid (the same rule
  // as get_cohort_signup_counts). Someone already holding a seat keeps it;
  // anyone else may not open payment for a group that is already full.
  if (reg.lead_status === "qualified" || reg.lead_status === "converted") return null;
  const { data: counts, error: countError } = await db.rpc("get_cohort_signup_counts");
  if (countError) return "The selected group is unavailable";
  const taken = Number((counts ?? []).find((row: { cohort_id: string }) => row.cohort_id === cohort.id)?.taken ?? 0);
  if (Number.isFinite(Number(cohort.max_seats)) && taken >= Number(cohort.max_seats)) return "The selected group is full";
  return null;
}
