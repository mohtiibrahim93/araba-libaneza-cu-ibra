import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Câte dialecte arabe există?",
    a: "În mare, șase familii: levantină (libaneză, siriană, palestiniană, iordaniană), egipteană, maghrebină (Maroc, Algeria, Tunisia), din Golf (Emirate, Kuweit, Arabia Saudită), mesopotamiană (Irak) și sudaneză. Peste ele stă araba standard modernă (fusha), care e limba scrisă și oficială, nu una vorbită acasă.",
  },
  {
    q: "Arabii din țări diferite se înțeleg între ei?",
    a: "Parțial. Levantina și egipteana se înțeleg foarte bine reciproc, pentru că sunt cele mai expuse în filme, muzică și seriale. Maghrebina e cea mai greu de înțeles pentru un vorbitor din Orientul Mijlociu. În practică, arabii comută spre un registru mai neutru, apropiat de egipteană sau de fusha.",
  },
  {
    q: "Araba libaneză e un dialect sau o limbă separată?",
    a: "Lingvistic e un dialect levantin de nord, foarte apropiat de siriana din Damasc. Practic însă diferă suficient de araba standard încât cineva care a studiat doar fusha nu înțelege o conversație libaneză de zi cu zi.",
  },
  {
    q: "Dacă învăț libaneza, mă descurc în Siria, Iordania sau Palestina?",
    a: "Da. Toate patru sunt dialecte levantine (shami) și diferă mai ales prin accent și câteva cuvinte. Un vorbitor de libaneză poartă conversații normale în Damasc, Amman sau Ramallah.",
  },
  {
    q: "Ce dialect e cel mai util în România?",
    a: "Depinde de comunitate: în București majoritatea vorbitorilor arabi sunt din Liban, Siria, Palestina și Irak, deci levantina acoperă cel mai mare grup. Pentru familie, prieteni sau afaceri cu Libanul, libaneza e alegerea directă.",
  },
];

const DialecteArabe = () => (
  <LandingLayout
    slug="dialecte-arabe"
    title="Dialectele arabe: ghid pe înțelesul tuturor"
    metaTitle="Dialectele Arabe — Levantin, Egiptean, Golf, Maghreb | Ghid 2026"
    description="Ghid clar al dialectelor arabe: levantin (libanez, sirian, palestinian, iordanian), egiptean, maghrebin, din Golf și irakian, plus araba standard. Cine pe cine înțelege și ce dialect merită învățat."
    crumb="Dialectele arabe"
    lead="Araba nu e o singură limbă vorbită, ci o familie de dialecte plus o limbă standard scrisă. Iată harta, fără jargon lingvistic."
    enHref="/en/arabic-dialects-guide"
    faq={FAQ}
  >
    <p>
      Cea mai frecventă confuzie a începătorilor: crezi că înveți „araba”, dar manualele predau
      <strong> araba standard modernă (fusha)</strong> — limba din ziare, discursuri și buletine de
      știri. Acasă, la piață și pe WhatsApp, nimeni nu vorbește așa. Se vorbește dialectul.
    </p>

    <h2>Familiile de dialecte, pe scurt</h2>
    <ul>
      <li><strong>Levantin (shami)</strong> — Liban, Siria, Palestina, Iordania. Melodic, ușor de urmărit, foarte prezent în muzică. Aici intră <Link to="/invata-araba">araba libaneză</Link>.</li>
      <li><strong>Egiptean</strong> — cel mai „auzit” dialect, datorită filmelor și televiziunii. Litera ج se pronunță „g”: <em>gamiil</em> în loc de <em>jamiil</em>.</li>
      <li><strong>Din Golf (khaliji)</strong> — Emirate, Kuweit, Qatar, Arabia Saudită. Util pentru muncă în regiune.</li>
      <li><strong>Mesopotamian (irakian)</strong> — influențe turcești și persane, vocabular distinct.</li>
      <li><strong>Maghrebin (darija)</strong> — Maroc, Algeria, Tunisia. Multe împrumuturi din franceză și berberă; cel mai greu de înțeles pentru restul lumii arabe.</li>
      <li><strong>Sudanez</strong> — punte între egipteană și dialectele din Golf.</li>
    </ul>

    <h2>Cine pe cine înțelege</h2>
    <p>
      Nu e reciproc. Un libanez înțelege aproape complet un egiptean, pentru că a crescut cu filme
      egiptene; un egiptean înțelege bine levantina din seriale; ambii se pierd rapid într-o
      conversație rapidă din Casablanca. Levantina e, de fapt, cel mai „neutru” dialect: e înțeles
      larg și nu sună regional-închis. Detalii pe zone în{" "}
      <Link to="/en/levantine-arabic-dialects-map">harta dialectelor levantine</Link>.
    </p>

    <h2>Unde stă araba libaneză</h2>
    <p>
      Libaneza e levantină de nord, sora apropiată a dialectului din Damasc. Semne distinctive:
      pronunția lui ق ca oprire glotală (<em>2albi</em>, nu <em>qalbi</em>), vocale scurtate și un
      amestec natural cu franceza și engleza (<em>bonjour</em>, <em>merci</em>, <em>yalla bye</em>).
      Detalii în <Link to="/blog/limbile-vorbite-in-liban">limbile vorbite în Liban</Link>.
    </p>

    <h2>Dialect sau arabă standard?</h2>
    <p>
      Dacă vrei să <strong>vorbești</strong> cu oameni — familie, prieteni, colegi, socri — începe cu
      dialectul. Dacă vrei să <strong>citești</strong> presă, documente sau texte religioase, ai
      nevoie de fusha. Comparația completă:{" "}
      <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link> și{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">libaneză vs. araba standard</Link>.
    </p>

    <h2>Cum începi concret</h2>
    <p>
      Scrii totul în <Link to="/arabizi">arabizi</Link>, ca să vorbești din prima lecție fără
      alfabetul arab (<Link to="/fara-alfabet-arab">de ce funcționează</Link>), iei materialele
      gratuite din <Link to="/resurse">pagina de resurse</Link> și, când vrei corectare reală,
      alegi între <Link to="/cursuri/grup">cursurile de grup</Link>,{" "}
      <Link to="/meditatii-araba">meditațiile 1:1</Link> sau{" "}
      <Link to="/araba-online">varianta online</Link>. Prima lecție de probă e{" "}
      <Link to="/trial">gratuită</Link>.
    </p>
  </LandingLayout>
);

export default DialecteArabe;
