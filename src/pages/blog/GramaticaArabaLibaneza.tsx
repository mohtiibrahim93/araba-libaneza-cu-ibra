import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "Ce face prefixul „b-” la verbe?", en: "What does the \"b-\" prefix do to verbs?" },
    a: { ro: "Marchează prezentul obișnuit, acțiunea pe care o faci în mod normal. Fără el, verbul exprimă mai degrabă intenție sau subjonctiv — este una dintre cele mai vizibile diferențe față de araba standard.", en: "It marks the ordinary present — what you normally do. Without it the verb expresses intention or subjunctive instead, and it is one of the most visible differences from Modern Standard Arabic." },
  },
  {
    q: { ro: "Araba libaneză are cazuri gramaticale?", en: "Does Lebanese Arabic have grammatical cases?" },
    a: { ro: "Nu. Terminațiile de caz din araba standard au dispărut din vorbire, ceea ce face dialectul sensibil mai simplu de învățat decât forma scrisă pe care o predau manualele.", en: "No. The case endings of Modern Standard Arabic have disappeared from speech, which makes the dialect appreciably simpler to learn than the written form textbooks teach." },
  },
  {
    q: { ro: "Cum se atașează pronumele la cuvinte?", en: "How do pronouns attach to words?" },
    a: { ro: "Se lipesc la sfârșitul cuvântului ca sufixe — la substantive marchează posesia, la verbe marchează complementul. Sunt aceleași terminații în ambele cazuri, deci le înveți o singură dată.", en: "They stick to the end of the word as suffixes — on nouns they mark possession, on verbs they mark the object. The endings are the same in both cases, so you learn them once." },
  },
];

const GramaticaArabaLibaneza = () => {
  const { lang } = useI18n();
  const en = lang === "en";

  return (
    <BlogArticleLayout
      slug="gramatica-arabei-libaneze"
      title={{
        ro: "Gramatica arabă libaneză: 5 întrebări frecvente",
        en: "Lebanese Arabic grammar: top 5 questions (b-, pronouns, word order)",
      }}
      description={{
        ro: "Învață simplu gramatica arabă libaneză: prefixul b-, pronumele, trecutul și ordinea cuvintelor, cu exemple clare și comparații cu MSA.",
        en: "A clear guide to the top 5 grammar questions in Lebanese Arabic: the بـ prefix, past-tense verbs with attached pronouns, personal and possessive pronouns, word order, and the key differences from MSA.",
      }}
      published="2026-07-24"
      readingMinutes={9}
      faq={FAQ}
      crumb={{
        ro: "Gramatica arabei libaneze",
        en: "Lebanese Arabic grammar",
      }}
      lead={{
        ro: "Cinci întrebări de gramatică pe care le pun cei mai mulți începători în araba libaneză — cu răspunsuri scurte, exemple și comparații cu Araba Standard Modernă (MSA).",
        en: "Five grammar questions almost every Lebanese Arabic beginner asks — with short answers, examples, and clear comparisons to Modern Standard Arabic (MSA).",
      }}
      cta={{
        title: {
          ro: "Vrei să exersezi cu un profesor nativ?",
          en: "Want to practise this with a native teacher?",
        },
        text: {
          ro: "Rezervă o lecție de probă gratuită de 30 de minute — online sau în București.",
          en: "Book a free 30-minute trial lesson — online or in Bucharest.",
        },
        href: "/trial",
        label: {
          ro: "Rezervă lecția de probă gratuită",
          en: "Book the free trial lesson",
        },
      }}
    >
      <Tldr
        points={[
          { ro: "Prefixul „b-” marchează prezentul obișnuit — una dintre marile diferențe față de MSA.", en: "The \"b-\" prefix marks the ordinary present — one of the big differences from MSA." },
          { ro: "Libaneza nu are cazuri gramaticale, deci e mai simplă decât araba standard.", en: "Lebanese has no grammatical cases, so it is simpler than Modern Standard Arabic." },
          { ro: "Pronumele se atașează ca sufixe, cu aceleași terminații la posesie și la complement.", en: "Pronouns attach as suffixes, with the same endings for possession and for objects." },
          { ro: "Ordinea cuvintelor e flexibilă, dar varianta neutră e subiect–verb–complement.", en: "Word order is flexible, but the neutral option is subject–verb–object." },
        ]}
      />
      <aside className="rounded-lg border border-border bg-muted/40 p-5 [&_a]:no-underline">
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide mt-0">
          {en ? "In this guide" : "În acest ghid"}
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/80">
          <li><a href="#b-prefix" className="hover:text-primary">{en ? "The بـ (b-) prefix on verbs" : "Prefixul بـ (b-) la verbe"}</a></li>
          <li><a href="#past-pronouns" className="hover:text-primary">{en ? "Past-tense verbs + attached pronouns" : "Verbele la trecut + pronume atașate"}</a></li>
          <li><a href="#pronouns" className="hover:text-primary">{en ? "Personal & possessive pronouns" : "Pronume personale și posesive"}</a></li>
          <li><a href="#word-order" className="hover:text-primary">{en ? "Word order: SVO vs VSO" : "Ordinea cuvintelor: SVO vs VSO"}</a></li>
          <li><a href="#vs-msa" className="hover:text-primary">{en ? "Lebanese grammar vs MSA" : "Gramatica libaneză vs MSA"}</a></li>
        </ol>
      </aside>

      <section id="b-prefix" className="scroll-mt-24 space-y-4">
        <h2>{en ? "1. What does the بـ (b-) prefix do?" : "1. Ce face prefixul بـ (b-)?"}</h2>
        <p>
          {en
            ? "The بـ prefix marks the habitual or ongoing present tense — the closest equivalent to English \"I do / I eat / I go\". It's the single most common source of beginner confusion."
            : "Prefixul بـ marchează prezentul obișnuit sau general — cel mai apropiat echivalent al lui „fac / mănânc / merg” din română. Este cea mai frecventă sursă de confuzie la începători."}
        </p>
        <ul>
          <li><strong>bektob</strong> — {en ? "I write (in general, I'm a writer)" : "scriu (în general, sunt scriitor)"}</li>
          <li><strong>bshoof</strong> — {en ? "I see / I'm seeing" : "văd"}</li>
          <li><strong>byekol</strong> — {en ? "he eats / he's eating" : "el mănâncă"}</li>
          <li><strong>mnrooh</strong> — {en ? "we go" : "mergem"}</li>
        </ul>
        <p>
          {en
            ? "Drop the بـ when the verb comes after a modal (want, can, must) — it becomes the plain subjunctive:"
            : "Renunți la بـ atunci când verbul vine după un modal (vreau, pot, trebuie) — devine subjonctivul simplu:"}
        </p>
        <ul>
          <li><strong>baddi ektob</strong> — {en ? "I want to write (no b-)" : "vreau să scriu (fără b-)"}</li>
          <li><strong>fiyyi rooh</strong> — {en ? "I can go (no b-)" : "pot să merg (fără b-)"}</li>
          <li><strong>lazem nrooh</strong> — {en ? "we must go (no b-)" : "trebuie să mergem (fără b-)"}</li>
        </ul>
        <p>
          <strong>{en ? "Quick rule:" : "Regulă rapidă:"}</strong>{" "}
          {en
            ? "real / habitual action → use بـ. After a modal or another verb → drop the بـ."
            : "acțiune reală / obișnuită → cu بـ. După un modal sau alt verb → fără بـ."}
        </p>
      </section>

      <section id="past-pronouns" className="scroll-mt-24 space-y-4">
        <h2>{en ? "2. Past-tense verbs with attached pronouns" : "2. Verbele la trecut cu pronume atașate"}</h2>
        <p>
          {en
            ? "In Lebanese Arabic you conjugate the verb in the past, then stick the object pronoun directly onto the end. Using katab (\"he wrote\") as the base:"
            : "În libaneză conjugi verbul la trecut, apoi lipești pronumele obiect direct la sfârșit. Luând ca bază katab („a scris”):"}
        </p>
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden my-4">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Form" : "Forma"}</th>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Meaning" : "Traducere"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="p-3"><strong>katabt</strong></td><td className="p-3 text-muted-foreground">{en ? "I wrote" : "am scris"}</td></tr>
            <tr><td className="p-3"><strong>katabt-o</strong></td><td className="p-3 text-muted-foreground">{en ? "I wrote it (masc.)" : "am scris-l (masc.)"}</td></tr>
            <tr><td className="p-3"><strong>katabt-a</strong></td><td className="p-3 text-muted-foreground">{en ? "I wrote it (fem.)" : "am scris-o (fem.)"}</td></tr>
            <tr><td className="p-3"><strong>katab-lak</strong></td><td className="p-3 text-muted-foreground">{en ? "he wrote to you (m.)" : "ți-a scris (ție, m.)"}</td></tr>
            <tr><td className="p-3"><strong>katab-lek</strong></td><td className="p-3 text-muted-foreground">{en ? "he wrote to you (f.)" : "ți-a scris (ție, f.)"}</td></tr>
            <tr><td className="p-3"><strong>katabna-hon</strong></td><td className="p-3 text-muted-foreground">{en ? "we wrote to them" : "le-am scris (lor)"}</td></tr>
          </tbody>
        </table>
        <p>
          {en
            ? "Two families of suffixes to memorise: the direct-object set (-o, -a, -hon, -ak, -ek…) and the beneficiary set (-lak, -lek, -lo, -la, -lna, -lkon, -lhon), which mean \"to / for someone\"."
            : "Două seturi de sufixe de memorat: cel de obiect direct (-o, -a, -hon, -ak, -ek…) și cel de beneficiar (-lak, -lek, -lo, -la, -lna, -lkon, -lhon), care înseamnă „către / pentru cineva”."}
        </p>
      </section>

      <section id="pronouns" className="scroll-mt-24 space-y-4">
        <h2>{en ? "3. Personal and possessive pronouns" : "3. Pronume personale și posesive"}</h2>
        <p>
          {en
            ? "There are two sets you'll use in almost every sentence — the standalone personal pronouns, and the possessive suffixes that attach to nouns."
            : "Vei folosi două seturi în aproape orice propoziție — pronumele personale independente și sufixele posesive care se atașează substantivelor."}
        </p>
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden my-4">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Person" : "Persoana"}</th>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Personal" : "Personal"}</th>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Possessive" : "Posesiv"}</th>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Example (bayt = house)" : "Exemplu (bayt = casă)"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="p-3">{en ? "I" : "eu"}</td><td className="p-3">ana</td><td className="p-3">-i</td><td className="p-3 text-muted-foreground">bayt-i</td></tr>
            <tr><td className="p-3">{en ? "you (m.)" : "tu (m.)"}</td><td className="p-3">inta</td><td className="p-3">-ak</td><td className="p-3 text-muted-foreground">bayt-ak</td></tr>
            <tr><td className="p-3">{en ? "you (f.)" : "tu (f.)"}</td><td className="p-3">inti</td><td className="p-3">-ek</td><td className="p-3 text-muted-foreground">bayt-ek</td></tr>
            <tr><td className="p-3">{en ? "he" : "el"}</td><td className="p-3">huwwe</td><td className="p-3">-o</td><td className="p-3 text-muted-foreground">bayt-o</td></tr>
            <tr><td className="p-3">{en ? "she" : "ea"}</td><td className="p-3">hiyye</td><td className="p-3">-(h)a</td><td className="p-3 text-muted-foreground">bayt-a</td></tr>
            <tr><td className="p-3">{en ? "we" : "noi"}</td><td className="p-3">nihna</td><td className="p-3">-na</td><td className="p-3 text-muted-foreground">bayt-na</td></tr>
            <tr><td className="p-3">{en ? "you (pl.)" : "voi"}</td><td className="p-3">intu</td><td className="p-3">-kon</td><td className="p-3 text-muted-foreground">bayt-kon</td></tr>
            <tr><td className="p-3">{en ? "they" : "ei/ele"}</td><td className="p-3">hinne</td><td className="p-3">-hon</td><td className="p-3 text-muted-foreground">bayt-hon</td></tr>
          </tbody>
        </table>
        <p>
          {en
            ? "The same possessive suffixes double as object pronouns on verbs (see section 2), so learning them once unlocks a huge chunk of the grammar."
            : "Aceleași sufixe posesive funcționează și ca pronume obiect pe verbe (vezi secțiunea 2), așa că, învățându-le o dată, deschizi o bună parte din gramatică."}
        </p>
      </section>

      <section id="word-order" className="scroll-mt-24 space-y-4">
        <h2>{en ? "4. Word order: is Lebanese SVO or VSO?" : "4. Ordinea cuvintelor: libaneza este SVO sau VSO?"}</h2>
        <p>
          {en
            ? "In everyday speech, Lebanese Arabic is overwhelmingly SVO (subject-verb-object) — just like English or Romanian. Classical / MSA Arabic prefers VSO (verb first), but Lebanese speakers almost never talk that way."
            : "În vorbire, araba libaneză este covârșitor SVO (subiect-verb-obiect) — ca engleza sau româna. Araba clasică / MSA preferă VSO (verbul întâi), dar libanezii aproape niciodată nu vorbesc așa."}
        </p>
        <ul>
          <li><strong>{en ? "Lebanese (SVO):" : "Libaneză (SVO):"}</strong> Ahmad byekol tuffaha — {en ? "Ahmad eats an apple." : "Ahmad mănâncă un măr."}</li>
          <li><strong>{en ? "MSA (VSO):" : "MSA (VSO):"}</strong> Ya'kul Ahmad tuffaha — {en ? "\"Eats Ahmad an apple.\"" : "„Mănâncă Ahmad un măr.”"}</li>
        </ul>
        <p>
          {en
            ? "This one difference is a big reason Lebanese feels much more intuitive to European learners than MSA."
            : "Această diferență este unul dintre motivele pentru care libaneza li se pare mult mai naturală europenilor decât MSA."}
        </p>
      </section>

      <section id="vs-msa" className="scroll-mt-24 space-y-4">
      <InlineCta
        title={{ ro: "Aici se închide gramatica", en: "This is where the grammar closes" }}
        text={{
          ro: "Structurile de mai sus — condițional, pasiv, vorbire indirectă — se predau integral la nivelul B1, în grupă mică.",
          en: "The structures above — conditional, passive, reported speech — are taught in full at B1, in a small group.",
        }}
        href="/cursuri/grup/b1"
        label={{ ro: "Vezi nivelul B1", en: "See level B1" }}
      />

        <h2>{en ? "5. How is Lebanese grammar different from MSA?" : "5. Prin ce diferă gramatica libaneză de MSA?"}</h2>
        <p>
          {en
            ? "Lebanese Arabic keeps the same roots and most of the vocabulary of MSA, but drops the heavy grammar layer. Here's what's actually different:"
            : "Araba libaneză păstrează aceleași rădăcini și cea mai mare parte a vocabularului MSA, dar renunță la stratul greu de gramatică. Iată ce diferă concret:"}
        </p>
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden my-4">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Feature" : "Caracteristică"}</th>
              <th className="text-left p-3 font-semibold text-foreground">MSA</th>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Lebanese" : "Libaneză"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="p-3">{en ? "Case endings" : "Terminații de caz"}</td><td className="p-3 text-muted-foreground">{en ? "Full system (-u, -a, -i)" : "Sistem complet (-u, -a, -i)"}</td><td className="p-3 text-muted-foreground">{en ? "None" : "Nu există"}</td></tr>
            <tr><td className="p-3">{en ? "Dual number" : "Numărul dual"}</td><td className="p-3 text-muted-foreground">{en ? "Separate dual form" : "Formă duală separată"}</td><td className="p-3 text-muted-foreground">{en ? "Uses plural" : "Se folosește pluralul"}</td></tr>
            <tr><td className="p-3">{en ? "Feminine plural verb" : "Feminin plural la verbe"}</td><td className="p-3 text-muted-foreground">{en ? "Separate conjugation" : "Conjugare separată"}</td><td className="p-3 text-muted-foreground">{en ? "Merged into hinne" : "Contopit în hinne"}</td></tr>
            <tr><td className="p-3">{en ? "Present tense" : "Prezent"}</td><td className="p-3 text-muted-foreground">aktub</td><td className="p-3 text-muted-foreground">bektob (b- prefix)</td></tr>
            <tr><td className="p-3">{en ? "Future tense" : "Viitor"}</td><td className="p-3 text-muted-foreground">sa-aktub / sawfa</td><td className="p-3 text-muted-foreground">rah ektob / ha-ektob</td></tr>
            <tr><td className="p-3">{en ? "Negation" : "Negație"}</td><td className="p-3 text-muted-foreground">la / lam / lan / laysa</td><td className="p-3 text-muted-foreground">ma (+ suffix -sh in some regions)</td></tr>
            <tr><td className="p-3">{en ? "Word order" : "Ordinea cuvintelor"}</td><td className="p-3 text-muted-foreground">VSO</td><td className="p-3 text-muted-foreground">SVO</td></tr>
          </tbody>
        </table>
        <p>
          {en ? "For a deeper comparison see " : "Pentru o comparație mai amplă vezi "}
          <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">{en ? "Lebanese Arabic vs MSA vs Egyptian" : "Araba libaneză vs MSA vs egipteană"}</Link>
          {en ? " or the RO article " : " sau articolul "}
          <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "Lebanese vs Standard Arabic" : "Araba libaneză vs araba standard"}</Link>.
        </p>
        <p>
          {en
            ? "None of this is taught as a table to memorise. The verb system, the conditional and reported speech are worked through in conversation across "
            : "Nimic din toate astea nu se predă ca tabel de memorat. Sistemul verbal, condiționalul și vorbirea indirectă se lucrează prin conversație, de-a lungul "}
          <Link to="/cursuri-limba-araba">{en ? "the A1–C2 levels" : "nivelurilor A1–C2"}</Link>
          {en ? "." : "."}
        </p>
      </section>
    </BlogArticleLayout>
  );
};

export default GramaticaArabaLibaneza;