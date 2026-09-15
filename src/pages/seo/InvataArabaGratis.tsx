import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ResourceDownloadForm from "@/components/ResourceDownloadForm";

const FAQ = [
  {
    q: "Se poate învăța araba gratis?",
    a: "Da, până la un punct. Gratuit poți acumula vocabular, expresii gata făcute, înțelegere la ascultare și noțiuni de gramatică. Ce nu obții gratis este corectarea pronunției și conversația reală — acolo ai nevoie de un vorbitor nativ care te ascultă și te corectează.",
  },
  {
    q: "Cât de departe ajungi singur, fără profesor?",
    a: "Realist, până la un A1 pasiv: recunoști saluturi, numere, cuvinte uzuale și înțelegi fraze scurte. Vorbitul fluent și pronunția sunetelor guturale (ع, ح, خ, غ) rămân blocate fără feedback, pentru că nu ai cum să știi singur că le pronunți greșit.",
  },
  {
    q: "Care e cea mai bună aplicație pentru arabă libaneză?",
    a: "Aplicațiile mari (Duolingo, Memrise, Busuu) predau arabă standard, nu dialect libanez, deci te ajută la alfabet și la vocabular general, nu la conversația de zi cu zi din Liban. Pentru dialect sunt mai utile canalele de YouTube libaneze, muzica, serialele și materialele în arabizi.",
  },
  {
    q: "De unde încep dacă nu știu nimic?",
    a: "Ia cheat-sheet-ul Arabizi ca să poți citi orice notiță, învață primele 20 de expresii, apoi urmează planul de 30 de zile (15–20 min pe zi). După prima lună, o lecție de probă gratuită îți arată exact unde ești și ce ai de corectat.",
  },
  {
    q: "Materialele voastre gratuite sunt cu adevărat gratuite?",
    a: "Da. PDF-urile se trimit pe email, fără plată și fără card. Ceri emailul doar ca să primești materialul; te poți dezabona din orice mesaj.",
  },
];

const InvataArabaGratis = () => (
  <LandingLayout
    slug="invata-araba-gratis"
    title="Învață arabă libaneză gratis: resurse, lecții și PDF-uri"
    metaTitle="Învață Arabă Libaneză Gratis: PDF-uri și Lecții"
    description="Învață arabă libaneză gratuit cu PDF-uri, 100 de expresii utile, un plan de 30 de zile și o mini-lecție de pronunție pentru începători."
    crumb="Învață araba gratis"
    lead="Tot ce poți învăța fără să plătești nimic — și, sincer, unde se oprește gratuitul. Începe cu mini-lecția de mai jos și cu PDF-urile."
    enHref={null}
    faq={FAQ}
  >
    <p>
      Nu ai nevoie de bani ca să începi araba libaneză. Ai nevoie de materiale corecte pentru
      <strong> dialect</strong>, nu pentru araba standard, și de un ritm pe care îl poți ține. Pagina
      asta strânge tot ce oferim gratuit, plus resursele externe care chiar merită timpul tău.
    </p>

    <ResourceDownloadForm
      resource="100-expresii-libaneze"
      source="/invata-araba-gratis"
      idPrefix="exp100"
      fileHref="/100-expresii-libaneze.pdf"
      title="Pachetul de start: 100 de expresii libaneze esențiale (PDF)"
      description="Salut, prezentare, restaurant, taxi, cumpărături, familie și urări — fiecare expresie în arabizi, cu traducere în română. Îl primești pe email în câteva secunde."
    />

    <h2>Mini-lecția: 10 expresii pe care le folosești azi</h2>
    <p>
      Scrise în <Link to="/arabizi">arabizi</Link>: cifra 7 e un „h” aspru din gât, cifra 3 e sunetul
      ع, iar 2 e o oprire scurtă din glotă (ca între cuvinte în „co-operare”).
    </p>
    <ul>
      <li><strong>mar7aba</strong> — bună / salut</li>
      <li><strong>kifak?</strong> (către un bărbat) / <strong>kifik?</strong> (către o femeie) — ce faci?</li>
      <li><strong>mni7, shukran</strong> — bine, mulțumesc</li>
      <li><strong>shu ismak?</strong> — cum te cheamă?</li>
      <li><strong>ana ismi…</strong> — pe mine mă cheamă…</li>
      <li><strong>eh / la2</strong> — da / nu</li>
      <li><strong>3afwan</strong> — cu plăcere / scuze</li>
      <li><strong>2addesh?</strong> — cât costă?</li>
      <li><strong>ma bifham</strong> — nu înțeleg</li>
      <li><strong>yalla, bye</strong> — hai, pa (exact așa se spune în Liban)</li>
    </ul>
    <p>
      Continuarea firească:{" "}
      <Link to="/blog/primele-20-de-expresii-libaneze">primele 20 de expresii libaneze</Link>,{" "}
      <Link to="/blog/cum-saluti-in-libaneza">cum saluți corect</Link> și{" "}
      <Link to="/blog/numere-in-araba-libaneza">numerele în libaneză</Link>.
    </p>

    <h2>Planul gratuit de 30 de zile</h2>
    <p>
      15–20 de minute pe zi, cu ce faci în fiecare zi și verificări la final de săptămână. E gândit
      să te ducă de la zero la o conversație scurtă despre tine, fără nicio literă arabă.
    </p>

    <ResourceDownloadForm
      resource="plan-30-zile"
      source="/invata-araba-gratis"
      idPrefix="plan30"
      fileHref="/plan-30-zile-araba-libaneza.pdf"
      title="Plan de învățare pentru 30 de zile (PDF)"
      description="Zi cu zi: ce asculți, ce repeți, ce notezi — 15–20 min pe zi, doar cu resurse gratuite, plus puncte de verificare săptămânale."
    />

    <h2>Ce e gratuit pe site</h2>
    <ul>
      <li><Link to="/arabizi">Ghidul Arabizi</Link> — tabelul cifrelor și cheat-sheet-ul PDF.</li>
      <li><Link to="/fara-alfabet-arab">Metoda fără alfabet arab</Link> — cum vorbești din prima lecție.</li>
      <li><Link to="/quiz">Testul de nivel</Link> — 2 minute, îți spune de unde pornești.</li>
      <li><Link to="/blog">Blogul</Link> — expresii, gramatică, numere, cultură libaneză.</li>
      <li><Link to="/trial">Lecția de probă</Link> — 30 de minute cu profesor nativ, fără plată.</li>
      <li><Link to="/resurse">Pagina de resurse</Link> — toate PDF-urile într-un singur loc.</li>
    </ul>

    <h2>Resurse externe gratuite care merită</h2>
    <ul>
      <li><strong>YouTube în libaneză</strong> (vlog-uri, interviuri de stradă din Beirut) — bun pentru ureche și expresii reale; slab la structură, nu urmezi o progresie.</li>
      <li><strong>Muzică libaneză</strong> (Fairuz pentru dicție clară, artiști contemporani pentru limbaj de zi cu zi) — bun pentru pronunție și memorare; slab la gramatică.</li>
      <li><strong>Seriale libaneze cu subtitrare</strong> — bun pentru context și ritm natural; slab pentru începători absoluți, viteza e mare.</li>
      <li><strong>Duolingo / Memrise / Busuu</strong> — bune pentru alfabet și vocabular de arabă standard; nu te învață dialectul libanez vorbit.</li>
      <li><strong>Grupuri de schimb lingvistic</strong> (Tandem, HelloTalk) — bune pentru practică scrisă în arabizi; corectarea vine inconsistent, de la necunoscuți.</li>
    </ul>

    <h2>Unde se oprește gratuitul</h2>
    <p>
      Trei lucruri nu le rezolvă niciun material gratuit: <strong>pronunția</strong> sunetelor care nu
      există în română, <strong>fluența</strong> (vorbitul sub presiune, în timp real) și{" "}
      <strong>consecvența</strong> — majoritatea abandonează în săptămâna a treia fără un cadru fix.
      De aceea, după prima lună de studiu singur, o oră pe săptămână cu un profesor nativ schimbă
      complet ritmul: vezi <Link to="/cursuri/grup">cursurile de grup</Link>,{" "}
      <Link to="/meditatii-araba">meditațiile 1:1</Link> sau{" "}
      <Link to="/cursuri-limba-araba">varianta online</Link>. Detalii despre ritm în{" "}
      <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">cât durează să înveți araba libaneză</Link>.
    </p>
  </LandingLayout>
);

export default InvataArabaGratis;
