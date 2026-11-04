import { Link } from "@/components/LocalizedLink";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";
import DialectSiblings from "@/components/seo/DialectSiblings";

/**
 * Palestinian Arabic, seen from Beirut.
 *
 * The Syrian page already carries the four-way comparison; this one takes the
 * southern pair on its own, because „familia mea e din Ramallah” and „familia
 * mea e din Damasc” sunt două întrebări diferite cu care vine un cursant.
 * Tabelul păstrează criteriile și ordinea din celelalte pagini, ca setul să se
 * citească ca un singur instrument, nu ca șase pagini scrise de șase mâini.
 */
const FAQ = [
  {
    q: "Araba libaneză e la fel cu cea palestiniană?",
    a: "Nu identică, dar din aceeași familie: ambele sunt levantine (shami). Gramatica e practic aceeași, iar vocabularul se suprapune în mare parte. Ce se schimbă e pronunția lui ق, sufixul -sh la negație, câteva cuvinte de zi cu zi și intonația.",
  },
  {
    q: "Dacă învăț libaneza, vorbesc cu un palestinian?",
    a: "Da. Un vorbitor de libaneză poartă conversații normale la Ramallah, Ierusalim sau Nablus. Ajustările sunt mici: sufixul -sh la negație, „hāla” în loc de „halla2” pentru „acum” și câteva zeci de cuvinte locale.",
  },
  {
    q: "Palestiniana e o singură vorbire?",
    a: "Nu. Vorbirea urbană din Ierusalim, Ramallah sau Nablus e cea mai apropiată de libaneză. Cea rurală păstrează un k pronunțat mai tare și schimbă câteva vocale, iar Gaza are trăsături proprii. Vorbirea din Israel și teritorii are, în plus, mai multe împrumuturi din ebraică.",
  },
  {
    q: "Ce cuvinte se schimbă cel mai des între libaneză și palestiniană?",
    a: "„Vreau”: baddi în libaneză, biddi în palestiniană. „Acum”: halla2 față de hāla. „Acesta”: hāda față de hādhīri. „Foarte”: ktīr față de kthīr. „Bine, ok”: ṭayyib sau zyēn față de tamām.",
  },
  {
    q: "Merită să învăț palestiniana în loc de libaneza?",
    a: "Doar dacă ai o legătură directă cu Palestina. Libaneza acoperă și ea conversația, are cele mai multe materiale de studiu și cei mai mulți profesori, iar în România comunitatea arabă e în bună parte libaneză și siriană. Diferențele se corectează din mers, în câteva lecții.",
  },
];

const LibanezaVsPalestiniana = () => (
  <LandingLayout
    slug="dialecte-arabe/libaneza-vs-palestiniana"
    title="Libaneza și palestiniana, față în față"
    metaTitle="Araba Libaneză vs Palestiniană: Ce Schimbă Accentul"
    description="Libaneză sau palestiniană? Pronunție, negație cu -sh, cuvinte de zi cu zi și cât de ușor treci de la una la alta. Ghid de la un profesor nativ libanez."
    crumb="Libaneză vs. palestiniană"
    parents={DIALECT_PARENTS}
    lead="Două dialecte levantine despărțite de o frontieră, nu de o distanță. Gramatica e comună; se schimbă câteva sunete, un sufix și un pumn de cuvinte."
    enHref="/en/arabic-dialects-guide/lebanese-vs-palestinian-arabic"
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      Libaneza și palestiniana sunt <strong>două variante ale levantinei</strong>{" "}
      (shami): libaneza aparține grupului de nord, palestiniana celui de sud.
      Același prefix <em>b-</em> pentru prezent, același <em>baddi / biddi</em>{" "}
      pentru „vreau”, aceleași pronume, aceeași construcție a negației.
      Diferența audibilă stă în trei lucruri: palestiniana adaugă des sufixul{" "}
      <em>-sh</em> la negație (<em>ma baʿrafsh</em>), nu închide vocala ā spre ē
      (deci <em>kān</em>, nu <em>kēn</em>) și are un alt strat de cuvinte
      împrumutate — turcă, engleză și, în Israel și teritorii, ebraică, în loc
      de franceză.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Libaneza comparată cu araba palestiniană"
      columns={["Criteriu", "Libaneză", "Palestiniană"]}
      rows={[
        [
          "Grup",
          "Levantină de nord (libaneză, siriană).",
          "Levantină de sud (palestiniană, iordaniană).",
        ],
        [
          "Litera ق",
          "Oprire glotală: ʾalb („inimă”).",
          "Oprire glotală în orașe; k tare în sate; k mai moale, spre č, în sudul zonei și în Gaza.",
        ],
        [
          "Vocala ā",
          "Se închide spre ē (imāla): kēn.",
          "Rămâne deschisă: kān.",
        ],
        [
          "Negația",
          "De obicei doar ma: ma baʿrif.",
          "Adaugă des sufixul -sh: ma baʿrafsh.",
        ],
        ["„Vreau”", "baddi", "biddi"],
        ["„Acum”", "halla2", "hāla"],
        ["„Acesta”", "hāda", "hādhīri"],
        ["„Foarte”", "ktīr", "kthīr"],
        ["„Bine, ok”", "ṭayyib, zyēn", "tamām"],
        ["„De unde?”", "mnēn?", "min wēn?"],
        [
          "Împrumuturi",
          "Multă franceză, plus engleză.",
          "Turcă și engleză; ebraică în vorbirea de zi cu zi din Israel și teritorii.",
        ],
        [
          "Intonație",
          "Urcătoare, cântată, recunoscută imediat.",
          "Mai plată decât libaneza.",
        ],
        [
          "Înțelegere reciprocă",
          "—",
          "Foarte bună; câteva cuvinte de ajustat.",
        ],
      ]}
    />

    <h2>Aceeași propoziție, în ambele</h2>
    <p>
      <em>„Acum vreau să știu de unde ești.”</em>
    </p>
    <ul>
      <li>
        <strong>Libaneză:</strong> <em>halla2 baddi aʿref mnēn inta</em>
      </li>
      <li>
        <strong>Palestiniană:</strong> <em>hāla biddi aʿref min wēn inta</em>
      </li>
    </ul>
    <p>
      <em>„Nu știu ce vrea.”</em>
    </p>
    <ul>
      <li>
        <strong>Libaneză:</strong> <em>ma baʿrif shu baddo</em>
      </li>
      <li>
        <strong>Palestiniană:</strong> <em>ma baʿrafsh shu biddo</em>
      </li>
    </ul>
    <p>
      Două cuvinte se schimbă, restul rămâne. E distanța dintre engleza
      britanică și cea americană, nu dintre română și italiană.
    </p>

    <h2>Palestiniana nu e o singură vorbire</h2>
    <p>
      Vorbirea urbană — Ierusalim, Ramallah, Nablus, Haifa — e cea mai
      apropiată de libaneză și de siriana din Damasc: aceeași oprire glotală
      pentru ق, aceeași intonație. În vorbirea de sat, qaf-ul revine la un{" "}
      <em>k</em> tare, iar în partea de sud a zonei și în Gaza un <em>k</em>
      iese mai moale, spre <em>č</em> („ch”). La toate se adaugă stratul
      local de împrumuturi: turcă din secolele otomane, engleză din mandat și
      din școală, ebraică din contactul de zi cu zi. Pentru un cursant, consecința
      e simplă: înveți o bază levantină și ajustezi vocabularul după zona
      familiei.
    </p>

    <h2>Unde se estompează granițele</h2>
    <p>
      Sudul Libanului împarte trăsături cu nordul Palestinei: aceeași
      intonație mai puțin cântată, câteva cuvinte comune. Granița dintre
      țări nu e o linie lingvistică — dialectele se amestecă pe fiecare
      parte a ei. Harta zonelor levantine, cu sursele ei, e în{" "}
      <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.
    </p>

    <h2>Ce înseamnă practic pentru tine</h2>
    <ul>
      <li>
        <strong>Ai familie sau un partener palestinian</strong> → un curs de
        libaneză îți e util direct; cele câteva cuvinte locale le corectezi
        din mers, iar pronunția se ajustează la{" "}
        <Link to="/meditatii-araba">meditațiile 1:1</Link>.
      </li>
      <li>
        <strong>Înveți fără o legătură regională</strong> → libaneza rămâne
        alegerea cu cele mai multe materiale și cu cel mai mare acces la
        profesori nativi.
      </li>
      <li>
        <strong>Vrei să auzi diferența</strong> → compară pe loc{" "}
        <Link to="/dialecte-arabe/libaneza-vs-siriana">
          libaneza cu siriana
        </Link>{" "}
        și <Link to="/dialecte-arabe/libaneza-vs-iordaniana">
          libaneza cu iordaniana
        </Link>
        .
      </li>
    </ul>

    <h2>Primul pas</h2>
    <p>
      Scrii totul în <Link to="/arabizi">arabizi</Link>, ca să vorbești din
      prima lecție, iei materialele din{" "}
      <Link to="/resurse">pagina de resurse</Link> și încerci o{" "}
      <Link to="/trial">lecție de probă gratuită (0 lei)</Link> cu profesor nativ.
    </p>
    <DialectSiblings current="/dialecte-arabe/libaneza-vs-palestiniana" />
  </LandingLayout>
);

export default LibanezaVsPalestiniana;
