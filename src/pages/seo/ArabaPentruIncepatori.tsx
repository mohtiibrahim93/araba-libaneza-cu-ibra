import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "E greu să înveți arabă ca începător?",
    a: "Mai puțin decât crezi. Dialectul libanez are gramatică simplificată față de araba standard (fără cazuri gramaticale), iar cu metoda Oral First vorbești din prima lecție folosind litere latine (arabizi). Sunetele noi (ع, ح, ق) se prind în câteva săptămâni de exersare ghidată.",
  },
  {
    q: "Trebuie să învăț alfabetul arab înainte să încep?",
    a: "Nu. Începi să vorbești cu arabizi — araba scrisă cu litere latine și cifre, exact cum scriu libanezii pe telefon. Alfabetul arab vine treptat, când urechea și pronunția sunt deja formate.",
  },
  {
    q: "Cât durează până port o conversație simplă?",
    a: "Cu 2 lecții pe săptămână, în 1–3 luni te prezinți, comanzi la restaurant și te descurci în situații de bază; nivelul A1 complet durează ~4 luni. Conversații relaxate pe teme familiare vin după ~6 luni.",
  },
  {
    q: "Când începe următoarea grupă de începători?",
    a: "Cohortele A1: online din 15 august 2026 (sâmbătă și duminică 12:00–13:30) și fizic în București din 1 septembrie 2026 (luni și miercuri 19:00–20:30). Locurile sunt limitate la 10 pe grupă.",
  },
];

const ArabaPentruIncepatori = () => (
  <LandingLayout
    slug="araba-pentru-incepatori"
    title="Arabă libaneză pentru începători: vorbește din prima lecție"
    metaTitle="Arabă Libaneză pentru Începători — Cursuri de la Zero | Vorbești din Prima Lecție"
    description="Învață arabă libaneză de la zero cu profesor nativ: metoda Oral First, fără blocajul alfabetului, grupe A1 pentru începători — fizic în București sau online. Probă gratuită."
    crumb="Arabă libaneză pentru începători"
    lead="Zero cunoștințe? Perfect. Grupele A1 sunt gândite exact pentru început de drum: vorbești din prima lecție, fără să te blochezi în alfabet."
    faq={FAQ}
  >
    <p>
      Cel mai mare mit despre arabă e că „trebuie ani întregi până spui ceva". Adevărul: cu
      dialectul potrivit și metoda potrivită, <strong>porți primele mini-conversații din primele
      săptămâni</strong>. La <Link to="/">Centrul de Arabă Libaneză</Link> începătorii pornesc cu
      ce e viu și util — salutul, prezentarea, întrebările de zi cu zi — cu profesor nativ.
    </p>

    <h2>Cum înveți, pas cu pas</h2>
    <ul>
      <li>
        <strong>Vorbit înainte de scris (Oral First)</strong> — folosești{" "}
        <Link to="/blog/ce-este-arabizi">arabizi</Link>, araba scrisă cu litere latine, ca să
        comunici imediat.
      </li>
      <li>
        <strong>Expresii reale din prima zi</strong> — începe chiar acum cu{" "}
        <Link to="/blog/primele-20-de-expresii-libaneze">primele 20 de expresii libaneze</Link> și{" "}
        <Link to="/blog/cum-saluti-in-libaneza">formulele de salut</Link>.
      </li>
      <li>
        <strong>Alfabetul vine treptat</strong> — când ești pregătit, nu ca obstacol la start. Vezi{" "}
        <Link to="/blog/alfabetul-arab-pentru-incepatori">ghidul alfabetului arab</Link>.
      </li>
      <li>
        <strong>Grupe mici, feedback constant</strong> — maximum 10 cursanți, ca să vorbești mult,
        nu doar să asculți.
      </li>
    </ul>

    <h2>Grupa A1 — startul tău din august sau septembrie</h2>
    <p>
      Nivelul <Link to="/cursuri/grup/a1">A1 — Începător</Link> durează ~4 luni (32 de lecții) și te
      duce de la zero la conversații de supraviețuire. Pornesc două cohorte: <strong>online din 15
      august 2026</strong> (weekend la prânz) și <strong>fizic în București din 1 septembrie
      2026</strong> (luni & miercuri seara). Preferi ritmul tău? Există și{" "}
      <Link to="/cursuri/private">lecții private 1:1</Link>.
    </p>

    <h2>Începe fără niciun risc</h2>
    <p>
      Prima lecție e o <Link to="/trial">probă gratuită de 30 de minute</Link> — cunoști profesorul,
      auzi limba, pronunți primele cuvinte și abia apoi decizi. Dacă ai mai avut contact cu araba și
      nu știi unde te încadrezi, <Link to="/quiz">testul de nivel</Link> îți spune în 2 minute.
      Dacă te blochează scrierea, începe cu{" "}
      <Link to="/arabizi">ghidul Arabizi</Link> și cu{" "}
      <Link to="/fara-alfabet-arab">varianta fără alfabet arab</Link>.
      Ghidul complet pentru început de drum e în{" "}
      <Link to="/blog/cum-inveti-araba-libaneza">cum înveți araba libaneză în 2026</Link>.
    </p>
  </LandingLayout>
);

export default ArabaPentruIncepatori;
