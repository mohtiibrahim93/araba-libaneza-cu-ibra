import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Cum se desfășoară o lecție de arabă online?",
    a: "Live pe Zoom, cu profesorul nativ — nu înregistrări. Vezi și auzi profesorul, vorbești din primele minute, primești corecturi pe loc, iar materialele se împart pe ecran. Ai nevoie doar de un laptop sau telefon cu cameră și o conexiune stabilă.",
  },
  {
    q: "E la fel de eficient online ca fizic?",
    a: "Pentru un dialect vorbit, da: ce contează e timpul de vorbire cu un nativ și feedbackul imediat pe pronunție — ambele complet posibile pe Zoom. Mulți cursanți preferă online: fără drumuri, program mai flexibil.",
  },
  {
    q: "Când începe următoarea grupă online?",
    a: "Cohorta A1 online (începători) pornește pe 15 august 2026, sâmbăta și duminica 12:00–13:30 — ideală dacă în timpul săptămânii nu ai timp. A2 online se deschide în curând.",
  },
  {
    q: "Pot face lecții online din afara României?",
    a: "Da — cursurile online funcționează de oriunde, atâta timp cât programul se potrivește cu fusul orar al Bucureștiului (EET). Avem cursanți din diaspora și din alte țări; există și o pagină în engleză pentru vorbitorii non-români.",
  },
];

const ArabaOnline = () => (
  <LandingLayout
    slug="araba-online"
    title="Cursuri de arabă libaneză online, live cu profesor nativ"
    metaTitle="Arabă Libaneză Online — Cursuri Live pe Zoom cu Profesor Nativ | De Oriunde"
    description="Cursuri de arabă libaneză online: lecții live pe Zoom cu profesor nativ, grupe A1–C2 și lecții private 1:1, de oriunde. Grupa A1 online începe pe 15 august — probă gratuită."
    crumb="Arabă libaneză online"
    lead="Lecții live pe Zoom cu profesor nativ — grupă de weekend sau private 1:1, de oriunde te afli. Fără înregistrări, fără aplicații care nu te corectează."
    faq={FAQ}
  >
    <p>
      Aplicațiile nu predau dialectul libanez și nu-ți corectează pronunția. Cursurile noastre{" "}
      <strong>online sunt lecții live</strong>: aceeași metodă, același profesor nativ ca la clasele
      fizice din București — doar că intri de acasă. Cum funcționează exact am povestit în{" "}
      <Link to="/blog/invata-araba-libaneza-online">ghidul cursurilor online</Link>.
    </p>

    <h2>Formate online</h2>
    <ul>
      <li>
        <strong><Link to="/cursuri/grup">Grupă online A1 — start 15 august</Link></strong> —
        începători, sâmbăta și duminica 12:00–13:30, maximum 10 locuri, de la 500 lei/lună.
        Perfectă dacă săptămâna e plină.
      </li>
      <li>
        <strong>A2 online — în curând</strong> — data se anunță; până atunci, A2 rulează{" "}
        <Link to="/cursuri/grup/a2">fizic în București</Link> din 1 septembrie 2026.
      </li>
      <li>
        <strong><Link to="/cursuri/private">Lecții private online 1:1</Link></strong> — complet
        flexibile ca orar, 150 lei/lecție, orice nivel, cu început oricând.
      </li>
    </ul>

    <h2>Pentru cine e online-ul?</h2>
    <ul>
      <li>Ești în alt oraș sau în <strong>diaspora</strong> și vrei limba familiei.</li>
      <li>Programul tău nu permite drumuri — înveți din sufragerie, în weekend.</li>
      <li>Vrei să continui vara/în vacanțe fără pauze.</li>
      <li>
        Nu vorbești română? Avem și o{" "}
        <Link to="/en/learn-lebanese-arabic">pagină în engleză pentru cursanți internaționali</Link>.
      </li>
    </ul>

    <h2>Începe de azi, gratuit</h2>
    <p>
      Rezervă o <Link to="/trial">lecție de probă online gratuită</Link> (30 de minute pe Zoom) sau
      fă <Link to="/quiz">testul de nivel</Link> ca să afli de unde pornești. Vrei să te încălzești
      singur până la prima lecție? Începe cu{" "}
      <Link to="/blog/primele-20-de-expresii-libaneze">primele 20 de expresii</Link> și{" "}
      <Link to="/blog/numere-in-araba-libaneza">numerele în libaneză</Link>.
    </p>
  </LandingLayout>
);

export default ArabaOnline;
