import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

const CumAlegiProfesor = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="cum-alegi-profesor-de-araba"
      title={{ ro: "Cum alegi un profesor de arabă: întrebările esențiale", en: "How to choose an Arabic tutor: the essential questions" }}
      description={{
        ro: "Ghid pentru a alege profesorul de arabă potrivit: ce să întrebi despre experiență, metodă, preț, format și rezultate — plus semnalele de alarmă de evitat.",
        en: "A guide to choosing the right Arabic tutor: what to ask about experience, method, price, format and results — plus the red flags to avoid.",
      }}
      published="2026-07-17"
      readingMinutes={6}
      crumb={{ ro: "Cum alegi un profesor", en: "Choosing a tutor" }}
      lead={{
        ro: "Ce să întrebi înainte să te înscrii — despre experiență, metodă, preț și rezultate — ca să nu pierzi timp și bani.",
        en: "What to ask before you enrol — about experience, method, price and results — so you don't waste time or money.",
      }}
    >
      <p>
        {en
          ? "A good teacher is the difference between quitting after three lessons and speaking with confidence. Before you choose, it's worth asking a few clear questions. Here they are, grouped, with our answers to each."
          : "Un profesor bun face diferența dintre a abandona după trei lecții și a ajunge să vorbești cu încredere. Înainte să alegi, merită să pui câteva întrebări clare. Iată-le, grupate, cu răspunsurile noastre la fiecare."}
      </p>

      <h2>{en ? "About experience and language" : "Despre experiență și limbă"}</h2>
      <ul>
        <li><strong>{en ? "Are you a native speaker?" : "Ești vorbitor nativ?"}</strong> {en ? "Yes — Ibra is a native speaker of Lebanese Arabic." : "Da — Ibra este vorbitor nativ de arabă libaneză."}</li>
        <li>
          <strong>{en ? "What kind of Arabic do you teach?" : "Ce fel de arabă predai?"}</strong>{" "}
          {en ? "The Lebanese (Levantine) dialect, the living language spoken in Lebanon — not just the " : "Dialect libanez (levantin), limba vie vorbită în Liban — nu doar "}
          <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "textbook Classical Arabic" : "araba clasică din manuale"}</Link>.
        </li>
        <li>
          <strong>{en ? "What experience do you have?" : "Ce experiență ai?"}</strong>{" "}
          {en ? "Years of teaching, both in groups and 1:1, with students at all levels — see the " : "Ani de predare, atât în grup cât și 1:1, cu cursanți de toate nivelurile — vezi "}
          <Link to="/#testimonials">{en ? "real reviews" : "recenziile reale"}</Link>.
        </li>
      </ul>

      <h2>{en ? "About the method" : "Despre metodă"}</h2>
      <ul>
        <li>
          <strong>{en ? "How are lessons structured?" : "Cum sunt structurate lecțiile?"}</strong>{" "}
          {en ? "With the Oral First method — you speak from the first lessons, with " : "Prin metoda Oral First — vorbești din primele lecții, cu "}
          <Link to="/blog/ce-este-arabizi">{en ? "Arabizi" : "arabizi"}</Link>
          {en ? " at first and a gradual move to the Arabic alphabet." : " la început și trecere treptată la alfabetul arab."}
        </li>
        <li>
          <strong>{en ? "How do you adapt lessons to my level?" : "Cum adaptezi lecțiile la nivelul meu?"}</strong>{" "}
          {en ? "Small groups and constant feedback; for specific goals, " : "Grupe mici și feedback constant; pentru obiective specifice, "}
          <Link to="/cursuri/private">{en ? "1:1 private lessons" : "lecții private 1:1"}</Link>.
        </li>
        <li>
          <strong>{en ? "Do you include culture?" : "Incluzi și cultura?"}</strong>{" "}
          {en ? "Yes — the language comes with the " : "Da — limba vine împreună cu "}
          <Link to="/blog/cultura-libaneza-obiceiuri-mancare-traditii">{en ? "customs and cultural context" : "obiceiurile și contextul cultural"}</Link>.
        </li>
      </ul>

      <h2>{en ? "About logistics" : "Despre logistică"}</h2>
      <ul>
        <li><strong>{en ? "How long and how often?" : "Cât durează și cât de des?"}</strong> {en ? "90 minutes, twice a week for groups; flexible for private." : "90 de minute, de 2 ori pe săptămână la grup; flexibil la privat."}</li>
        <li><strong>{en ? "Online or in person?" : "Online sau fizic?"}</strong> {en ? "Both — in person in Bucharest or online via Zoom." : "Ambele — fizic în București sau online prin Zoom."}</li>
        <li>
          <strong>{en ? "How much, and what's the cancellation policy?" : "Cât costă și care e politica de anulare?"}</strong>{" "}
          {en ? "Transparent, no hidden fees — see the " : "Transparent, fără costuri ascunse — vezi "}
          <Link to="/blog/cat-costa-cursurile-de-araba-libaneza">{en ? "pricing details" : "detaliile de preț"}</Link>.
          {en ? " Subscriptions can be cancelled anytime, with a prorated refund in the first 5 days." : " Abonamentele se pot anula oricând, cu rambursare proporțională în primele 5 zile."}
        </li>
        <li>
          <strong>{en ? "Do you offer a trial lesson?" : "Oferi o lecție de probă?"}</strong>{" "}
          {en ? "Yes — the first lesson is " : "Da — prima lecție e "}
          <Link to="/trial">{en ? "free, with no obligation" : "gratuită, fără obligații"}</Link>.
        </li>
      </ul>

      <h2>{en ? "About fit and results" : "Despre potrivire și rezultate"}</h2>
      <ul>
        <li><strong>{en ? "Do you have student reviews?" : "Ai recenzii de la cursanți?"}</strong> {en ? "Yes, real verified reviews on Preply." : "Da, recenzii reale verificate pe Preply."}</li>
        <li>
          <strong>{en ? "Can you help with my goal?" : "Mă poți ajuta cu obiectivul meu?"}</strong>{" "}
          {en ? "Conversation, travel, family, kids — the " : "Conversație, călătorie, familie, copii — "}
          <Link to="/cursuri">{en ? "courses" : "cursurile"}</Link>{en ? " cover every goal." : " acoperă toate scopurile."}
        </li>
        <li>
          <strong>{en ? "How quickly will I see progress?" : "Cât de repede văd progres?"}</strong>{" "}
          {en ? "You speak from the first lesson; see " : "Vorbești de la prima lecție; vezi "}
          <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">{en ? "how long each level takes" : "cât durează pe fiecare nivel"}</Link>.
        </li>
      </ul>

      <h2>{en ? "Red flags to avoid" : "Semnale de alarmă de evitat"}</h2>
      <ul>
        <li>{en ? "A native speaker with no teaching experience — knowing a language isn't the same as teaching it." : "Un vorbitor nativ care nu are experiență de predare — a ști o limbă nu înseamnă a o preda."}</li>
        <li>{en ? "Generic lessons, the same for everyone, with no adaptation." : "Lecții generice, la fel pentru toată lumea, fără adaptare."}</li>
        <li>{en ? "Hidden fees or rigid scheduling, with no trial lesson." : "Costuri ascunse sau program rigid, fără lecție de probă."}</li>
      </ul>

      <p>
        {en ? "The simplest test? A " : "Cel mai simplu test? O "}
        <Link to="/trial">{en ? "free trial lesson" : "lecție de probă gratuită"}</Link>
        {en ? " — you see the method directly, ask the questions above and decide with full information." : " — vezi direct metoda, pui întrebările de mai sus și decizi în cunoștință de cauză."}
      </p>
    </BlogArticleLayout>
  );
};

export default CumAlegiProfesor;
