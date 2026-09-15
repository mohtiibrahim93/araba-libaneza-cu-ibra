import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "@/lib/router-compat";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import GdprCheckbox from "@/components/GdprCheckbox";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isBlockedEmail, isValidEmail, isValidPhone } from "@/components/RegistrationForm/LeadFields";

const TrialPage = () => {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  // Per-field messages. The form is noValidate so the browser never shows its
  // own bubble, which renders in the browser's UI language (English on a
  // Romanian page) and flags only one field at a time.
  const [errors, setErrors] = useState<{
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    gdpr?: string | undefined;
  }>({});

  const required = lang === "en" ? "This field is required." : "Acest câmp este obligatoriu.";

  /** Validate every field at once so the visitor sees all problems together. */
  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = required;
    if (!email.trim()) next.email = required;
    else if (isBlockedEmail(email))
      next.email =
        lang === "en"
          ? "Please use a personal address you actually read — this one can't receive our confirmation."
          : "Folosește o adresă personală pe care o citești — pe aceasta nu putem trimite confirmarea.";
    else if (!isValidEmail(email)) next.email = t.validEmailError;
    if (!phone.trim()) next.phone = required;
    else if (!isValidPhone(phone)) next.phone = t.validPhoneError;
    if (!gdpr) next.gdpr = t.bookingGdprRequired;
    return next;
  };

  // Once step 1 is submitted the visitor is on step 2 with nothing booked yet.
  // Leaving here is what produces a contact with no lesson attached, so warn
  // before the tab closes or navigates away. The browser shows its own generic
  // wording; all we control is whether the prompt appears at all.
  useEffect(() => {
    if (!registrationId || booked) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [registrationId, booked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard and screen-reader users
      // are taken to it rather than left at the button.
      const first = (["name", "email", "phone", "gdpr"] as const).find((k) => found[k]);
      document.getElementById(first === "gdpr" ? "gdpr" : `trial-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.from("registrations").insert({
        id,
        form_type: "trial",
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        // The language the visitor is actually reading the site in. Without it
        // a trial lead arrived with language NULL, so there was no way to tell
        // an English enquiry from a Romanian one — which is also what decides
        // which cohorts they can be offered, since cohorts carry a
        // teaching_language. Every other registration path already records it.
        language: lang,
        // Step 1 only captures the lead. Until a slot is picked in step 2 the
        // trial is NOT booked, so it is recorded as "incomplete" rather than as
        // a real lead. booking-create promotes it to "new" once a slot is
        // actually chosen. This used to be a marker string in `notes`, which
        // meant abandoned step-1 entries sat in the admin looking like genuine
        // bookings and could not be filtered out.
        lead_status: "incomplete",
      });
      if (error) throw error;
      // No generate_lead here. This is step 1 of the trial flow: the visitor
      // then picks a slot in step 2, booking-create promotes the row from
      // "incomplete" to "new", and that fires trial_booking_complete. Counting
      // step 1 as a lead as well made one trial booking two conversions.
      //
      // The trade-off is deliberate and worth naming: someone who fills in
      // step 1 and never picks a slot is a real enquiry and no longer appears
      // in GA4. The row is still written with lead_status "incomplete", so the
      // contact is not lost — it is visible in the admin, just not counted as
      // a conversion, which is the correct reading of an unfinished booking.
      setRegistrationId(id);

    } catch (err) {
      console.error("[trial] insert failed", err);
      toast.error(t.schedulerBookingFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const title = t.trialPageSeoTitle;

  return (
    <main id="main-content" className="min-h-screen bg-background py-12 px-gutter">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={t.trialPageSeoDesc} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/trial" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={t.trialPageSeoDesc} />
      </Helmet>
      <div className="w-full max-w-2xl 2xl:max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t.navHome}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t.trialPageTitle}</h1>
        <p className="text-muted-foreground mb-4">{t.trialPageSubtitle}</p>

        {/* Two explicit steps. A trial is only booked once a time slot is
            chosen in step 2, so the visitor must never think step 1 finished
            the job. */}
        <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm" aria-label={lang === "en" ? "Booking steps" : "Pașii rezervării"}>
          {[
            { n: 1, ro: "Datele tale", en: "Your details" },
            { n: 2, ro: "Alege intervalul", en: "Pick a time" },
          ].map(({ n, ro, en }) => {
            const current = registrationId ? 2 : 1;
            const done = n < current;
            const active = n === current;
            return (
              <li key={n} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-primary/15 text-primary"
                      : active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? "✓" : n}
                </span>
                <span className={active ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  {lang === "en" ? en : ro}
                </span>
                {n === 1 && <span aria-hidden className="text-muted-foreground">→</span>}
              </li>
            );
          })}
        </ol>

        {!registrationId ? (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 bg-background rounded-2xl border border-border p-6 shadow-xs"
          >
            <div className="space-y-2">
              <Label htmlFor="trial-name">{t.labelName} *</Label>
              <Input
                id="trial-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder={t.placeholderName}
                maxLength={100}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "trial-name-error" : undefined}
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : undefined}
              />
              {errors.name && (
                <p id="trial-name-error" role="alert" className="text-xs font-medium text-destructive">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trial-email">{t.labelEmail} *</Label>
                <Input
                  id="trial-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder={t.placeholderEmail}
                  maxLength={255}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "trial-email-error" : undefined}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : undefined}
                />
                {errors.email && (
                  <p id="trial-email-error" role="alert" className="text-xs font-medium text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-phone">{t.labelPhone} *</Label>
                <Input
                  id="trial-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  placeholder={t.placeholderPhone}
                  maxLength={30}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? "trial-phone-error" : undefined}
                  className={errors.phone ? "border-destructive focus-visible:ring-destructive" : undefined}
                />
                {errors.phone && (
                  <p id="trial-phone-error" role="alert" className="text-xs font-medium text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
            <GdprCheckbox
              checked={gdpr}
              onCheckedChange={(v) => {
                setGdpr(v);
                if (v && errors.gdpr) setErrors((p) => ({ ...p, gdpr: undefined }));
              }}
              error={errors.gdpr}
            />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {submitting ? t.trialFormSubmitting : t.trialFormCta}
            </Button>
          </form>
        ) : (
          <div className="bg-background rounded-2xl border border-border p-6 shadow-xs">
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-gutter py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              {lang === "en" ? (
                <><strong>Almost done!</strong> Pick a time slot below to confirm your free trial — it isn't booked until you choose one.</>
              ) : (
                <><strong>Aproape gata!</strong> Alege un interval mai jos pentru a confirma proba gratuită — nu e rezervată până nu alegi unul.</>
              )}
            </div>
            <NativeScheduler
              eventType="trial"
              registrationId={registrationId}
              prefill={{ name, email, phone }}
              // The lead is promoted from "incomplete" to a real lead
              // server-side by booking-create; RLS blocks browser updates.
              onBooked={() => setBooked(true)}
            />

          </div>
        )}

        {/* Below the form on purpose: the booking flow stays the first thing a
            visitor sees, and this explains the offer to anyone still deciding —
            and to crawlers, for which 67 words of visible text was too thin to
            be worth indexing. */}
        <section className="mx-auto mt-section max-w-2xl space-y-8 text-left">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialWhatH2}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.trialWhatP}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialWhyH2}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.trialWhyP}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialHowH2}</h2>
            <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>{t.trialHowLi1}</li>
              <li>{t.trialHowLi2}</li>
              <li>{t.trialHowLi3}</li>
              <li>{t.trialHowLi4}</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialRulesH2}</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>{t.trialRulesLi1}</li>
              <li>{t.trialRulesLi2}</li>
              <li>{t.trialRulesLi3}</li>
              <li>{t.trialRulesLi4}</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrialPage;