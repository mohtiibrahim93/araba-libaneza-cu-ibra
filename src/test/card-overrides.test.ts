import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Published teacher corrections.
 *
 * Corrections made in the game's teacher workspace used to live in one
 * browser's localStorage, so students kept seeing the original text. They now
 * go to yalla_card_overrides, which every learner's game applies over the
 * bundled cards at start-up.
 *
 * That table decides what 4,315 cards teach to everyone at once, which makes
 * its write path the part worth pinning down. A public write policy, or a
 * client that writes directly, would let any visitor rewrite the lessons.
 *
 * It is also the record of which cards an owner judged wrong, and when, and
 * that half is private. The two were one table-wide read grant until
 * 20261009070000, so the split -- published text out through a function,
 * correction records locked behind RLS with no policy -- is pinned here too.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const migrations = resolve(process.cwd(), "supabase/migrations");
const migration = readdirSync(migrations)
  .filter((f) => f.includes("yalla_card_override"))
  .map((f) => readFileSync(resolve(migrations, f), "utf8"))
  .join("\n");
const privacy = read("supabase/migrations/20261009070000_yalla_card_overrides_private.sql");

describe("the overrides table", () => {
  it("exists with the card id as its key", () => {
    // Not a generated key: student review history is keyed on the card id, so
    // it is the join between the bundled bank and this overlay.
    expect(migration).toContain("CREATE TABLE public.yalla_card_overrides");
    expect(migration).toContain("card_id text PRIMARY KEY");
  });

  it("is readable by no one directly and writable by no one", () => {
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    // The original grant and policy are gone: a visitor's game reads the
    // published text through get_published_card_overrides(), never the table.
    expect(privacy).toContain('DROP POLICY IF EXISTS "yalla_card_overrides public read"');
    expect(privacy).toContain("REVOKE SELECT ON public.yalla_card_overrides FROM anon, authenticated");
    // The absence of these is the whole security model: writes reach the table
    // only through service_role, which means only through the admin function.
    for (const write of ["FOR INSERT", "FOR UPDATE", "FOR DELETE", "FOR ALL"]) {
      expect(migration, `a ${write} policy would open the table to visitors`).not.toContain(write);
    }
  });

  it("refuses blank text at the database level", () => {
    // Belt and braces: the edge function checks too, but a blank card would
    // render as an empty prompt with no way for a learner to answer it.
    expect(migration).toContain("btrim(ar) <> ''");
    expect(migration).toContain("btrim(ro) <> ''");
    expect(migration).toContain("jsonb_typeof(variants) = 'array'");
  });
});

/**
 * Correction records.
 *
 * What a card said before someone fixed it, and when, is the owner's record of
 * their own judgement. A visitor needs the corrected text and nothing else, so
 * the history lives in its own table that no public role can reach, and the
 * public read path is a function that returns four columns and cannot see it.
 */
describe("correction records stay private", () => {
  it("keeps the history in a table with RLS and no policy", () => {
    expect(privacy).toContain("CREATE TABLE IF NOT EXISTS public.yalla_card_override_history");
    expect(privacy).toContain("ALTER TABLE public.yalla_card_override_history ENABLE ROW LEVEL SECURITY");
    // RLS with no policy denies every row to anon and authenticated; the
    // revoke is the second lock, because Supabase grants those roles table
    // privileges by default and a policy added here later would open reads.
    expect(privacy).toContain("REVOKE ALL ON public.yalla_card_override_history FROM anon, authenticated");
    expect(privacy).not.toMatch(/CREATE POLICY[^;]*yalla_card_override_history/);
  });

  it("records every change, including the delete the republish does", () => {
    // save_card_overrides deletes the whole set and reinserts it, so a
    // trigger on INSERT and UPDATE alone would log a reverted correction as
    // nothing at all.
    expect(privacy).toContain("AFTER INSERT OR UPDATE OR DELETE ON public.yalla_card_overrides");
    expect(privacy).toContain("FOR EACH ROW EXECUTE FUNCTION public.tg_yalla_card_override_history()");
  });

  it("lets the public function return only the published text", () => {
    const fn = privacy.slice(privacy.indexOf("CREATE OR REPLACE FUNCTION public.get_published_card_overrides"));
    expect(fn).toContain("RETURNS TABLE(card_id text, ar text, ro text, variants jsonb)");
    // Not updated_at, which dates the correction, and not the history table.
    expect(fn).not.toContain("updated_at");
    expect(fn).not.toContain("yalla_card_override_history");
    // SECURITY DEFINER reaches past the revoked table grant; a mutable
    // search_path would let a caller point those names elsewhere.
    expect(fn).toContain("SECURITY DEFINER");
    expect(fn).toContain("SET search_path TO 'public'");
    expect(fn).toContain("GRANT EXECUTE ON FUNCTION public.get_published_card_overrides() TO anon, authenticated, service_role");
  });

  it("gives no public role the trigger function either", () => {
    expect(privacy).toContain("REVOKE ALL ON FUNCTION public.tg_yalla_card_override_history() FROM PUBLIC, anon, authenticated");
  });

  it("is reachable from nothing in the app but the admin function", () => {
    // The panel lists overrides through list_card_overrides and writes through
    // save_card_overrides, both service_role. Nothing in src/ should name the
    // history table at all.
    for (const f of ["src/hooks/useCardOverrides.ts", "src/components/admin/CardOverridesAdmin.tsx", "src/components/YallaGame.tsx"]) {
      expect(read(f), `${f} must not reach the correction records`).not.toContain("yalla_card_override_history");
    }
  });
});

describe("the write path", () => {
  const fn = read("supabase/functions/admin-registrations/index.ts");

  it("saves corrections through the admin-gated function", () => {
    expect(fn).toContain('action === "save_card_overrides"');
    expect(fn).toContain("ADMIN_EMAILS");
  });

  it("publishes the whole set so a reverted correction disappears", () => {
    // Upserting alone would leave a correction the teacher removed live for
    // students forever, with nothing in the workspace pointing at it.
    const block = fn.slice(
      fn.indexOf('action === "save_card_overrides"'),
      fn.indexOf('action === "list_card_overrides"'),
    );
    expect(block).toMatch(/from\("yalla_card_overrides"\)\s*\.delete\(\)/);
  });

  it("validates ids and text before writing", () => {
    const block = fn.slice(fn.indexOf('action === "save_card_overrides"'), fn.indexOf('action === "list_card_overrides"'));
    expect(block).toContain("Identificator de card invalid");
    expect(block).toContain("Card incomplet");
  });
});

describe("the read path", () => {
  it("fails soft so a correction outage cannot break the game", () => {
    const hook = read("src/hooks/useCardOverrides.ts");
    expect(hook).toContain("if (error || !data) return {}");
    expect(hook).toContain("retry: false");
  });

  it("reads through the published-only function, never the table", () => {
    // The table's shape is owned by the migration. The hook calls the function
    // through one narrow cast rather than `as any`, which would throw away the
    // row types it maps.
    expect(read("supabase/migrations/20260914180000_yalla_card_overrides.sql")).toContain(
      "CREATE TABLE public.yalla_card_overrides",
    );
    const hook = read("src/hooks/useCardOverrides.ts");
    expect(hook).toContain('rpc("get_published_card_overrides")');
    expect(hook).not.toContain('from("yalla_card_overrides")');
    expect(hook).not.toContain("as any");
  });

  it("keeps Supabase off /joc's critical path", () => {
    // /joc is a public page. A static import would put 216 KB back in front
    // of first paint — the regression src/hooks/useSiteTexts.ts documents.
    const hook = read("src/hooks/useCardOverrides.ts");
    expect(hook).toContain('await import("@/integrations/supabase/client")');
    expect(hook).not.toMatch(/^import\s+\{[^}]*supabase[^}]*\}\s+from/m);
  });

  it("layers a teacher's unpublished edits over the published set", () => {
    // commitEdits replaces the whole map. Passing only the published set would
    // wipe a teacher's in-progress batch in that browser.
    const game = read("src/components/YallaGame.tsx");
    expect(game).toContain("commit({ ...published, ...local })");
    expect(game).toContain("yalla-teacher-edits-v1");
  });

  it("never lets an override failure take the game down", () => {
    const game = read("src/components/YallaGame.tsx");
    const block = game.slice(game.indexOf("const applyOverrides"), game.indexOf("useEffect(() => {\n    if (!mounted"));
    expect(block).toContain("catch");
    expect(block).toContain("return false");
  });
});

/**
 * Correcting a card where you see it.
 *
 * The teacher workspace could already fix a card, but only by searching a list
 * of 4,315 and filling a form — which is not how anyone notices a mistake. You
 * notice it reading the word, or the moment a round marks you wrong. Both of
 * those now carry an edit control.
 */
describe("inline correcting", () => {
  const game = readFileSync(resolve(process.cwd(), "public/yalla/app.js"), "utf8");

  it("shows edit controls only when the page says an owner is present", () => {
    expect(game).toContain("const canEdit=()=>window.YALLA_TEACHER===true");
    // Both entry points: the word browser and the round's answer screen.
    expect(game.match(/data-start-edit=/g)?.length).toBe(2);
  });

  it("puts the handlers above the round-only guard", () => {
    // Everything after `if(!session||session.done)return;` fires only mid-round.
    // The word browser has no session, so a handler below that line can never
    // run there — which is exactly how this broke the first time.
    const click = game.slice(game.indexOf("document.addEventListener('click'"));
    const edit = click.indexOf("b.dataset.startEdit");
    const guard = click.indexOf("if(!session||session.done)return;");
    expect(edit).toBeGreaterThan(-1);
    expect(guard).toBeGreaterThan(-1);
    expect(edit, "startEdit must be handled before the session guard").toBeLessThan(guard);
  });

  it("carries existing corrections across when saving one card", () => {
    // commitEdits replaces the whole map, so writing a single card without
    // merging would silently discard every other correction made that session.
    expect(game).toContain("yalla-teacher-edits-v1");
    expect(game).toMatch(/commitEdits\(\{\.\.\.current,\[id\]:\{ar,ro,variants\}\}\)/);
  });

  it("tells the teacher a correction is not published yet", () => {
    // Saving here changes this browser only. Without saying so, an owner would
    // reasonably assume students already had the fix.
    expect(game).toMatch(/Publica corecturile|Publică corecturile/);
  });
});
