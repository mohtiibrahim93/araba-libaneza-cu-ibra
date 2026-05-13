import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmailSettings } from "./types";

interface Props {
  settings: EmailSettings;
  saving: boolean;
  onChange: (settings: EmailSettings) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const EmailSettingsForm = ({ settings, saving, onChange, onSubmit }: Props) => (
  <form onSubmit={onSubmit} className="mb-6 rounded-lg border border-border bg-card p-4">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-foreground">Setări email confirmare</h2>
      <p className="text-sm text-muted-foreground">
        Configurează numele și adresa afișate ca expeditor.
      </p>
    </div>
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="sender-name">Nume expeditor</Label>
        <Input
          id="sender-name"
          value={settings.sender_name}
          onChange={(e) => onChange({ ...settings, sender_name: e.target.value })}
          maxLength={80}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sender-email">Email expeditor</Label>
        <Input
          id="sender-email"
          type="email"
          value={settings.sender_email}
          onChange={(e) => onChange({ ...settings, sender_email: e.target.value })}
          placeholder="noreply@centruldearabalibaneza.com"
          required
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Salvează
      </Button>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">
      Folosește doar domeniile verificate: centruldearabalibaneza.com sau
      notify.centruldearabalibaneza.com.
    </p>
  </form>
);

export default EmailSettingsForm;