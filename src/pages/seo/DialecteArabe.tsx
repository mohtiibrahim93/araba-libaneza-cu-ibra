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
    q: "Care e diferența dintre levantina de nord și cea de sud?",
    a: "Levantina de nord înseamnă libaneză și siriană; cea de sud, palestiniană și iordaniană. Gramatica și cea mai mare parte a vocabularului sunt comune. Diferă pronunția (litera ق, culoarea vocalelor, intonația) și câteva cuvinte de zi cu zi — cam cât diferă engleza britanică de cea americană.",
  },
  {
    q: "Araba libaneză e la fel cu cea siriană?",
    a: "Nu identică, dar foarte apropiată. Libaneza și siriana din Damasc se înțeleg reciproc fără efort. Nordul Libanului (Tripoli) sună deja parțial sirian, iar zonele de graniță se amestecă în ambele direcții.",
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
    metaTitle="Dialectele Arabe — Hartă & Ghid: Levantin, Egiptean, Golf, Maghreb | 2026"
    description="Ghid și hartă a dialectelor arabe: levantin (nord vs. sud — libanez, sirian, palestinian, iordanian), egiptean, maghrebin, din Golf și irakian, plus araba standard. Cine pe cine înțelege și ce dialect merită învățat."
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

    {/* IMAGE SLOT 1 — arabic-dialects-map.
        Verificat de pe pagina fișierului: „Arabic Dialects" de Rafy, 21 dec.
        2011, CC BY 3.0 Neadaptată, derivat din File:Arab World-Large.PNG. Doar
        atribuire — fără distribuire în condiții identice, deci nu impune nimic
        restului paginii. Pagina listează și o variantă alternativă, „Arabic
        Varieties Map 2023"; fișierul acesta NU e marcat ca înlocuit, deci
        oricare merge. Verifică varianta 2023 doar dacă vrei limite mai noi în
        Peninsula Arabică.

        FOLOSEȘTE SVG-UL, NU O CAPTURĂ DE ECRAN. Fișierul de pe Commons e un SVG
        vectorial cu textul legendei încorporat — deci coloana de culori fără
        text din copia trimisă e o problemă de randare a fontului, nu harta
        reală. Descarcă SVG-ul (sau una dintre variantele PNG generate de
        Commons, care includ textul). O captură făcută într-un vizualizator
        fără fontul potrivit ajunge pe site cu o legendă imposibil de citit.

        Descrierea de mai jos decodează oricum culorile geografic, ceea ce
        merită păstrat și cu o legendă lizibilă — e ce primesc motoarele de
        căutare și cititoarele de ecran.

        Pune src/assets/arabic-dialects-map.svg (sau .png), apoi adaugă aceste două importuri în capul fișierului:
          import CreditedFigure from "@/components/content/CreditedFigure";
          import map1 from "@/assets/arabic-dialects-map.svg";
        și înlocuiește tot acest comentariu cu:

        <CreditedFigure
          src={map1}
          className="w-full"
          alt="Harta familiilor de dialecte arabe din Africa de Nord și Orientul Mijlociu"
          caption="Familiile de dialecte arabe. Albastrurile din vest sunt maghrebine; albastrul deschis peste Egipt e egipteana; maroul de sub el, sudaneza; verdele-oliv din nord-est, mesopotamiana; nuanțele de zmeuriu din peninsulă sunt dialectele din Golf, najdi și hijazi, iar rozul de pe coasta sudică — yemenita și omaneza. Fâșia verde îngustă de pe coasta estică a Mediteranei e levantina."
          credit={{
            title: "Arabic Dialects",
            author: "Rafy",
            sourceHref: "https://commons.wikimedia.org/wiki/File:Arabic_Dialects.svg",
            licence: "CC BY 3.0",
            licenceHref: "https://creativecommons.org/licenses/by/3.0/",
          }}
        />
    */}

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
      larg și nu sună regional-închis. Detalii pe zone în secțiunea de mai jos despre harta
      dialectelor levantine.
    </p>

    <h2>Harta dialectelor levantine (shami)</h2>
    <p>
      Levantina e vorbită nativ de circa 30–35 de milioane de oameni în Liban, Siria, Iordania și
      Palestina. Se împarte în două grupuri apropiate:
    </p>

    {/* IMAGE SLOT 2 — levantine-dialects-map.
        ALEGE ÎNTÂI FIȘIERUL POTRIVIT — sunt trei variante și nu sunt aceeași hartă:

          1. LevantineArabic.svg — varianta cu șase categorii (nord-estică,
             nusayrieh, centrală / palestiniană, sud-estică, sudică exterioară).
             E cea pe care ai arătat-o și se potrivește cel mai bine acestei
             pagini: e singura care pune Beirutul și Damascul în aceeași zonă
             centrală, exact ideea din textul de mai sus. Licența ei nu apare
             în ce avem; citește-o de pe pagina fișierului. (E părintele unei
             lucrări derivate CC BY-SA 4.0, deci aproape sigur tot CC BY-SA,
             dar confirmă versiunea.)

          2. Levantine Arabic 2022.svg — doar două categorii (nord / sud).
             Verificată complet: Tom Fish + A455bcd9, CC BY-SA 4.0. Pagina ei
             o marchează ÎNLOCUITĂ și recomandă fișierul din 2023.

          3. Levantine Arabic 2023.svg — înlocuitorul recomandat pentru #2,
             actualizat după unirea codurilor ISO [apc] și [ajp]. Tot două
             categorii. Licența nu apare în ce avem.

        Creditul de mai jos e completat pentru #2, singurul pentru care avem o
        fișă completă și verificată. Dacă folosești #1 sau #3, înlocuiește
        title, author, sourceHref și licence cu cele de pe pagina acelui fișier,
        iar pentru #3 simplifică și textul alt la două categorii.

        Pune src/assets/levantine-dialects-map.png, apoi adaugă aceste două importuri în capul fișierului:
          import CreditedFigure from "@/components/content/CreditedFigure";
          import map2 from "@/assets/levantine-dialects-map.png";
        și înlocuiește tot acest comentariu cu:

        <CreditedFigure
          src={map2}
          className="w-full max-w-md"
          alt="Harta dialectelor levantine: levantina de nord (nord-estică, nusayrieh, centrală) și levantina de sud (palestiniană, sud-estică, sudică exterioară)"
          caption="Zona dialectelor levantine (shami). Beirut și Damasc cad în aceeași zonă centrală — de aceea cele două sună atât de apropiat. Limitele dialectale după Brustad & Zuniga (2019) și Ethnologue (2022)."
          credit={{
            title: "Levantine Arabic 2022",
            author: "Tom Fish (geo.fish), derivative work by A455bcd9",
            sourceHref: "https://commons.wikimedia.org/wiki/File:Levantine_Arabic_2022.svg",
            licence: "CC BY-SA 4.0",
            licenceHref: "https://creativecommons.org/licenses/by-sa/4.0/",
          }}
        />
    */}

    <ul>
      <li><strong>Levantina de nord</strong> — Liban și Siria (Beirut, Tripoli, Damasc, Alep, Homs, Latakia). Gramatică aproape identică, înțelegere reciprocă ~95%.</li>
      <li><strong>Levantina de sud</strong> — Palestina și Iordania (Ierusalim, Ramallah, Gaza, Amman, Irbid). Aceeași familie, mici diferențe de vocabular și câteva sunete.</li>
      <li><strong>Margini</strong> — Hatay în sudul Turciei, valea Bekaa spre deșertul sirian și comunitățile mari din diaspora: Brazilia, Franța, SUA, Germania și Golf.</li>
    </ul>

    <h3>Levantina de nord: libaneză și siriană</h3>
    <p>
      Libaneza și siriana din Damasc sunt atât de apropiate încât vorbitorii nici nu observă că
      trec de la una la alta. Semnul cel mai audibil e <strong>ق</strong>: și la Beirut, și la
      Damasc se pronunță ca oprire glotală, deci <em>qalb</em> („inimă”) devine <em>2alb</em>.
      Libaneza înclină spre vocale mai deschise, mai „ridicate” (<em>imēle</em>) — <em>kēn</em> la
      Beirut față de <em>kān</em> la Damasc. Tot libaneza are cel mai gros strat de franceză și
      engleză dintre toate dialectele arabe: <em>bonjour</em>, <em>merci</em> și{" "}
      <em>yalla bye</em> intră natural în vorbirea de zi cu zi — unul dintre motivele pentru care
      li se pare accesibilă europenilor.
    </p>

    <h3>Levantina de sud: palestiniană și iordaniană</h3>
    <p>
      Gramatica e practic aceeași ca în nord — același prefix verbal <em>b-</em>, aceleași
      pronume, același tipar de negație. Se schimbă pronunția și o felie de vocabular. Iordaniana
      rurală și beduină păstrează adesea un <em>g</em> dur pentru ق (<em>galb</em>), în timp ce
      vorbirea urbană din Ierusalim și Amman folosește aceeași oprire glotală ca Beirutul. Forme ca{" "}
      <em>bidd-</em> („a vrea”) și <em>halla2</em> („acum”) sunt comune întregii familii.
    </p>

    <h3>Nord vs. sud — diferențele practice</h3>
    <ul>
      <li><strong>ق:</strong> oprire glotală în orașe peste tot; <em>g</em> dur în iordaniana beduină și rurală.</li>
      <li><strong>Vocale:</strong> mai deschise, mai „ușoare” în libaneză; mai plate în palestiniană și iordaniană.</li>
      <li><strong>Împrumuturi:</strong> franceză și engleză în Liban; mai multă engleză în Iordania și Palestina.</li>
      <li><strong>Intonație:</strong> libaneza are o urcare cântată, recunoscută instantaneu.</li>
      <li><strong>În rest:</strong> gramatica, structura frazei și peste 90% din vocabular sunt comune.</li>
    </ul>
    <p>
      Zonele de graniță estompează și mai mult limitele: Tripoli sună parțial sirian, sudul
      Libanului împarte trăsături cu Palestina, și tot așa de-a lungul fiecărei granițe din
      regiune. Practic, cine învață bine o variantă levantină urmărește conversații în toate cele
      patru țări — distanța e mult mai mică decât cea dintre levantină și egipteană sau fusha.
    </p>

    <h2>Unde stă araba libaneză</h2>
    <p>
      Libaneza stă în centrul familiei: geografic între Siria și Palestina, cultural cel mai mare
      exportator de media din regiune. Fairuz, Nancy Ajram, filmul și serialele libaneze circulă
      în toată lumea arabă, așa că vorbirea libaneză e înțeleasă mult dincolo de Levant — cea mai
      largă acoperire pasivă pentru cel mai mic efort. Detalii în{" "}
      <Link to="/blog/limbile-vorbite-in-liban">limbile vorbite în Liban</Link>, iar dacă vrei să
      o înveți, vezi <Link to="/cursuri-araba">cursurile de arabă (libaneză)</Link>.
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
