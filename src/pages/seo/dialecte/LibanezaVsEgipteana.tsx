import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";

const FAQ = [
  {
    q: "Care e diferența dintre araba libaneză și cea egipteană?",
    a: "Sunt două dialecte vorbite ale aceleiași limbi, apropiate ca gramatică, diferite la ureche. Egipteana pronunță ج ca un „g” dur (gamal), libaneza ca un „j” moale (jamal). Verbele de zi cu zi diferă: „vreau” e ʿāyiz în egipteană și baddi în libaneză. Negația egipteană încadrează verbul (ma…-sh), cea libaneză stă de obicei doar în față (ma). Un vorbitor al uneia urmărește fără efort o conversație în cealaltă.",
  },
  {
    q: "Libaneza sau egipteana — pe care s-o învăț?",
    a: "Depinde cu cine vrei să vorbești. Dacă ai familie, prieteni sau parteneri din Liban, Siria, Iordania sau Palestina, libaneza e alegerea directă. Dacă ținta ta e Egiptul sau vrei cea mai largă înțelegere pasivă în lumea arabă, egipteana are avantajul decadelor de cinema. Niciuna nu e „mai corectă” decât cealaltă.",
  },
  {
    q: "Un libanez și un egiptean se înțeleg între ei?",
    a: "Da, aproape complet, dar asimetric. Libanezii au crescut cu filme și seriale egiptene, deci înțeleg egipteana foarte bine. Egiptenii înțeleg levantina mai ales din muzică și seriale siriano-libaneze. În practică amândoi ajustează câteva cuvinte și conversația merge.",
  },
  {
    q: "Egipteana e mai ușoară decât libaneza?",
    a: "Nu una e obiectiv mai ușoară. Ambele au renunțat la terminațiile cazuale ale arabei standard și au gramatică mai simplă decât ea. Pentru un vorbitor de română, libaneza are avantajul practic al stratului mare de franceză și engleză din vocabularul curent.",
  },
  {
    q: "Care dialect are mai mulți vorbitori?",
    a: "Egipteana, de departe: e dialectul Egiptului, cea mai populată țară arabă, cu peste o sută de milioane de locuitori. Levantina, familia din care face parte libaneza, e vorbită nativ de circa 30–35 de milioane de oameni în Liban, Siria, Iordania și Palestina.",
  },
];

const LibanezaVsEgipteana = () => (
  <LandingLayout
    slug="dialecte-arabe/libaneza-vs-egipteana"
    title="Araba libaneză vs. araba egipteană"
    metaTitle="Araba Libaneză vs Egipteană: Toate Diferențele"
    description="Libaneză sau egipteană? Comparație pe pronunție, gramatică și vocabular, cu aceeași propoziție în ambele și un răspuns clar la „pe care s-o învăț”."
    crumb="Libaneză vs. egipteană"
    parents={DIALECT_PARENTS}
    lead="Cele două dialecte arabe pe care le auzi cel mai des — unul din muzică, celălalt din filme. Iată ce le desparte și pe care merită s-o alegi."
    enHref={null}
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      Araba libaneză și araba egipteană sunt <strong>două dialecte vorbite</strong>, nu două limbi
      separate. Gramatica lor se suprapune în mare parte și amândouă sunt mult mai simple decât
      araba standard. Diferă la <strong>pronunție</strong> (ج: „g” dur în Cairo, „j” moale la
      Beirut), la <strong>verbele de bază</strong> („vreau”: <em>ʿāyiz</em> vs. <em>baddi</em>) și la{" "}
      <strong>stratul de împrumuturi</strong> (engleză și italiană în egipteană, franceză și engleză
      în libaneză). Alegi în funcție de oamenii cu care vrei să vorbești, nu în funcție de
      dificultate.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Araba libaneză comparată cu araba egipteană"
      columns={["Criteriu", "Libaneză (levantină)", "Egipteană"]}
      rows={[
        ["Unde se vorbește", "Liban, plus înțeleasă în Siria, Iordania, Palestina.", "Egipt, plus înțeleasă aproape peste tot în lumea arabă."],
        ["Litera ج", "„j” moale, ca în „jurnal”: jamal.", "„g” dur, ca în „gară”: gamal."],
        ["Litera ق", "Oprire glotală în vorbirea urbană: ʾalb pentru qalb.", "Tot oprire glotală la Cairo: ʾalb. În sudul Egiptului rămâne „g”."],
        ["„Vreau”", "baddi", "ʿāyiz / ʿāwiz"],
        ["„Acum”", "hallaʾ", "dilwaʾti"],
        ["„Ce?”", "shu", "eh"],
        ["„Ce faci?”", "kīfak", "izzayyak"],
        ["Negația", "De obicei doar ma în față: ma baʿrif.", "Încadrează verbul: ma-baʿrafsh."],
        ["Viitorul", "raḥ / ḥa- înaintea verbului.", "ḥa- lipit de verb: ḥaktib."],
        ["„Această casă”", "Determinantul stă în față: hal-bēt.", "Determinantul stă după: el-bēt da."],
        ["Împrumuturi", "Multă franceză și engleză, ceva turcă și aramaică.", "Engleză, ceva turcă și italiană."],
        ["Acoperire media", "Muzică modernă și televiziune prin satelit.", "Cinema și seriale, din anii '40 încoace."],
      ]}
    />

    <h2>Aceeași propoziție, în ambele</h2>
    <p><em>„Vreau să beau o cafea.”</em></p>
    <ul>
      <li><strong>Libaneză:</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Egipteană:</strong> <em>ʿāyiz ashrab ʾahwa</em></li>
      <li><strong>Arabă standard:</strong> <em>ʾurīdu an ashraba qahwatan</em></li>
    </ul>
    <p>
      Aceeași rădăcină pentru „a bea” (ش-ر-ب), același cuvânt pentru cafea, verbul „a vrea”
      complet diferit. Asta e, în mic, toată relația dintre cele două dialecte: scheletul e comun,
      cuvintele cele mai folosite nu.
    </p>

    <h2>Se înțeleg între ei?</h2>
    <p>
      Da, și mai bine decât se așteaptă cei din afară — dar nu simetric. Libanezii au crescut cu
      filme egiptene, deci înțeleg egipteana aproape complet. Egiptenii înțeleg levantina din
      muzică și din serialele siriano-libaneze, ceva mai puțin fluent. Când conversația se
      împotmolește, amândoi alunecă spre un registru mai neutru, apropiat de egipteană sau de
      araba standard. Harta completă a familiilor de dialecte e în{" "}
      <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.
    </p>

    <h2>Pe care s-o alegi</h2>
    <ul>
      <li><strong>Familie, partener sau prieteni din Liban, Siria, Iordania, Palestina</strong> → libaneză. Vezi <Link to="/araba-pentru-partener">arabă pentru partener</Link>.</li>
      <li><strong>Legături cu Egiptul</strong> → egipteană, fără ezitare.</li>
      <li><strong>Vrei să înțelegi cât mai mult din lumea arabă, fără o țintă anume</strong> → egipteana are cea mai largă acoperire pasivă; levantina e a doua și sună cel mai „neutru”.</li>
      <li><strong>Vrei să citești presă sau documente</strong> → niciuna: îți trebuie araba standard. Comparația e în <Link to="/blog/araba-libaneza-vs-araba-standard">libaneză vs. araba standard</Link>.</li>
    </ul>

    <h2>Ce predăm noi și de ce</h2>
    <p>
      Cursurile noastre sunt de <Link to="/cursuri-limba-araba">arabă libaneză</Link>, predate de un
      profesor nativ din Liban. Motivul e simplu: majoritatea cursanților noștri au o legătură
      concretă cu Levantul — familie, partener, colegi, călătorii. Dacă nu ești sigur unde te
      încadrezi, răspunde la câteva întrebări în{" "}
      <Link to="/quiz">chestionarul de orientare</Link> sau începe cu o{" "}
      <Link to="/trial">lecție de probă gratuită</Link>.
    </p>
  </LandingLayout>
);

export default LibanezaVsEgipteana;
