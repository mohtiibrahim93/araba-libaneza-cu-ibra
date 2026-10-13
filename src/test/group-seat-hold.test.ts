import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Two people who both opened payment for the last seat could both pay: a seat
 * only counted once paid. Opening payment now holds the seat for 30 minutes,
 * decided under a lock on the group, and the hold counts as taken everywhere.
 */
const sql = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20261012170000_group_seat_hold.sql",
  ),
  "utf8",
);

describe("group seat hold (database)", () => {
  it("decides the hold under a lock on the group row", () => {
    const hold = sql.slice(sql.indexOf("FUNCTION public.hold_group_seat"));
    expect(hold).toMatch(
      /FROM public\.group_cohorts WHERE id = r\.cohort_id FOR UPDATE/,
    );
    expect(hold).toContain(
      "cohort_seats_taken(c.id, r.id) >= c.max_seats THEN RETURN false",
    );
  });

  it("counts active holds (not your own) as taken, and expired holds not at all", () => {
    const taken = sql.slice(
      sql.indexOf("FUNCTION public.cohort_seats_taken"),
      sql.indexOf("REVOKE ALL ON FUNCTION public.cohort_seats_taken"),
    );
    expect(taken).toContain(
      "r.seat_hold_until > now() AND r.id IS DISTINCT FROM p_exclude",
    );
    expect(taken).toContain("lead_status IN ('qualified','converted')");
  });

  it("uses that one count for the public picker and the registration check", () => {
    expect(sql).toContain(
      "public.cohort_seats_taken(c.id)::bigint AS taken FROM public.group_cohorts c",
    );
    expect(sql).toContain(
      "public.cohort_seats_taken(c.id) >= c.max_seats THEN\n    RAISE EXCEPTION 'group_full",
    );
  });

  it("keeps the hold and the internal count off the public API", () => {
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.hold_group_seat(uuid, integer) FROM PUBLIC, anon, authenticated;",
    );
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.cohort_seats_taken(uuid, uuid) FROM PUBLIC, anon, authenticated;",
    );
  });
});
