import { Link } from "@/lib/router-compat";
import NotifyMeForm from "@/components/NotifyMeForm";
import LandingLayout from "@/components/seo/LandingLayout";
import { courseInstances, GROUP_WEEKLY_WORKLOAD } from "@/lib/courseSchema";

const FAQ = [
  {
    q: "De la ce vârstă poate un adolescent să înceapă cursul de arabă?",
    a: "Grupele pentru adolescenți sunt pentru 11–17 ani. De la 16 ani, adolescenții pot intra direct în grupele de adulți (A1–C2), cu acordul părintelui. Pentru 6–10 ani avem cursul separat pentru copii, prin joc.",
  },
  {
    q: "Ce fel de arabă învață adolescenții?",
    a: "Arabă libaneză (dialect levantin) — limba vorbită real în Liban, Siria, Iordania și Palestina. E dialectul din muzica, serialele și clipurile pe care adolescenții le văd oricum pe TikTok și Instagram, ceea ce îi motivează mult mai mult decât araba standard din manuale.",
  },
  {
    q: "Cursul de arabă pentru adolescenți e fizic sau online?",
    a: "Ambele. Fizic în București (Strada Icoanei 80) sau online pe Zoom. La această vârstă online funcționează bine — adolescenții sunt obișnuiți cu formatul și pot menține atenția 90 de minute cu pauză.",
  },
  {
    q: "Adolescentul meu nu știe alfabetul arab. E o problemă?",
    a: "Nu. Începem oral, cu arabizi (arabă scrisă cu litere latine și cifre) — exact cum scriu tinerii libanezi pe telefon. Alfabetul arab îl introducem treptat, după ce există deja vocabular vorbit.",
  },
  {
    q: "Cât costă cursul de arabă pentru adolescenți?",
    a: "Aceleași prețuri ca la grupele de adulți: de la 500 lei/lună pentru grup (2 lecții de 90 min/săptămână), sau 150 lei/lecție de 60 min pentru meditații 1:1, cu reduceri la pachet. Prima lecție de probă de 30 de minute este gratuită.",
  },
  {
    q: "Cât de mare este grupa?",
    a: "Între 4 și 10 cursanți. E limita peste care nu mai apucă fiecare să vorbească în fiecare lecție, iar la adolescenți asta contează mai mult decât la adulți: dacă stau o oră fără să deschidă gura, se pierd.",
  },
  {
    q: "Ce vorbește copilul meu după prima lună?",
    a: "O lună înseamnă opt lecții. Acoperă sunetele care nu există în română, sistemul arabizi, salutările și formulele de politețe, prezentarea personală, familia, naționalitățile, profesiile și posesivele. Concret: poate purta o conversație scurtă de prezentare cu o rudă din Liban, în dialect, fără să fi învățat alfabetul arab.",
  },
  {
    q: "Are teme de făcut acasă?",
    a: "Da, dar scurte și audio — ascultare și repetare, nu liste de memorat. Progresul se verifică în conversație la lecția următoare, nu prin dictare.",
  },
  {
    q: "Cum știu dacă i se potrivește înainte să plătesc?",
    a: "Prin lecția de probă gratuită de 30 de minute, online sau fizic. Nu se cere card și nu se face nicio plată la acea etapă; dacă după cele 30 de minute nu vrei să continui, nu urmează nimic.",
  },
];

const CursuriArabaAdolescenti = () => (
  <LandingLayout
    slug="cursuri-araba-adolescenti"
    enHref="/en/arabic-for-teenagers"
    courseInstances={courseInstances({ workload: GROUP_WEEKLY_WORKLOAD, repeatFrequency: "Weekly" })}
    title="Cursuri de arabă libaneză pentru adolescenți (11–17 ani) — București și online"
    metaTitle="Arabă Libaneză pentru Adolescenți | Curs 11–17 ani"
    description="Adolescenții de 11–17 ani învață arabă libaneză prin conversație, muzică și social media, online sau în București. Lecție de probă gratuită."
    crumb="Cursuri arabă adolescenți"
    lead="Grupe de arabă libaneză gândite pentru adolescenți 11–17 ani: conversație, muzică și limbaj real de social media — nu gramatică tocită. Profesor nativ libanez, fizic în București sau online."
    faq={FAQ}
  >
    <p>
      Adolescenții învață o limbă când o pot folosi imediat. De asta grupele noastre de{" "}
      <strong>arabă libaneză pentru adolescenți</strong> (11–17 ani) pornesc de la limba vie —
      dialectul levantin vorbit în Liban, Siria, Iordania și Palestina — și nu de la araba standard
      din manuale, pe care nimeni nu o folosește în conversație.
    </p>

    {/* Above the fold: the page ranks (466 impressions) but sat at position
        33.5 with no clicks, and a visitor had to scroll past four sections
        before finding the price or a way to start. Age, format, size, price and
        the trial, answered immediately. */}
    <div className="not-prose rounded-xl border border-border bg-muted/40 p-5 md:p-6">
      <ul className="space-y-1.5 text-sm md:text-base">
        <li><strong>Vârsta:</strong> 11–17 ani (de la 16 ani se poate intra și în grupele de adulți, cu acordul părintelui)</li>
        <li><strong>Format:</strong> fizic în București, Strada Icoanei 80, sau online pe Zoom</li>
        <li><strong>Ritm:</strong> două lecții de 90 de minute pe săptămână, în grupe mici (max. 6 online, 10 fizic)</li>
        <li><strong>Preț:</strong> de la 500 lei/lună online (700 lei/lună fizic); meditații 1:1 — 150 lei/lecție de 60 min</li>
        <li><strong>Nivel de start:</strong> de la zero, fără alfabet arab — se începe oral, cu arabizi</li>
      </ul>
      <div className="mt-5">
        <Link
          to="/trial"
          data-cta
        className="inline-block rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground no-underline transition hover:bg-primary/90"
        >
          Rezervă lecția de probă gratuită (30 min)
        </Link>
      </div>
    </div>

    <h2>Pentru cine este cursul</h2>
    <ul>
      <li><strong>Adolescenți din familii libaneze / arabe</strong> care vor să vorbească cu bunicii, verii sau rudele din Liban.</li>
      <li><strong>Adolescenți fără legătură cu limba</strong>, dar interesați de muzică arabă, seriale, TikTok sau călătorii.</li>
      <li><strong>Elevi care vor o a treia limbă</strong> utilă și rară în CV-ul viitor (arabă = peste 400 de milioane de vorbitori).</li>
      <li><strong>Familii mixte</strong> în care un părinte e vorbitor nativ — vezi și{" "}
        <Link to="/araba-in-familie">arabă în familie</Link>.</li>
    </ul>

    <h2>Cum arată o lecție</h2>
    <p>
      90 de minute, ritm alert: 10 min recap, 25 min vocabular și structuri noi prin exemple reale
      (mesaje, versuri, scene de film), 40 min conversație și joc de rol, 15 min feedback pe
      pronunție. Fără dictări, fără liste de memorat acasă — temele sunt scurte și audio. Metoda se
      numește <strong>Oral First</strong>: vorbești din prima lecție, folosind{" "}
      <Link to="/arabizi">arabizi</Link>.
    </p>

    <h2>Vârste și traseu</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Vârstă</th>
            <th className="py-2 px-3 font-semibold">Format recomandat</th>
            <th className="py-2 pl-3 font-semibold">Unde</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">6–10 ani</td>
            <td className="py-2 px-3"><Link to="/curs-araba-copii">Curs pentru copii, prin joc</Link></td>
            <td className="py-2 pl-3">Fizic, București</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">11–15 ani</td>
            <td className="py-2 px-3">Grupă de adolescenți (în formare) sau meditații 1:1</td>
            <td className="py-2 pl-3">Fizic sau online</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">16–17 ani</td>
            <td className="py-2 px-3"><Link to="/cursuri/grup">Grupele de adulți A1–C2</Link>, cu acordul părintelui</td>
            <td className="py-2 pl-3">Fizic sau online</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Grupele dedicate 11–15 ani se formează pe măsură ce se strâng 4–8 înscrieri. Îți poți rezerva
      locul mai jos — te anunțăm imediat ce
      pornește grupa, iar până atunci poți începe cu{" "}
      <Link to="/meditatii-araba">meditații 1:1</Link>.
    </p>

    <h2>Prețuri</h2>
    <ul>
      <li><strong>Grup:</strong> de la 500 lei/lună (2 lecții de 90 min/săptămână), cu 10% reducere la plata integrală a nivelului.</li>
      <li><strong>Meditații 1:1:</strong> 150 lei/lecție de 60 min, cu −10% de la 10 lecții și −20% de la 20.</li>
      <li><strong>Lecție de probă (30 min):</strong> gratuită, cu părintele prezent dacă dorește.</li>
    </ul>

    <h2>Ce vorbește adolescentul după primele 4 săptămâni</h2>
    <p>
      Patru săptămâni înseamnă opt lecții. Nu e o promisiune de fluență — e ce acoperă efectiv
      primele opt lecții din programa A1, în ordinea în care le predăm:
    </p>
    <ul>
      <li>Sunetele care nu există în română (ح، ع، ط، غ، ق) și sistemul <Link to="/arabizi">arabizi</Link>, ca să poată scrie de pe telefon din prima săptămână.</li>
      <li><Link to="/blog/cum-saluti-in-libaneza">Salutări și formule de politețe</Link> — <em>mar7aba</em>, <em>kifak</em>, <em>yalla bye</em> — folosite corect, nu doar recunoscute.</li>
      <li>Prezentarea personală: nume, vârstă, de unde e, ce face.</li>
      <li>Familia, naționalitățile și țările, profesiile.</li>
      <li>Posesivele (<em>-i</em>, <em>-ak</em>, <em>-ek</em>) — diferența dintre „casa mea” și „casa ta”.</li>
    </ul>
    <p>
      Concret: după o lună poate purta o conversație scurtă de prezentare cu o rudă din Liban, în
      dialect, fără să fi învățat alfabetul arab. Programa completă A1 are 32 de lecții — vezi{" "}
      <Link to="/cursuri/grup/a1">tot ce acoperă nivelul A1</Link>.
    </p>

    <h2>Pentru părinți</h2>
    <p>
      Întrebările pe care le primim cel mai des, cu răspunsuri scurte:
    </p>
    <ul>
      <li><strong>Cât durează și când?</strong> Două ședințe de 90 de minute pe săptămână. Zilele și orele exacte ale grupei active sunt pe <Link to="/cursuri/grup">pagina cursului de grup</Link> — le ținem acolo ca să fie mereu la zi.</li>
      <li><strong>Cât de mare e grupa?</strong> Între 4 și 10 cursanți, ca fiecare să apuce să vorbească în fiecare lecție.</li>
      <li><strong>Unde?</strong> Fizic la Raduga Creative Center, Strada Icoanei 80, sector 2, sau online pe Zoom. Formatul se alege la înscriere.</li>
      <li><strong>Ce temă are acasă?</strong> Scurtă și audio — ascultare și repetare, nu liste de memorat. Progresul se vede în conversație, la lecția următoare.</li>
      <li><strong>Trebuie să știe alfabetul arab?</strong> Nu. Se începe oral; alfabetul vine mai târziu, după ce există vocabular vorbit.</li>
      <li><strong>Cum verific dacă i se potrivește?</strong> Cu <Link to="/trial">lecția de probă gratuită de 30 de minute</Link>, înainte de orice plată. Dacă nu i se potrivește, nu urmează nimic.</li>
    </ul>

    <h2>Profesor nativ, în București sau online</h2>
    <p>
      Ibra este vorbitor nativ de arabă libaneză, cu peste 5 ani de experiență în predare, și predă
      în română, engleză, franceză sau arabă — alegi limba în care adolescentul se simte confortabil.
      Lecțiile fizice au loc la Raduga Creative Center (Strada Icoanei 80, sector 2), iar cele online
      pe Zoom. Vezi și <Link to="/cursuri-araba-bucuresti">cursurile de arabă în București</Link> sau{" "}
      <Link to="/cel-mai-bun-curs-de-araba">cum alegi cel mai bun curs de arabă</Link>.
    </p>
    <h2 id="lista-asteptare">Anunță-mă când pornește grupa</h2>
    <p>
      Grupele dedicate adolescenților (11–17 ani) sunt în formare: pornim o cohortă imediat ce avem
      suficienți înscriși. Lasă-ți datele și te anunțăm primul, fără nicio obligație. Între timp,
      poți începe oricând cu <Link to="/meditatii-araba">meditații de arabă 1:1</Link>.
    </p>
    <NotifyMeForm context="Grupă adolescenți 11–17" className="not-prose my-6" />
  </LandingLayout>
);

export default CursuriArabaAdolescenti;
