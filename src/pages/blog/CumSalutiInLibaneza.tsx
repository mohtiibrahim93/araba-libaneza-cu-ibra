import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const GREETINGS: [string, string, string][] = [
  ["Mar7aba", "مرحبا", "Salut / Bună (universal, orice moment)"],
  ["Ahla w sahla", "أهلا وسهلا", "Bine ai venit"],
  ["Saba7 el kheir", "صباح الخير", "Bună dimineața"],
  ["Saba7 el noor", "صباح النور", "Răspuns la „bună dimineața”"],
  ["Masa el kheir", "مساء الخير", "Bună seara"],
  ["Kifak? (m) / Kifik? (f)", "كيفك؟", "Ce faci?"],
  ["Mnee7, il7amdillah", "منيح، الحمد لله", "Bine, slavă Domnului"],
  ["Yalla bye", "يلا باي", "Hai, pa (informal, foarte folosit)"],
  ["Bshoufak (m) / Bshoufik (f)", "بشوفك", "Ne vedem / Pe curând"],
];

const CumSalutiInLibaneza = () => (
  <BlogArticleLayout
    slug="cum-saluti-in-libaneza"
    title="Cum saluți în libaneză: ghid complet de politețe"
    description="Toate formulele de salut în araba libaneză: bună dimineața, ce faci, bine ai venit, pa — cu pronunție în arabizi, scriere arabă și când folosești fiecare."
    published="2026-07-16"
    readingMinutes={4}
    crumb="Cum saluți în libaneză"
    lead="De la „mar7aba” la „yalla bye” — formulele de salut pe care le auzi zilnic în Liban, cu pronunție și context."
  >
    <p>
      Salutul este prima ta interacțiune în orice limbă — și în libaneză e cald și expresiv.
      Vestea bună: câteva formule te duc foarte departe. Iată-le pe cele mai folosite, cu
      pronunție în <Link to="/blog/ce-este-arabizi">arabizi</Link> și scriere arabă.
    </p>

    <h2>Formulele esențiale</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Arabizi</th>
            <th className="py-2 px-3 font-semibold">Arabă</th>
            <th className="py-2 pl-3 font-semibold">Când / ce înseamnă</th>
          </tr>
        </thead>
        <tbody>
          {GREETINGS.map(([arabizi, arabic, ro]) => (
            <tr key={arabizi} className="border-b border-border/60 align-top">
              <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{arabizi}</td>
              <td className="py-2.5 px-3 font-arabic text-lg text-brand-green" dir="rtl" lang="ar">{arabic}</td>
              <td className="py-2.5 pl-3 text-foreground/80">{ro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2>Masculin sau feminin — atenție la terminație</h2>
    <p>
      Ai observat „Kifak?" vs „Kifik?". În libaneză, când te adresezi cuiva, forma se schimbă după
      genul persoanei: <strong>-ak</strong> pentru bărbați, <strong>-ik</strong> pentru femei. E o
      regulă simplă care apare peste tot și pe care o prinzi repede vorbind.
    </p>

    <h2>„7” și „kh” — cum le pronunți</h2>
    <p>
      În „saba<strong>7</strong>" și „el <strong>kh</strong>eir" apar sunete guturale specifice
      arabei. Cifra 7 este un „h" puternic din gât, iar „kh" seamănă cu „ch" din germana „Bach".
      Nu-ți face griji dacă nu-ți ies din prima — la o lecție le auzi de la un vorbitor nativ și le
      repeți pe loc.
    </p>

    <h2>Exersează cu cineva real</h2>
    <p>
      Salutările se învață cel mai bine spunându-le, nu citindu-le. La o{" "}
      <Link to="/trial">lecție de probă gratuită</Link> le pronunți cu profesorul și pornești o
      primă conversație scurtă. Vezi și <Link to="/blog/primele-20-de-expresii-libaneze">primele 20
      de expresii libaneze</Link> ca să continui.
    </p>
  </BlogArticleLayout>
);

export default CumSalutiInLibaneza;
