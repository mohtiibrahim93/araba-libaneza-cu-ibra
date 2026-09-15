import { Bell, CreditCard, ExternalLink, LogOut, Mail, ShieldCheck, User } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import EmailSettingsForm from "./EmailSettingsForm";
import TestEmailForm from "./TestEmailForm";
import type { EmailSettings } from "./types";

interface Props {
  emailSettings: EmailSettings;
  savingEmailSettings: boolean;
  onEmailSettingsChange: (s: EmailSettings) => void;
  onEmailSettingsSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  testEmail: string;
  sendingTestEmail: boolean;
  onTestEmailChange: (v: string) => void;
  onTestEmailSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  adminEmail: string;
  onLogout: () => void;
}

const SectionCard = ({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border bg-background p-5 shadow-xs">
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
    {children}
  </section>
);

/**
 * "Setări" admin tab: everything configurable or account-related in one
 * organized place — email sender, test sends, notifications, payment
 * service shortcuts, and the signed-in account.
 */
const SettingsTab = ({
  emailSettings,
  savingEmailSettings,
  onEmailSettingsChange,
  onEmailSettingsSubmit,
  testEmail,
  sendingTestEmail,
  onTestEmailChange,
  onTestEmailSubmit,
  adminEmail,
  onLogout,
}: Props) => (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="space-y-6">
      <SectionCard
        icon={Mail}
        title="Email tranzacțional"
        desc="Expeditorul confirmărilor trimise cursanților și un test rapid al template-ului."
      >
        <div className="[&_form]:mb-0 [&_form]:border-0 [&_form]:bg-transparent [&_form]:p-0 [&_form_h2]:hidden [&_form>div:first-child>p]:mb-1 space-y-6">
          <EmailSettingsForm
            settings={emailSettings}
            saving={savingEmailSettings}
            onChange={onEmailSettingsChange}
            onSubmit={onEmailSettingsSubmit}
          />
          <TestEmailForm
            email={testEmail}
            sending={sendingTestEmail}
            onChange={onTestEmailChange}
            onSubmit={onTestEmailSubmit}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={Bell}
        title="Notificări"
        desc="Alertele pe care le primești când apare o înscriere sau o programare nouă."
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/notifications">
            Deschide setările de notificări
          </Link>
        </Button>
      </SectionCard>
    </div>

    <div className="space-y-6">
      <SectionCard
        icon={CreditCard}
        title="Plăți & servicii"
        desc="Acces rapid la serviciile conectate. Sumele și abonamentele se administrează din tab-ul Înscrieri."
      >
        <ul className="space-y-2.5 text-sm">
          <li>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              Stripe Dashboard <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="block text-xs text-muted-foreground">
              Plăți, abonamente, rambursări · descriptor extras: CENTRUL ARABA LIBANEZA
            </span>
          </li>
          <li>
            <a
              href="https://supabase.com/dashboard/project/pzouzxgswccyhxhpgfwb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              Supabase <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="block text-xs text-muted-foreground">
              Baza de date, funcții, secrete (chei API)
            </span>
          </li>
          <li>
            <a
              href="https://github.com/mohtiibrahim93/araba-libaneza-cu-ibra/blob/main/docs/GO_LIVE_subscriptions.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
            >
              Ghid operațiuni plăți <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="block text-xs text-muted-foreground">
              Prețuri, webhook-uri, politica de rambursare (5 zile, prorata)
            </span>
          </li>
        </ul>
      </SectionCard>

      <SectionCard
        icon={User}
        title="Contul tău"
        desc="Sesiunea de administrator curentă."
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{adminEmail || "—"}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
              Autentificat cu Google · acces pe listă de administratori
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Deconectare
          </Button>
        </div>
      </SectionCard>
    </div>
  </div>
);

export default SettingsTab;
