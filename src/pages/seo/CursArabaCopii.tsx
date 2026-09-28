import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "De la ce vârstă poate începe un copil să învețe araba?",
    a: "Cursul nostru este pentru 6–11 ani, când copilul citește deja fluent în română și poate sta concentrat 60 min cu pauze. Pentru copii mai mici (3–5 ani) recomandăm expunere acasă (cântece, desene animate în arabă), nu curs structurat.",
  },
  {
    q: "Cum arată o lecție de arabă pentru copii?",
    a: "60 de minute, structurate ca un joc: 10 min salut și rutine, 20 min vocabular nou prin poze/obiecte, 15 min activitate (cântec, poveste, joc de rol), 10 min recap, 5 min încheiere. Fără caiete de gramatică — copiii învață oral, ca prima limbă.",
  },
  {
    q: "Cursul de arabă pentru copii e online sau fizic?",
    a: "Fizic. Momentan nu avem cursuri pentru copii; când pornim, pornim fizic, la centru, iar varianta online o vom adăuga mai târziu, ca opțiune. Lasă-ți datele și te anunțăm.",
  },
  {
    q: "Ce dialect învață copiii — libanez sau standard?",
    a: "Libanez, ca dialect vorbit — ca să poată comunica cu bunicii, familia sau prietenii. La această vârstă araba standard (MSA) e prea abstractă. Pentru scris, părinții aleg traseul: alfabetul arab de la început (araba libaneză scrisă cu litere arabe, nu araba standard) sau arabizi. Celălalt sistem se poate adăuga oricând mai târziu.",
  },
];

const CursArabaCopii = () => (
  <LandingLayout
    slug="curs-araba-copii"
    enHref={null}
    title="Curs de arabă libaneză pentru copii — București, 6–11 ani, învățare prin joc"
    metaTitle="Curs de Arabă pentru Copii în București | 6–11 ani"
    description="Curs de arabă libaneză pentru copii de 6–11 ani în București. Lecții prin joc, cântece și povești, în grupă mică, cu profesor nativ libanez."
    crumb="Curs arabă libaneză copii"
    lead="Curs de arabă libaneză pentru copii 6–11 ani, fizic în București. Învățare prin joc, cântece și povești — cu profesor nativ libanez, fără presiune, fără teme obositoare."
    faq={FAQ}
  >
    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
      <strong>Momentan nu avem grupe pentru copii — lasă-ți datele și te anunțăm.</strong>{" "}
      <Link to="/cursuri/copii">Formularul e pe pagina cursului pentru copii</Link>.
    </p>

    <p>
      Vrei ca al tău copil să învețe <strong>araba de mic</strong>, ca să comunice cu bunicii, cu
      familia sau pur și simplu ca să crească bilingv? La{" "}
      <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> avem un curs dedicat copiilor 6–11 ani,
      fizic, la centru, prin joc și povești — fără caiete de gramatică.
    </p>

    <h2>De ce arabă de la 6–11 ani</h2>
    <p>
      La această vârstă copilul învață o limbă nouă natural, prin ureche și imitație, cu accent
      aproape nativ. Creierul e încă în fereastra sensibilă pentru achiziția lingvistică (aprox.
      până la 12 ani). Cu 1 oră/săptămână + expunere acasă (cântece, desene animate), copilul poate
      înțelege și vorbi arabă de bază în 6–12 luni. Detalii în{" "}
      <Link to="/blog/araba-pentru-copii-ghidul-parintilor">ghidul părinților</Link>.
    </p>

    <h2>Cum arată cursul</h2>
    <ul>
      <li><strong>Format:</strong> fizic, la centru; varianta online o vom adăuga mai târziu (orarul îl stabilim când pornește grupa)</li>
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
      Momentan nu avem grupe pentru copii — lasă-ți datele și te anunțăm. Când pornește o grupă, prețul este 500 lei/lună (4 lecții).{" "}
      <Link to="/cursuri/copii">Lasă-ți datele pe pagina cursului</Link>.
    </p>
  </LandingLayout>
);

export default CursArabaCopii;