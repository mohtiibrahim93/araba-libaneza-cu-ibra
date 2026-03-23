import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyContent = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="max-w-3xl mx-auto px-6 py-28">
      <h1 className="text-3xl font-bold text-foreground mb-8">Politica de Confidențialitate</h1>
      
      <div className="prose prose-sm text-muted-foreground space-y-6">
        <p><strong>Ultima actualizare:</strong> Martie 2026</p>

        <h2 className="text-lg font-semibold text-foreground">1. Cine suntem</h2>
        <p>„Arabă Libaneză cu Ibra" este un proiect educațional care oferă cursuri de limbă arabă libaneză în București și online. Datele de contact: mohtiibrahim@gmail.com.</p>

        <h2 className="text-lg font-semibold text-foreground">2. Ce date colectăm</h2>
        <p>Colectăm doar datele pe care ni le furnizați voluntar prin formularele de pe site: nume, număr de telefon, adresă de email, centrul/locația preferată și formatul dorit al cursului. În cazul cursurilor pentru copii, colectăm și vârsta copilului.</p>

        <h2 className="text-lg font-semibold text-foreground">3. Scopul colectării</h2>
        <p>Datele dumneavoastră sunt utilizate exclusiv pentru a vă contacta în legătură cu cursurile solicitate, a vă înscrie la cursuri și a vă transmite informații relevante despre programul educațional.</p>

        <h2 className="text-lg font-semibold text-foreground">4. Stocarea datelor</h2>
        <p>Datele sunt stocate în mod securizat pe servere protejate și sunt păstrate atât timp cât este necesar pentru scopurile menționate. Nu partajăm datele cu terți, cu excepția furnizorilor de servicii tehnice necesare funcționării platformei.</p>

        <h2 className="text-lg font-semibold text-foreground">5. Drepturile dumneavoastră</h2>
        <p>Conform GDPR, aveți dreptul de a accesa, rectifica, șterge sau restricționa prelucrarea datelor dumneavoastră personale. Pentru orice solicitare, contactați-ne la mohtiibrahim@gmail.com.</p>

        <h2 className="text-lg font-semibold text-foreground">6. Cookie-uri</h2>
        <p>Acest site nu utilizează cookie-uri de marketing sau tracking. Se pot folosi cookie-uri tehnice esențiale pentru funcționarea normală a site-ului.</p>

        <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
        <p>Pentru întrebări legate de protecția datelor, ne puteți contacta la: mohtiibrahim@gmail.com sau pe WhatsApp la +40 763 124 514.</p>
      </div>
    </main>
    <Footer />
  </div>
);

const Privacy = () => (
  <I18nProvider>
    <PrivacyContent />
  </I18nProvider>
);

export default Privacy;
