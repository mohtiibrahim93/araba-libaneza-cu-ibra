import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type LeadStatus = "new" | "contacted" | "confirmed";

interface PrivateStatusData {
  id: string;
  created_at: string;
  name: string;
  format: string | null;
  lead_status: LeadStatus;
}

const statusLabels: Record<LeadStatus, string> = {
  new: "Cerere primită",
  contacted: "Contact inițiat",
  confirmed: "Confirmată",
};

const steps: LeadStatus[] = ["new", "contacted", "confirmed"];

const PrivateStatus = () => {
  const { id } = useParams();
  const [lead, setLead] = useState<PrivateStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      if (!id) return;

      setLoading(true);
      const sig = new URLSearchParams(window.location.search).get("sig") || "";
      const { data, error: fnError } = await supabase.functions.invoke("admin-registrations", {
        body: { action: "get_private_status", id, sig },
      });

      if (fnError || data?.error) {
        setError("Cererea nu a putut fi găsită.");
      } else {
        setLead(data.data);
      }
      setLoading(false);
    };

    loadStatus();
  }, [id]);

  const currentIndex = lead ? steps.indexOf(lead.lead_status || "new") : 0;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
    <Navbar />
    <main id="main-content" className="flex-1 px-gutter pt-36 pb-16">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-2xl border border-[#E7E1D6] bg-card p-6 shadow-xs sm:p-8 dark:border-border">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Se încarcă statusul...
            </div>
          ) : error || !lead ? (
            <div className="space-y-3 text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">Status indisponibil</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-green">Lecții private</p>
              <h1 className="font-display text-display-md font-bold tracking-tight text-foreground">Statusul cererii tale</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Cerere trimisă pe {new Date(lead.created_at).toLocaleDateString("ro-RO")}
              </p>

              <div className="mt-8 space-y-4">
                {steps.map((step, index) => {
                  const isDone = index <= currentIndex;
                  const Icon = isDone ? CheckCircle2 : Clock;

                  return (
                    <div key={step} className={`flex gap-3 rounded-xl border p-4 ${isDone ? "border-brand-green/30 bg-brand-green/5" : "border-[#E7E1D6] bg-background dark:border-border"}`}>
                      <Icon className={isDone ? "mt-0.5 h-5 w-5 text-brand-green" : "mt-0.5 h-5 w-5 text-muted-foreground"} />
                      <div>
                        <p className="font-medium text-foreground">{statusLabels[step]}</p>
                        <p className="text-sm text-muted-foreground">
                          {step === "new" && "Am primit cererea și o analizăm."}
                          {step === "contacted" && "Te contactăm pentru program și detalii."}
                          {step === "confirmed" && "Lecția este confirmată."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button asChild className="mt-8 w-full">
                <a href={`/booking?type=paid&registration_id=${id}`}>
                  <Calendar className="h-4 w-4" /> Programează lecția
                </a>
              </Button>
              <Button asChild variant="outline" className="mt-3 w-full">
                <a href="https://wa.me/40763124514" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Contactează-ne pe WhatsApp
                </a>
              </Button>
            </div>
          )}
        </section>
        <p className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Înapoi la site
          </Link>
        </p>
      </div>
    </main>
    <Footer />
    </div>
  );
};

export default PrivateStatus;