import { Link } from "@/components/LocalizedLink";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";
import DialectSiblings from "@/components/seo/DialectSiblings";

/**
 * The south–north line inside Levantine, on its own page.
 *
 * The four-way comparison (libaneza-vs-siriana) answers „cât de diferite
 * sunt cele patru". This one answers the question a learner asks before
 * that: which side of the line they are learning, and what changes when
 * they cross it. Criteria and their order follow the other comparison
 * pages so the set stays one instrument.
 */
const FAQ = [
  {
    q: "Ce e levantina de sud?",
    a: "Varianta levantinei vorbită în Palestina și Iordania. Împreună cu levantina de nord — libaneză și siriană — formează familia shami: aceeași gramatică, circa 80–90% din vocabular comun, accente diferite.",
  },
  {
    q: "Care e diferența cea mai audibilă dintre nord și sud?",
    a: "Negația. Sudul adaugă des sufixul -sh (ma baʿrafsh), nordul se oprește de obicei la ma (ma baʿrif). La ea se adaugă pronunția lui ق, culoarea vocalelor și intonația: libaneza urcă cântat, sudul stă mai plat.",
  },
  {
    q: "Dacă învăț libaneza, vorbesc în sud?",
    a: "Da. Un vorbitor de libaneză poartă conversații normale la Ramallah, Ierusalim sau Amman. Ajustezi un sufix, câteva cuvinte și accentul — nu înveți altă limbă.",
  },
  {
    q: "Unde trece linia dintre nord și sud?",
    a: "Prin zona de contact, nu pe o frontieră. Sudul Libanului împarte trăsături cu nordul Palestinei, Tripoli sună parțial sirian, iar în Amman conviețuiesc vorbirea urbană de origine palestiniană și cea beduină, cu g dur pentru ق.",
  },
  {
    q: "Pe care s-o învăț: nord sau sud?",
    a: "Nordul, dacă nu ai o legătură regională anume: libaneza are cele mai multe materiale, cei mai mulți profesori nativi și cea mai mare expunere media. Cu ea acoperi și sudul; cu sudul acoperi nordul mai greu, pentru că materialele sunt mai puține.",
  },
];

const LevantinaDeSud = () => (
  <LandingLayout
    slug="dialecte-arabe/levantina-de-sud"
    title="Levantina de sud și cea de nord"
    metaTitle="Levantina de Sud vs Nord: Cele 4 Accente Shami"
    description="Nord sau sud? Libaneză și siriană în nord, palestiniană și iordaniană în sud. Diferențele de pronunție, negație și vocabular — și pe care s-o înveți."
    crumb="Levantina de sud vs. nord"
    parents={DIALECT_PARENTS}
    lead="Familia levantină are o singură linie în interior: nordul, cu libaneza și siriana, și sudul, cu palestiniana și iordaniana. Iată ce se schimbă când treci de ea."
    enHref="/en/arabic-dialects-guide/south-levantine-arabic"
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      <strong>Levantina de nord</strong> = libaneză + siriană (Beirut, Tripoli,
      Damasc, Alep). <strong>Levantina de sud</strong> = palestiniană +
      iordaniană (Ierusalim, Ramallah, Gaza, Amman, Irbid). Gramatica e
      comună: același prefix <em>b-</em> pentru prezent, același{" "}
      <em>baddi / biddi</em> pentru „vreau", aceleași pronume. Ce se schimbă
      e un sufix de negație, pronunția lui <strong>ق</strong>, culoarea
      vocalelor și intonația.
    </p>

    <h2>Nord vs. sud, punct cu punct</h2>
    <ComparisonTable
      caption="Levantina de nord comparată cu levantina de sud"
      columns={[
        "Criteriu",
        "Nord (libaneză, siriană)",
        "Sud (palestiniană, iordaniană)",
      ]}
      rows={[
        [
          "Negația",
          "De obicei doar ma: ma baʿrif.",
          "Ma + sufixul -sh: ma baʿrafsh.",
        ],
        [
          "Litera ق",
          "Oprire glotală în orașe: ʾalb.",
          "Oprire glotală în orașe; g dur în vorbirea beduină și rurală: galb.",
        ],
        [
          "Vocala ā",
          "Se închide spre ē în libaneză: kēn.",
          "Rămâne deschisă: kān.",
        ],
        ["„Vreau”", "baddi", "biddi"],
        ["„Acum”", "halla2", "hāla / hēla"],
        ["„Acesta”", "hāda", "hādhīri"],
        ["„Foarte”", "ktīr", "kthīr"],
        ["„De unde?”", "mnēn?", "min wēn?"],
        ["„Ok, bine”", "ṭayyib, zyēn", "tamām"],
        [
          "Împrumuturi",
          "Franceză și engleză, mai ales în Liban.",
          "Turcă și engleză; ebraică în vorbirea de zi cu zi din Israel și teritorii.",
        ],
        [
          "Intonație",
          "Urcătoare, cântată, recunoscută imediat.",
          "Mai plată, cu accent propriu în Amman și Ierusalim.",
        ],
        [
          "Materiale de studiu",
          "Cele mai multe: muzică, seriale, cursuri, profesori nativi.",
          "Mai puține; se studiază de obicei prin levantina de nord.",
        ],
      ]}
    />

    <h2>Aceeași propoziție, de la ambele capete</h2>
    <p>
      <em>„Nu știu ce vrea.”</em>
    </p>
    <ul>
      <li>
        <strong>Nord (Beirut, Damasc):</strong>{" "}
        <em>ma baʿrif shu baddo</em>
      </li>
      <li>
        <strong>Sud (Ramallah, Amman):</strong>{" "}
        <em>ma baʿrafsh shu biddo</em>
      </li>
    </ul>
    <p>
      Un sufix și o vocală. E distanța dintre engleza britanică și cea
      americană, nu dintre română și italiană.
    </p>

    <h2>Unde trece linia, de fapt</h2>
    <p>
      Nu pe o frontieră. Zona de contact o estompează în ambele direcții:
      sudul Libanului împarte trăsături cu nordul Palestinei, Tripoli sună
      parțial sirian, iar în Amman conviețuiesc două registre — cel urban, de
      origine palestiniană, și cel beduin, cu <em>g</em> dur pentru ق.
      Harta zonelor levantine, cu sursele ei, e în{" "}
      <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.
    </p>

    <h2>Cele patru, pe rând</h2>
    <ul>
      <li>
        <Link to="/dialecte-arabe/libaneza-vs-siriana">
          Libaneza vs. siriana
        </Link>{" "}
        — cele două din nord, aproape identice.
      </li>
      <li>
        <Link to="/dialecte-arabe/libaneza-vs-palestiniana">
          Libaneza vs. palestiniana
        </Link>{" "}
        — nordul față de sudul urban.
      </li>
      <li>
        <Link to="/dialecte-arabe/libaneza-vs-iordaniana">
          Libaneza vs. iordaniana
        </Link>{" "}
        — sudul cu un picior în deșert: Amman și accentul beduin.
      </li>
    </ul>

    <h2>Pe care s-o înveți</h2>
    <ul>
      <li>
        <strong>Fără o legătură regională anume</strong> → nordul, adică
        libaneza: cele mai multe materiale și cel mai mare acces la profesori
        nativi, cu sudul acoperit în aceeași palmă.
      </li>
      <li>
        <strong>Familie sau partener din Palestina ori Iordania</strong> →
        tot libaneza, cu cuvintele și accentul local corectate din mers la{" "}
        <Link to="/meditatii-araba">lecțiile 1:1</Link>.
      </li>
      <li>
        <strong>Vrei sudul pentru muncă sau studii</strong> → începutul e tot
        levantina de nord; diferențele se adaugă după ce ai gramatica și
        vocabularul comun.
      </li>
    </ul>

    <h2>Primul pas</h2>
    <p>
      Scrii totul în <Link to="/arabizi">arabizi</Link>, ca să vorbești din
      prima lecție, iei materialele din{" "}
      <Link to="/resurse">pagina de resurse</Link> și încerci o{" "}
      <Link to="/trial">lecție de probă gratuită</Link> cu profesor nativ.
    </p>
    <DialectSiblings current="/dialecte-arabe/levantina-de-sud" />
  </LandingLayout>
);

export default LevantinaDeSud;
