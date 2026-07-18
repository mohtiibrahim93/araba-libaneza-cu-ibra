import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

const CatCostaCursurile = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="cat-costa-cursurile-de-araba-libaneza"
      title={{ ro: "Cât costă cursurile de arabă libaneză în 2026?", en: "How much do Lebanese Arabic courses cost in 2026?" }}
      description={{
        ro: "Prețurile cursurilor de arabă libaneză: grup lunar sau plată integrală cu reducere, lecții private, curs pentru copii și proba gratuită. Fără costuri ascunse.",
        en: "Lebanese Arabic course prices: monthly group or discounted pay-in-full, private lessons, kids course and the free trial. No hidden fees.",
      }}
      published="2026-07-16"
      readingMinutes={5}
      crumb={{ ro: "Cât costă cursurile", en: "Course prices" }}
      lead={{
        ro: "Grup sau privat, online sau fizic — iată cum se calculează prețul, ce reduceri există și de ce prima lecție e gratuită.",
        en: "Group or private, online or in person — here's how the price works, what discounts exist and why the first lesson is free.",
      }}
    >
      <p>
        {en
          ? "One of the first natural questions when you want to learn a new language is 'how much?'. At the Lebanese Arabic Center prices are transparent and depend on one thing: the format you choose. Here are all the options."
          : "Una dintre primele întrebări firești când vrei să înveți o limbă nouă este „cât costă?”. La Centrul de Arabă Libaneză prețurile sunt transparente și depind de un singur lucru: formatul pe care îl alegi. Mai jos ai toate opțiunile."}
      </p>

      <h2>{en ? "Group courses (adults, A1–C2)" : "Cursuri de grup (adulți, A1–C2)"}</h2>
      <p>
        {en
          ? "Group courses are the most affordable and motivating option — you learn alongside peers at your level, with 2 lessons a week. You can pay in two ways:"
          : "Cursurile de grup sunt cea mai accesibilă și mai motivantă opțiune — înveți alături de colegi de nivelul tău, cu 2 lecții pe săptămână. Poți plăti în două feluri:"}
      </p>
      <ul>
        <li>
          <strong>{en ? "Monthly subscription" : "Abonament lunar"}</strong>
          {en
            ? " — you pay month by month, and the subscription stops automatically when the course ends. The monthly price starts from 500 lei for A1 online and rises by level; the in-person format in Bucharest has a slightly higher rate."
            : " — plătești lună de lună, iar abonamentul se oprește automat când se termină cursul. Prețul pe lună pornește de la 500 lei pentru nivelul A1 online și crește pe niveluri; formatul fizic în București are un tarif ușor mai mare."}
        </li>
        <li>
          <strong>{en ? "Pay in full up front" : "Plată integrală în avans"}</strong>
          {en ? " — if you pay for the whole course at once, you get a " : " — dacă plătești tot cursul o dată, primești "}
          <strong>{en ? "10% discount" : "10% reducere"}</strong>{en ? " on the total." : " la total."}
        </li>
      </ul>
      <p>
        {en
          ? "Each level lasts a fixed number of months (A1 four months, A2 seven, etc.), so you know your total from the start. See the exact figures per level on the "
          : "Fiecare nivel durează un număr fix de luni (A1 patru luni, A2 șapte luni etc.), așa că știi din start cât plătești în total. Vezi cifrele exacte pe nivel în pagina de "}
        <Link to="/cursuri/grup">{en ? "group courses" : "cursuri de grup"}</Link>.
      </p>

      <h2>{en ? "Private lessons (1:1)" : "Lecții private (1:1)"}</h2>
      <p>
        {en
          ? "If you want a personalized pace or a flexible schedule, private lessons cost "
          : "Dacă vrei ritm personalizat sau un program flexibil, lecțiile private costă "}
        <strong>{en ? "150 lei / lesson" : "150 lei / lecție"}</strong>
        {en ? " (90 minutes), in any format — online or in person. Packs of " : " (90 de minute), în orice format — online sau fizic. La pachetele de "}
        <strong>{en ? "20 lessons or more get 15% off" : "20 de lecții sau mai multe primești 15% reducere"}</strong>
        {en ? ". Details on the " : ". Detalii pe pagina de "}
        <Link to="/cursuri/private">{en ? "private lessons" : "lecții private"}</Link>{en ? " page." : "."}
      </p>

      <h2>{en ? "Kids course (ages 6–10)" : "Curs pentru copii (6–10 ani)"}</h2>
      <p>
        {en
          ? "The kids course is an interactive, game-based program, in person in Bucharest (online from age 10). The price is 500 lei/month for the program's duration. See the "
          : "Cursul pentru copii este un program interactiv, bazat pe joc, fizic în București (online de la 10 ani). Prețul este 500 lei/lună pe durata programului. Vezi "}
        <Link to="/cursuri/copii">{en ? "kids course" : "cursul pentru copii"}</Link>.
      </p>

      <h2>{en ? "The trial is free" : "Proba este gratuită"}</h2>
      <p>
        {en ? "You don't have to pay anything to start. The first lesson is a " : "Nu trebuie să plătești nimic ca să începi. Prima lecție este o "}
        <Link to="/trial">{en ? "free trial" : "probă gratuită"}</Link>
        {en
          ? " of 30 minutes, with no obligation — you book it online, pick a slot and talk to the teacher. Only after you see how it is do you decide whether to enrol."
          : " de 30 de minute, fără nicio obligație — o rezervi online, îți alegi un interval și vorbești cu profesorul. Abia după ce vezi cum e, decizi dacă te înscrii."}
      </p>

      <h2>{en ? "Are there hidden costs?" : "Există costuri ascunse?"}</h2>
      <p>
        {en
          ? "No. Audio materials and support are included. Payments are made securely via Stripe, and for monthly subscriptions you can cancel anytime — if you cancel within the first 5 days of an already-paid month, you get a prorated refund. The remaining months simply aren't billed."
          : "Nu. Materialele audio și suportul sunt incluse. Plățile se fac securizat prin Stripe, iar pentru abonamentele lunare poți anula oricând — dacă anulezi în primele 5 zile ale unei luni deja plătite, primești banii înapoi proporțional. Restul lunilor pur și simplu nu se mai facturează."}
      </p>
    </BlogArticleLayout>
  );
};

export default CatCostaCursurile;
