import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, LogOut, Loader2, Trash2, Download, ExternalLink, Search, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LeadStatus = "new" | "contacted" | "confirmed";
type CourseTypeFilter = "all" | "group" | "private" | "kids";
type LeadStatusFilter = "all" | LeadStatus;

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
  lead_status: LeadStatus;
}

interface EmailSettings {
  sender_name: string;
  sender_email: string;
}

const formTypeLabels: Record<string, string> = {
  group: "Curs Grup",
  private: "Lecții Private",
  kids: "Curs Copii",
};

const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Nou",
  contacted: "Contactat",
  confirmed: "Confirmat",
};

const Admin = () => {
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [courseTypeFilter, setCourseTypeFilter] = useState<CourseTypeFilter>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatusFilter>("all");
  const [privateMessageSearch, setPrivateMessageSearch] = useState("");
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    sender_name: "Arabă Libaneză cu Ibra",
    sender_email: "noreply@arabalibanezacuibra.ro",
  });
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<{ id: string; status: LeadStatus } | null>(null);

  const filteredRegistrations = useMemo(
    () => {
      const messageTerms = privateMessageSearch
        .trim()
        .toLocaleLowerCase("ro-RO")
        .split(/\s+/)
        .filter(Boolean);

      return registrations.filter((r) => {
        const matchesCourse = courseTypeFilter === "all" || r.form_type === courseTypeFilter;
        const matchesStatus = leadStatusFilter === "all" || (r.lead_status || "new") === leadStatusFilter;
        const matchesPrivateMessage =
          messageTerms.length === 0 ||
          (r.form_type === "private" &&
            messageTerms.every((term) => (r.notes || "").toLocaleLowerCase("ro-RO").includes(term)));

        return matchesCourse && matchesStatus && matchesPrivateMessage;
      });
    },
    [registrations, courseTypeFilter, leadStatusFilter, privateMessageSearch]
  );

  const privateLeadCounts = useMemo(
    () =>
      registrations.reduce(
        (counts, r) => {
          if (r.form_type !== "private") return counts;
          const status = r.lead_status || "new";
          counts.total += 1;
          counts[status] += 1;
          return counts;
        },
        { total: 0, new: 0, contacted: 0, confirmed: 0 } as Record<LeadStatus | "total", number>
      ),
    [registrations]
  );

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
      if (data.settings) setEmailSettings(data.settings);
      setStoredPassword(password);
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
    setStoredPassword("");
    setRegistrations([]);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const filteredIds = filteredRegistrations.map((r) => r.id);
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredIds));
    }
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    setDeleting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "admin-registrations",
        {
          body: {
            password: storedPassword,
            action: "delete",
            ids: Array.from(selected),
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setRegistrations((prev) =>
        prev.filter((r) => !selected.has(r.id))
      );
      toast({
        title: `${selected.size} înscrier${selected.size === 1 ? "e" : "i"} ștears${selected.size === 1 ? "ă" : "e"}`,
      });
      setSelected(new Set());
    } catch {
      toast({
        title: "Eroare la ștergere",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, leadStatus: LeadStatus) => {
    const previous = registrations;
    setUpdatingStatus({ id, status: leadStatus });
    setRegistrations((current) =>
      current.map((r) => (r.id === id ? { ...r, lead_status: leadStatus } : r))
    );

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "admin-registrations",
        {
          body: {
            password: storedPassword,
            action: "update_status",
            id,
            lead_status: leadStatus,
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
    } catch {
      setRegistrations(previous);
      toast({
        title: "Statusul nu a putut fi actualizat",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus((current) => (current?.id === id && current.status === leadStatus ? null : current));
    }
  };

  const handleEmailSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingEmailSettings(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
        body: {
          password: storedPassword,
          action: "update_email_settings",
          sender_name: emailSettings.sender_name,
          sender_email: emailSettings.sender_email,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (data?.settings) setEmailSettings(data.settings);
      toast({ title: "Setările expeditorului au fost salvate" });
    } catch {
      toast({ title: "Setările nu au putut fi salvate", variant: "destructive" });
    } finally {
      setSavingEmailSettings(false);
    }
  };

  const handleTestEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const recipient = testEmail.trim();
    if (!recipient) return;

    setSendingTestEmail(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "registration-confirmation",
          recipientEmail: recipient,
          idempotencyKey: `reg-confirm-test-${Date.now()}`,
          templateData: {
            name: "Maria Popescu",
            formType: "private",
            format: "online",
            message: "Aș prefera lecții seara, după ora 18:00, cu accent pe conversație.",
            statusUrl: `${window.location.origin}/private-status/exemplu`,
          },
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Emailul de test a fost trimis" });
    } catch {
      toast({ title: "Emailul de test nu a putut fi trimis", variant: "destructive" });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleExport = useCallback(() => {
    const headers = [
      "Data",
      "Tip",
      "Nume",
      "Telefon",
      "Email",
      "Centru",
      "Format",
      "Status lead",
      "Vârsta copil",
      "Note",
    ];

    const rows = filteredRegistrations.map((r) => [
      new Date(r.created_at).toLocaleString("ro-RO"),
      formTypeLabels[r.form_type] || r.form_type,
      r.name,
      r.phone,
      r.email || "",
      r.center || "",
      r.format || "",
      leadStatusLabels[r.lead_status || "new"],
      r.child_age || "",
      r.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const courseSuffix = courseTypeFilter === "all" ? "toate" : courseTypeFilter;
    const statusSuffix = leadStatusFilter === "all" ? "toate-statusurile" : leadStatusFilter;
    a.download = `inscrieri_${courseSuffix}_${statusSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredRegistrations, courseTypeFilter, leadStatusFilter]);

  const privateFilteredRegistrations = useMemo(
    () => filteredRegistrations.filter((r) => r.form_type === "private"),
    [filteredRegistrations]
  );

  const getPrivateExportFilename = useCallback((extension: "csv" | "pdf") => {
    const statusSuffix = leadStatusFilter === "all" ? "toate-statusurile" : leadStatusFilter;
    const searchSuffix = privateMessageSearch.trim()
      ? `_mesaj-${privateMessageSearch.trim().toLocaleLowerCase("ro-RO").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")}`
      : "";
    return `leaduri_private_${statusSuffix}${searchSuffix}_${new Date().toISOString().slice(0, 10)}.${extension}`;
  }, [leadStatusFilter, privateMessageSearch]);

  const handlePrivateCsvExport = useCallback(() => {
    const headers = ["Data", "Nume", "Telefon", "Email", "Format", "Status lead", "Mesaj"];
    const rows = privateFilteredRegistrations.map((r) => [
      new Date(r.created_at).toLocaleString("ro-RO"),
      r.name,
      r.phone,
      r.email || "",
      r.format || "",
      leadStatusLabels[r.lead_status || "new"],
      r.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getPrivateExportFilename("csv");
    a.click();
    URL.revokeObjectURL(url);
  }, [privateFilteredRegistrations, getPrivateExportFilename]);

  const handlePrivatePdfExport = useCallback(() => {
    const doc = new jsPDF({ orientation: "landscape" });
    const statusLabel = leadStatusFilter === "all" ? "Toate statusurile" : leadStatusLabels[leadStatusFilter];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Lead-uri lectii private", 14, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Filtru status: ${statusLabel} · Total: ${privateFilteredRegistrations.length}`, 14, 24);

    autoTable(doc, {
      startY: 32,
      head: [["Data", "Nume", "Telefon", "Email", "Format", "Status", "Mesaj"]],
      body: privateFilteredRegistrations.map((r) => [
        new Date(r.created_at).toLocaleString("ro-RO"),
        r.name,
        r.phone,
        r.email || "—",
        r.format || "—",
        leadStatusLabels[r.lead_status || "new"],
        r.notes || "—",
      ]),
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255] },
      columnStyles: { 6: { cellWidth: 78 } },
      margin: { left: 14, right: 14 },
    });

    doc.save(getPrivateExportFilename("pdf"));
  }, [privateFilteredRegistrations, leadStatusFilter, getPrivateExportFilename]);

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
            Înscrieri ({filteredRegistrations.length}/{registrations.length})
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrivateCsvExport} disabled={privateFilteredRegistrations.length === 0}>
              <Download className="w-4 h-4" />
              Private CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrivatePdfExport} disabled={privateFilteredRegistrations.length === 0}>
              <Download className="w-4 h-4" />
              Private PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredRegistrations.length === 0}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Ieși
            </Button>
          </div>
        </div>
      </header>

      {selected.size > 0 && (
        <div className="border-b border-border bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selected.size} selectat{selected.size > 1 ? "e" : "ă"}
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deleting}>
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Trash2 className="w-4 h-4" />
                  Șterge
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ești sigur că vrei să ștergi {selected.size} înscrier
                    {selected.size === 1 ? "e" : "i"}? Acțiunea nu poate fi
                    anulată.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Șterge definitiv
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleEmailSettingsSubmit} className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Setări email confirmare</h2>
            <p className="text-sm text-muted-foreground">Configurează numele și adresa afișate ca expeditor.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="sender-name">Nume expeditor</Label>
              <Input
                id="sender-name"
                value={emailSettings.sender_name}
                onChange={(e) => setEmailSettings((current) => ({ ...current, sender_name: e.target.value }))}
                maxLength={80}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-email">Email expeditor</Label>
              <Input
                id="sender-email"
                type="email"
                value={emailSettings.sender_email}
                onChange={(e) => setEmailSettings((current) => ({ ...current, sender_email: e.target.value }))}
                placeholder="noreply@arabalibanezacuibra.ro"
                required
              />
            </div>
            <Button type="submit" disabled={savingEmailSettings}>
              {savingEmailSettings && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvează
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Folosește doar domeniile verificate: arabalibanezacuibra.ro sau notify.arabalibanezacuibra.ro.
          </p>
        </form>

        <form onSubmit={handleTestEmailSubmit} className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Test email confirmare</h2>
            <p className="text-sm text-muted-foreground">Trimite template-ul de confirmare cu date exemplu către o adresă de test.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(260px,420px)_auto] md:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="test-email">Email destinatar</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@email.com"
                required
              />
            </div>
            <Button type="submit" disabled={sendingTestEmail}>
              {sendingTestEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Trimite test
            </Button>
          </div>
        </form>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[180px_180px_minmax(260px,360px)]">
            <div className="space-y-1.5">
              <Label>Tip curs</Label>
              <Select value={courseTypeFilter} onValueChange={(value) => setCourseTypeFilter(value as CourseTypeFilter)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate cursurile</SelectItem>
                  <SelectItem value="group">{formTypeLabels.group}</SelectItem>
                  <SelectItem value="private">Lead-uri lecții private</SelectItem>
                  <SelectItem value="kids">{formTypeLabels.kids}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status lead</Label>
              <Select value={leadStatusFilter} onValueChange={(value) => setLeadStatusFilter(value as LeadStatusFilter)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate statusurile</SelectItem>
                  <SelectItem value="new">{leadStatusLabels.new}</SelectItem>
                  <SelectItem value="contacted">{leadStatusLabels.contacted}</SelectItem>
                  <SelectItem value="confirmed">{leadStatusLabels.confirmed}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="private-message-search">Caută în mesaj</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="private-message-search"
                  value={privateMessageSearch}
                  onChange={(e) => setPrivateMessageSearch(e.target.value)}
                  placeholder="ex: online, program, seară"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCourseTypeFilter("all");
              setLeadStatusFilter("all");
              setPrivateMessageSearch("");
            }}
          >
            Resetează filtrele
          </Button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setCourseTypeFilter("private");
              setLeadStatusFilter("all");
            }}
            className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
          >
            <p className="text-xs font-medium text-muted-foreground">Lead-uri private</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{privateLeadCounts.total}</p>
          </button>
          {(["new", "contacted", "confirmed"] as LeadStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setCourseTypeFilter("private");
                setLeadStatusFilter(status);
              }}
              className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
            >
              <p className="text-xs font-medium text-muted-foreground">Private · {leadStatusLabels[status]}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{privateLeadCounts[status]}</p>
            </button>
          ))}
        </div>

        {registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nu există înscrieri momentan.
          </p>
        ) : filteredRegistrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nu există lead-uri pentru filtrele selectate.
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        filteredRegistrations.length > 0 &&
                        filteredRegistrations.every((r) => selected.has(r.id))
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Nume</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Centru</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vârstă copil</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Detalii</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((r) => (
                  <TableRow
                    key={r.id}
                    data-state={selected.has(r.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.has(r.id)}
                        onCheckedChange={() => toggleSelect(r.id)}
                      />
                    </TableCell>
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
                    <TableCell>
                      {r.form_type === "private" ? (
                        <div className="flex min-w-[252px] gap-1">
                          {(["new", "contacted", "confirmed"] as LeadStatus[]).map((status) => (
                            <Button
                              key={status}
                              type="button"
                              size="sm"
                              variant={(r.lead_status || "new") === status ? "default" : "outline"}
                              className="h-8 px-2 text-xs"
                              onClick={() => handleStatusChange(r.id, status)}
                            >
                              {leadStatusLabels[status]}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Select
                          value={r.lead_status || "new"}
                          onValueChange={(value) => handleStatusChange(r.id, value as LeadStatus)}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">{leadStatusLabels.new}</SelectItem>
                            <SelectItem value="contacted">{leadStatusLabels.contacted}</SelectItem>
                            <SelectItem value="confirmed">{leadStatusLabels.confirmed}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>{r.child_age || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {r.notes || "—"}
                    </TableCell>
                    <TableCell>
                      {r.form_type === "private" ? (
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/private-leads/${r.id}`}>
                            <ExternalLink className="h-4 w-4" />
                            Detalii
                          </Link>
                        </Button>
                      ) : (
                        "—"
                      )}
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
