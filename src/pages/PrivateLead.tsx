import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LeadStatus = "new" | "contacted" | "confirmed";

interface Registration {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  center: string | null;
  format: string | null;
  notes: string | null;
  lead_status: LeadStatus;
}

interface StatusHistoryItem {
  id: string;
  created_at: string;
  previous_status: LeadStatus | null;
  new_status: LeadStatus;
  changed_by: string;
}

const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Nou",
  contacted: "Contactat",
  confirmed: "Confirmat",
};

const formatLabels: Record<string, string> = {
  fizic: "Față în față",
  online: "Online",
};

const extractMessage = (notes: string | null) => {
  if (!notes) return "—";
  const marker = "Message:";
  const index = notes.indexOf(marker);
  return index >= 0 ? notes.slice(index + marker.length).trim() || "—" : notes;
};

const PrivateLead = () => {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [lead, setLead] = useState<Registration | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLead = async (adminPassword: string) => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
        body: { password: adminPassword, action: "get_private_lead", id },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        return;
      }

      setLead(data.data.registration);
      setHistory(data.data.history || []);
      setStoredPassword(adminPassword);
    } catch {
      setError("Lead-ul nu a putut fi încărcat.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadStatus: LeadStatus) => {
    if (!lead) return;
    const previous = lead;
    setLead({ ...lead, lead_status: leadStatus });

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
        body: { password: storedPassword, action: "update_status", id: lead.id, lead_status: leadStatus },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      await loadLead(storedPassword);
    } catch {
      setLead(previous);
      toast({ title: "Statusul nu a putut fi actualizat", variant: "destructive" });
    }
  };

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadLead(password);
          }}
          className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-bold text-foreground">Lead lecții private</h1>
            <p className="text-sm text-muted-foreground">Introdu parola de admin pentru detalii.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Deschide lead
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/admin"><ArrowLeft className="h-4 w-4" /> Înapoi la admin</Link>
        </Button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Lead lecții private</p>
            <h1 className="text-3xl font-bold text-foreground">{lead.name}</h1>
            <p className="text-sm text-muted-foreground">
              Creat pe {new Date(lead.created_at).toLocaleString("ro-RO")}
            </p>
          </div>
          <div className="w-full sm:w-48">
            <Label>Status lead</Label>
            <Select value={lead.lead_status || "new"} onValueChange={(value) => handleStatusChange(value as LeadStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{leadStatusLabels.new}</SelectItem>
                <SelectItem value="contacted">{leadStatusLabels.contacted}</SelectItem>
                <SelectItem value="confirmed">{leadStatusLabels.confirmed}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Detalii contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <a href={`tel:${lead.phone}`} className="rounded-lg border border-border p-4 transition-colors hover:bg-muted">
                <Phone className="mb-2 h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Telefon</p>
                <p className="font-medium text-foreground">{lead.phone}</p>
              </a>
              <a href={lead.email ? `mailto:${lead.email}` : undefined} className="rounded-lg border border-border p-4 transition-colors hover:bg-muted">
                <Mail className="mb-2 h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{lead.email || "—"}</p>
              </a>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Format</p>
                <p className="font-medium text-foreground">{lead.format ? formatLabels[lead.format] || lead.format : "—"}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Centru</p>
                <p className="font-medium text-foreground">{lead.center || "—"}</p>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold text-foreground">Mesaj</h2>
              <p className="whitespace-pre-wrap rounded-lg border border-border bg-background p-4 text-sm text-foreground">
                {extractMessage(lead.notes)}
              </p>
            </div>
          </section>

          <aside className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Istoric statusuri</h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nu există schimbări de status încă.</p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-medium text-foreground">
                      {item.previous_status ? leadStatusLabels[item.previous_status] : "—"} → {leadStatusLabels[item.new_status]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString("ro-RO")} · {item.changed_by}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PrivateLead;