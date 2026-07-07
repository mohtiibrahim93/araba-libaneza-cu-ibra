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
import { Loader2, Trash2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminNav from "@/components/AdminNav";
import CapacitiesAdmin from "@/components/CapacitiesAdmin";
import CohortsAdmin from "@/components/admin/CohortsAdmin";
import AvailabilityAdmin from "@/components/AvailabilityAdmin";
import BookingsAdmin from "@/components/BookingsAdmin";
import StudentJourneyAdmin from "@/components/admin/StudentJourneyAdmin";
import TrialFunnelAdmin from "@/components/admin/TrialFunnelAdmin";
import AdminLogin from "@/components/admin/AdminLogin";
import EmailSettingsForm from "@/components/admin/EmailSettingsForm";
import TestEmailForm from "@/components/admin/TestEmailForm";
import RegistrationFilters from "@/components/admin/RegistrationFilters";
import PrivateLeadStats from "@/components/admin/PrivateLeadStats";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
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
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
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

    supabase.auth.getSession().then(({ data }) => checkSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
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
      const matchesStatus =
        leadStatusFilter === "all" || (r.lead_status || "new") === leadStatusFilter;
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
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

  const handleDelete = async () => {
    if (selected.size === 0) return;
    setDeleting(true);
    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "delete",
        ids: Array.from(selected),
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setRegistrations((prev) => prev.filter((r) => !selected.has(r.id)));
      toast({
        title: `${selected.size} înscrier${selected.size === 1 ? "e" : "i"} ștears${
          selected.size === 1 ? "ă" : "e"
        }`,
      });
      setSelected(new Set());
    } catch {
      toast({ title: "Eroare la ștergere", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleRefund = async (id: string, reason: string) => {
    setRefundingId(id);
    try {
      const { data, error: fnError } = await invokeAdmin({
        action: "refund",
        id,
        refund_reason: reason || null,
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.data } : r)));
      toast({ title: "Rambursare procesată cu succes" });
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
      const { data, error: fnError } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName: "private-registration-confirmation",
            recipientEmail: recipient,
            idempotencyKey: `reg-confirm-test-${Date.now()}`,
            templateData: {
              name: "Maria Popescu",
              format: "online",
              message: "Aș prefera lecții seara, după ora 18:00, cu accent pe conversație.",
              statusUrl: `${window.location.origin}/private-status/exemplu`,
            },
          },
        },
      );
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

  return (
    <div className="min-h-screen bg-background">
      <AdminNav
        onLogout={handleLogout}
        rightSlot={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredRegistrations.length === 0}
            className="h-8 hidden sm:inline-flex"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline ml-1">CSV</span>
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-foreground">
          Înscrieri{" "}
          <span className="text-muted-foreground font-normal">
            ({filteredRegistrations.length}/{registrations.length})
          </span>
        </h1>
        <div className="flex items-center gap-2">
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
                    {selected.size === 1 ? "e" : "i"}? Acțiunea nu poate fi anulată.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Șterge definitiv</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <StudentJourneyAdmin />
        <TrialFunnelAdmin />

        <CapacitiesAdmin />
        <CohortsAdmin />

        <AvailabilityAdmin />
        <BookingsAdmin />

        <EmailSettingsForm
          settings={emailSettings}
          saving={savingEmailSettings}
          onChange={setEmailSettings}
          onSubmit={handleEmailSettingsSubmit}
        />

        <TestEmailForm
          email={testEmail}
          sending={sendingTestEmail}
          onChange={setTestEmail}
          onSubmit={handleTestEmailSubmit}
        />

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

        <PrivateLeadStats
          counts={privateLeadCounts}
          onSelect={(status) => {
            setCourseTypeFilter("private");
            setLeadStatusFilter(status === "all" ? "all" : status);
          }}
        />

        {registrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nu există înscrieri momentan.
          </p>
        ) : filteredRegistrations.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nu există lead-uri pentru filtrele selectate.
          </p>
        ) : (
          <RegistrationsTable
            rows={filteredRegistrations}
            selected={selected}
            updatingStatus={updatingStatus}
            refundingId={refundingId}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onStatusChange={handleStatusChange}
            onRefund={handleRefund}
          />
        )}
      </main>
    </div>
  );
};

export default Admin;
