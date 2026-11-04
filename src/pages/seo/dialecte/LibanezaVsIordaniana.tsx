import { Link } from "@/components/LocalizedLink";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";
import DialectSiblings from "@/components/seo/DialectSiblings";

/**
 * Jordanian Arabic, seen from Beirut.
 *
 * Jordan is the Levantine variety that sits closest to the Gulf and to the
 * desert register, so the page carries three columns instead of two: urban
 * Amman and Bedouin speech really are two different answers to „cum se
 * vorbește în Iordania". Criteria and their order follow the other
 * comparison pages so the set stays one instrument.
 */
const FAQ = [
  {
    q: "Araba iordaniană e la fel cu cea libaneză?",
    a: "Nu identică, dar din aceeași familie levantină (shami). Gramatica și cea mai mare parte a vocabularului sunt comune. Diferă pronunția lui ق, sufixul -sh adăugat la negație, câteva cuvinte de zi cu zi și intonația.",
  },
  {
    q: "Dacă învăț libaneza, mă descurc în Iordania?",
    a: "Da. În Amman și în orașe, un vorbitor de libaneză e înțeles fără probleme. Ajustările sunt mici: ma baʿrafsh în loc de ma baʿrif, hēla sau hāla în loc de halla2, min wēn în loc de mnēn.",
  },
  {
    q: "Iordaniana e o singură vorbire?",
    a: "Nu. Amman-ul are două vorbiri principale: cea urbană, adusă de valurile de familii originare din Palestina, și cea de est, beduină și fellahin, care păstrează un g dur pentru ق (galb) și un k mai moale, spre č. Ambele sunt levantine, dar se aud distinct.",
  },
  {
    q: "Ce cuvinte se schimbă cel mai des între libaneză și iordaniană?",
    a: "„Vreau": baddi față de biddi. „Acum": halla2 față de hēla. „Acesta": hāda față de hādhīri. „Foarte": ktīr față de kthīr. „De unde": mnēn față de min wēn. „Ok": ṭayyib față de tamām.",
  },
  {
    q: "Iordaniana e mai aproape de libaneză sau de araba din Golf?",
    a: "De libaneză. E levantină, deci împarte gramatica și vocabularul cu Beirutul și Damascul. Araba din Golf e vecină geografic, dar are altă morfologie verbală și alt vocabular — o comparație separată are propria pagină.",
  },
];

const LibanezaVsIordaniana = () => (
  <LandingLayout
    slug="dialecte-arabe/libaneza-vs-iordaniana"
    title="Libaneza și iordaniana, față în față"
    metaTitle="Araba Libaneză vs Iordaniană: Diferențe și Asemănări"
    description="Cât de diferită e araba din Iordania de cea libaneză? Amman, accent beduin, negație cu -sh și ce înțelegi dacă înveți libaneza. Ghid practic, pe înțeles."
    crumb="Libaneză vs. iordaniană"
    parents={DIALECT_PARENTS}
    lead="Iordania e levantina de sud cu un picior în deșert: aceeași gramatică pe care o înveți la Beirut, două accente diferite în aceeași țară."
    enHref="/en/arabic-dialects-guide/lebanese-vs-jordanian-arabic"
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      Iordaniana e <strong>levantină de sud</strong>, la fel ca palestiniana,
      iar libaneza e <strong>levantină de nord</strong>. Ce înveți la un curs
      de libaneză se aude aproape la fel în Amman: același <em>b-</em> pentru
      prezent, același <em>biddi</em> pentru „vreau", aceleași pronume. Ce se
      schimbă e negația (sufixul <em>-sh</em>), pronunția lui{" "}
      <strong>ق</strong> și câteva cuvinte de zi cu zi. Iar în Iordania însăși
      ai două vorbiri: urbană, apropiată de cea palestiniană, și beduină, cu
      un <em>g</em> dur unde Beirutul are o oprire glotală.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Libaneza comparată cu araba iordaniană, urbană și beduină"
      columns={[
        "Criteriu",
        "Libaneză",
        "Iordaniană (Amman, oraș)",
        "Iordaniană (beduină, rurală)",
      ]}
      rows={[
        [
          "Grup",
          "Levantină de nord.",
          "Levantină de sud, urbană.",
          "Levantină de sud, cu trăsături beduine.",
        ],
        [
          "Litera ق",
          "Oprire glotală: ʾalb.",
          "Oprire glotală: ʾalb.",
          "g dur: galb.",
        ],
        [
          "Litera ك",
          "Rămâne k: kēn.",
          "Rămâne k: kān.",
          "Despre č („ch") în multe cuvinte.",
        ],
        [
          "Vocala ā",
          "Se închide spre ē: kēn.",
          "Rămâne deschisă: kān.",
          "Rămâne deschisă: kān.",
        ],
        [
          "Negația",
          "De obicei doar ma: ma baʿrif.",
          "Ma + -sh: ma baʿrafsh.",
          "Ma + -sh: ma baʿrafsh.",
        ],
        ["„Vreau”", "baddi", "biddi", "biddi"],
        ["„Acum”", "halla2", "hēla / hāla", "hēla"],
        ["„Acesta”", "hāda", "hādhīri", "hādhīri"],
        ["„Foarte”", "ktīr", "kthīr", "kthīr"],
        ["„De unde?”", "mnēn?", "min wēn?", "min wēn?"],
        ["„Cum ești?”", "kīfak", "kīfak", "shlōnak"],
        [
          "Împrumuturi",
          "Multă franceză, plus engleză.",
          "Engleză, turcă.",
          "Turcă; puține europene.",
        ],
        [
          "Vecinătăți",
          "Siria, Egiptul prin media.",
          "Palestina, Golf, Irak.",
          "Golf, peninsula.",
        ],
        [
          "Înțelegere reciprocă",
          "—",
          "Foarte bună.",
          "Bună; câteva cuvinte de ajustat.",
        ],
      ]}
    />

    <h2>Aceeași propoziție, în toate trei</h2>
    <p>
      <em>„Acum vreau să merg acasă.”</em>
    </p>
    <ul>
      <li>
        <strong>Libaneză:</strong> <em>halla2 baddi arūḥ ʿal bēt</em>
      </li>
      <li>
        <strong>Iordaniană (Amman):</strong>{" "}
        <em>hēla biddi arūḥ ʿal bēt</em>
      </li>
      <li>
        <strong>Iordaniană (beduină):</strong>{" "}
        <em>hēla biddi arūḥ ʿal bēt</em> — aceeași frază, altă culoare la ق
      </li>
    </ul>
    <p>
      <em>„Cât costă acest lucru?”</em>
    </p>
    <ul>
      <li>
        <strong>Libaneză:</strong> <em>bqaddēsh hāda?</em>
      </li>
      <li>
        <strong>Iordaniană:</strong> <em>kammīsh hādhīri?</em> (sau{" "}
        <em>qaddēsh</em>)
      </li>
    </ul>
    <p>
      Un sufix, o vocală, un cuvânt de preț. Restul frazei e comun.
    </p>

    <h2>De ce Amman sună a două dialecte</h2>
    <p>
      Amman a crescut din valuri de populație: familii originare din Palestina
      și din nord, aduse de 1948 și 1967, și comunități beduine și fellahin
      din est. Vorbirea urbană a moștenit accentul palestinian — qaf-oprire
      glotală, intonație mai puțin cântată decât în Liban — iar cea de est a
      păstrat <em>g</em>-ul dur și trăsături apropiate de araba din Golf.
      Același oraș, două registre. Pentru un cursant, vestea bună e că
      libaneza merge în ambele: se aud două accente, nu două limbi.
    </p>

    <h2>Ce înseamnă practic pentru tine</h2>
    <ul>
      <li>
        <strong>Ai familie în Iordania</strong> → libaneza îți dă baza;
        pronunția și cuvintele locale le ajustezi la{" "}
        <Link to="/meditatii-araba">lecțiile 1:1</Link>.
      </li>
      <li>
        <strong>Lucrezi sau călătorești între Iordania și Golf</strong> →
        levantina acoperă Iordania, iar pentru Golf ai{" "}
        <Link to="/dialecte-arabe/levantina-vs-golf">
          levantina vs. araba din Golf
        </Link>
        .
      </li>
      <li>
        <strong>Înveți fără o legătură regională</strong> → libaneza rămâne
        varianta cu cele mai multe materiale și cu cel mai mare acces la
        profesori nativi.
      </li>
    </ul>

    <h2>Primul pas</h2>
    <p>
      Scrii totul în <Link to="/arabizi">arabizi</Link>, ca să vorbești din
      prima lecție, iei materialele din{" "}
      <Link to="/resurse">pagina de resurse</Link> și încerci o{" "}
      <Link to="/trial">lecție de probă gratuită</Link> cu profesor nativ.
    </p>
    <DialectSiblings current="/dialecte-arabe/libaneza-vs-iordaniana" />
  </LandingLayout>
);

export default LibanezaVsIordaniana;
