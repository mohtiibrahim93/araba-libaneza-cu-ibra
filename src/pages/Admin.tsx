import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock, LogOut, Loader2 } from "lucide-react";

interface Registration {
  id: string;
  created_at: string;
  form_type: string;
  name: string;
  phone: string;
  email: string | null;
  center: string | null;
  format: string | null;
  child_age: string | null;
  notes: string | null;
}

const formTypeLabels: Record<string, string> = {
  group: "Curs Grup",
  private: "Lecții Private",
  kids: "Curs Copii",
};

const Admin = () => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "admin-registrations",
        { body: { password } }
      );

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        return;
      }

      setRegistrations(data.data);
      setAuthenticated(true);
    } catch {
      setError("Eroare la autentificare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
    setRegistrations([]);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-6 bg-card border border-border rounded-xl p-8 shadow-lg"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Panou Admin</h1>
            <p className="text-sm text-muted-foreground">
              Introdu parola pentru a vedea înscrierile
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Autentifică-te
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">
            Înscrieri ({registrations.length})
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Ieși
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nu există înscrieri momentan.
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Nume</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Centru</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Vârstă copil</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {new Date(r.created_at).toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {formTypeLabels[r.form_type] || r.form_type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.email || "—"}
                    </TableCell>
                    <TableCell>{r.center || "—"}</TableCell>
                    <TableCell>{r.format || "—"}</TableCell>
                    <TableCell>{r.child_age || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {r.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
