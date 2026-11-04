import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const WHATSAPP_NUMBER = "40763124514";
const DISPLAY_NUMBER = "+40 763 124 514";
const PHONE_URL = "tel:+40763124514";

type ContactContext = {
  courseType?: "group" | "private" | "kids";
  format?: "fizic" | "online";
};

const courseLabels = {
  ro: {
    group: "curs de grup",
    private: "lecții private individuale",
    kids: "curs pentru copii",
  },
  en: {
    group: "the group course",
    private: "private lessons",
    kids: "the children's course",
  },
} as const;

const formatLabels = {
  ro: { fizic: "fizic", online: "online" },
  en: { fizic: "in person", online: "online" },
} as const;

const getStoredContext = (): ContactContext => {
  try {
    const raw = window.localStorage.getItem("lead-contact-context");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ContactContext;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const WhatsAppButton = () => {
  const [context, setContext] = useState<ContactContext>(() =>
    getStoredContext(),
  );

  useEffect(() => {
    const updateContext = () => setContext(getStoredContext());
    window.addEventListener("lead-contact-context-change", updateContext);
    window.addEventListener("storage", updateContext);
    return () => {
      window.removeEventListener("lead-contact-context-change", updateContext);
      window.removeEventListener("storage", updateContext);
    };
  }, []);

  const { lang } = useI18n();
  const en = lang === "en";

  // The pre-filled message follows the reader's language.
  const whatsappUrl = useMemo(() => {
    const message = en
      ? `Hi! I'd like more details about ${
          context.courseType
            ? courseLabels.en[context.courseType]
            : "your Lebanese Arabic courses"
        }${context.format ? `, ${formatLabels.en[context.format]}` : ""}.`
      : `Salut! Vreau mai multe detalii${
          context.courseType
            ? ` pentru ${courseLabels.ro[context.courseType]}`
            : " despre cursurile de arabă libaneză"
        }${context.format ? `, format ${formatLabels.ro[context.format]}` : ""}.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [context, en]);

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden flex-col items-end gap-2 md:flex">
      <a
        href={PHONE_URL}
        aria-label={en ? `Call ${DISPLAY_NUMBER}` : `Sună la ${DISPLAY_NUMBER}`}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Phone className="h-4 w-4 text-primary" />
        <span>{DISPLAY_NUMBER}</span>
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          en
            ? `WhatsApp us at ${DISPLAY_NUMBER}`
            : `Contact pe WhatsApp la ${DISPLAY_NUMBER}`
        }
        className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">WhatsApp</span>
      </a>
    </div>
  );
};

export default WhatsAppButton;
