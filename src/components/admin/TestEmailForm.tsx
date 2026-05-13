import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  email: string;
  sending: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const TestEmailForm = ({ email, sending, onChange, onSubmit }: Props) => (
  <form onSubmit={onSubmit} className="mb-6 rounded-lg border border-border bg-card p-4">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">Test email confirmare</h2>
      <p className="text-sm text-muted-foreground">
        Trimite template-ul de confirmare cu date exemplu către o adresă de test.
      </p>
    </div>
    <div className="grid gap-3 md:grid-cols-[minmax(260px,420px)_auto] md:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="test-email">Email destinatar</Label>
        <Input
          id="test-email"
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          placeholder="test@email.com"
          required
        />
      </div>
      <Button type="submit" disabled={sending}>
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Trimite test
      </Button>
    </div>
  </form>
);

export default TestEmailForm;