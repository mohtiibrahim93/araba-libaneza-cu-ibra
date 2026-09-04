import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";
import FaqGroups from "@/components/FaqGroups";
import { allFaqs } from "@/data/faq";

/**
 * Every question the site answers, grouped by topic.
 *
 * The homepage used to carry all of these in one accordion — the longest
 * section on the page. It now shows six and links here. Both read
 * src/data/faq.ts, so there is one copy of each answer.
 *
 * `faq` is passed to the layout for the FAQPage structured data only; the
 * visible list is FaqGroups, which keeps the topic headings.
 */
const IntrebariFrecvente = () => (
  <LandingLayout
    slug="intrebari-frecvente"
    enHref="/en/faq"
    title="Întrebări frecvente despre araba libaneză și cursurile noastre"
    metaTitle="Întrebări frecvente despre cursurile de arabă libaneză | Ibra"
    description="Răspunsuri despre araba libaneză: preț, orar, format online sau fizic, cât durează până vorbești, ce dialect să înveți și cum arată gramatica."
    crumb="Întrebări frecvente"
    lead="Tot ce ne întreabă cursanții înainte să se înscrie — preț și orar, cât durează până ții o conversație, diferența dintre libaneză și araba standard, și cum funcționează gramatica."
    faq={allFaqs("ro")}
  >
    <p>
      Am strâns aici întrebările pe care le primim cel mai des, grupate pe teme. Dacă vrei
      doar esențialul — preț, orar și lecția de probă — găsești un rezumat pe{" "}
      <Link to="/">pagina principală</Link>. Pentru detalii despre fiecare tip de curs, vezi{" "}
      <Link to="/cursuri/grup">cursurile de grup</Link>,{" "}
      <Link to="/cursuri/private">lecțiile private</Link> sau{" "}
      <Link to="/cursuri/copii">cursul pentru copii</Link>.
    </p>

    <FaqGroups lang="ro" />

    <h2>Nu ai găsit răspunsul?</h2>
    <p>
      Scrie-ne și îți răspundem în aceeași zi. Cel mai simplu mod de a afla dacă un curs ți
      se potrivește rămâne{" "}
      <Link to="/trial">lecția de probă gratuită de 30 de minute</Link> — fără card și fără
      obligații.
    </p>
  </LandingLayout>
);

export default IntrebariFrecvente;
