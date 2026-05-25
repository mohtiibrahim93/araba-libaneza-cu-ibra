import { useI18n } from "@/lib/i18n";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const content = {
  ro: {
    title: "Termeni și Condiții",
    updated: "Ultima actualizare:",
    sections: [
      ["1. Descriere generală", "Acești termeni și condiții reglementează utilizarea site-ului web și a serviciilor educaționale oferite de „centrul de araba libaneza”."],
      ["2. Servicii oferite", "Oferim cursuri de arabă libaneză pentru adulți (grup și privat) și copii, atât fizic la Raduga Creative Center din București, cât și online. Cursurile acoperă toate nivelurile CEFR (A1–C2)."],
      ["3. Înscriere și plăți", "Înscrierea se face prin formularele de pe site sau prin WhatsApp. Plata se efectuează conform instrucțiunilor primite după confirmare. Acceptăm plata în LEI, EUR sau USD."],
      ["4. Anulare și rambursare", "Anularea înscrierii se poate face cu cel puțin 7 zile înainte de începerea cursului pentru o rambursare completă. După începerea cursului, rambursările se fac proporțional cu lecțiile rămase, minus o taxă administrativă de 10%."],
      ["5. Obligațiile cursantului", "Cursanții se obligă să participe activ la lecții, să respecte programul stabilit și să mențină un comportament adecvat în cadrul grupului. În cazul lecțiilor online, este necesară o conexiune stabilă la internet."],
      ["6. Proprietate intelectuală", "Toate materialele de curs, inclusiv prezentări, exerciții și înregistrări, sunt proprietatea „centrul de araba libaneza” și nu pot fi distribuite fără acord scris."],
      ["7. Limitarea responsabilității", "Ne rezervăm dreptul de a modifica programul cursurilor sau de a anula un curs în cazul în care numărul minim de participanți nu este atins, cu notificarea prealabilă a cursanților înscriși."],
      ["8. Contact", "Pentru orice întrebare, contactați-ne la mohtiibrahim@gmail.com sau pe WhatsApp la +40 763 124 514."],
    ],
  },
  en: {
    title: "Terms & Conditions",
    updated: "Last updated:",
    updatedValue: "March 2026",
    sections: [
      ["1. Overview", "These terms and conditions govern the use of the website and educational services provided by “lebanese arabic center”."],
      ["2. Services", "We offer Lebanese Arabic courses for adults (group and private) and children, in person at Raduga Creative Center in Bucharest and online. Courses cover all CEFR levels (A1–C2)."],
      ["3. Registration and payments", "Registration is completed through the forms on the website or via WhatsApp. Payment is made according to the instructions received after confirmation. We accept payment in LEI, EUR, or USD."],
      ["4. Cancellation and refund", "Registration can be cancelled at least 7 days before the course start date for a full refund. After the course starts, refunds are calculated proportionally based on remaining lessons, minus a 10% administrative fee."],
      ["5. Student responsibilities", "Students agree to participate actively, respect the agreed schedule, and maintain appropriate conduct in the group. For online lessons, a stable internet connection is required."],
      ["6. Intellectual property", "All course materials, including presentations, exercises, and recordings, are the property of “lebanese arabic center” and may not be distributed without written permission."],
      ["7. Limitation of liability", "We reserve the right to modify course schedules or cancel a course if the minimum number of participants is not reached, with prior notice to registered students."],
      ["8. Contact", "For any questions, contact us at mohtiibrahim@gmail.com or on WhatsApp at +40 763 124 514."],
    ],
  },
} as const;

const TermsContent = () => {
  const { lang } = useI18n();
  const page = content[lang];

  const title = lang === "ro"
    ? "Termeni și Condiții — centrul de araba libaneza"
    : "Terms & Conditions — lebanese arabic center";
  const description = lang === "ro"
    ? "Termenii și condițiile de utilizare a serviciilor educaționale oferite de centrul de araba libaneza."
    : "Terms and conditions for using the educational services provided by the lebanese arabic center.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/terms" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://centruldearabalibaneza.com/terms" />
      </Helmet>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-28">
        <h1 className="text-3xl font-bold text-foreground mb-8">{page.title}</h1>
        <div className="prose prose-sm text-muted-foreground space-y-6">
          <p><strong>{page.updated}</strong> {"updatedValue" in page ? page.updatedValue : "Martie 2026"}</p>
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

const Terms = () => <TermsContent />;

export default Terms;
