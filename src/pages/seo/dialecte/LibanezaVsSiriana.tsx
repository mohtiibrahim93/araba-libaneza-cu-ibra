import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";

const FAQ = [
  {
    q: "Araba libaneză e la fel cu cea siriană?",
    a: "Nu identică, dar foarte apropiată. Beirutul și Damascul stau în aceeași zonă a levantinei de nord: gramatica e practic aceeași, vocabularul se suprapune aproape complet, iar vorbitorii trec de la una la alta fără să observe. Diferă accentul, câteva cuvinte și cantitatea de franceză din vorbirea curentă.",
  },
  {
    q: "Dacă învăț libaneza, mă descurc în Siria, Iordania și Palestina?",
    a: "Da. Toate patru sunt dialecte levantine (shami). Un vorbitor de libaneză poartă conversații normale la Damasc, Amman sau Ramallah. Vei auzi alt accent și câteva cuvinte noi, nu altă limbă.",
  },
  {
    q: "Care e diferența dintre levantina de nord și cea de sud?",
    a: "Nordul înseamnă libaneză și siriană, sudul palestiniană și iordaniană. Gramatica și peste 90% din vocabular sunt comune. Diferă pronunția lui ق, culoarea vocalelor, intonația și forma negației: sudul adaugă des sufixul -sh (ma baʿrafsh), nordul de obicei nu.",
  },
  {
    q: "De ce sună libaneza atât de diferit de siriană, dacă sunt atât de apropiate?",
    a: "Din trei motive mici care se adună: imāla, adică închiderea lui ā spre ē (kēn la Beirut, kān la Damasc); intonația cântată, urcătoare, a libanezei; și stratul gros de franceză și engleză din vorbirea de zi cu zi libaneză. Structura de dedesubt rămâne aceeași.",
  },
  {
    q: "Ce variantă levantină e cel mai util de învățat în România?",
    a: "Oricare, pentru că sunt reciproc inteligibile. Comunitatea arabă din București vine în bună parte din Liban, Siria, Palestina și Irak, iar o bază levantină acoperă primele trei dintre ele. Contează mai mult să vorbești constant cu cineva decât ce variantă alegi.",
  },
];

const LibanezaVsSiriana = () => (
  <LandingLayout
    slug="dialecte-arabe/libaneza-vs-siriana"
    title="Libaneza față de restul levantinei"
    metaTitle="Araba Libaneză vs Siriană, Palestiniană, Iordaniană"
    description="Cât de diferită e libaneza de siriană, palestiniană și iordaniană? Pronunție, negație, vocabular și ce înțelegi dacă înveți una dintre ele."
    crumb="Libaneză vs. restul levantinei"
    parents={DIALECT_PARENTS}
    lead="Libaneza, siriana, palestiniana și iordaniana sunt patru accente ale aceleiași familii. Iată exact unde se despart — și de ce contează atât de puțin."
    enHref="/en/arabic-dialects-guide/lebanese-vs-syrian-arabic"
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      Cele patru sunt <strong>dialecte levantine (shami)</strong> și se înțeleg reciproc fără
      efort. Se împart în <strong>levantina de nord</strong> — libaneză și siriană — și{" "}
      <strong>levantina de sud</strong> — palestiniană și iordaniană. Gramatica e comună: același
      prefix <em>b-</em> pentru prezent, același <em>ʿam</em> pentru acțiunea în desfășurare,
      același <em>baddi</em> pentru „vreau”. Ce se schimbă e accentul, forma negației și câteva
      zeci de cuvinte de zi cu zi. Dacă înveți una, le urmărești pe toate.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Libaneza comparată cu siriana, palestiniana și iordaniana"
      columns={["Criteriu", "Libaneză", "Siriană (Damasc)", "Palestiniană / iordaniană"]}
      rows={[
        ["Grup", "Levantină de nord", "Levantină de nord", "Levantină de sud"],
        ["Litera ق", "Oprire glotală: ʾalb.", "Oprire glotală: ʾalb.", "Oprire glotală în oraș; „g” dur în vorbirea rurală și beduină: galb."],
        ["Vocala ā", "Se închide spre ē (imāla): kēn.", "Rămâne deschisă: kān.", "Rămâne deschisă: kān."],
        ["Negația", "De obicei doar ma: ma baʿrif.", "De obicei doar ma: ma baʿrif.", "Adaugă des sufixul -sh: ma baʿrafsh."],
        ["„Vreau”", "baddi", "baddi", "biddi / baddi"],
        ["Împrumuturi", "Multă franceză, plus engleză.", "Mai puțină franceză, ceva turcă.", "Mai multă engleză."],
        ["Intonație", "Urcătoare, cântată, recunoscută imediat.", "Mai plată decât libaneza.", "Mai plată, cu accent propriu în Amman și Ierusalim."],
        ["Înțelegere reciprocă", "—", "Aproape completă.", "Foarte bună; câteva cuvinte de ajustat."],
      ]}
    />

    <h2>Aceeași propoziție, în toate patru</h2>
    <p><em>„Nu știu ce vrea.”</em></p>
    <ul>
      <li><strong>Libaneză:</strong> <em>ma baʿrif shu baddo</em></li>
      <li><strong>Siriană:</strong> <em>ma baʿrif shu baddo</em></li>
      <li><strong>Palestiniană:</strong> <em>ma baʿrafsh shu biddo</em></li>
      <li><strong>Iordaniană:</strong> <em>ma baʿrafsh shu biddo</em></li>
    </ul>
    <p>
      Patru variante, aceeași frază. Diferența e un sufix și o vocală — exact distanța dintre
      engleza britanică și cea americană, nu dintre română și italiană.
    </p>

    <h2>Unde se estompează granițele</h2>
    <p>
      Zonele de contact amestecă trăsăturile în ambele direcții. Tripoli, în nordul Libanului,
      sună deja parțial sirian; sudul Libanului împarte trăsături cu Palestina; valea Bekaa se
      apropie de vorbirea din deșertul sirian. Harta detaliată a zonelor levantine, cu sursele ei,
      e în <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.
    </p>

    <h2>Ce înseamnă asta practic pentru tine</h2>
    <ul>
      <li><strong>Înveți libaneza</strong> → vorbești și la Damasc, și la Amman, și la Ramallah.</li>
      <li><strong>Ai familie siriană sau palestiniană</strong> → un curs de libaneză îți e util direct; corectezi din mers cele câteva cuvinte locale.</li>
      <li><strong>Vrei să te apropii de un accent anume</strong> → asta se rezolvă la <Link to="/meditatii-araba">meditațiile 1:1</Link>, unde profesorul ajustează pronunția pe ținta ta.</li>
      <li><strong>Te interesează cum stau levantina și celelalte familii</strong> → vezi <Link to="/dialecte-arabe/levantina-vs-golf">levantina vs. araba din Golf</Link> și <Link to="/dialecte-arabe/levantina-vs-irakiana">levantina vs. araba irakiană</Link>.</li>
    </ul>

    <h2>Primul pas</h2>
    <p>
      Scrii totul în <Link to="/arabizi">arabizi</Link>, ca să vorbești din prima lecție, iei
      materialele din <Link to="/resurse">pagina de resurse</Link> și încerci o{" "}
      <Link to="/trial">lecție de probă gratuită</Link> cu profesor nativ.
    </p>
  </LandingLayout>
);

export default LibanezaVsSiriana;
