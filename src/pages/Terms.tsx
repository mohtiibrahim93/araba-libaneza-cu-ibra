import { I18nProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsContent = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="max-w-3xl mx-auto px-6 py-28">
      <h1 className="text-3xl font-bold text-foreground mb-8">Termeni și Condiții</h1>
      
      <div className="prose prose-sm text-muted-foreground space-y-6">
        <p><strong>Ultima actualizare:</strong> Martie 2026</p>

        <h2 className="text-lg font-semibold text-foreground">1. Descriere generală</h2>
        <p>Acești termeni și condiții reglementează utilizarea site-ului web și a serviciilor educaționale oferite de „Arabă Libaneză cu Ibra".</p>

        <h2 className="text-lg font-semibold text-foreground">2. Servicii oferite</h2>
        <p>Oferim cursuri de arabă libaneză pentru adulți (grup și privat) și copii, atât fizic la Raduga Creative Center din București, cât și online. Cursurile sunt destinate nivelului A0-A1 (începători).</p>

        <h2 className="text-lg font-semibold text-foreground">3. Înscriere și plăți</h2>
        <p>Înscrierea se face prin formularele de pe site sau prin WhatsApp. Plata se efectuează conform instrucțiunilor primite după confirmare. Acceptăm plata în LEI, EUR sau USD.</p>

        <h2 className="text-lg font-semibold text-foreground">4. Anulare și rambursare</h2>
        <p>Anularea înscrierii se poate face cu cel puțin 7 zile înainte de începerea cursului pentru o rambursare completă. După începerea cursului, rambursările se fac proporțional cu lecțiile rămase, minus o taxă administrativă de 10%.</p>

        <h2 className="text-lg font-semibold text-foreground">5. Obligațiile cursantului</h2>
        <p>Cursanții se obligă să participe activ la lecții, să respecte programul stabilit și să mențină un comportament adecvat în cadrul grupului. În cazul lecțiilor online, este necesară o conexiune stabilă la internet.</p>

        <h2 className="text-lg font-semibold text-foreground">6. Proprietate intelectuală</h2>
        <p>Toate materialele de curs, inclusiv prezentări, exerciții și înregistrări, sunt proprietatea „Arabă Libaneză cu Ibra" și nu pot fi distribuite fără acord scris.</p>

        <h2 className="text-lg font-semibold text-foreground">7. Limitarea responsabilității</h2>
        <p>Ne rezervăm dreptul de a modifica programul cursurilor sau de a anula un curs în cazul în care numărul minim de participanți nu este atins, cu notificarea prealabilă a cursanților înscriși.</p>

        <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
        <p>Pentru orice întrebare, contactați-ne la mohtiibrahim@gmail.com sau pe WhatsApp la +40 763 124 514.</p>
      </div>
    </main>
    <Footer />
  </div>
);

const Terms = () => (
  <I18nProvider>
    <TermsContent />
  </I18nProvider>
);

export default Terms;
