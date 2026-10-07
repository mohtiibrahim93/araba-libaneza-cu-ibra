import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, Cloud, Loader2, LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/components/LocalizedLink";
import { YALLA_STORAGE_KEY } from "@/lib/yallaProgress";
import {
  mergeStates,
  readLocalState,
  sameState,
  summarize,
  writeLocalState,
  type GameState,
} from "@/lib/studentSync";

/**
 * Optional student accounts (October 2026, the owner's option B).
 *
 * Playing never needs an account. Signing in (email link or Google) saves the
 * Yalla progress to student_progress, so it follows the student to any device
 * and shows in admin. See src/lib/studentSync.ts for the merge rules.
 *
 * The table is not in the generated Supabase types yet, hence the narrow
 * untyped handle below; RLS limits every call to the student's own row.
 */
type Row = { state: GameState } | null;
const progressTable = () =>
  (supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: Row; error: unknown }> } };
      upsert: (v: Record<string, unknown>) => Promise<{ error: unknown }>;
      delete: () => { eq: (k: string, v: string) => Promise<{ error: unknown }> };
    };
  }).from("student_progress");

async function upload(user: User, state: GameState) {
  const { error } = await progressTable().upsert({
    user_id: user.id,
    email: user.email ?? null,
    state,
    ...summarize(state),
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("[student-sync] upload failed", error);
}

/**
 * Signs the visitor's progress in and out of their account.
 * `version` changes whenever the saved progress replaced what the game had
 * loaded — pages pass it to YallaGame so the frame reloads with it.
 */
export function useStudentSync() {
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [version, setVersion] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => !cancelled && setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // On sign-in: merge the device's progress with the account's, both ways.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      setSyncing(true);
      try {
        const { data, error } = await progressTable().select("state").eq("user_id", user.id).maybeSingle();
        if (error) throw error;
        const local = readLocalState();
        const merged = mergeStates(local, data?.state ?? null);
        if (cancelled) return;
        if (!sameState(local, merged)) {
          writeLocalState(merged);
          setVersion((v) => v + 1);
        }
        if (!sameState(data?.state ?? null, merged)) await upload(user, merged);
      } catch (e) {
        console.error("[student-sync] sync failed", e);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // While playing: the game (same origin, in its frame) writes localStorage,
  // which fires a storage event here. Upload a few seconds after it settles,
  // and once more when the page is hidden.
  useEffect(() => {
    if (!user) return;
    const flush = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
      const state = readLocalState();
      if (state) void upload(user, state);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== YALLA_STORAGE_KEY) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, 4000);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden" && timer.current) flush();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onHide);
      if (timer.current) flush();
    };
  }, [user]);

  return { user, syncing, version };
}

const COPY = {
  ro: {
    title: "Salvează progresul în cont",
    text: "Opțional. Cu un cont, scorul și progresul din joc te urmează pe orice dispozitiv, iar Ibra îți vede nivelul.",
    email: "Emailul tău",
    send: "Trimite-mi linkul",
    sending: "Se trimite…",
    google: "Continuă cu Google",
    sent: "Ți-am trimis un link pe email. Deschide-l pe acest dispozitiv ca să intri.",
    consent: "Salvăm emailul și progresul din joc ca să le vezi pe orice dispozitiv. Detalii în",
    privacy: "politica de confidențialitate",
    signedIn: "Progresul se salvează în contul",
    syncing: "Se sincronizează…",
    signOut: "Ieși din cont",
    signOutNote: "Progresul rămâne salvat în cont.",
    error: "Nu am putut trimite linkul. Încearcă din nou.",
    invalid: "Scrie o adresă de email validă.",
  },
  en: {
    title: "Save your progress to an account",
    text: "Optional. With an account, your game score and progress follow you to any device, and Ibra can see your level.",
    email: "Your email",
    send: "Send me the link",
    sending: "Sending…",
    google: "Continue with Google",
    sent: "We've emailed you a link. Open it on this device to sign in.",
    consent: "We store your email and game progress so you can see them on any device. Details in the",
    privacy: "privacy policy",
    signedIn: "Your progress is saved to the account",
    syncing: "Syncing…",
    signOut: "Sign out",
    signOutNote: "Your progress stays saved in the account.",
    error: "We couldn't send the link. Please try again.",
    invalid: "Please enter a valid email address.",
  },
} as const;

/** The sign-in box shown next to the game, the level test and the score. */
export const StudentAccountBox = ({ user, syncing }: { user: User | null; syncing: boolean }) => {
  const { lang } = useI18n();
  const c = COPY[lang];
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const redirect = typeof window !== "undefined" ? window.location.href.split("#")[0] : undefined;

  const sendLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return void toast.error(c.invalid);
      setSending(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { ...(redirect ? { emailRedirectTo: redirect } : {}), shouldCreateUser: true },
      });
      setSending(false);
      if (error) {
        console.error("[student-account] magic link failed", error);
        toast.error(c.error);
        return;
      }
      setSent(true);
    },
    [email, redirect, c],
  );

  const google = useCallback(async () => {
    const result = await lovable.auth.signInWithOAuth("google", redirect ? { redirect_uri: redirect } : undefined);
    if (result.error) toast.error(c.error);
  }, [redirect, c]);

  const card = "rounded-2xl border border-[#E7E1D6] bg-card p-5 dark:border-border";

  if (user) {
    return (
      <div className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
        <p className="flex items-center gap-2 text-sm text-foreground">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin text-brand-green" /> : <CheckCircle2 className="h-4 w-4 text-brand-green" />}
          <span>
            {syncing ? c.syncing : c.signedIn} <strong className="break-all">{user.email}</strong>
          </span>
        </p>
        <button
          type="button"
          onClick={() => void supabase.auth.signOut().then(() => toast.success(c.signOutNote))}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-muted-foreground hover:text-foreground sm:self-auto"
        >
          <LogOut className="h-4 w-4" /> {c.signOut}
        </button>
      </div>
    );
  }

  return (
    <div className={card}>
      <p className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Cloud className="h-5 w-5 text-brand-green" aria-hidden /> {c.title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
      {sent ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-green/5 px-4 py-3 text-sm text-foreground">
          <Mail className="h-4 w-4 shrink-0 text-brand-green" /> {c.sent}
        </p>
      ) : (
        <>
          <form onSubmit={sendLink} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="student-email">{c.email}</label>
            <input
              id="student-email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={c.email}
              className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm sm:flex-1 dark:bg-background"
            />
            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-green px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {sending ? c.sending : c.send}
            </button>
            <button
              type="button"
              onClick={() => void google()}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E7E1D6] bg-white px-5 text-sm font-semibold text-foreground transition hover:border-brand-green dark:border-border dark:bg-background"
            >
              {c.google}
            </button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            {c.consent} <Link to="/privacy" className="underline">{c.privacy}</Link>.
          </p>
        </>
      )}
    </div>
  );
};
