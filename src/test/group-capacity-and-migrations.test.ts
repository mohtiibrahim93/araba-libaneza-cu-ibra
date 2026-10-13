import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("public group registration refuses a full group (database)", () => {
  const sql = read(
    "supabase/migrations/20261012150000_group_capacity_on_registration.sql",
  );

  it("locks the group row so two last-seat sign-ups are checked one after the other", () => {
    expect(sql).toMatch(
      /FROM public\.group_cohorts WHERE id = NEW\.cohort_id FOR UPDATE/,
    );
  });

  it("counts seats exactly like get_cohort_signup_counts", () => {
    expect(sql).toContain("lead_status IN ('qualified','converted')");
    expect(sql).toContain("coalesce(c.manual_offset, 0)");
    expect(sql).toContain("FROM public.manual_signups");
  });

  it("raises a recognisable error the form can explain", () => {
    expect(sql).toContain("group_full");
    expect(read("src/components/RegistrationFormSection.tsx")).toContain(
      'message.includes("group_full")',
    );
  });

  it("still exempts admin (service_role) arrangements", () => {
    expect(sql).toContain("coalesce(auth.role(), '') = 'service_role'");
  });
});

describe("a group marked full opens the waiting list", () => {
  it("treats status 'full' as full even with seats left on paper", () => {
    expect(read("src/hooks/useGroupCohorts.ts")).toContain(
      'full: c.status === "full" || taken >= c.max_seats',
    );
  });
});

describe("admin list shows an email after the contact email is cleared", () => {
  it("falls back to the account email when contact_email is empty", () => {
    const fn = read("supabase/functions/admin-registrations/index.ts");
    expect(fn).toContain(
      "registration.email = registration.contact_email || registration.email;",
    );
    expect(fn).not.toContain(
      "registration.email = registration.contact_email ?? registration.email;",
    );
  });
});

describe("one migration history", () => {
  it("has no drizzle/migrations folder (AGENTS.md: supabase/migrations only)", () => {
    expect(existsSync(resolve(process.cwd(), "drizzle/migrations"))).toBe(
      false,
    );
  });

  it("kept the one change that existed only in drizzle/migrations", () => {
    expect(
      read(
        "supabase/migrations/20261008071938_drop_blog_media_list_policy.sql",
      ),
    ).toContain(
      'DROP POLICY IF EXISTS "blog_media_public_read" ON storage.objects;',
    );
  });
});
