import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  password: string;
  loading: boolean;
  error: string;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AdminLogin = ({ password, loading, error, onPasswordChange, onSubmit }: Props) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-6 bg-card border border-border rounded-xl p-8 shadow-lg"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Panou Admin</h1>
        <p className="text-sm text-muted-foreground">Introdu parola pentru a vedea înscrierile</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Parolă</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Autentifică-te
      </Button>
    </form>
  </div>
);

export default AdminLogin;