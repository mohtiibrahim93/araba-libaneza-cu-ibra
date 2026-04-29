import { I18nProvider, useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const content = {
  ro: {
    title: "Politica de Confidențialitate",
    updated: "Ultima actualizare:",
    sections: [
      ["1. Cine suntem", "„centrul de araba libaneza” este un proiect educațional care oferă cursuri de limbă arabă libaneză în București și online. Datele de contact: mohtiibrahim@gmail.com."],
      ["2. Ce date colectăm", "Colectăm doar datele pe care ni le furnizați voluntar prin formularele de pe site: nume, număr de telefon, adresă de email, centrul/locația preferată și formatul dorit al cursului. În cazul cursurilor pentru copii, colectăm și vârsta copilului."],
      ["3. Scopul colectării", "Datele dumneavoastră sunt utilizate exclusiv pentru a vă contacta în legătură cu cursurile solicitate, a vă înscrie la cursuri și a vă transmite informații relevante despre programul educațional."],
      ["4. Stocarea datelor", "Datele sunt stocate în mod securizat pe servere protejate și sunt păstrate atât timp cât este necesar pentru scopurile menționate. Nu partajăm datele cu terți, cu excepția furnizorilor de servicii tehnice necesare funcționării platformei."],
      ["5. Drepturile dumneavoastră", "Conform GDPR, aveți dreptul de a accesa, rectifica, șterge sau restricționa prelucrarea datelor dumneavoastră personale. Pentru orice solicitare, contactați-ne la mohtiibrahim@gmail.com."],
      ["6. Cookie-uri", "Acest site nu utilizează cookie-uri de marketing sau tracking fără consimțământ. Se pot folosi cookie-uri tehnice esențiale pentru funcționarea normală a site-ului."],
      ["7. Contact", "Pentru întrebări legate de protecția datelor, ne puteți contacta la: mohtiibrahim@gmail.com sau pe WhatsApp la +40 763 124 514."],
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated:",
    sections: [
      ["1. Who we are", "“lebanese arabic center” is an educational project offering Lebanese Arabic language courses in Bucharest and online. Contact details: mohtiibrahim@gmail.com."],
      ["2. What data we collect", "We collect only the data you voluntarily provide through the website forms: name, phone number, email address, preferred center/location, and desired course format. For kids courses, we also collect the child’s age."],
      ["3. Purpose of collection", "Your data is used exclusively to contact you about the requested courses, register you for courses, and send relevant information about the educational program."],
      ["4. Data storage", "Data is stored securely on protected servers and retained only as long as necessary for the purposes described. We do not share data with third parties, except technical service providers required for the platform to function."],
      ["5. Your rights", "Under GDPR, you have the right to access, correct, delete, or restrict the processing of your personal data. For any request, contact us at mohtiibrahim@gmail.com."],
      ["6. Cookies", "This site does not use marketing or tracking cookies without consent. Essential technical cookies may be used for normal site functionality."],
      ["7. Contact", "For questions about data protection, you can contact us at mohtiibrahim@gmail.com or on WhatsApp at +40 763 124 514."],
    ],
  },
} as const;

const PrivacyContent = () => {
  const { lang } = useI18n();
  const page = content[lang];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-28">
        <h1 className="text-3xl font-bold text-foreground mb-8">{page.title}</h1>
        <div className="prose prose-sm text-muted-foreground space-y-6">
          <p><strong>{page.updated}</strong> Martie 2026</p>
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

const Privacy = () => (
  <I18nProvider>
    <PrivacyContent />
  </I18nProvider>
);

export default Privacy;
