import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";

const FAQ = [
  {
    q: "Ce arabă se vorbește în Arabia Saudită?",
    a: "Nu una singură. În vest, de-a lungul Mării Roșii, se vorbește hijazi — vorbirea din Jeddah, Mecca și Medina. În centru, najdi, vorbirea din Riad și din podișul Najd. În est, pe coasta Golfului, o varietate apropiată de cea din Kuweit și Bahrain. Toate pronunță ق ca „g” dur, dar diferă între ele la alte sunete și la vocabular.",
  },
  {
    q: "Care e diferența dintre araba levantină și cea din Peninsula Arabică?",
    a: "Levantina urbană pronunță ق ca oprire glotală (ʾāl), varietățile peninsulare ca „g” dur (gāl). Levantina marchează prezentul cu prefixul b-, iar acțiunea în desfășurare cu ʿam; varietățile peninsulare folosesc de obicei verbul simplu. Vocabularul de mare frecvență diferă, începând cu „vreau”: baddi în levantină, abī sau abgha în peninsulă.",
  },
  {
    q: "Araba din Peninsula Arabică e mai aproape de araba standard?",
    a: "Unele varietăți păstrează într-adevăr sunete pe care levantina urbană le-a pierdut, iar dialectele yemenite sunt printre cele mai conservatoare din lumea arabă. Asta nu le face mai ușor de învățat: vocabularul de zi cu zi și intonația se îndepărtează de fusha la fel ca oriunde altundeva, și nicio varietate vorbită nu e araba standard.",
  },
  {
    q: "Dacă știu levantină, mă descurc în Arabia Saudită?",
    a: "Da, în general ești înțeles: levantina și egipteana circulă în toată regiunea prin muzică, seriale și comunități mari de expați. Invers e mai greu la început, mai ales cu vorbirea najdi rapidă. Pentru contexte formale sau scrise, araba standard rămâne referința comună.",
  },
  {
    q: "Hijazi și khaliji sunt același lucru?",
    a: "Nu. Khaliji e vorbirea coastei Golfului — Kuweit, Bahrain, Qatar, Emirate și estul Arabiei Saudite. Hijazi e vorbirea vestului saudit, de la Marea Roșie. Sunt vecine și înrudite, dar se disting la ureche, iar hijazi e de obicei descris ca sunând mai „neutru” pentru restul lumii arabe.",
  },
];

const LevantinaVsPeninsulara = () => (
  <LandingLayout
    slug="dialecte-arabe/levantina-vs-peninsulara"
    title="Araba levantină vs. araba din Peninsula Arabică"
    metaTitle="Araba Levantină vs Araba din Peninsula Arabică"
    description="Hijazi, najdi, yemenită: ce se vorbește în Arabia Saudită și Yemen, prin ce diferă de levantină și cât te ajută libaneza dacă ajungi acolo."
    crumb="Levantină vs. peninsulară"
    parents={DIALECT_PARENTS}
    lead="Peninsula nu vorbește un singur fel de arabă. Iată cele trei grupuri mari și ce le desparte de vorbirea din Liban și Siria."
    enHref="/en/arabic-dialects-guide/levantine-vs-peninsular-arabic"
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      Prin „arabă peninsulară” înțelegem aici varietățile din interiorul și vestul Peninsulei
      Arabice: <strong>hijazi</strong> (Jeddah, Mecca, Medina), <strong>najdi</strong> (Riad și
      podișul central) și <strong>dialectele yemenite</strong>. Coasta Golfului — Kuweit, Qatar,
      Emirate — e un grup separat, tratat în{" "}
      <Link to="/dialecte-arabe/levantina-vs-golf">levantina vs. araba din Golf</Link>. Față de
      levantină, toate trei schimbă pronunția lui ق în „g”, renunță la prefixul <em>b-</em> al
      prezentului levantin și folosesc alte cuvinte pentru cele mai frecvente verbe.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Araba levantină comparată cu varietățile din Peninsula Arabică"
      columns={["Criteriu", "Levantină (shami)", "Hijazi (vestul saudit)", "Najdi (centrul saudit)", "Yemenită"]}
      rows={[
        ["Unde se vorbește", "Liban, Siria, Iordania, Palestina.", "Jeddah, Mecca, Medina.", "Riad și podișul Najd.", "Yemen, în mai multe varietăți."],
        ["Litera ق", "Oprire glotală: ʾāl.", "„g” dur: gāl.", "„g” dur: gāl.", "Adesea păstrat ca q profund, mai ales la Sanaa."],
        ["Litera ج", "„j” moale.", "„j” ca în araba standard.", "„j” ca în araba standard.", "La Sanaa, pronunțat „g”."],
        ["Prezentul", "Prefixul b-: baʿrif.", "Verb simplu: aʿrif.", "Verb simplu: aʿrif.", "Verb simplu."],
        ["Acțiunea în desfășurare", "ʿam + verb.", "gāʿid sau verb simplu.", "gāʿid sau verb simplu.", "Variază de la o zonă la alta."],
        ["„Vreau”", "baddi", "abī / widdi", "abgha", "Variază: ashti, abghi și altele."],
        ["Caracterizare", "Melodică, larg înțeleasă din media.", "Descrisă des ca sunând neutru.", "Cu afrikate caracteristice în unele poziții.", "Printre cele mai conservatoare varietăți arabe."],
      ]}
    />

    <h2>Aceeași propoziție</h2>
    <p><em>„Vreau să beau o cafea.”</em></p>
    <ul>
      <li><strong>Levantină (libaneză):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Hijazi:</strong> <em>abī ashrab gahwa</em></li>
      <li><strong>Najdi:</strong> <em>abgha ashrab gahwa</em></li>
    </ul>

    <h2>Cine pe cine înțelege</h2>
    <p>
      Vorbitorii din peninsulă înțeleg levantina bine: muzica libaneză, serialele siriene și
      filmele egiptene se consumă peste tot în regiune, iar comunitățile de expați levantini sunt
      mari. Un vorbitor de levantină care aude prima dată najdi rapid prinde sensul general și
      pierde detaliile. Ca peste tot în lumea arabă, când conversația se împotmolește se comută
      spre un registru mai neutru, apropiat de araba standard.
    </p>

    <h2>Ce alegi, în funcție de scop</h2>
    <ul>
      <li><strong>Familie sau prieteni din Levant</strong> → levantină, adică <Link to="/cursuri-limba-araba">araba libaneză</Link>.</li>
      <li><strong>Muncă sau studii în Arabia Saudită</strong> → o bază levantină sau egipteană te ține în conversație; accentul local se prinde pe loc.</li>
      <li><strong>Context religios, texte, Coran</strong> → arabă standard. Vezi <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link>.</li>
      <li><strong>Călătorie scurtă</strong> → o sută de expresii de bază din <Link to="/resurse">resursele gratuite</Link> acoperă situațiile obișnuite.</li>
    </ul>

    <h2>Restul hărții</h2>
    <p>
      Pentru celelalte comparații:{" "}
      <Link to="/dialecte-arabe/levantina-vs-golf">levantina vs. Golf</Link>,{" "}
      <Link to="/dialecte-arabe/levantina-vs-irakiana">levantina vs. irakiană</Link>,{" "}
      <Link to="/dialecte-arabe/levantina-vs-maghrebina">levantina vs. maghrebină</Link> și{" "}
      <Link to="/dialecte-arabe/libaneza-vs-egipteana">libaneza vs. egipteana</Link>. Privirea de
      ansamblu, cu hărți, e în <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.
    </p>
  </LandingLayout>
);

export default LevantinaVsPeninsulara;
