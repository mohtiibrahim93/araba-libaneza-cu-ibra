import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const LEVELS: [string, string, string][] = [
  ["A1 — Începător", "~4 luni", "Te descurci în situații simple de zi cu zi: saluturi, cumpărături, prezentări."],
  ["A2 — Elementar", "~6–7 luni", "Conversații despre subiecte familiare, trecut și viitor, opinii simple."],
  ["B1 — Intermediar", "~8–9 luni", "Vorbești liber despre experiențe, planuri, povești; înțelegi discuții normale."],
  ["B2 — Intermediar avansat", "~9 luni", "Comunicare naturală, nuanțe culturale, subiecte abstracte."],
  ["C1–C2 — Avansat", "~10 luni fiecare", "Fluență apropiată de nativ, umor, registre diferite."],
];

const CatDureaza = () => (
  <BlogArticleLayout
    slug="cat-dureaza-sa-inveti-araba-libaneza"
    title="Cât durează să înveți arabă libaneză?"
    description="De cât timp ai nevoie ca să vorbești arabă libaneză: durata pe fiecare nivel (A1–C2), câte ore pe săptămână și ce influențează ritmul. Estimări realiste."
    published="2026-07-16"
    readingMinutes={5}
    crumb="Cât durează"
    lead="Depinde de nivelul-țintă și de ritm — dar iată estimări realiste pe fiecare nivel, ca să știi la ce să te aștepți."
  >
    <p>
      „Cât durează?" este întrebarea la care toată lumea vrea un răspuns simplu. Adevărul onest:
      depinde de cât de departe vrei să ajungi și cât de des exersezi. Vestea bună pentru libaneză
      e că, fiind un dialect vorbit, <strong>începi să comunici din primele lecții</strong> — nu
      aștepți luni întregi ca să spui ceva util.
    </p>

    <h2>Durata pe fiecare nivel</h2>
    <p>
      La Centrul de Arabă Libaneză, cursurile de grup au 2 lecții pe săptămână (câte 90 de minute).
      Cu acest ritm, iată cât durează fiecare nivel CEFR:
    </p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Nivel</th>
            <th className="py-2 px-3 font-semibold">Durată</th>
            <th className="py-2 pl-3 font-semibold">Ce poți face</th>
          </tr>
        </thead>
        <tbody>
          {LEVELS.map(([lvl, dur, can]) => (
            <tr key={lvl} className="border-b border-border/60 align-top">
              <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{lvl}</td>
              <td className="py-2.5 px-3 text-brand-green font-medium whitespace-nowrap">{dur}</td>
              <td className="py-2.5 pl-3 text-foreground/80">{can}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2>Ce influențează ritmul</h2>
    <ul>
      <li><strong>Frecvența</strong> — 2 lecții/săptămână plus puțină practică între ele accelerează mult.</li>
      <li><strong>Expunerea</strong> — muzică, seriale, prieteni libanezi — orice contact real ajută.</li>
      <li><strong>Formatul</strong> — lecțiile <Link to="/cursuri/private">private 1:1</Link> merg mai repede pentru obiective specifice; grupul e mai motivant și mai accesibil.</li>
      <li><strong>Limbile pe care le știi</strong> — dacă știi deja o limbă cu sunete guturale, pronunția vine mai ușor.</li>
    </ul>

    <h2>Cât până „mă descurc în vacanță"?</h2>
    <p>
      Pentru a te descurca într-o călătorie în Liban — saluturi, restaurant, taxi, cumpărături —
      nivelul <strong>A1–A2</strong> este suficient, deci câteva luni. Vezi{" "}
      <Link to="/blog/primele-20-de-expresii-libaneze">primele 20 de expresii</Link> ca să începi
      chiar azi, sau <Link to="/blog/cum-inveti-araba-libaneza">ghidul complet pentru începători</Link>.
    </p>

    <h2>Cum afli de unde pornești</h2>
    <p>
      Dacă știi deja câteva cuvinte, poți sări peste A1. Fă <Link to="/quiz">testul de nivel
      gratuit</Link> (2 minute) sau o <Link to="/trial">lecție de probă gratuită</Link> — profesorul
      îți spune exact de unde e cel mai bine să începi.
    </p>
  </BlogArticleLayout>
);

export default CatDureaza;
