import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Care este cel mai bun curs de arabă din România?",
    a: "Depinde de scopul tău. Dacă vrei să vorbești cu oameni reali — familie, prieteni, vacanță în Liban sau Iordania — cel mai bun curs este unul de arabă libaneză (dialect levantin) cu profesor nativ, nu de arabă standard (MSA). Dacă vrei să citești presă, documente sau Coranul, ai nevoie de MSA. Multe cursuri din România predau doar MSA, motiv pentru care mulți cursanți termină un an și tot nu pot purta o conversație.",
  },
  {
    q: "Cum recunosc un curs de arabă bun?",
    a: "Cinci semne: (1) profesorul e vorbitor nativ al dialectului predat, (2) vorbești din prima lecție, nu după 3 luni de alfabet, (3) grupele sunt mici — maximum 6 persoane online, 10 fizic, (4) programul e aliniat pe niveluri CEFR (A1–C2) cu evaluări clare, (5) prețul e afișat public, fără costuri ascunse.",
  },
  {
    q: "Cursuri de grup sau lecții private — ce e mai bun?",
    a: "Grupul e mai bun pentru motivație, conversație cu colegi și cost (de la 500 lei/lună). Lecțiile private sunt mai bune pentru viteză și obiective specifice (150 lei/60 min, cu reduceri la pachet). Cea mai eficientă combinație pentru majoritatea: o grupă + 1–2 lecții private pe lună pentru punctele slabe.",
  },
  {
    q: "Aplicațiile (Duolingo, Memrise) pot înlocui un curs de arabă?",
    a: "Nu pentru dialect. Duolingo predă arabă standard, cu accent pe citire, și nu are corectare de pronunție — un obstacol serios în arabă, unde sunete ca ع, ح, ق nu există în română. Aplicațiile sunt utile ca supliment de vocabular între lecții, nu ca înlocuitor.",
  },
  {
    q: "Cât ar trebui să coste un curs de arabă bun?",
    a: "În București, un curs de grup serios costă 450–600 lei/lună, iar o lecție privată 130–200 lei/oră. La noi: 500 lei/lună la grup (2 × 90 min/săptămână) și 150 lei/lecție de 60 min la privat, cu reduceri de până la −20% pe pachet. Prima lecție de probă e gratuită — cel mai bun mod de a compara înainte să plătești.",
  },
];

const CelMaiBunCursAraba = () => (
  <LandingLayout
    slug="cel-mai-bun-curs-de-araba"
    enHref="/en/best-arabic-course"
    title="Cel mai bun curs de arabă: cum alegi în 2026 (grup, privat, online sau aplicație)"
    metaTitle="Cel mai bun curs de arabă în 2026 | Ghid de alegere"
    description="Compară cursurile de arabă: libaneză sau standard, grup, privat, online ori aplicații. Vezi prețuri, criterii și greșeli de evitat înainte să alegi."
    crumb="Cel mai bun curs de arabă"
    lead="Nu există „cel mai bun curs de arabă” în general — există cel mai bun curs pentru scopul tău. Acest ghid compară onest dialectul libanez cu araba standard, grupul cu lecțiile private și cursurile cu aplicațiile, ca să nu pierzi un an pe varianta greșită."
    faq={FAQ}
  >
    <p>
      Cel mai frecvent regret al celor care încep araba în România: au făcut un an de{" "}
      <strong>arabă standard</strong> (MSA / Fusha) și nu pot purta o conversație simplă cu un
      vorbitor nativ. Motivul e simplu — araba standard este limba scrisă a știrilor și a
      documentelor oficiale, nu limba pe care o vorbește cineva acasă. Dacă obiectivul tău e să
      vorbești, cel mai bun curs de arabă este un curs de <strong>dialect</strong>, iar pentru
      România cel mai util dialect este <strong>araba libaneză (levantină)</strong> — vorbită în
      Liban, Siria, Iordania și Palestina.
    </p>

    <h2>Prima decizie: dialect libanez (levantin) sau arabă standard?</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Criteriu</th>
            <th className="py-2 px-3 font-semibold">Arabă libaneză (levantină)</th>
            <th className="py-2 pl-3 font-semibold">Arabă standard (MSA)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Unde o folosești</td>
            <td className="py-2 px-3">Conversație reală, familie, vacanță, muzică, seriale, social media</td>
            <td className="py-2 pl-3">Presă, documente, texte religioase, examene</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Timp până la prima conversație</td>
            <td className="py-2 px-3">2–4 săptămâni</td>
            <td className="py-2 pl-3">6–12 luni</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Alfabet obligatoriu la start</td>
            <td className="py-2 px-3">Nu (poți începe cu <Link to="/arabizi">arabizi</Link>)</td>
            <td className="py-2 pl-3">Da</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Înțeles de vorbitori nativi</td>
            <td className="py-2 px-3">Da, în tot Levantul; larg înțeles în lumea arabă</td>
            <td className="py-2 pl-3">Înțeles, dar sună formal/livresc în conversație</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Comparația completă, cu exemple concrete de propoziții, e în{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">araba libaneză vs araba standard</Link> și în{" "}
      <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link>.
    </p>

    <h2>A doua decizie: grup, privat, online sau aplicație</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Format</th>
            <th className="py-2 px-3 font-semibold">Cel mai bun pentru</th>
            <th className="py-2 px-3 font-semibold">Preț</th>
            <th className="py-2 pl-3 font-semibold">Limitare</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/cursuri/grup">Curs de grup A1–C2</Link></td>
            <td className="py-2 px-3">Motivație, conversație cu colegi, raport calitate-preț</td>
            <td className="py-2 px-3">de la 500 lei/lună</td>
            <td className="py-2 pl-3">Orar fix, ritm comun</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/meditatii-araba">Meditații 1:1</Link></td>
            <td className="py-2 px-3">Obiective precise, progres rapid, program flexibil</td>
            <td className="py-2 px-3">150 lei / 60 min (−10% / −20% pe pachet)</td>
            <td className="py-2 pl-3">Cost mai mare pe oră</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/cursuri-limba-araba">Online (Zoom)</Link></td>
            <td className="py-2 px-3">Cursanți din alte orașe sau din diasporă</td>
            <td className="py-2 px-3">Același preț ca fizic</td>
            <td className="py-2 pl-3">Necesită autodisciplină</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Aplicații (Duolingo etc.)</td>
            <td className="py-2 px-3">Vocabular de întreținere între lecții</td>
            <td className="py-2 px-3">Gratuit / abonament</td>
            <td className="py-2 pl-3">Doar MSA, fără corectare de pronunție, fără conversație</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Cele 5 criterii după care compari orice curs de arabă</h2>
    <ul>
      <li><strong>Profesor nativ al dialectului predat.</strong> Pentru libaneză, un vorbitor nativ libanez — pronunția și expresiile vii nu se învață din manual.</li>
      <li><strong>Vorbești din prima lecție.</strong> Dacă primele luni sunt doar alfabet și tabele de gramatică, vei renunța înainte să vorbești.</li>
      <li><strong>Grupe mici (max. 6 online, 10 fizic).</strong> Peste atât, timpul tău de vorbire pe lecție scade sub 5 minute.</li>
      <li><strong>Structură CEFR (A1–C2)</strong> cu evaluări la 8–10 lecții, ca să știi obiectiv unde ești.</li>
      <li><strong>Preț public și lecție de probă.</strong> Un curs bun nu are nevoie să ascundă prețul și îți dă ocazia să testezi înainte.</li>
    </ul>

    <h2>Greșeli frecvente când alegi un curs de arabă</h2>
    <ul>
      <li>Alegi MSA „ca să fie universal”, deși scopul tău e conversația cu familia sau în vacanță.</li>
      <li>Alegi grupa cu cei mai mulți cursanți, crezând că e semn de calitate — de fapt e semn de mai puțin timp de vorbire.</li>
      <li>Amâni startul până „înveți alfabetul singur”. Nu e necesar: vezi{" "}
        <Link to="/fara-alfabet-arab">cum înveți arabă fără alfabet</Link>.</li>
      <li>Compari doar prețul pe lună, nu prețul pe oră efectivă de predare.</li>
    </ul>

    <h2>Ce oferim noi și pentru cine e potrivit</h2>
    <p>
      La <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> predăm <strong>exclusiv arabă
      libaneză (levantină)</strong>, cu profesor nativ libanez, fizic în București (Strada Icoanei
      80) și online. Formate: <Link to="/cursuri/grup">grupe A1–C2</Link>,{" "}
      <Link to="/cursuri/private">lecții private 1:1</Link>,{" "}
      <Link to="/curs-araba-copii">curs pentru copii 6–10 ani</Link> și{" "}
      <Link to="/cursuri-araba-adolescenti">grupe pentru adolescenți 11–17 ani</Link>. Nu suntem cea
      mai bună alegere dacă ai nevoie strict de arabă standard pentru un examen academic — în acest
      caz îți spunem direct la proba gratuită.
    </p>
    <p>
      Cel mai simplu mod de a afla dacă e cursul potrivit pentru tine:{" "}
      <Link to="/trial">lecția de probă gratuită de 30 de minute</Link>. Sau răspunde la{" "}
      <Link to="/quiz">quizul de 30 de secunde</Link> și îți recomandăm formatul.
    </p>
  </LandingLayout>
);

export default CelMaiBunCursAraba;
