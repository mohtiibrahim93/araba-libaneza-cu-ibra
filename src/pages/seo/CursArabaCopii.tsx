import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "De la ce vârstă poate începe un copil să învețe araba?",
    a: "Cursul nostru este pentru 6–10 ani, când copilul citește deja fluent în română și poate sta concentrat 60 min cu pauze. Pentru copii mai mici (3–5 ani) recomandăm expunere acasă (cântece, desene animate în arabă), nu curs structurat.",
  },
  {
    q: "Cum arată o lecție de arabă pentru copii?",
    a: "60 de minute, structurate ca un joc: 10 min salut și rutine, 20 min vocabular nou prin poze/obiecte, 15 min activitate (cântec, poveste, joc de rol), 10 min recap, 5 min încheiere. Fără caiete de gramatică — copiii învață oral, ca prima limbă.",
  },
  {
    q: "Cursul de arabă pentru copii e doar fizic?",
    a: "Da, momentan doar fizic în București. Copiii mici nu pot menține atenția online 60 min, iar interacțiunea directă cu profesorul și cu ceilalți copii e esențială pentru limbă. Pentru părinți din alte orașe recomandăm meditații 1:1 online (părinte + copil împreună).",
  },
  {
    q: "Ce dialect învață copiii — libanez sau standard?",
    a: "Libanez, ca dialect vorbit — ca să poată comunica cu bunicii, familia sau prietenii. La această vârstă araba standard (MSA) e prea abstractă. Alfabetul arab îl introducem treptat, după ce copilul are deja vocabular oral.",
  },
];

const CursArabaCopii = () => (
  <LandingLayout
    slug="curs-araba-copii"
    enHref={null}
    title="Curs de arabă libaneză pentru copii — București, 6–10 ani, învățare prin joc"
    metaTitle="Curs Arabă Libaneză pentru Copii (6–10 ani) | București, prin Joc"
    description="Curs de arabă libaneză pentru copii 6–10 ani în București: învățare prin joc, cântece și povești, cu profesor nativ libanez. Grupă mică, sâmbătă dimineața."
    crumb="Curs arabă libaneză copii"
    lead="Curs de arabă libaneză pentru copii 6–10 ani, fizic în București. Învățare prin joc, cântece și povești — cu profesor nativ libanez, fără presiune, fără teme obositoare."
    faq={FAQ}
  >
    <p>
      Vrei ca al tău copil să învețe <strong>araba de mic</strong>, ca să comunice cu bunicii, cu
      familia sau pur și simplu ca să crească bilingv? La{" "}
      <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> avem un curs dedicat copiilor 6–10 ani,
      fizic în București, prin joc și povești — fără caiete de gramatică.
    </p>

    <h2>De ce arabă de la 6–10 ani</h2>
    <p>
      La această vârstă copilul învață o limbă nouă natural, prin ureche și imitație, cu accent
      aproape nativ. Creierul e încă în fereastra sensibilă pentru achiziția lingvistică (aprox.
      până la 12 ani). Cu 1 oră/săptămână + expunere acasă (cântece, desene animate), copilul poate
      înțelege și vorbi arabă de bază în 6–12 luni. Detalii în{" "}
      <Link to="/blog/araba-pentru-copii-ghidul-parintilor">ghidul părinților</Link>.
    </p>

    <h2>Cum arată cursul</h2>
    <ul>
      <li><strong>Format:</strong> fizic în București, sâmbătă dimineața</li>
      <li><strong>Durată:</strong> 60 min/lecție, o lecție/săptămână</li>
      <li><strong>Grupă:</strong> maxim 6 copii, aceeași vârstă apropiată</li>
      <li><strong>Metodă:</strong> joc, cântece, povești, obiecte, mișcare — zero caiete</li>
      <li><strong>Ce învață:</strong> salut, familia, culorile, numerele, animalele, mâncarea, expresii uzuale</li>
    </ul>

    <h2>Ce facem la o lecție tipică</h2>
    <p>
      Ne salutăm în arabă, cântăm cântecul zilei (numere, zilele săptămânii), învățăm 5–8 cuvinte
      noi prin poze și obiecte reale, jucăm un joc de rol simplu (la magazin, la doctor, la
      restaurant), citim o poveste scurtă. Copilul iese din lecție zâmbind, nu obosit.
    </p>

    <h2>Preț și înscriere</h2>
    <p>
      500 lei/lună (4 lecții). Lecția de probă (30 min) este gratuită — vii cu copilul, vede cum e,
      decideți împreună. <Link to="/cursuri/copii">Vezi pagina cursului</Link> pentru detalii de
      înscriere sau <Link to="/trial">rezervă proba gratuită</Link>.
    </p>
  </LandingLayout>
);

export default CursArabaCopii;