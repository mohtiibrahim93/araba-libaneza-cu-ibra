import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Gamepad2, RefreshCw, SquarePen } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Empty, ErrorNote, Loading, ScreenToolbar, Section, TableWrap, Td, Th, Tr } from "./ui";

/**
 * The game cards that have been corrected by hand.
 *
 * Two loose ends meet here. `list_card_overrides` was the last admin action
 * with no caller in `src/` — not an orphaned feature like the kids' slots, but
 * a redundant one: the game reads the published text for itself, through
 * `get_published_card_overrides()`, so it never needed the admin route. The
 * table itself is private now, and the correction records behind it are not
 * readable from the browser at all.
 *
 * The other is that the editing itself happens inside the public game.
 * `YallaGame.tsx` reveals its "Corectează" controls when a Supabase session
 * exists and publishes through `save_card_overrides`, so the only way to reach
 * it is to open `/joc` while signed in. Nothing in the panel said so, which is
 * how an admin screen stays secret from its own admin.
 *
 * So this is deliberately a read-only list plus a way in. Editing stays where
 * it works — over the card, in context, where you can see what you are
 * changing.
 */

interface Override {
  card_id: string;
  ar: string | null;
  ro: string | null;
  variants: unknown;
  updated_at: string;
}

const stamp = new Intl.DateTimeFormat("ro-RO", {
  timeZone: "Europe/Bucharest",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const CardOverridesAdmin = () => {
  const [rows, setRows] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await invokeAdmin({ action: "list_card_overrides" });
      if (err) throw err;
      if (data?.error) throw new Error(data.error);
      setRows(data?.data ?? []);
    } catch (e) {
      console.error("[card overrides] load failed", e);
      setError("Corecturile nu au putut fi încărcate.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openGame = (
    <Button asChild size="sm" variant="outline">
      <a href="/joc" target="_blank" rel="noopener noreferrer">
        <SquarePen className="h-4 w-4" />
        Editează în joc
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </Button>
  );

  return (
    <div className="space-y-5">
      <ScreenToolbar>
        {openGame}
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} aria-label="Reîncarcă">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </ScreenToolbar>

      <Section
        title="Unde se editează"
        icon={Gamepad2}
        tone="quiet"
        description="Corectarea se face peste cartonaș, în joc — acolo vezi ce schimbi. Deschide /joc fiind autentificat și apar controalele „Corectează”. Butonul de mai sus face exact asta."
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          Controalele apar doar dacă ești autentificat, dar asta e o comoditate, nu bariera:
          publicarea trece prin funcția de admin, care verifică adresa față de lista de
          administratori, iar tabelul nu permite scriere publică.
        </p>
      </Section>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading && rows.length === 0 && <Loading label="Se încarcă…" />}

      {!loading && rows.length === 0 && !error && (
        <Empty
          icon={Gamepad2}
          title="Niciun cartonaș corectat."
          description="Cartonașele din joc sunt exact cele generate din conținutul sursă."
          action={openGame}
        />
      )}

      {rows.length > 0 && (
        <Section title={`Cartonașe corectate (${rows.length})`} icon={SquarePen}>
          <TableWrap label="Cartonașe corectate">
            <thead>
              <tr>
                <Th>Cartonaș</Th>
                <Th>Arabă</Th>
                <Th>Română</Th>
                <Th>Schimbat</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.card_id}>
                  <Td className="font-mono text-xs text-muted-foreground">{r.card_id}</Td>
                  <Td className="max-w-[16rem] truncate text-foreground">{r.ar || "—"}</Td>
                  <Td className="max-w-[16rem] truncate text-muted-foreground">{r.ro || "—"}</Td>
                  <Td className="whitespace-nowrap tabular-nums text-xs text-muted-foreground">
                    {stamp.format(new Date(r.updated_at))}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </Section>
      )}
    </div>
  );
};

export default CardOverridesAdmin;
