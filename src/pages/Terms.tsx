import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const content = {
  ro: {
    title: "Termeni și Condiții",
    updated: "Ultima actualizare:",
    sections: [
      [
        "1. Descriere generală",
        "Acești termeni și condiții reglementează utilizarea site-ului web și a serviciilor educaționale oferite de Centrul de Arabă Libaneză.",
      ],
      [
        "2. Servicii oferite",
        "Oferim cursuri de arabă libaneză pentru adulți și adolescenți (grup și privat), fizic la Raduga Creative Center din București și online. Cursurile pentru copii nu sunt încă deschise (momentan se poate lăsa doar o cerere „Anunță-mă”); când pornesc, sunt fizice, la centru, în grupe de maximum 6 copii, cu lecții de 60 de minute și maximum 8 lecții pe lună, iar varianta online se va adăuga mai târziu ca opțiune. Cursurile acoperă toate nivelurile CEFR (A1–C2).",
      ],
      [
        "3. Înscriere și plăți",
        "Înscrierea se face prin formularele de pe site sau prin WhatsApp. Plata se efectuează conform instrucțiunilor primite după confirmare. Acceptăm plata în LEI, EUR sau USD.",
      ],
      [
        "4. Anulare și rambursare",
        [
          "Cursuri plătite integral: anularea înscrierii se poate face cu cel puțin 7 zile înainte de începerea cursului pentru o rambursare completă. După începerea cursului, rambursările se fac proporțional cu lecțiile rămase, minus o taxă administrativă de 10%.",
          "Grupe cu plată lunară (abonament): anularea oprește întotdeauna toate plățile lunare viitoare.",
          "Înainte de data de începere a cursului: dacă anulezi cu cel puțin 7 zile înainte, prima lună se rambursează integral; dacă anulezi cu mai puțin de 7 zile înainte, prima lună se rambursează minus o taxă administrativă de 10%.",
          "După începerea cursului: luna curentă se rambursează pentru lecțiile din acea lună care nu au avut loc încă, minus o taxă administrativă de 10%, doar dacă anulezi în cel mult 7 zile de la plata acelei luni (pentru o lună plătită înainte de începerea cursului, de la data începerii); mai târziu, luna curentă nu se mai rambursează. Lunile anterioare nu se rambursează niciodată. Lecțiile unei luni sunt lecțiile reale ale grupei din perioada plătită, iar zilele se socotesc după ora României (București).",
          "Exemplu: abonament de 500 lei/lună, 8 lecții pe lună. Anulezi cu 10 zile înainte de începere: primești înapoi 500 lei. Anulezi cu 3 zile înainte: primești 450 lei (500 lei minus 10%). Luna a fost plătită pe 1 și anulezi pe 5, după 2 din cele 8 lecții: rămân 6 lecții, adică 500 × 6/8 = 375 lei, minus 10% (37,50 lei), deci primești 337,50 lei. Dacă anulezi abia pe 12, la 11 zile după plată, nu primești nimic pentru acea lună, dar nu se mai încasează nicio lună viitoare.",
          "Lecția de probă gratuită: proba costă 0 lei, iar cardul se salvează la programare fără să se încaseze nimic. O poți anula sau reprograma gratuit cu cel puțin 24 de ore înainte. Dacă nu te prezinți sau anulezi cu mai puțin de 24 de ore înainte, se încasează de pe card 150 lei, cât o lecție privată. Taxa poate fi rambursată dacă o contești și explici motivul; decidem caz cu caz.",
        ],
      ],
      [
        "5. Obligațiile cursantului",
        "Cursanții se obligă să participe activ la lecții, să respecte programul stabilit și să mențină un comportament adecvat în cadrul grupului. În cazul lecțiilor online, este necesară o conexiune stabilă la internet.",
      ],
      [
        "6. Proprietate intelectuală",
        "Toate materialele de curs, inclusiv prezentări, exerciții și înregistrări, sunt proprietatea Centrul de Arabă Libaneză și nu pot fi distribuite fără acord scris.",
      ],
      [
        "7. Limitarea responsabilității",
        "Ne rezervăm dreptul de a modifica programul cursurilor sau de a anula un curs în cazul în care numărul minim de participanți nu este atins, cu notificarea prealabilă a cursanților înscriși.",
      ],
      [
        "8. Contact",
        "Pentru orice întrebare, contactați-ne la marhaba@centruldearabalibaneza.com sau pe WhatsApp la +40 763 124 514.",
      ],
      [
        "9. Date de identificare",
        [
          "Firma: E-SERVICES TODAY S.R.L.",
          "Sediu social: Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025",
          "CUI: 52051074",
          "Nr. de ordine în registrul comerțului: J2025046577002",
          "EUID: ROONRC.J2025046577002",
        ],
      ],
    ],
  },
  en: {
    title: "Terms & Conditions",
    updated: "Last updated:",
    updatedValue: "October 2026",
    sections: [
      [
        "1. Overview",
        "These terms and conditions govern the use of the website and educational services provided by Centrul de Arabă Libaneză (Lebanese Arabic with Ibra).",
      ],
      [
        "2. Services",
        "We offer Lebanese Arabic courses for adults and teenagers (group and private), in person at Raduga Creative Center in Bucharest and online. Kids' courses are not open yet (for now you can only ask to be notified); when they start, they are in person at the centre, in groups of up to 6 children, with 60-minute lessons and up to 8 lessons a month, and an online option will be added later. Courses cover all CEFR levels (A1–C2).",
      ],
      [
        "3. Registration and payments",
        "Registration is completed through the forms on the website or via WhatsApp. Payment is made according to the instructions received after confirmation. We accept payment in LEI, EUR, or USD.",
      ],
      [
        "4. Cancellation and refund",
        [
          "Courses paid in full: registration can be cancelled at least 7 days before the course start date for a full refund. After the course starts, refunds are calculated proportionally based on remaining lessons, minus a 10% administrative fee.",
          "Groups paid monthly (subscription): cancelling always stops all future monthly charges.",
          "Before the course start date: if you cancel at least 7 days before, the first month is refunded in full; if you cancel less than 7 days before, the first month is refunded minus a 10% administrative fee.",
          "After the course has started: the current month is refunded for the lessons of that month not yet held, minus a 10% administrative fee, only if you cancel within 7 days of that month's charge (for a month paid before the course started, within 7 days of the start date); later than that, the current month is not refunded. Earlier months are never refunded. A month's lessons are the group's real lessons in the period paid for, and days are counted in Romanian time (Bucharest).",
          "Example: a 500 lei/month subscription, 8 lessons a month. You cancel 10 days before the start: you get 500 lei back. You cancel 3 days before: you get 450 lei (500 lei minus 10%). The month was charged on the 1st and you cancel on the 5th, after 2 of the 8 lessons: 6 lessons remain, so 500 × 6/8 = 375 lei, minus 10% (37.50 lei), and you get 337.50 lei back. If you cancel only on the 12th, 11 days after the charge, you get nothing back for that month, but no future month is charged.",
          "Free trial lesson: the trial costs 0 lei, and your card is saved when you book without anything being charged. You can cancel or reschedule free of charge at least 24 hours ahead. If you do not show up, or cancel less than 24 hours ahead, 150 lei is charged to the card, the price of a private lesson. The fee may be refunded if you appeal it and explain why; we decide case by case.",
        ],
      ],
      [
        "5. Student responsibilities",
        "Students agree to participate actively, respect the agreed schedule, and maintain appropriate conduct in the group. For online lessons, a stable internet connection is required.",
      ],
      [
        "6. Intellectual property",
        "All course materials, including presentations, exercises, and recordings, are the property of Centrul de Arabă Libaneză (Lebanese Arabic with Ibra) and may not be distributed without written permission.",
      ],
      [
        "7. Limitation of liability",
        "We reserve the right to modify course schedules or cancel a course if the minimum number of participants is not reached, with prior notice to registered students.",
      ],
      [
        "8. Contact",
        "For any questions, contact us at marhaba@centruldearabalibaneza.com or on WhatsApp at +40 763 124 514.",
      ],
      [
        "9. Company details",
        [
          "Company: E-SERVICES TODAY S.R.L.",
          "Registered office: Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025",
          "Tax ID (CUI): 52051074",
          "Trade Register No.: J2025046577002",
          "EUID: ROONRC.J2025046577002",
        ],
      ],
    ],
  },
} as const;

const TermsContent = () => {
  const { lang } = useI18n();
  const page = content[lang];

  // No <head> here: the title, description and canonical are served by the
  // route (src/lib/seoHead.ts), which is also what meta-length.test.ts
  // length-checks. A second copy in the component put two of each in the HTML.

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main
        id="main-content"
        className="w-full max-w-3xl 2xl:max-w-4xl mx-auto px-gutter pt-36 pb-28"
      >
        <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-8">
          {page.title}
        </h1>
        <div className="prose prose-sm text-muted-foreground space-y-6">
          <p>
            <strong>{page.updated}</strong>{" "}
            {"updatedValue" in page ? page.updatedValue : "Octombrie 2026"}
          </p>
          {page.sections.map(([title, body]) => (
            <section key={title} className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              {typeof body === "string" ? (
                <p>{body}</p>
              ) : (
                body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              )}
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
