import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
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
import {
  Lock,
  LogOut,
  Loader2,
  Send,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type EmailStatus = "sent" | "pending" | "failed" | "dlq" | "suppressed" | "not_sent" | "no_email";

interface NotificationRow {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  form_type: string;
  format: string | null;
  center: string | null;
  whatsapp_sent_at: string | null;
  lead_status: string;
  email_status: EmailStatus;
  email_sent_at: string | null;
}

const WHATSAPP_BASE = "https://wa.me/";

const formTypeLabels: Record<string, string> = {
  group: "Grup",
  private: "Privat",
  kids: "Copii",
};

const formatPhoneForWa = (phone: string) => phone.replace(/[^\d]/g, "");

const buildWaMessage = (r: NotificationRow) => {
  const tip = formTypeLabels[r.form_type] || r.form_type;
  return encodeURIComponent(
    `Bună, ${r.name}! Sunt Ibra de la Centrul de Arabă Libaneză. Mulțumesc pentru înscrierea la cursul ${tip}. Confirm rezervarea ta și îți trimit toate detaliile aici.`
  );
};

const EmailBadge = ({ status }: { status: EmailStatus }) => {
  const map: Record<EmailStatus, { label: string; cls: string; icon: JSX.Element }> = {
    sent: { label: "Trimis", cls: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-3 h-3" /> },
    pending: { label: "În așteptare", cls: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
    failed: { label: "Eșuat", cls: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
    dlq: { label: "Eșuat (final)", cls: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
    suppressed: { label: "Blocat", cls: "bg-gray-200 text-gray-800", icon: <XCircle className="w-3 h-3" /> },
    not_sent: { label: "Netrimis", cls: "bg-gray-100 text-gray-700", icon: <Clock className="w-3 h-3" /> },
    no_email: { label: "Fără email", cls: "bg-gray-100 text-gray-500", icon: <XCircle className="w-3 h-3" /> },
  };
  const v = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${v.cls}`}>
      {v.icon} {v.label}
    </span>
  );
};

const WhatsAppBadge = ({ sentAt }: { sentAt: string | null }) =>
  sentAt ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      <CheckCircle2 className="w-3 h-3" /> Trimis
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      <Clock className="w-3 h-3" /> Netrimis
    </span>
  );

const AdminNotifications = () => {
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const refresh = useCallback(async (pwd: string) => {
    const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
      body: { password: pwd, action: "list_notifications" },
    });
    if (fnError) throw fnError;
    if (data?.error) throw new Error(data.error);
    setRows(data.data || []);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await refresh(password);
      setStoredPassword(password);
      setAuthenticated(true);
    } catch (err: any) {
      setError(err?.message === "Parolă incorectă" ? "Parolă incorectă" : "Eroare la autentificare");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
    setStoredPassword("");
    setRows([]);
  };

  const handleResendEmail = async (id: string) => {
    setBusyId(id);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
        body: { password: storedPassword, action: "resend_confirmation", id },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Email retrimis", description: "Va apărea ca trimis după procesare." });
      await refresh(storedPassword);
    } catch (err: any) {
      toast({ title: "Retrimitere eșuată", description: err?.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenWhatsApp = async (r: NotificationRow) => {
    const phone = formatPhoneForWa(r.phone);
    if (!phone) {
      toast({ title: "Telefon invalid", variant: "destructive" });
      return;
    }
    const url = `${WHATSAPP_BASE}${phone}?text=${buildWaMessage(r)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setBusyId(r.id);
    // Optimistic update
    setRows((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, whatsapp_sent_at: new Date().toISOString() } : x))
    );
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
        body: { password: storedPassword, action: "mark_whatsapp_sent", id: r.id },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      toast({ title: "Nu s-a putut salva statusul WhatsApp", variant: "destructive" });
      setRows((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, whatsapp_sent_at: r.whatsapp_sent_at } : x))
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleClearWhatsApp = async (id: string) => {
    setBusyId(id);
    const prev = rows.find((x) => x.id === id)?.whatsapp_sent_at || null;
    setRows((p) => p.map((x) => (x.id === id ? { ...x, whatsapp_sent_at: null } : x)));
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
        body: { password: storedPassword, action: "mark_whatsapp_sent", id, clear: true },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
    } catch {
      setRows((p) => p.map((x) => (x.id === id ? { ...x, whatsapp_sent_at: prev } : x)));
      toast({ title: "Eroare", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "pending") {
      return rows.filter(
        (r) =>
          (r.email_status !== "sent" && r.email_status !== "no_email") || !r.whatsapp_sent_at
      );
    }
    return rows.filter(
      (r) =>
        (r.email_status === "sent" || r.email_status === "no_email") && r.whatsapp_sent_at
    );
  }, [rows, filter]);

  const counts = useMemo(() => {
    let pending = 0;
    let done = 0;
    for (const r of rows) {
      const emailOk = r.email_status === "sent" || r.email_status === "no_email";
      const waOk = !!r.whatsapp_sent_at;
      if (emailOk && waOk) done++;
      else pending++;
    }
    return { total: rows.length, pending, done };
  }, [rows]);

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
            <h1 className="text-xl font-bold text-foreground">Notificări — Admin</h1>
            <p className="text-sm text-muted-foreground">
              Status email & WhatsApp pentru fiecare lead
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Intră
          </Button>
          <Link to="/admin" className="block text-center text-xs text-muted-foreground hover:text-primary">
            ← Panou principal
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" /> Admin
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-bold text-foreground">Notificări</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh(storedPassword)}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Reîncarcă
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Ieși
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {([
            ["all", `Toate · ${counts.total}`],
            ["pending", `În așteptare · ${counts.pending}`],
            ["done", `Finalizate · ${counts.done}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filter === key
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Email status</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    Nicio înscriere de afișat
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const isBusy = busyId === r.id;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("ro-RO")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.phone}</div>
                        {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formTypeLabels[r.form_type] || r.form_type}
                        {r.format && (
                          <div className="text-xs text-muted-foreground">{r.format}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <EmailBadge status={r.email_status} />
                        {r.email_sent_at && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {new Date(r.email_sent_at).toLocaleString("ro-RO")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <WhatsAppBadge sentAt={r.whatsapp_sent_at} />
                        {r.whatsapp_sent_at && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {new Date(r.whatsapp_sent_at).toLocaleString("ro-RO")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex flex-col sm:flex-row gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy || !r.email}
                            onClick={() => handleResendEmail(r.id)}
                            title={!r.email ? "Lead-ul nu are email" : "Retrimite confirmarea"}
                          >
                            {isBusy ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span className="ml-1">Retrimite</span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#25D366] hover:bg-[#1fb855] text-white"
                            disabled={isBusy}
                            onClick={() => handleOpenWhatsApp(r)}
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span className="ml-1">WhatsApp</span>
                          </Button>
                          {r.whatsapp_sent_at && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isBusy}
                              onClick={() => handleClearWhatsApp(r.id)}
                              title="Anulează status WhatsApp"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;