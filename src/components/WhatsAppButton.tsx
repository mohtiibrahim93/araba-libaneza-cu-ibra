import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "40731481061";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Salut! Vreau mai multe detalii despre cursurile de arabă libaneză.")}`;

const WhatsAppButton = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contact pe WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
  >
    <MessageCircle className="w-5 h-5 fill-white" />
    <span className="text-sm font-semibold hidden sm:inline">WhatsApp</span>
  </a>
);

export default WhatsAppButton;
