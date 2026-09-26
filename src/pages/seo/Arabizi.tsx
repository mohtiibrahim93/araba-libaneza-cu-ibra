import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import { ARABIZI_DIGITS } from "@/data/arabizi";
import ArabiziCheatSheetForm from "@/components/ArabiziCheatSheetForm";


const FAQ = [
  {
    q: "Ce înseamnă arabizi?",
    a: "Arabizi (numit și arabish sau franco-arabe) este araba scrisă cu litere latine și cifre, așa cum o scriu arabii pe telefon și pe rețelele sociale. Cifrele înlocuiesc sunetele arabe care nu au literă latină corespunzătoare.",
  },
  {
    q: "Ce înseamnă 3 în arabă?",
    a: "Cifra 3 înlocuiește litera ع (ʿayn) — un sunet gutural adânc din gât, fără echivalent în română. Exemple: 3afwan (cu plăcere), ya3ni (adică), 3anjad (serios).",
  },
  {
    q: "Ce înseamnă 7 în arabă?",
    a: "Cifra 7 înlocuiește litera ح (ḥāʾ) — un h puternic, produs din gât. Exemple: mar7aba (salut), 7abibi (dragul meu), sa7tein (poftă bună).",
  },
  {
    q: "Ce înseamnă 5 și 2 în arabă?",
    a: "5 înlocuiește خ (kh), un h aspru ca în germanul „Bach” — 5alas (destul). 2 înlocuiește hamza ء, o oprire glotală scurtă — 2ana (eu), ta2burni.",
  },
  {
    q: "De ce scriu arabii cu cifre?",
    a: "Pentru că formele cifrelor seamănă cu literele arabe corespunzătoare. Obiceiul a apărut în epoca SMS-urilor și a tastaturilor fără suport pentru alfabetul arab și a rămas, pentru că e rapid și clar pentru toți vorbitorii de dialect.",
  },
  {
    q: "Pot învăța araba libaneză doar cu arabizi, fără alfabetul arab?",
    a: "Da. La cursurile noastre predăm implicit în arabizi, ca să vorbești din prima lecție; până la B1 inclusiv cursul e doar oral, iar de la B2 poți adăuga, opțional, alfabetul arab.",
  },
];

const Arabizi = () => (
  <LandingLayout
    slug="arabizi"
    title="Arabizi: ghid complet — ce înseamnă 2, 3, 5 și 7 în arabă"
    metaTitle="Arabizi: ce înseamnă 2, 3, 5 și 7 în arabă"
    description="Învață ce înseamnă cifrele 2, 3, 5, 7 și 8 în Arabizi, cu tabel complet, exemple din mesaje și cheat-sheet PDF gratuit."
    crumb="Arabizi"
    lead="Araba scrisă cu litere latine și cifre. Aici găsești tabelul complet de decodare, exemple reale de mesaje și cheat-sheet-ul PDF gratuit."
    enHref={null}
    faq={FAQ}
  >
    <p>
      Ai văzut „mar7aba”, „kifak” sau „3anjad” într-un comentariu pe TikTok, într-un mesaj pe
      WhatsApp sau într-un titlu de melodie și te-ai întrebat ce caută cifrele acolo. Nu e o greșeală
      de tastare: e <strong>arabizi</strong> — araba scrisă cu alfabetul latin, exact așa cum o scriu
      milioane de arabi zi de zi.
    </p>

    <h2>Tabelul complet: cifrele care înlocuiesc litere arabe</h2>
    <p>
      Regula e simplă: forma cifrei seamănă cu forma literei arabe. Tot restul se citește aproape ca
      în română.
    </p>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Cifră</th>
            <th className="py-2 px-3 font-semibold">Literă</th>
            <th className="py-2 px-3 font-semibold">Sunet</th>
            <th className="py-2 pl-3 font-semibold">Exemple</th>
          </tr>
        </thead>
        <tbody>
          {ARABIZI_DIGITS.map(({ digit: n, letter, sound, note, examples }) => (
            <tr key={n} className="border-b border-border/60 align-top">
              <td className="py-2 pr-3 font-bold text-lg text-primary">{n}</td>
              <td className="py-2 px-3 font-arabic text-xl text-brand-green" dir="rtl" lang="ar">{letter}</td>
              <td className="py-2 px-3 text-foreground/80">
                {sound.ro}
                {note ? ` — ${note.ro}` : ""}
              </td>
              <td className="py-2 pl-3 text-foreground/80">{examples.ro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <ArabiziCheatSheetForm source="/arabizi" />

    <p>
      Mai vrei materiale gratuite? Ai încă două PDF-uri (100 de expresii libaneze și un plan de 30
      de zile) pe <Link to="/resurse">pagina de resurse</Link> și un ghid complet în{" "}
      <Link to="/invata-araba-gratis">învață araba libaneză gratis</Link>.
    </p>

    <h2>Cum citești un mesaj real, cuvânt cu cuvânt</h2>
    <p className="font-semibold text-foreground">
      „mar7aba 7abibi, kifak? 3anjad ktir mnih, yalla ba3dein”
    </p>
    <ul>
      <li><strong>mar7aba</strong> → mar<em>h</em>aba (ح) — salut</li>
      <li><strong>7abibi</strong> → <em>h</em>abibi — dragul meu</li>
      <li><strong>kifak?</strong> — ce faci? (către un bărbat; „kifik?” către o femeie)</li>
      <li><strong>3anjad</strong> → sunetul ع — serios, pe bune</li>
      <li><strong>ktir mnih</strong> — foarte bine</li>
      <li><strong>yalla ba3dein</strong> — hai, pe mai târziu</li>
    </ul>
    <p>
      Traducere: „Salut dragul meu, ce faci? Pe bune, foarte bine, hai pe mai târziu.” Mai multe
      formule găsești în{" "}
      <Link to="/blog/primele-20-de-expresii-libaneze">primele 20 de expresii libaneze</Link> și în{" "}
      <Link to="/blog/cum-saluti-in-libaneza">cum saluți în libaneză</Link>.
    </p>

    <h2>De ce scriu arabii cu cifre</h2>
    <p>
      Alfabetul arab are sunete care pur și simplu nu există în alfabetul latin: ع, ح, خ, غ, ق. Când
      au apărut SMS-urile și primele tastaturi de telefon, nimeni nu avea litere arabe la îndemână, așa
      că vorbitorii au improvizat: au luat cifrele a căror <em>formă</em> seamănă cu litera arabă. „7”
      arată ca ح, „3” ca ع întors. Obiceiul a rămas și după ce tastaturile arabe au devenit standard,
      pentru că e rapid, se scrie cu o singură tastatură și e citit imediat de toți vorbitorii de
      dialect — libanezi, sirieni, palestinieni, iordanieni.
    </p>
    <p>
      Important: arabizi se folosește pentru <strong>dialectele vorbite</strong> (libaneză,
      levantină), nu pentru araba standard scrisă. Diferența e explicată în{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">araba libaneză vs araba standard</Link>.
    </p>

    <h2>Cum scrii arabă pe telefon</h2>
    <ul>
      <li>
        <strong>Cel mai simplu: scrii în arabizi.</strong> Nu ai nevoie de nicio setare — folosești
        tastatura obișnuită și cifrele din tabel. Așa comunică majoritatea libanezilor între ei.
      </li>
      <li>
        <strong>Tastatură arabă:</strong> pe iPhone, Setări → General → Tastatură → Adaugă tastatură
        → Arabă. Pe Android, Setări → Sistem → Limbi și introducere → Tastatură virtuală. Utilă
        când ajungi la scrierea cu alfabet.
      </li>
      <li>
        <strong>Transliterare:</strong> aplicații ca Yamli convertesc textul latin în litere arabe,
        dar redau araba standard, nu felul în care se scrie efectiv dialectul.
      </li>
    </ul>

    <h2>Se poate învăța libaneza doar cu arabizi?</h2>
    <p>
      Da — și e cea mai rapidă cale spre conversație. Alfabetul arab este motivul principal pentru
      care oamenii se apucă de arabă și renunță în prima lună. Noi predăm implicit în arabizi, iar
      alfabetul arab e opțional, de la nivelul B2. Detalii despre metodă:{" "}
      <Link to="/fara-alfabet-arab">nu ai nevoie de alfabetul arab ca să începi să vorbești</Link>.
      Iar dacă vrei totuși alfabetul, îl explicăm pas cu pas în{" "}
      <Link to="/blog/alfabetul-arab-pentru-incepatori">ghidul alfabetului arab</Link>.
    </p>
    <p>
      Varianta scurtă a acestui ghid, cu accent pe cultură și utilizare, e în articolul{" "}
      <Link to="/blog/ce-este-arabizi">ce este arabizi</Link>. Când vrei să treci de la citit la
      vorbit, ai <Link to="/cursuri-limba-araba">cursurile de arabă libaneză</Link> (grup, private,
      online).
    </p>
  </LandingLayout>
);

export default Arabizi;
