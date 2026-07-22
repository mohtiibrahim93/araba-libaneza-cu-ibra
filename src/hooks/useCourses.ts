import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Course, PUBLIC_COURSE_STATUSES } from "@/lib/courses";

const COLS =
  "id, form_type, age_category, course_type, level, format, slug, title_ro, title_en, start_date, end_date, schedule_label_ro, schedule_label_en, session_count, total_hours, price_lei, image_url, max_seats, status, is_active, sort_order, content";

export interface CourseFilters {
  age?: string | null;
  format?: string | null;
  courseType?: string | null;
  /** Include non-public (draft/past) rows. Default false = public only. */
  includeAll?: boolean;
}

type Row = Record<string, unknown> & { id: string; max_seats: number };

function withSeats(rows: Row[], counts: { cohort_id: string; taken: number }[] | null): Course[] {
  const taken = new Map<string, number>();
  (counts || []).forEach((c) => taken.set(c.cohort_id, Number(c.taken) || 0));
  return rows.map((r) => {
    const t = Math.min(taken.get(r.id) || 0, r.max_seats);
    return {
      ...(r as unknown as Course),
      content: (r.content as Course["content"]) || {},
      taken: t,
      seatsLeft: Math.max(0, r.max_seats - t),
      full: t >= r.max_seats,
    };
  });
}

async function fetchCourses(f: CourseFilters): Promise<Course[]> {
  const today = new Date().toISOString().slice(0, 10);
  // Cast: the generated Supabase types predate the course columns (migration
  // 20260722120000). The columns exist in the DB; regenerate types to restore
  // full typing.
  let q = (supabase.from("group_cohorts") as unknown as {
    select: (c: string) => any;
  }).select(COLS).eq("is_active", true).eq("course_type", f.courseType ?? "grup");
  if (!f.includeAll) {
    q = q.in("status", PUBLIC_COURSE_STATUSES).gte("start_date", today);
  }
  if (f.age) q = q.eq("age_category", f.age);
  // A chosen format shows that format plus format-agnostic rows (format IS NULL).
  if (f.format) q = q.or(`format.eq.${f.format},format.is.null`);
  q = q.order("sort_order", { ascending: true }).order("start_date", { ascending: true });

  const [{ data, error }, { data: counts }] = await Promise.all([
    q,
    supabase.rpc("get_cohort_signup_counts"),
  ]);
  if (error) {
    console.error("[useCourses] load error", error);
    return [];
  }
  return withSeats((data as Row[]) || [], counts as { cohort_id: string; taken: number }[]);
}

/** Group courses matching the chosen facets (age / modality). */
export function useCourses(filters: CourseFilters) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(filters);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourses(filters).then((d) => {
      if (active) {
        setCourses(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { courses, loading };
}

/** A single course by its slug (for the individual course page). */
export function useCourseBySlug(slug: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const table = () => supabase.from("group_cohorts") as unknown as { select: (c: string) => any };
      const counts = (await supabase.rpc("get_cohort_signup_counts")).data as { cohort_id: string; taken: number }[];
      // 1) owner-set slug
      let { data: rows } = await table().select(COLS).eq("slug", slug).eq("is_active", true).limit(1);
      // 2) synthetic "<level>-<format>" slug for courses without a manual one
      if (!rows || rows.length === 0) {
        const m = (slug as string).match(/^([a-cA-C][12])-(online|fizic)$/);
        if (m) {
          ({ data: rows } = await table().select(COLS)
            .eq("level", m[1].toUpperCase()).eq("format", m[2].toLowerCase())
            .eq("course_type", "grup").eq("is_active", true)
            .order("start_date", { ascending: true }).limit(1));
        }
      }
      if (!active) return;
      const row = rows && rows[0];
      setCourse(row ? withSeats([row as Row], counts)[0] : null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  return { course, loading };
}
