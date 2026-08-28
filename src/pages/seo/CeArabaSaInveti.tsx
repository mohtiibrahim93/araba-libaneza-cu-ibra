import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Ce arabă să învăț: standard sau dialect?",
    a: "Dacă scopul e conversația cu oameni reali, învață dialectul. Araba standard (fusha) e limba scrisă, folosită în presă și documente oficiale — nimeni nu o vorbește acasă. Pentru majoritatea celor care învață din motive personale sau de familie, dialectul e alegerea corectă.",
  },
  {
    q: "Care e diferența dintre araba libaneză și araba standard?",
    a: "Pronunție, vocabular de zi cu zi și gramatică simplificată. Libaneza renunță la terminațiile cazuale, folosește prefixul b- pentru prezent (bḥibbak — te iubesc) și pronunță ق ca o oprire glotală. Un vorbitor de fusha e înțeles, dar sună ca cineva care citește buletinul de știri într-o cafenea.",
  },
  {
    q: "Libaneza sau egipteana?",
    a: "Egipteana are cea mai mare acoperire media; libaneza e mai utilă dacă ai legături cu Libanul, Siria, Iordania sau Palestina și e considerată mai ușor de pronunțat pentru vorbitorii de română, pentru că are mai puține sunete gutural-marcate în vorbirea curentă.",
  },
  {
    q: "Dacă învăț libaneza, pot învăța ulterior araba standard?",
    a: "Da, și e mai ușor în ordinea asta: ai deja vocabularul de bază și urechea formată, iar fusha adaugă gramatica formală și scrierea. Invers e frustrant — mulți studiază ani de fusha și tot nu pot purta o conversație.",
  },
  {
    q: "Cât durează până vorbesc?",
    a: "Cu 1–2 ore pe săptămână plus 15 minute zilnic, primele conversații simple apar în 6–8 săptămâni. Nivelul A1 complet (prezentare, cumpărături, orientare, small talk) se atinge în aproximativ 3 luni.",
  },
];

const CeArabaSaInveti = () => (
  <LandingLayout
    slug="ce-araba-sa-inveti"
    title="Ce arabă să înveți? Libaneză, standard sau egipteană"
    metaTitle="Ce Arabă Să Înveți: Libaneză, Standard sau Egipteană"
    description="Compară araba libaneză, standard și egipteană. Vezi ce se vorbește în familie, la muncă sau în călătorii și alege varianta potrivită în 5 minute."
    crumb="Ce arabă să înveți"
    lead="Alegerea dialectului contează mai mult decât metoda. Iată cum decizi în funcție de motivul tău real."
    enHref="/en/lebanese-arabic-vs-msa-vs-egyptian"
    faq={FAQ}
  >
    <p>
      Majoritatea celor care abandonează araba au ales varianta greșită de la început: au studiat
      araba standard când voiau, de fapt, să vorbească cu soacra, cu prietenii sau cu partenerul.
      Alege întâi <strong>pentru cine</strong> înveți.
    </p>

    <h2>Comparația rapidă</h2>
    <ul>
      <li><strong>Arabă standard (fusha)</strong> — presă, documente, texte religioase, examene. Se scrie și se citește peste tot; nu se vorbește nicăieri ca limbă maternă.</li>
      <li><strong>Arabă libaneză (levantină)</strong> — conversație reală în Liban, Siria, Iordania, Palestina. Gramatică simplificată, vocabular de zi cu zi, mult contact cu franceza și engleza.</li>
      <li><strong>Arabă egipteană</strong> — cea mai largă acoperire în filme și muzică; utilă dacă ai legături cu Egiptul.</li>
      <li><strong>Dialecte din Golf / Maghreb</strong> — nișate geografic: utile pentru muncă în Emirate, respectiv pentru Maroc, Algeria, Tunisia.</li>
    </ul>

    <h2>Alege după motivul tău</h2>
    <ul>
      <li><strong>Partener, soț/soție sau socri libanezi</strong> → arabă libaneză, fără ezitare. Vezi <Link to="/meditatii-araba">meditațiile 1:1</Link>.</li>
      <li><strong>Prieteni sau colegi din Orientul Mijlociu</strong> → levantină; e înțeleasă în toată regiunea.</li>
      <li><strong>Călătorii în Liban, Iordania, Palestina</strong> → libaneză, plus 100 de expresii de bază din <Link to="/resurse">resursele gratuite</Link>.</li>
      <li><strong>Studii academice, traduceri, presă</strong> → arabă standard, eventual după o bază de dialect.</li>
      <li><strong>Copii dintr-o familie mixtă</strong> → dialectul vorbit acasă; vezi <Link to="/curs-araba-copii">cursul pentru copii</Link>.</li>
    </ul>

    <h2>De ce libaneza e un start bun chiar și pentru fusha</h2>
    <p>
      Dialectul îți dă rapid vocabular activ, ureche și încredere. Structurile de bază (pronume,
      posesive, verbe frecvente) se suprapun în mare parte cu fusha, deci treci mai ușor la limba
      standard mai târziu. Comparația detaliată e în{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">libaneză vs. arabă standard</Link>, iar harta
      completă a variantelor în <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.
    </p>

    <h2>Ce faci mai departe</h2>
    <p>
      Dă <Link to="/quiz">testul de nivel</Link> (2 minute), descarcă{" "}
      <Link to="/invata-araba-gratis">materialele gratuite</Link> și rezervă o{" "}
      <Link to="/trial">lecție de probă gratuită</Link> cu profesor nativ. Dacă vrei un cadru fix,
      grupele A1 pornesc periodic — detalii la <Link to="/cursuri/grup">cursurile de grup</Link>.
    </p>
  </LandingLayout>
);

export default CeArabaSaInveti;
