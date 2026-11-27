// Instant answers for the assistant's suggested questions. These never call
// the AI model, so the most common questions cost no credits. Prices come from
// src/lib/pricing.ts so they always match the site.
import { ONLINE_PRICES, physicalPrice } from "@/lib/pricing";

const a1 = ONLINE_PRICES.groupMonthly.A1;
const priv = ONLINE_PRICES.privateLesson;

const ANSWERS: Record<string, string> = {
  "cât costă cursul de grup?": `Cursul de grup A1 costă **${a1} LEI/lună online** sau **${physicalPrice(a1)} LEI/lună fizic** (2 ședințe pe săptămână, 1h30 fiecare). La plata integrală a cursului ai -15%. Lecțiile private costă ${priv} LEI online / ${physicalPrice(priv)} LEI fizic. Poți începe cu o lecție de probă gratuită.`,
  "ce nivel mi se potrivește?": `Dacă nu ai mai învățat araba libaneză, începi de la **A1**: vorbești din prima lecție, fără alfabet. Dacă știi deja puțin, cea mai bună cale e o **lecție de probă gratuită**, unde Ibra îți stabilește nivelul.`,
  "aveți cursuri pentru copii?": `Cursul pentru copii **nu este încă deschis**. Poți lăsa o cerere „Anunță-mă” pe pagina /curs-araba-copii și te anunțăm când pornește. Pentru adolescenți (12–17 ani) se pot face deja lecții private.`,
  "how much is the group course?": `The A1 group course is **${a1} LEI/month online** or **${physicalPrice(a1)} LEI/month in person** (2 sessions a week, 90 minutes each). Paying for the whole course upfront gives you 15% off. Private lessons are ${priv} LEI online / ${physicalPrice(priv)} LEI in person. You can start with a free trial lesson.`,
  "which level suits me?": `If you have never studied Lebanese Arabic, start at **A1**: you speak from the first lesson, no alphabet needed. If you already know some, the best way is a **free trial lesson**, where Ibra places you at the right level.`,
  "do you teach children?": `The children's course **is not open yet**. You can leave a "Notify me" request on /curs-araba-copii and we will tell you when it starts. Teenagers (12–17) can already take private lessons.`,
};

export function faqAnswer(question: string): string | null {
  return ANSWERS[question.trim().toLowerCase()] ?? null;
}
