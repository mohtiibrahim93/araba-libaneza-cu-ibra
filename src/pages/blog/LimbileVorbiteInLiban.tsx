import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

const LimbileVorbiteInLiban = () => {
  const { lang } = useI18n();
  const en = lang === "en";

  return (
    <BlogArticleLayout
      slug="limbile-vorbite-in-liban"
      title={{
        ro: "Limbile vorbite în Liban: ghid complet (arabă libaneză, MSA, franceză, engleză)",
        en: "Languages of Lebanon: complete guide (Lebanese Arabic, MSA, French, English)",
      }}
      description={{
        ro: "Ce limbă se vorbește în Liban: arabă libaneză, araba standard (MSA), franceză și engleză. Cine le folosește, de ce libaneza e cheia și ce dialect merită să înveți.",
        en: "What languages are spoken in Lebanon: Lebanese Arabic, MSA, French and English. Who uses each, why Lebanese Arabic is the key, and which dialect to learn.",
      }}
      published="2026-07-24"
      readingMinutes={7}
      crumb={{ ro: "Limbile din Liban", en: "Languages of Lebanon" }}
      lead={{
        ro: "Liban e una dintre cele mai multilingve țări din lume: aproape orice libanez jonglează zilnic între arabă libaneză, franceză și engleză, iar araba standard (MSA) apare la știri și în documente. Iată harta clară a limbilor din Liban — și de ce dialectul libanez rămâne limba conexiunii reale.",
        en: "Lebanon is one of the most multilingual countries in the world: almost every Lebanese person juggles Lebanese Arabic, French and English daily, while Modern Standard Arabic shows up in news and paperwork. Here's a clear map of Lebanon's languages — and why the Lebanese dialect stays the language of real connection.",
      }}
    >
      <h2>{en ? "1. Lebanese Arabic — the everyday language" : "1. Araba libaneză — limba de zi cu zi"}</h2>
      <p>
        {en
          ? "Lebanese Arabic (لهجة لبنانية, lahje libnēniyye) is the spoken dialect of ~5.5 million people in Lebanon plus a global diaspora of 8–14 million. It's the language of the home, the street, WhatsApp voice notes, Fairuz songs, Lebanese cinema and TV. It belongs to the Levantine Arabic family and is mutually intelligible with Syrian, Palestinian and Jordanian."
          : "Araba libaneză (لهجة لبنانية, lahje libnēniyye) e dialectul vorbit de ~5,5 milioane de oameni din Liban plus o diasporă globală de 8–14 milioane. E limba casei, a străzii, a mesajelor vocale de pe WhatsApp, a melodiilor lui Fairuz, a cinematografiei și televiziunii libaneze. Face parte din familia levantină și e reciproc inteligibilă cu siriana, palestiniana și iordaniana."}
      </p>
      <p>
        {en ? (
          <>See <Link to="/en/arabic-dialects-guide">the Arabic dialects guide</Link> for how it fits in the wider region.</>
        ) : (
          <>Vezi <Link to="/blog/araba-libaneza-vs-araba-standard">comparația libaneză vs standard</Link> pentru contextul mai larg.</>
        )}
      </p>

      <h2>{en ? "2. Modern Standard Arabic (MSA / Fusha)" : "2. Araba standard modernă (MSA / Fusha)"}</h2>
      <p>
        {en
          ? "MSA is the formal written and broadcast register of the Arab world — news bulletins, official speeches, textbooks, newspapers. Every Lebanese person learns it in school, but nobody speaks it at home or with friends. If you learn only MSA, locals will understand you, but you'll sound like a walking newspaper — and you won't understand what they say back."
          : "MSA e registrul formal scris și de radiodifuziune al lumii arabe — știri, discursuri oficiale, manuale, ziare. Orice libanez o învață la școală, dar nimeni nu o vorbește acasă sau cu prietenii. Dacă înveți doar MSA, localnicii te vor înțelege, dar vei suna ca un ziar ambulant — și nu vei înțelege ce îți răspund."}
      </p>

      <h2>{en ? "3. French — the historical second language" : "3. Franceza — a doua limbă istorică"}</h2>
      <p>
        {en
          ? "Lebanon was under French mandate from 1920 to 1943, and French remains embedded in schooling, law, banking and elite life. Around 40% of Lebanese speak French, and it's often mixed casually into Lebanese sentences ('Bonjour, kifak, ça va?' is a real greeting). Many private schools still teach mostly in French."
          : "Libanul a fost sub mandat francez între 1920 și 1943, iar franceza a rămas ancorată în școli, drept, bancă și viața elitei. Aproximativ 40% dintre libanezi vorbesc franceză și e amestecată frecvent în frazele libaneze („Bonjour, kifak, ça va?” e un salut real). Multe școli private predau încă în principal în franceză."}
      </p>

      <h2>{en ? "4. English — the rising third language" : "4. Engleza — a treia limbă în ascensiune"}</h2>
      <p>
        {en
          ? "Since the 1990s, English has overtaken French among younger generations, especially in business, tech and universities like AUB and LAU. Around 30–40% of Lebanese speak English fluently. Bilingual (English/Arabic) or trilingual (English/French/Arabic) schooling is now the norm in major cities."
          : "Din anii '90 încoace, engleza a depășit franceza în rândul generațiilor tinere, mai ales în business, tech și universități ca AUB și LAU. Aproximativ 30–40% dintre libanezi vorbesc engleză fluent. Școlarizarea bilingvă (engleză/arabă) sau trilingvă (engleză/franceză/arabă) e acum norma în orașele mari."}
      </p>

      <h2>{en ? "5. Armenian, Kurdish and other communities" : "5. Armeana, kurda și alte comunități"}</h2>
      <p>
        {en
          ? "Lebanon hosts long-established Armenian (~4% of the population, mostly in Bourj Hammoud) and Kurdish communities, plus Assyrian/Syriac and Circassian minorities. Their languages are used at home and in community institutions alongside Lebanese Arabic."
          : "Libanul găzduiește comunități armene bine stabilite (~4% din populație, mai ales în Bourj Hammoud) și kurde, plus minorități asiriene/siriace și cerkeze. Limbile lor sunt folosite acasă și în instituțiile comunitare, alături de araba libaneză."}
      </p>

      <h2>{en ? "6. So which one should you learn?" : "6. Deci pe care ar trebui să o înveți?"}</h2>
      <ul>
        <li>{en ? "Want to talk to Lebanese people, family, friends, clients — learn Lebanese Arabic (the dialect)." : "Vrei să vorbești cu libanezi, familie, prieteni, clienți — învață araba libaneză (dialectul)."}</li>
        <li>{en ? "Want to read Arabic news or classical texts — add MSA later, after A2 dialect." : "Vrei să citești presă arabă sau texte clasice — adaugă MSA mai târziu, după A2 la dialect."}</li>
        <li>{en ? "Doing business with Lebanon — English or French will get you through meetings, but Lebanese Arabic is what earns trust." : "Faci business cu Libanul — engleza sau franceza te scot din ședințe, dar araba libaneză e ce câștigă încrederea."}</li>
      </ul>

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "Lebanese vs MSA" : "Libaneză vs MSA"}</Link>{" · "}
        <Link to="/blog/cultura-libaneza-obiceiuri-mancare-traditii">{en ? "Lebanese culture" : "Cultura libaneză"}</Link>{" · "}
        <Link to="/blog/de-ce-invatam-araba-in-2026">{en ? "Why learn Arabic in 2026" : "De ce înveți arabă în 2026"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default LimbileVorbiteInLiban;