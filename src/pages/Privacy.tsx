import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const content = {
  ro: {
    title: "Politica de Confidențialitate",
    updated: "Ultima actualizare:",
    updatedValue: "Octombrie 2026",
    sections: [
      ["1. Cine suntem", "Centrul de Arabă Libaneză (Arabă Libaneză cu Ibra) oferă cursuri de arabă libaneză în București și online. Pentru orice întrebare despre datele tale: marhaba@centruldearabalibaneza.com."],
      ["2. Ce date colectăm", "Doar ce ne dai tu: la formularele de înscriere și „anunță-mă” — nume, telefon, email, formatul și nivelul dorit (iar pentru cursurile de copii, vârsta copilului); la programarea lecției de probă — nume, email, telefon, data și ora aleasă; la descărcarea unui PDF — prenumele și emailul; mesajele pe care ni le trimiți (formular de contact, WhatsApp sau asistentul „Întreabă despre cursuri”); iar dacă îți faci cont, emailul (sau contul Google cu care te conectezi) și progresul din Jocul Yalla (scorul, rezultatul testului de nivel și expresiile exersate), ca să le vezi pe orice dispozitiv; Ibra le vede în panoul de administrare. Fără cont, progresul din joc rămâne doar în browserul tău. La plăți nu vedem și nu păstrăm datele cardului — le prelucrează Stripe; noi primim doar confirmarea plății și suma. Statistici de vizitare colectăm doar dacă accepți cookie-urile de analiză."],
      ["3. De ce le folosim", "Ca să te contactăm despre cursul cerut, să te înscriem, să îți confirmăm programările și plățile, să îți trimitem materialele cerute și, dacă ai bifat acordul, informații despre cursuri. Statisticile (doar cu acordul tău) ne arată ce pagini sunt folosite."],
      ["4. Cine ne ajută să le prelucrăm", "Folosim furnizori care prelucrează date în numele nostru: Supabase (baza de date și conturile), Lovable (găzduirea site-ului, trimiterea emailurilor și asistentul AI de pe site), Stripe (plăți și păstrarea cardului pentru lecția de probă), Google (reCAPTCHA pentru protecția formularelor, Google Analytics și măsurarea campaniilor Google Ads, doar cu acordul tău, Google Calendar pentru programări și conectarea cu Google), Zoom (lecțiile online) și WhatsApp (dacă ne scrii acolo). Unii dintre ei pot prelucra date în afara Spațiului Economic European; fiecare are propria politică de confidențialitate. Nu vindem și nu închiriem datele tale."],
      ["5. Cât timp le păstrăm", "Cât timp e nevoie pentru scopurile de mai sus — de exemplu, cât durează cursul și relația cu noi — și cât ne obligă legea (de exemplu, documentele de plată). Poți cere oricând ștergerea datelor care nu trebuie păstrate legal."],
      ["6. Drepturile tale", "Conform GDPR, poți cere acces la datele tale, corectarea, ștergerea sau restricționarea lor, te poți opune prelucrării, poți cere portarea lor și îți poți retrage oricând acordul (de exemplu, pentru emailuri sau cookie-uri). Scrie-ne la marhaba@centruldearabalibaneza.com. Ai și dreptul să depui plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)."],
      ["7. Cookie-uri", "Folosim cookie-uri tehnice necesare funcționării site-ului și, doar dacă accepți, cookie-uri de analiză și publicitate (Google Analytics și măsurarea campaniilor Google Ads). Când intri prima dată pe site, te întrebăm: „Acceptă toate” sau „Doar esențiale”. Alegerea ta se păstrează în browser și o poți schimba oricând din linkul „Setări cookies” din subsolul site-ului. Formularele folosesc Google reCAPTCHA ca să oprească spamul."],
      ["8. Contact", "Pentru întrebări despre datele tale: marhaba@centruldearabalibaneza.com sau WhatsApp la +40 763 124 514."],
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated:",
    updatedValue: "October 2026",
    sections: [
      ["1. Who we are", "Centrul de Arabă Libaneză (Lebanese Arabic with Ibra) offers Lebanese Arabic courses in Bucharest and online. For any question about your data: marhaba@centruldearabalibaneza.com."],
      ["2. What data we collect", "Only what you give us: on the sign-up and notify-me forms — name, phone, email, the format and level you want (and, for kids' courses, the child's age); when you book the trial lesson — name, email, phone and the date and time you choose; when you download a PDF — your first name and email; the messages you send us (contact form, WhatsApp or the “Ask about courses” assistant); and, if you create an account, your email (or the Google account you sign in with) and your Yalla game progress (score, level test result and the phrases you practised), so you can see them on any device; Ibra sees them in the admin panel. Without an account, game progress stays only in your browser. For payments we never see or keep your card details — Stripe processes them; we only receive the payment confirmation and the amount. We collect visit statistics only if you accept analytics cookies."],
      ["3. Why we use it", "To contact you about the course you asked for, register you, confirm your bookings and payments, send you the materials you requested and, if you ticked the box, information about courses. Statistics (only with your consent) show us which pages are used."],
      ["4. Who helps us process it", "We use providers that process data on our behalf: Supabase (database and accounts), Lovable (website hosting, sending emails and the AI assistant on the site), Stripe (payments and holding the card for the trial lesson), Google (reCAPTCHA to protect the forms, Google Analytics and Google Ads campaign measurement, only with your consent, Google Calendar for bookings, and Google sign-in), Zoom (online lessons) and WhatsApp (if you message us there). Some of them may process data outside the European Economic Area; each has its own privacy policy. We do not sell or rent your data."],
      ["5. How long we keep it", "As long as needed for the purposes above — for example, for the length of your course and our relationship — and as long as the law requires (for example, payment records). You can ask us at any time to delete data we are not legally required to keep."],
      ["6. Your rights", "Under GDPR you can ask to access, correct, delete or restrict your data, object to its processing, ask for it to be ported, and withdraw your consent at any time (for example, for emails or cookies). Write to marhaba@centruldearabalibaneza.com. You also have the right to complain to the Romanian data protection authority (ANSPDCP)."],
      ["7. Cookies", "We use technical cookies the site needs to work and, only if you accept, analytics and advertising cookies (Google Analytics and Google Ads campaign measurement). On your first visit we ask you: “Accept all” or “Essential only”. Your choice is kept in your browser and you can change it at any time via the “Cookie settings” link in the site footer. The forms use Google reCAPTCHA to stop spam."],
      ["8. Contact", "For questions about your data: marhaba@centruldearabalibaneza.com or WhatsApp at +40 763 124 514."],
    ],
  },
} as const;

const PrivacyContent = () => {
  const { lang } = useI18n();
  const page = content[lang];

  // No <head> here: the title, description and canonical are served by the
  // route (src/lib/seoHead.ts), which is also what meta-length.test.ts
  // length-checks. A second copy in the component put two of each in the HTML.

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="w-full max-w-3xl 2xl:max-w-4xl mx-auto px-gutter pt-36 pb-28">
        <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-8">{page.title}</h1>
        <div className="prose prose-sm text-muted-foreground space-y-6">
          <p><strong>{page.updated}</strong> {page.updatedValue}</p>
          {page.sections.map(([title, body]) => (
            <section key={title} className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Privacy = () => <PrivacyContent />;

export default Privacy;
