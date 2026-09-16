import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";

const FAQ = [
  {
    q: "Care e diferența dintre araba levantină și araba maghrebină?",
    a: "Maghrebina (darija) reduce sau elimină vocalele scurte, așa că apar grupuri de consoane greu de citit pentru cineva obișnuit cu levantina: kteb, „a scris”. Are alt tipar de conjugare la persoana întâi (nekteb „scriu”, nketbu „scriem”), un strat gros de cuvinte berbere, franceze și spaniole și cuvinte de bază complet diferite. E cea mai îndepărtată familie de dialecte arabe față de levantină.",
  },
  {
    q: "Un libanez înțelege un marocan?",
    a: "De regulă nu, nu într-o conversație normală, rapidă. Înțelegerea e asimetrică: marocanii, algerienii și tunisienii înțeleg bine levantina și egipteana, pentru că au crescut cu media din Orientul Mijlociu, dar în sens invers foarte puțin ajunge. În practică se comută spre egipteană, franceză sau arabă standard.",
  },
  {
    q: "Darija e o limbă sau un dialect?",
    a: "Termenul „darija” înseamnă pur și simplu „vorbire de zi cu zi” și e folosit pentru arabele vorbite din Maroc, Algeria și Tunisia. Lingvistic sunt dialecte arabe, cu substrat berber puternic. Practic, distanța față de araba standard și față de dialectele orientale e suficient de mare încât mulți vorbitori să le trateze ca pe limbi separate.",
  },
  {
    q: "Dacă vreau să merg în Maroc, ce arabă învăț?",
    a: "Darija marocană, dacă ținta e conversația cu localnicii. Libaneza nu te ajută acolo. Merită știut și că în Maroc franceza e larg folosită în oraș, iar în zonele turistice te descurci cu ea sau cu engleza.",
  },
  {
    q: "De ce se înțeleg maghrebinii cu orientalii, dar nu invers?",
    a: "Din expunere, nu din structură. Filmele egiptene și serialele libaneze și siriene s-au difuzat decenii la rând în tot Maghrebul, deci urechea de acolo e antrenată. Producția maghrebină a circulat mult mai puțin spre est, așa că vorbitorii de levantină nu au avut de unde să se obișnuiască.",
  },
];

const LevantinaVsMaghrebina = () => (
  <LandingLayout
    slug="dialecte-arabe/levantina-vs-maghrebina"
    title="Araba levantină vs. araba maghrebină"
    metaTitle="Araba Levantină vs Araba Maghrebină (Darija)"
    description="De ce nu se înțeleg un libanez și un marocan? Vocale, conjugări, împrumuturi berbere și franceze — și ce dialect îți trebuie pentru Maroc sau Tunisia."
    crumb="Levantină vs. maghrebină"
    parents={DIALECT_PARENTS}
    lead="Cea mai mare distanță din lumea arabă: două capete ale aceleiași limbi care, vorbite repede, nu se mai întâlnesc."
    enHref={null}
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      <strong>Maghrebina (darija)</strong> acoperă Marocul, Algeria, Tunisia și Libia.{" "}
      <strong>Levantina</strong> acoperă Libanul, Siria, Iordania și Palestina. Sunt rude, dar
      îndepărtate: maghrebina scurtează vocalele până la grupuri dense de consoane, conjugă
      persoana întâi altfel și aduce un strat gros de cuvinte berbere, franceze și spaniole.
      Rezultatul e singura pereche din lumea arabă unde înțelegerea chiar se rupe — și se rupe
      într-un singur sens.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Araba levantină comparată cu araba maghrebină"
      columns={["Criteriu", "Levantină (shami)", "Maghrebină (darija)"]}
      rows={[
        ["Unde se vorbește", "Liban, Siria, Iordania, Palestina.", "Maroc, Algeria, Tunisia, Libia."],
        ["Vocalele scurte", "Se păstrează: katab, „a scris”.", "Se reduc sau dispar: kteb."],
        ["„Scriu” / „scriem”", "baktub / mnuktub", "nekteb / nketbu"],
        ["Negația", "De obicei doar ma în față.", "Încadrează verbul: ma-ktebsh."],
        ["„Acum”", "hallaʾ", "daba (Maroc)"],
        ["„Mult”", "ktīr", "bezzaf"],
        ["„Unde?”", "wēn", "fīn"],
        ["Posesia", "tabaʿ: l-bēt tabaʿi.", "dyal: d-dar dyali."],
        ["Împrumuturi", "Franceză, engleză, ceva turcă.", "Berberă, franceză, spaniolă."],
        ["Înțeleasă în restul lumii arabe", "Larg, din muzică și seriale.", "Slab, în afara Maghrebului."],
      ]}
    />

    <h2>Aceeași propoziție, în ambele</h2>
    <p><em>„Vreau să beau o cafea.”</em></p>
    <ul>
      <li><strong>Levantină (libaneză):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Maghrebină (marocană):</strong> <em>bghit nshrab qahwa</em></li>
    </ul>
    <p>
      Trei cuvinte, trei diferențe: alt verb pentru „a vrea” (<em>bghit</em>), alt prefix la
      persoana întâi (<em>n-</em> în loc de <em>a-</em>) și un ق pronunțat ca atare, nu ca oprire
      glotală. Nimic din asta nu e aleatoriu, dar toate lovesc odată.
    </p>

    <h2>De ce înțelegerea e într-un singur sens</h2>
    <p>
      Nu e o chestiune de structură, ci de expunere. Decenii de filme egiptene și de seriale
      libaneze și siriene au ajuns în toate casele din Maghreb, deci urechea de acolo e antrenată
      cu vorbirea orientală. Producția maghrebină nu a circulat la fel spre est. Rezultatul e
      exact ce se observă în practică: un marocan urmărește o conversație libaneză, un libanez se
      pierde într-una marocană.
    </p>

    <h2>Ce alegi, în funcție de scop</h2>
    <ul>
      <li><strong>Maroc, Algeria, Tunisia</strong> → darija locală. Libaneza nu te ajută acolo.</li>
      <li><strong>Liban, Siria, Iordania, Palestina</strong> → levantină. Vezi <Link to="/cursuri-limba-araba">cursurile de arabă libaneză</Link>.</li>
      <li><strong>Vrei să fii înțeles cât mai larg</strong> → levantina sau egipteana; ambele circulă în tot spațiul arab, inclusiv în Maghreb.</li>
      <li><strong>Vrei să citești în arabă</strong> → arabă standard, aceeași peste tot. Vezi <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link>.</li>
    </ul>

    <h2>Restul hărții</h2>
    <p>
      Maghrebul e extrema vestică. Pentru vecinii de est ai levantinei vezi{" "}
      <Link to="/dialecte-arabe/levantina-vs-irakiana">levantina vs. araba irakiană</Link> și{" "}
      <Link to="/dialecte-arabe/levantina-vs-golf">levantina vs. araba din Golf</Link>, iar pentru
      perechea cea mai apropiată,{" "}
      <Link to="/dialecte-arabe/libaneza-vs-egipteana">libaneza vs. egipteana</Link>.
    </p>
  </LandingLayout>
);

export default LevantinaVsMaghrebina;
