import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

const DeCeInvatamAraba2026 = () => {
  const { lang } = useI18n();
  const en = lang === "en";

  return (
    <BlogArticleLayout
      slug="de-ce-invatam-araba-in-2026"
      title={{
        ro: "De ce merită să înveți arabă în 2026",
        en: "Why learning Arabic in 2026 matters — and why the dialect, not MSA",
      }}
      description={{
        ro: "Arabă e printre cele mai vorbite limbi din lume, cererea pentru vorbitori crește, iar în 2026 dialectele au depășit MSA la căutări online. Argumente clare pentru începători.",
        en: "Arabic is one of the world's most spoken languages, demand for speakers is rising, and in 2026 dialects have overtaken MSA in online searches. Clear reasons for beginners.",
      }}
      published="2026-07-24"
      readingMinutes={6}
      crumb={{ ro: "De ce înveți arabă în 2026", en: "Why learn Arabic in 2026" }}
      lead={{
        ro: "Arabă e a cincea limbă din lume după numărul de vorbitori — și totuși majoritatea manualelor te învață o formă pe care aproape nimeni nu o folosește în conversație. Iată de ce merită să înveți în 2026 și de ce dialectul e alegerea corectă.",
        en: "Arabic is the world's fifth most spoken language — yet most textbooks teach a form almost nobody uses in real conversation. Here's why 2026 is a strong year to start, and why the dialect is the right choice.",
      }}
    >
      <h2>{en ? "1. The numbers behind Arabic" : "1. Cifrele din spatele limbii arabe"}</h2>
      <ul>
        <li>{en ? "~420 million native speakers across 22 Arab countries." : "~420 milioane de vorbitori nativi, în 22 de țări arabe."}</li>
        <li>{en ? "5th most spoken language in the world, ahead of Portuguese and Russian." : "A 5-a limbă din lume ca număr de vorbitori, înaintea portughezei și a rusei."}</li>
        <li>{en ? "Official language in 22 countries, plus a working language of the UN, African Union and Arab League." : "Limbă oficială în 22 de țări, plus limbă de lucru la ONU, Uniunea Africană și Liga Arabă."}</li>
        <li>{en ? "The Arabic-speaking economy (GCC + Egypt + Levant) is roughly $3.5 trillion GDP combined." : "Economia lumii arabe (Golf + Egipt + Levant) însumează aproximativ 3,5 trilioane USD PIB."}</li>
      </ul>

      <h2>{en ? "2. Dialects are winning online (2026)" : "2. Dialectele câștigă online (2026)"}</h2>
      <p>
        {en
          ? "Public search data from 2025–2026 shows the trend clearly: searches for \"Levantine Arabic\" (~1,900/mo) and \"Lebanese Arabic\" (~880/mo) have grown while \"Modern Standard Arabic course\" is flat. Learners increasingly want to speak with people, not read newspapers — and they've noticed that MSA doesn't get you there."
          : "Datele publice de căutare 2025–2026 arată tendința clar: căutările pentru „Levantine Arabic” (~1.900/lună) și „Lebanese Arabic” (~880/lună) au crescut, în timp ce „curs de arabă standard” stagnează. Cursanții vor din ce în ce mai mult să vorbească cu oameni, nu să citească ziare — și au observat că MSA nu îi duce acolo."}
      </p>

      <h2>{en ? "3. AI translation didn't kill demand — it clarified it" : "3. Traducerea AI nu a ucis cererea — a clarificat-o"}</h2>
      <p>
        {en
          ? "In 2026, ChatGPT and Google Translate handle text between English and Arabic decently. What they still can't do: real-time conversation with a Lebanese grandmother, catch the joke in a Fairuz song, or make a client in Dubai actually trust you. Speaking a dialect is a relationship skill, not a translation task — that's why demand for real teachers keeps growing."
          : "În 2026, ChatGPT și Google Translate se descurcă decent cu text între engleză/română și arabă. Ce încă nu pot: o conversație în timp real cu o bunică libaneză, gluma dintr-o melodie Fairuz sau să facă un client din Dubai să aibă încredere în tine. A vorbi un dialect e o abilitate de relație, nu o sarcină de traducere — de aceea cererea pentru profesori reali crește."}
      </p>

      <h2>{en ? "4. Career and travel angle" : "4. Unghiul carieră + călătorie"}</h2>
      <ul>
        <li>{en ? "The Gulf hires foreigners with Arabic at a premium — legal, hospitality, media, aviation." : "Golful angajează străini cu arabă la un salariu superior — juridic, ospitalitate, media, aviație."}</li>
        <li>{en ? "Romania → Middle East business (Emirates flights, Dubai construction, Lebanese diaspora in Bucharest) makes even basic Arabic a differentiator." : "Business România → Orientul Mijlociu (zboruri Emirates, construcții Dubai, diaspora libaneză din București) face chiar și araba de bază un diferențiator."}</li>
        <li>{en ? "Travel: Lebanon, Jordan, Egypt, UAE, Oman — locals treat Arabic-speaking visitors very differently." : "Călătorie: Liban, Iordania, Egipt, EAU, Oman — localnicii tratează vizitatorii care vorbesc arabă complet diferit."}</li>
      </ul>

      <h2>{en ? "5. Why Lebanese specifically" : "5. De ce libanezul în mod special"}</h2>
      <p>
        {en ? (
          <>
            Lebanese Arabic is the media prestige dialect of the Levant — the language of Fairuz,
            of Lebanese cinema, of the diaspora. It's mutually intelligible with Syrian and widely
            understood in Jordan and Palestine. See{" "}
            <Link to="/en/learn-lebanese-arabic">the full Lebanese argument</Link> for details.
          </>
        ) : (
          <>
            Araba libaneză e dialectul de prestigiu media al Levantului — limba lui Fairuz, a
            cinematografiei libaneze, a diasporei. E reciproc inteligibilă cu siriana și larg
            înțeleasă în Iordania și Palestina. Vezi{" "}
            <Link to="/cursuri-araba">pagina detaliată a cursurilor</Link> pentru context.
          </>
        )}
      </p>

      <h2>{en ? "6. Realistic timelines for 2026" : "6. Estimări realiste pentru 2026"}</h2>
      <ul>
        <li>{en ? "3–6 months of 2 lessons/week → A2 (basic daily conversation)." : "3–6 luni cu 2 lecții/săpt → A2 (conversație zilnică de bază)."}</li>
        <li>{en ? "12 months → B1 (comfortable travel, opinions, past experiences)." : "12 luni → B1 (călătorii confortabile, opinii, experiențe trecute)."}</li>
        <li>{en ? "18–24 months → B2/C1 (understand movies, work in Arabic)." : "18–24 luni → B2/C1 (înțelegi filme, poți lucra în arabă)."}</li>
      </ul>

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "Lebanese vs MSA" : "Libaneză vs MSA"}</Link>{" · "}
        <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">{en ? "How long it takes" : "Cât durează"}</Link>{" · "}
        <Link to="/blog/cat-costa-cursurile-de-araba-libaneza">{en ? "Course prices in 2026" : "Prețurile cursurilor în 2026"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default DeCeInvatamAraba2026;