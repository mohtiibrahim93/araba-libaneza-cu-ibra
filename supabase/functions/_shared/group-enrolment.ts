/** Validate the stored group, never a client-supplied replacement. */
export async function groupEnrolmentError(db: any, reg: { form_type?: string | null; cohort_id?: string | null; level?: string | null; format?: string | null }): Promise<string | null> {
  if (reg.form_type !== "group") return null;
  if (!reg.cohort_id) return "Select a group before continuing";
  const { data: cohort, error } = await db.from("group_cohorts").select("id,form_type,level,format,status,is_active").eq("id", reg.cohort_id).maybeSingle();
  if (error || !cohort || cohort.is_active !== true) return "The selected group is unavailable";
  if (cohort.form_type !== "group" || cohort.level !== reg.level || (cohort.format && cohort.format !== reg.format)) return "The selected group does not match the course";
  if (!["forming", "minimum_reached", "confirmed", "in_progress"].includes(cohort.status)) return "The selected group is not open for registration";
  return null;
}
