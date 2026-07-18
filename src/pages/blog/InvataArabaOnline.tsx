import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

const InvataArabaOnline = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="invata-araba-libaneza-online"
      title={{ ro: "Cum înveți araba libaneză online (de oriunde)", en: "How to learn Lebanese Arabic online (from anywhere)" }}
      description={{
        ro: "Cum funcționează cursurile de arabă libaneză online: de ce ai nevoie, cum arată o lecție pe Zoom, dacă online e la fel de bun ca fizic și pentru cine e potrivit.",
        en: "How online Lebanese Arabic courses work: what you need, what a Zoom lesson looks like, whether online is as good as in person and who it's for.",
      }}
      published="2026-07-17"
      readingMinutes={6}
      crumb={{ ro: "Învață online", en: "Learn online" }}
      lead={{
        ro: "Cu profesor nativ, de oriunde din lume — cum arată o lecție online, ce îți trebuie și de ce funcționează la fel de bine ca la clasă.",
        en: "With a native teacher, from anywhere in the world — what an online lesson looks like, what you need and why it works just as well as the classroom.",
      }}
    >
      <p>
        {en
          ? "You don't have to live in Bucharest — or even in Romania — to learn Lebanese Arabic with a native teacher. Our online courses run over Zoom, with the same method and the same teacher as the in-person ones. If you're part of the Lebanese diaspora, have Lebanese family, or simply want the living dialect from wherever you are, online is made for you."
          : "Nu trebuie să locuiești în București — și nici măcar în România — ca să înveți araba libaneză cu profesor nativ. Cursurile noastre online se țin pe Zoom, cu aceeași metodă și același profesor ca cele fizice. Dacă faci parte din diaspora libaneză, ai familie libaneză sau vrei pur și simplu dialectul viu de oriunde te-ai afla, online e făcut pentru tine."}
      </p>

      <h2>{en ? "What you need" : "De ce ai nevoie"}</h2>
      <ul>
        <li>{en ? "A laptop or phone with a camera and microphone." : "Un laptop sau telefon cu cameră și microfon."}</li>
        <li>{en ? "A stable internet connection and a quiet spot." : "O conexiune stabilă la internet și un loc liniștit."}</li>
        <li>{en ? "Zoom (free) — we send you the link before each lesson." : "Zoom (gratuit) — îți trimitem linkul înainte de fiecare lecție."}</li>
        <li>{en ? "That's it. Audio materials and support are included." : "Atât. Materialele audio și suportul sunt incluse."}</li>
      </ul>

      <h2>{en ? "What an online lesson looks like" : "Cum arată o lecție online"}</h2>
      <p>
        {en
          ? "It's a live lesson, not a recording. You see and hear the teacher, you speak from the first minutes, and you get corrected on the spot — exactly the "
          : "E o lecție live, nu o înregistrare. Vezi și auzi profesorul, vorbești din primele minute și ești corectat pe loc — exact metoda "}
        <Link to="/blog/cum-inveti-araba-libaneza">Oral First</Link>
        {en
          ? " method. The teacher shares the screen for words and phrases, you practise with "
          : ". Profesorul împarte ecranul pentru cuvinte și expresii, exersezi cu "}
        <Link to="/blog/ce-este-arabizi">{en ? "Arabizi" : "arabizi"}</Link>
        {en ? " and move gradually to the Arabic script, and you leave each lesson able to say something new." : " și treci treptat la scrierea arabă, iar din fiecare lecție pleci putând spune ceva nou."}
      </p>

      <h2>{en ? "Is online as good as in person?" : "E online la fel de bun ca fizic?"}</h2>
      <p>
        {en
          ? "For a spoken dialect, yes. What matters most is speaking time with a native teacher and immediate feedback on pronunciation — and you get both fully online. Many students actually prefer it: no commute, easier scheduling, and you can review recordings of your own practice. The only thing online can't replace is the coffee afterwards."
          : "Pentru un dialect vorbit, da. Ce contează cel mai mult este timpul de vorbire cu un profesor nativ și feedbackul imediat pe pronunție — și le ai pe amândouă complet online. Mulți cursanți chiar preferă online: fără drum, program mai ușor și poți relua înregistrări din propria practică. Singurul lucru pe care online-ul nu-l poate înlocui e cafeaua de după."}
      </p>

      <h2>{en ? "Group or private, online" : "Grup sau privat, online"}</h2>
      <p>
        {en
          ? "All our levels have an online variant. You can join an online "
          : "Toate nivelurile noastre au o variantă online. Poți intra într-un "}
        <Link to="/cursuri/grup">{en ? "group course" : "curs de grup"}</Link>
        {en
          ? " — more affordable and more motivating, learning alongside peers at your level — or take "
          : " online — mai accesibil și mai motivant, înveți alături de colegi de nivelul tău — sau poți alege "}
        <Link to="/cursuri/private">{en ? "private 1:1 lessons" : "lecții private 1:1"}</Link>
        {en ? " online for a fully personalised pace and schedule." : " online, pentru ritm și program complet personalizate."}
      </p>

      <h2>{en ? "The next open online cohort" : "Următoarea cohortă online deschisă"}</h2>
      <p>
        {en
          ? "The next online group starting fresh is A1 (complete beginners) on 15 August — the perfect moment to start from zero with others at the same level. Not a total beginner? You can still join online at a higher level or through private lessons."
          : "Următoarea grupă online care pornește de la zero este A1 (începători compleți) pe 15 august — momentul perfect ca să începi de la zero alături de alții de același nivel. Nu ești începător complet? Poți intra online la un nivel mai avansat sau prin lecții private."}
      </p>
      <p>
        {en ? "Not sure where you'd start? Take the " : "Nu știi de unde ai porni? Fă "}
        <Link to="/quiz">{en ? "free level test" : "testul de nivel gratuit"}</Link>
        {en ? " (2 minutes), or see " : " (2 minute), sau vezi "}
        <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">{en ? "how long each level takes" : "cât durează fiecare nivel"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default InvataArabaOnline;
