import { useState } from "react";
import { Lock, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.12A6.98 6.98 0 0 1 5.47 12c0-.74.13-1.45.36-2.12V7.04H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

interface Props {
  loading: boolean;
  error: string;
  onGoogleSignIn: () => void;
}

/**
 * Google sign-in opens a sized popup window (the auth SDK only falls back to a
 * full-page redirect inside the Lovable app, not in a normal phone browser),
 * and mobile Safari and Chrome routinely block those — with no fallback, the
 * button simply appears to do nothing. The email link below is the way in on a
 * phone: it is a plain navigation, so nothing can block it.
 *
 * Security is unchanged either way. The admin allowlist is enforced server-side
 * by the edge function against ADMIN_EMAILS, so a session obtained by email
 * link grants exactly as much as one obtained through Google — an address that
 * is not on the list gets a session and still cannot read anything.
 */
const AdminLogin = ({ loading, error, onGoogleSignIn }: Props) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [linkError, setLinkError] = useState("");

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setLinkError("");
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (err) throw err;
      setSent(true);
    } catch {
      setLinkError("Nu am putut trimite linkul. Încearcă din nou.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 bg-card border border-border rounded-xl p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Panou Admin</h1>
          <p className="text-sm text-muted-foreground text-center">
            Autentifică-te cu contul de admin
          </p>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <Button
          onClick={onGoogleSignIn}
          disabled={loading}
          variant="outline"
          className="w-full h-11 gap-3"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
          <span>Continuă cu Google</span>
        </Button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">sau</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {sent ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Link trimis
            </p>
            <p className="mt-1 text-muted-foreground">
              Deschide emailul de la noi și apasă pe link ca să intri în panou. Linkul e valabil o
              singură dată.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-2 text-xs text-primary underline underline-offset-2"
            >
              Trimite din nou
            </button>
          </div>
        ) : (
          <form onSubmit={sendLink} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs text-muted-foreground">
                Link pe email — recomandat pe telefon
              </Label>
              <Input
                id="admin-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adresa ta de admin"
                className="h-11"
              />
            </div>
            {linkError && <p className="text-xs font-medium text-destructive">{linkError}</p>}
            <Button
              type="submit"
              disabled={sending || !email.trim()}
              variant="secondary"
              className="w-full h-11 gap-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>Trimite-mi un link de acces</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
