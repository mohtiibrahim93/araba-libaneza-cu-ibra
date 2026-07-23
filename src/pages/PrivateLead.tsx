import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { invokeAdmin } from "@/lib/adminAuth";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  LEAD_STATUSES,
  leadStatusLabels,
  type LeadStatus,
} from "@/components/admin/types";

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PrivateLead = () => {
  const { id } = useParams();
  const isValidId = !!id && UUID_RE.test(id);
  const [lead, setLead] = useState<Registration | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const loadLead = async () => {
    if (!isValidId) {
      setError("ID lead invalid.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await invokeAdmin({ action: "get_private_lead", id });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        setAuthenticated(false);
        return;
      }

      setLead(data.data.registration);
      setHistory(data.data.history || []);
      setAuthenticated(true);
    } catch {
      setError("Lead-ul nu a putut fi încărcat.");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const checkSession = async (hasSession: boolean) => {
      if (!hasSession) {
        if (!cancelled) setCheckingSession(false);
        return;
      }
      await loadLead();
      if (!cancelled) setCheckingSession(false);
    };
    supabase.auth.getSession().then(({ data }) => checkSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      checkSession(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + `/admin/private-leads/${id}`,
      });
      if (result.error) {
        setError("Eroare la autentificare.");
        setLoading(false);
      }
    } catch {
      setError("Eroare la autentificare.");
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadStatus: LeadStatus) => {
    if (!lead) return;
    const previous = lead;
    setLead({ ...lead, lead_status: leadStatus });

    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "update_status",
        id: lead.id,
        lead_status: leadStatus,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      await loadLead();
    } catch {
      setLead(previous);
      toast({ title: "Statusul nu a putut fi actualizat", variant: "destructive" });
    }
  };

  if (!lead) {
    if (!isValidId) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8 text-center shadow-lg">
            <h2 className="text-xl font-bold text-foreground">Link invalid</h2>
            <p className="text-sm text-muted-foreground">
              Acest URL nu conține un ID de lead valid. Deschide un lead din lista de admin.
            </p>
            <Button asChild className="w-full">
              <Link to="/admin"><ArrowLeft className="h-4 w-4" /> Înapoi la admin</Link>
            </Button>
          </div>
        </div>
      );
    }
    if (checkingSession) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (!authenticated) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-foreground">Lead lecții private</h2>
              <p className="text-sm text-muted-foreground">Autentifică-te cu contul Google de admin.</p>
            </div>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <Button onClick={handleGoogleSignIn} className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continuă cu Google
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
                {LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {leadStatusLabels[status]}
                  </SelectItem>
                ))}
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