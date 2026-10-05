import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
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
import {
  Loader2,
  Trash2,
  Download,
  Users,
  CreditCard,
  Repeat,
  Gift,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  GraduationCap,
  Newspaper,
  Settings,
  LineChart,
  Route,
  Clock,
  HeartPulse,
  Inbox,
  UserPlus,
  BarChart3,
  FileText,
  Languages,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import AdminShell from "@/components/admin/AdminShell";
import CapacitiesAdmin from "@/components/CapacitiesAdmin";
import ManualSignupsAdmin from "@/components/ManualSignupsAdmin";
import ManualStudentForm from "@/components/admin/ManualStudentForm";
import CohortsAdmin from "@/components/admin/CohortsAdmin";
import GroupOverview from "@/components/admin/GroupOverview";
import BlogAdmin from "@/components/admin/BlogAdmin";
import ResourcesAdmin from "@/components/admin/ResourcesAdmin";
import PagesAdmin from "@/components/admin/PagesAdmin";
import SiteTextsAdmin from "@/components/admin/SiteTextsAdmin";
import BacklinksAdmin from "@/components/admin/BacklinksAdmin";
import CourseRequestsAdmin from "@/components/admin/CourseRequestsAdmin";
import AvailabilityAdmin from "@/components/AvailabilityAdmin";
import BookingsAdmin from "@/components/BookingsAdmin";
import CalendarHealth from "@/components/admin/CalendarHealth";
import StudentJourneyAdmin from "@/components/admin/StudentJourneyAdmin";
import TrialFunnelAdmin from "@/components/admin/TrialFunnelAdmin";
import AnalyticsAdmin from "@/components/admin/AnalyticsAdmin";
import TodayAdmin from "@/components/admin/TodayAdmin";
import AdminLogin from "@/components/admin/AdminLogin";
import SettingsTab from "@/components/admin/SettingsTab";
import RegistrationFilters from "@/components/admin/RegistrationFilters";
import PrivateLeadStats from "@/components/admin/PrivateLeadStats";
import RegistrationsTable, { type RefundPreview } from "@/components/admin/RegistrationsTable";
import {
  leadStatusLabels,
  LEAD_STATUSES,
  type CourseTypeFilter,
  type EmailSettings,
  type LeadStatus,
  type LeadStatusFilter,
  type Registration,
} from "@/components/admin/types";
import {
  exportAllRegistrationsCsv,
  exportPrivateLeadsCsv,
  exportPrivateLeadsPdf,
} from "@/lib/adminExport";
import { invokeAdmin } from "@/lib/adminAuth";
import { lovable } from "@/integrations/lovable";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [courseTypeFilter, setCourseTypeFilter] = useState<CourseTypeFilter>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatusFilter>("all");
  const [privateMessageSearch, setPrivateMessageSearch] = useState("");
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    sender_name: "Arabă Libaneză cu Ibra",
    sender_email: "noreply@centruldearabalibaneza.com",
  });
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<{ id: string; status: LeadStatus } | null>(
    null,
  );
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    const { data, error: fnError } = await invokeAdmin({});
    if (fnError) throw fnError;
    if (data?.error) throw new Error(data.error);
    setRegistrations(data.data);
    if (data.settings) setEmailSettings(data.settings);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const checkSession = async (hasSession: boolean) => {
      if (!hasSession) {
        if (!cancelled) {
          setAuthenticated(false);
          setCheckingSession(false);
        }
        return;
      }
      try {
        await loadData();
        if (!cancelled) setAuthenticated(true);
      } catch (err) {
        if (!cancelled) {
          setAuthenticated(false);
          const msg = err instanceof Error ? err.message : String(err);
          // Surface allowlist failures so the user knows why they're stuck on the login screen.
          if (/neautorizat|unauthori[sz]ed/i.test(msg)) {
            setError(
              "Contul Google folosit nu are drepturi de admin. Cere să fie adăugat în lista de administratori.",
            );
            await supabase.auth.signOut();
          } else {
            setError("Nu am putut încărca panoul de admin. Reîncearcă.");
          }
        }
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      setAdminEmail(data.session?.user?.email ?? "");
      checkSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAdminEmail(session?.user?.email ?? "");
      checkSession(!!session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadData]);

  const filteredRegistrations = useMemo(() => {
    const messageTerms = privateMessageSearch
      .trim()
      .toLocaleLowerCase("ro-RO")
      .split(/\s+/)
      .filter(Boolean);

    return registrations.filter((r) => {
      const matchesCourse = courseTypeFilter === "all" || r.form_type === courseTypeFilter;
      const status = (r.lead_status || "new") as LeadStatus;
      // "Toate" means every real lead. Trial forms abandoned before a slot was
      // chosen are kept as a record but stay out of the default list — they are
      // not bookings, and mixing them in is what made the admin unusable. They
      // are still one click away by selecting the "Incomplet" status.
      const matchesStatus =
        leadStatusFilter === "all" ? status !== "incomplete" : status === leadStatusFilter;
      const matchesPrivateMessage =
        messageTerms.length === 0 ||
        (r.form_type === "private" &&
          messageTerms.every((term) =>
            (r.notes || "").toLocaleLowerCase("ro-RO").includes(term),
          ));
      return matchesCourse && matchesStatus && matchesPrivateMessage;
    });
  }, [registrations, courseTypeFilter, leadStatusFilter, privateMessageSearch]);

  const privateLeadCounts = useMemo(() => {
    const initial = LEAD_STATUSES.reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      { total: 0 } as Record<LeadStatus | "total", number>,
    );
    return registrations.reduce((counts, r) => {
      if (r.form_type !== "private") return counts;
      const status = (r.lead_status || "new") as LeadStatus;
      counts.total += 1;
      if (status in counts) counts[status] += 1;
      return counts;
    }, initial);
  }, [registrations]);

  const privateFilteredRegistrations = useMemo(
    () => filteredRegistrations.filter((r) => r.form_type === "private"),
    [filteredRegistrations],
  );

  // Which admin tab is open; PrivateLeadStats / stat cards can jump to "leads".
  const [activeTab, setActiveTab] = useState("today");

  const stats = useMemo(() => {
    const incomplete = registrations.filter(
      (r) => (r.lead_status || "new") === "incomplete",
    ).length;
    const total = registrations.length - incomplete;
    const paid = registrations.filter((r) => r.payment_status === "paid").length;
    const activeSubs = registrations.filter(
      (r) => r.subscription_status === "active",
    ).length;
    const newLeads = registrations.filter(
      (r) => (r.lead_status || "new") === "new",
    ).length;
    return { total, paid, activeSubs, newLeads, incomplete };
  }, [registrations]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/admin",
      });
      if (result.error) {
        setError("Eroare la autentificare. Încearcă din nou.");
        setLoading(false);
      }
      // On success, onAuthStateChange (registered above) picks up the new
      // session and calls loadData(); if the account isn't in the
      // ADMIN_EMAILS allowlist, loadData() will fail and authenticated stays false.
    } catch {
      setError("Eroare la autentificare. Încearcă din nou.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
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
    const allFilteredSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
    setSelected(allFilteredSelected ? new Set() : new Set(filteredIds));
  };

  const [forceText, setForceText] = useState("");
  const handleDelete = async (force = false) => {
    if (selected.size === 0) return;
    setDeleting(true);
    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "delete",
        ids: Array.from(selected),
        force,
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      await loadData();
      const deleted = typeof data?.deleted === "number" ? data.deleted : selected.size;
      const blocked = typeof data?.blocked === "number" ? data.blocked : 0;
      toast({
        title: `${deleted} șters${deleted === 1 ? "ă" : "e"}`,
        description:
          blocked > 0
            ? `${blocked} au plăți și nu pot fi șterse — folosește „Anonimizează" (păstrează banii, șterge datele personale).`
            : undefined,
        variant: blocked > 0 ? "destructive" : undefined,
      });
      setSelected(new Set());
    } catch {
      toast({ title: "Eroare la ștergere", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const [anonymizing, setAnonymizing] = useState(false);
  const handleAnonymize = async () => {
    if (selected.size === 0) return;
    setAnonymizing(true);
    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "anonymize",
        ids: Array.from(selected),
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      await loadData();
      toast({
        title: `${data?.anonymized ?? 0} înscrieri anonimizate`,
        description: "Datele personale au fost șterse; plățile și istoricul rămân.",
      });
      setSelected(new Set());
    } catch {
      toast({ title: "Eroare la anonimizare", variant: "destructive" });
    } finally {
      setAnonymizing(false);
    }
  };

  /**
   * What the published policy returns, before anything is charged back.
   * `lessonsTaken` is the owner's input: the lessons already delivered are not
   * refundable, and nothing in the system knows how many those are.
   */
  const previewRefund = useCallback(async (id: string, lessonsTaken: number) => {
    const { data, error: fnError } = await invokeAdmin({
      action: "preview_refund",
      id,
      lessons_taken: lessonsTaken,
    });
    if (fnError) throw fnError;
    if (data?.error) throw new Error(data.error);
    return data.data as RefundPreview;
  }, []);

  const handleRefund = async (id: string, reason: string, lessonsTaken: number) => {
    setRefundingId(id);
    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "refund",
        id,
        refund_reason: reason || null,
        lessons_taken: lessonsTaken,
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.data } : r)));
      toast({
        title: "Rambursare procesată",
        description: data?.refund_label
          ? `S-au returnat ${data.refund_label} conform politicii.`
          : undefined,
      });
    } catch (err) {
      toast({
        title: "Rambursare eșuată",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setRefundingId(null);
    }
  };

  const previewCancelSubscription = async (id: string) => {
    const { data, error: fnError } = await invokeAdmin({
      action: "preview_cancel_subscription",
      id,
    });
    if (fnError) throw fnError;
    if (data?.error) throw new Error(data.error);
    return data.data as {
      within_grace: boolean;
      grace_days: number;
      refund_amount: number;
      currency: string;
    };
  };

  const handleCancelSubscription = async (id: string) => {
    setCancelingId(id);
    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "cancel_subscription",
        id,
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.data } : r)));
      const refunded = typeof data.refund_amount === "number" ? data.refund_amount : 0;
      toast({
        title: "Abonament anulat",
        description:
          refunded > 0
            ? `Rambursat ${(refunded / 100).toLocaleString("ro-RO")} din luna curentă.`
            : "Fără rambursare (în afara ferestrei de 5 zile).",
      });
    } catch (err) {
      toast({
        title: "Anulare eșuată",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
    }
  };

  const handleStatusChange = async (id: string, leadStatus: LeadStatus) => {
    const previous = registrations;
    const previousLead = registrations.find((r) => r.id === id);
    const previousStatus = previousLead?.lead_status || "new";
    if (previousStatus === leadStatus) return;

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    setUpdatingStatus({ id, status: leadStatus });
    setRegistrations((current) =>
      current.map((r) => (r.id === id ? { ...r, lead_status: leadStatus } : r)),
    );

    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "update_status",
        id,
        lead_status: leadStatus,
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const undoToast = toast({
        title: `Status schimbat în ${leadStatusLabels[leadStatus]}`,
        description: "Poți reveni la statusul anterior pentru câteva secunde.",
        action: (
          <ToastAction
            altText="Anulează schimbarea de status"
            onClick={async () => {
              if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
                undoTimeoutRef.current = null;
              }
              setUpdatingStatus({ id, status: previousStatus });
              setRegistrations((current) =>
                current.map((r) => (r.id === id ? { ...r, lead_status: previousStatus } : r)),
              );
              try {
                const { data: undoData, error: undoFnError } = await invokeAdmin({
                  action: "update_status",
                  id,
                  lead_status: previousStatus,
                });
                if (undoFnError) throw undoFnError;
                if (undoData?.error) throw new Error(undoData.error);
                undoToast.dismiss();
              } catch {
                setRegistrations((current) =>
                  current.map((r) => (r.id === id ? { ...r, lead_status: leadStatus } : r)),
                );
                toast({ title: "Undo nu a putut fi aplicat", variant: "destructive" });
              } finally {
                setUpdatingStatus(null);
              }
            }}
          >
            Undo
          </ToastAction>
        ),
      });

      undoTimeoutRef.current = setTimeout(() => {
        undoToast.dismiss();
        undoTimeoutRef.current = null;
      }, 6000);
    } catch {
      setRegistrations(previous);
      toast({ title: "Statusul nu a putut fi actualizat", variant: "destructive" });
    } finally {
      setUpdatingStatus((current) =>
        current?.id === id && current.status === leadStatus ? null : current,
      );
    }
  };

  const handleEmailSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingEmailSettings(true);
    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "update_email_settings",
        sender_name: emailSettings.sender_name,
        sender_email: emailSettings.sender_email,
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
      const { data, error: fnError } = await invokeAdmin({
        action: "send_test_email",
        recipient_email: recipient,
        status_url: `${window.location.origin}/private-status/exemplu`,
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

  const handleExport = useCallback(
    () => exportAllRegistrationsCsv(filteredRegistrations, courseTypeFilter, leadStatusFilter),
    [filteredRegistrations, courseTypeFilter, leadStatusFilter],
  );

  const handlePrivateCsvExport = useCallback(
    () =>
      exportPrivateLeadsCsv(privateFilteredRegistrations, leadStatusFilter, privateMessageSearch),
    [privateFilteredRegistrations, leadStatusFilter, privateMessageSearch],
  );

  const handlePrivatePdfExport = useCallback(
    () =>
      exportPrivateLeadsPdf(privateFilteredRegistrations, leadStatusFilter, privateMessageSearch),
    [privateFilteredRegistrations, leadStatusFilter, privateMessageSearch],
  );

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin loading={loading} error={error} onGoogleSignIn={handleGoogleSignIn} />;
  }


  /**
   * The sections, grouped by the kind of work rather than by which component
   * happened to be written first.
   *
   * "Grupe" and "Programări" each used to be one scrolling page with five and
   * three separate screens stacked on it; they are sub-items now. "Azi" is the
   * home screen (Acasă): a worklist rather than all-time totals, which is what
   * the Analiză tab is for.
   *
   * Every `value` here is matched by a <TabsContent value="..."> below. Renaming
   * one without the other makes a section unreachable with no error anywhere,
   * which is what src/test/admin-nav-reachable.test.ts exists to catch.
   */
  const navGroups = [
    {
      title: "Panou",
      items: [
        {
          value: "today",
          label: "Azi",
          icon: LayoutDashboard,
          hint: "Ce are nevoie de tine astăzi",
        },
        {
          value: "analytics",
          label: "Analiză",
          icon: BarChart3,
          hint: "Cifrele pe o perioadă, nu pe tot timpul",
        },
      ],
    },
    {
      title: "Cursanți",
      items: [
        {
          value: "leads",
          label: "Înscrieri",
          icon: ClipboardList,
          badge: registrations.length,
          hint: "Toate cererile și plățile",
        },
        {
          value: "journey",
          label: "Parcurs",
          icon: Route,
          hint: "De la prima cerere până la înscriere",
        },
      ],
    },
    {
      title: "Program",
      items: [
        { value: "bookings", label: "Lecții", icon: CalendarDays, hint: "Rezervările cursanților" },
        {
          value: "availability",
          label: "Disponibilitate",
          icon: Clock,
          hint: "Orele în care se pot rezerva lecții",
        },
        {
          value: "calendar-health",
          label: "Sănătate calendar",
          icon: HeartPulse,
          hint: "Sincronizarea cu Google Calendar",
        },
      ],
    },
    {
      title: "Grupe",
      items: [
        { value: "cohorts", label: "Cohorte", icon: GraduationCap, hint: "Grupele și programul lor" },
        {
          value: "capacities",
          label: "Capacități",
          icon: Users,
          hint: "Minim și maxim de locuri pe grupă",
        },
        {
          value: "course-requests",
          label: "Cereri de curs",
          icon: Inbox,
          hint: "Cereri pentru grupe care nu există încă",
        },
        {
          value: "manual-signups",
          label: "Înscrieri externe",
          icon: UserPlus,
          hint: "Cursanți veniți din afara site-ului",
        },
      ],
    },
    {
      title: "Conținut",
      items: [
        { value: "blog", label: "Blog", icon: Newspaper, hint: "Articolele de pe site" },
        { value: "resources", label: "Resurse", icon: FileText, hint: "Materiale descărcabile" },
        { value: "pages", label: "Pagini", icon: FileText, hint: "Texte și SEO pe pagini" },
        {
          value: "site-texts",
          label: "Texte site",
          icon: Languages,
          hint: "Toate textele afișate pe site",
        },
      ],
    },
    {
      title: "Sistem",
      items: [
        { value: "seo", label: "SEO", icon: LineChart, hint: "Backlink-uri și sănătatea domeniului" },
        { value: "settings", label: "Setări", icon: Settings, hint: "Email, plăți și cont" },
      ],
    },
  ];

  return (
    <AdminShell
      groups={navGroups}
      active={activeTab}
      onChange={setActiveTab}
      adminEmail={adminEmail}
      onLogout={handleLogout}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* ── Panou general: cifrele zilei + funnel-uri ────────────────── */}
          <TabsContent value="today" className="mt-0 space-y-6">
            <TodayAdmin onGoToLeads={() => setActiveTab("leads")} />
          </TabsContent>

          {/* ── Parcurs: de la prima cerere până la înscriere ─────────────── */}
          <TabsContent value="journey" className="mt-0 space-y-6">
            <StudentJourneyAdmin />
            <TrialFunnelAdmin />
          </TabsContent>

          {/* ── Analiză: aceleași date, dar pe o perioadă ────────────────── */}
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsAdmin />
          </TabsContent>

          {/* ── Înscrieri: filtre + tabel + export ───────────────────────── */}
          <TabsContent value="leads" className="mt-0 space-y-4">
            {/* The private-lead status counts, above the table they filter —
                clicking one sets the filter below rather than navigating. */}
            <PrivateLeadStats
              counts={privateLeadCounts}
              onSelect={(status) => {
                setCourseTypeFilter("private");
                setLeadStatusFilter(status === "all" ? "all" : status);
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-foreground">
                Înscrieri{" "}
                <span className="text-muted-foreground font-normal">
                  ({filteredRegistrations.length}/{registrations.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={filteredRegistrations.length === 0}
                >
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrivateCsvExport}
                  disabled={privateFilteredRegistrations.length === 0}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Private CSV</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrivatePdfExport}
                  disabled={privateFilteredRegistrations.length === 0}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Private PDF</span>
                </Button>
              </div>
            </div>

            <RegistrationFilters
              courseType={courseTypeFilter}
              leadStatus={leadStatusFilter}
              privateMessageSearch={privateMessageSearch}
              onCourseTypeChange={setCourseTypeFilter}
              onLeadStatusChange={setLeadStatusFilter}
              onPrivateMessageSearchChange={setPrivateMessageSearch}
              onReset={() => {
                setCourseTypeFilter("all");
                setLeadStatusFilter("all");
                setPrivateMessageSearch("");
              }}
            />

            {selected.size > 0 && (
              <div className="rounded-lg border border-border bg-background px-gutter h-12 flex items-center justify-between shadow-xs">
                <span className="text-sm text-muted-foreground">
                  {selected.size} selectat{selected.size > 1 ? "e" : "ă"}
                </span>
                <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={anonymizing}>
                      {anonymizing && <Loader2 className="w-4 h-4 animate-spin" />}
                      Anonimizează
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anonimizezi {selected.size} înscrier{selected.size === 1 ? "e" : "i"}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Numele, emailul, telefonul și notele se șterg definitiv (GDPR). Plățile,
                        statusul și istoricul rămân intacte. Acțiunea nu poate fi anulată.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulează</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAnonymize}>Anonimizează definitiv</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                        {selected.size === 1 ? "e" : "i"}? Acțiunea nu poate fi anulată.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulează</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete()}>Șterge definitiv</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog onOpenChange={(o) => !o && setForceText("")}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={deleting}>
                      <Trash2 className="w-4 h-4" />
                      Forțează ștergerea (test)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ștergere forțată</AlertDialogTitle>
                      <AlertDialogDescription>
                        Șterge {selected.size} înscrier{selected.size === 1 ? "e" : "i"} chiar dacă au plăți, inclusiv rezervările legate.
                        Folosește doar pentru înscrieri de test. Scrie STERGE pentru a confirma.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <input
                      value={forceText}
                      onChange={(e) => setForceText(e.target.value)}
                      placeholder="STERGE"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulează</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={forceText.trim().toUpperCase() !== "STERGE"}
                        onClick={() => handleDelete(true)}
                      >
                        Șterge forțat
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
              </div>
            )}

            {registrations.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nu există înscrieri momentan.
              </p>
            ) : filteredRegistrations.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nu există lead-uri pentru filtrele selectate.
              </p>
            ) : (
              <div className="bg-background rounded-xl shadow-xs">
                <RegistrationsTable
                  rows={filteredRegistrations}
                  selected={selected}
                  updatingStatus={updatingStatus}
                  refundingId={refundingId}
                  cancelingId={cancelingId}
                  onToggleSelect={toggleSelect}
                  onToggleAll={toggleAll}
                  onStatusChange={handleStatusChange}
                  onRefund={handleRefund}
                  onPreviewRefund={previewRefund}
                  onPreviewCancel={previewCancelSubscription}
                  onCancelSubscription={handleCancelSubscription}
                />
              </div>
            )}
          </TabsContent>

          {/* ── Programări: disponibilitate + rezervări ──────────────────── */}
          <TabsContent value="bookings" className="mt-0 space-y-6">
            <BookingsAdmin />
          </TabsContent>

          <TabsContent value="availability" className="mt-0 space-y-6">
            <AvailabilityAdmin />
          </TabsContent>

          <TabsContent value="calendar-health" className="mt-0 space-y-6">
            <CalendarHealth />
          </TabsContent>

          {/* ── Grupe: capacitate, contoare manuale, cohorte, cereri ─────── */}
          <TabsContent value="cohorts" className="mt-0 space-y-6">
            <GroupOverview />
            <CohortsAdmin />
          </TabsContent>

          <TabsContent value="capacities" className="mt-0 space-y-6">
            <CapacitiesAdmin />
          </TabsContent>

          <TabsContent value="course-requests" className="mt-0 space-y-6">
            <CourseRequestsAdmin />
          </TabsContent>

          <TabsContent value="manual-signups" className="mt-0 space-y-6">
            <ManualStudentForm />
            <ManualSignupsAdmin />
          </TabsContent>

          {/* ── Blog: editare articole (CMS override) ────────────────────── */}
          <TabsContent value="blog" className="mt-0">
            <BlogAdmin />
          </TabsContent>

          {/* ── SEO: backlink-uri și sănătate domeniu ─────────────────────── */}
          <TabsContent value="resources" className="mt-0">
            <ResourcesAdmin />
          </TabsContent>

          <TabsContent value="pages" className="mt-0">
            <PagesAdmin />
          </TabsContent>

          <TabsContent value="site-texts" className="mt-0">
            <SiteTextsAdmin />
          </TabsContent>

          <TabsContent value="seo" className="mt-0">
            <BacklinksAdmin />
          </TabsContent>

          {/* ── Setări: email, notificări, servicii, cont ────────────────── */}
          <TabsContent value="settings" className="mt-0">
            <SettingsTab
              emailSettings={emailSettings}
              savingEmailSettings={savingEmailSettings}
              onEmailSettingsChange={setEmailSettings}
              onEmailSettingsSubmit={handleEmailSettingsSubmit}
              testEmail={testEmail}
              sendingTestEmail={sendingTestEmail}
              onTestEmailChange={setTestEmail}
              onTestEmailSubmit={handleTestEmailSubmit}
              adminEmail={adminEmail}
              onLogout={handleLogout}
            />
          </TabsContent>
      </Tabs>
    </AdminShell>
  );

};

export default Admin;
