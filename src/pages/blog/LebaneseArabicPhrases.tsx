import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import ResourceDownloadForm from "@/components/ResourceDownloadForm";
import { useI18n } from "@/lib/i18n";

type Row = { arabizi: string; arabic: string; en: string; ro: string };

const GROUPS: { titleEn: string; titleRo: string; rows: Row[] }[] = [
  {
    titleEn: "Greetings & politeness",
    titleRo: "Salut și politețe",
    rows: [
      { arabizi: "marhaba", arabic: "مرحبا", en: "hi", ro: "bună" },
      { arabizi: "ahla w sahla", arabic: "أهلا وسهلا", en: "welcome", ro: "bine ai venit" },
      { arabizi: "kifak / kifik", arabic: "كيفك", en: "how are you (m/f)", ro: "ce faci (m/f)" },
      { arabizi: "mniih, hamdillah", arabic: "منيح، الحمد لله", en: "fine, thank God", ro: "bine, slavă Domnului" },
      { arabizi: "shukran", arabic: "شكرا", en: "thank you", ro: "mulțumesc" },
      { arabizi: "3afwan", arabic: "عفوا", en: "you're welcome", ro: "cu plăcere" },
      { arabizi: "law samaht / samahti", arabic: "لو سمحت", en: "please (m/f)", ro: "te rog (m/f)" },
      { arabizi: "3an iznak", arabic: "عن إذنك", en: "excuse me", ro: "scuză-mă" },
      { arabizi: "yalla bye", arabic: "يلا باي", en: "bye", ro: "pa" },
    ],
  },
  {
    titleEn: "Introducing yourself",
    titleRo: "Prezentare",
    rows: [
      { arabizi: "ismi ...", arabic: "اسمي ...", en: "my name is ...", ro: "numele meu este ..." },
      { arabizi: "ana min ...", arabic: "أنا من ...", en: "I'm from ...", ro: "sunt din ..." },
      { arabizi: "ana 3aayesh bi Bucharest", arabic: "أنا عايش ببوخارست", en: "I live in Bucharest", ro: "locuiesc în București" },
      { arabizi: "b7ib el 3arabe", arabic: "بحب العربي", en: "I like Arabic", ro: "îmi place araba" },
      { arabizi: "3am et3allam 3arabe", arabic: "عم أتعلم عربي", en: "I'm learning Arabic", ro: "învăț arabă" },
    ],
  },
  {
    titleEn: "Café, restaurant, taxi",
    titleRo: "Cafenea, restaurant, taxi",
    rows: [
      { arabizi: "baddi ahwe, law samaht", arabic: "بدي قهوة، لو سمحت", en: "I'd like a coffee, please", ro: "vreau o cafea, te rog" },
      { arabizi: "bikam hayda?", arabic: "بكم هيدا؟", en: "how much is this?", ro: "cât costă asta?" },
      { arabizi: "el 7saab, law samaht", arabic: "الحساب، لو سمحت", en: "the bill, please", ro: "nota, te rog" },
      { arabizi: "lawein ...?", arabic: "لوين ...؟", en: "where to ...?", ro: "către ...?" },
      { arabizi: "3al yamin / 3al shmeel", arabic: "عاليمين / عالشمال", en: "on the right / on the left", ro: "la dreapta / la stânga" },
      { arabizi: "dughri", arabic: "دغري", en: "straight ahead", ro: "drept înainte" },
      { arabizi: "hon", arabic: "هون", en: "here", ro: "aici" },
    ],
  },
  {
    titleEn: "Small talk & feelings",
    titleRo: "Smalltalk și sentimente",
    rows: [
      { arabizi: "shu 3am ta3mel?", arabic: "شو عم تعمل؟", en: "what are you doing?", ro: "ce faci?" },
      { arabizi: "wein raye7?", arabic: "وين رايح؟", en: "where are you going?", ro: "unde te duci?" },
      { arabizi: "mabsoot", arabic: "مبسوط", en: "happy", ro: "fericit" },
      { arabizi: "ta3ban", arabic: "تعبان", en: "tired", ro: "obosit" },
      { arabizi: "jou3an", arabic: "جوعان", en: "hungry", ro: "flămând" },
      { arabizi: "ma fi mushkile", arabic: "ما في مشكلة", en: "no problem", ro: "nicio problemă" },
      { arabizi: "akid", arabic: "أكيد", en: "sure / definitely", ro: "sigur" },
      { arabizi: "wallaw", arabic: "ولّاو", en: "come on / no way", ro: "haide / imposibil" },
    ],
  },
  {
    titleEn: "Time & basic questions",
    titleRo: "Timp și întrebări de bază",
    rows: [
      { arabizi: "eymta?", arabic: "إيمتى؟", en: "when?", ro: "când?" },
      { arabizi: "lyoum", arabic: "اليوم", en: "today", ro: "azi" },
      { arabizi: "bukra", arabic: "بكرا", en: "tomorrow", ro: "mâine" },
      { arabizi: "mbeere7", arabic: "مبارح", en: "yesterday", ro: "ieri" },
      { arabizi: "3ala keef", arabic: "على كيف", en: "at your ease", ro: "cum vrei" },
      { arabizi: "shu badak?", arabic: "شو بدك؟", en: "what do you want?", ro: "ce vrei?" },
    ],
  },
];

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "Cum se pronunță „3” și „7” din expresii?", en: "How are the \"3\" and \"7\" in these phrases pronounced?" },
    a: { ro: "Sunt sunete din gât fără echivalent în română: „3” este ع, un sunet apăsat din fundul gâtului, iar „7” este ح, o expirație puternică. Se prind prin imitație, nu prin descriere.", en: "They are throat sounds with no English equivalent: \"3\" is ع, a tightened sound from deep in the throat, and \"7\" is ح, a strong breathy h. They are learned by imitation, not description." },
  },
  {
    q: { ro: "Sunt expresiile astea folosite și în Siria sau Iordania?", en: "Are these phrases used in Syria or Jordan too?" },
    a: { ro: "Majoritatea, da. Toate patru țările vorbesc dialecte levantine, iar expresiile uzuale se suprapun în bună măsură; diferă mai ales accentul și câteva cuvinte.", en: "Most of them, yes. All four countries speak Levantine dialects and everyday expressions overlap considerably; what differs is mainly the accent and a handful of words." },
  },
  {
    q: { ro: "Câte expresii îmi trebuie ca să încep o conversație?", en: "How many phrases do I need to start a conversation?" },
    a: { ro: "Mai puține decât pare. Salutul, prezentarea, câteva întrebări simple și formulele de politețe acoperă majoritatea schimburilor scurte — restul se construiește peste ele.", en: "Fewer than it seems. Greetings, introducing yourself, a few simple questions and the politeness formulas cover most short exchanges — everything else builds on top." },
  },
];

const LebaneseArabicPhrases = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="lebanese-arabic-phrases"
      title={{
        ro: "35+ Expresii în Arabă Libaneză pentru Viața de Zi cu Zi",
        en: "35+ Lebanese Arabic phrases: daily life table + free PDF download",
      }}
      description={{
        ro: "Învață 35+ expresii în arabă libaneză pentru saluturi, cafenea, taxi și familie, cu pronunție arabizi, scriere arabă și traducere în română.",
        en: "The most useful Lebanese Arabic phrases for daily life, grouped by context: greetings, café, taxi, family. Arabizi + Arabic script + translation. Free PDF download.",
      }}
      published="2026-07-24"
      readingMinutes={7}
      faq={FAQ}
      crumb={{ ro: "Expresii libaneze zilnice", en: "Lebanese Arabic phrases" }}
      lead={{
        ro: "O listă practică — nu vocabular pentru un manual, ci frazele pe care le folosesc libanezii în fiecare zi.",
        en: "A practical list — not textbook vocabulary, but the phrases Lebanese speakers actually use every day.",
      }}
    >
      <Tldr
        points={[
          { ro: "Expresiile fixe duc conversația libaneză mai mult decât gramatica.", en: "Set expressions carry Lebanese conversation more than grammar does." },
          { ro: "Cifrele din scriere marchează sunete din gât: 3 pentru ع, 7 pentru ح.", en: "The digits in the spelling mark throat sounds: 3 for ع, 7 for ح." },
          { ro: "Aceleași expresii funcționează în Siria, Iordania și Palestina.", en: "The same expressions work in Syria, Jordan and Palestine." },
          { ro: "Învață fraze întregi, nu cuvinte izolate — multe nu se traduc cuvânt cu cuvânt.", en: "Learn whole phrases, not isolated words — many do not translate word for word." },
        ]}
      />
      <p>
        {en
          ? "If you already know a few greetings and want to move from ‘saying hi’ to ‘holding a real short conversation,’ this is the shortlist. All phrases are in the Lebanese dialect (Levantine), not Modern Standard Arabic — so what you learn here is what you'll hear on the street, in a café, or with your Lebanese friends and family."
          : "Dacă știi deja câteva salutări și vrei să treci de la „bună” la „port o conversație scurtă”, aceasta e lista scurtă. Toate expresiile sunt în dialect libanez (levantin), nu în araba standard — deci ce înveți aici e ce auzi pe stradă, la cafenea sau cu prietenii și familia libaneză."}
      </p>
      <p>
        {en
          ? "Written in arabizi (Latin transliteration) with the Arabic script for reference. Numbers in arabizi replace sounds that don't exist in English: 3 = ع, 7 = ح, 2 = ء, 5 = خ."
          : "Scrise în arabizi (transliterare latină) cu scrierea arabă pentru referință. Cifrele din arabizi înlocuiesc sunete care nu există în română: 3 = ع, 7 = ح, 2 = ء, 5 = خ."}{" "}
        <Link to="/blog/ce-este-arabizi">{en ? "More about arabizi." : "Mai multe despre arabizi."}</Link>
      </p>

      {GROUPS.map((g) => (
        <section key={g.titleEn} className="space-y-3">
          <h2>{en ? g.titleEn : g.titleRo}</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-semibold">Arabizi</th>
                  <th className="p-3 font-semibold" dir="rtl">عربي</th>
                  <th className="p-3 font-semibold">{en ? "English" : "Română"}</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.arabizi} className="border-t border-border">
                    <td className="p-3 font-mono">{r.arabizi}</td>
                    <td className="p-3" dir="rtl">{r.arabic}</td>
                    <td className="p-3 text-muted-foreground">{en ? r.en : r.ro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <InlineCta
        title={{ ro: "Vrei să auzi cum sună?", en: "Want to hear how it sounds?" }}
        text={{
          ro: "30 de minute cu profesor nativ, gratuit — online sau fizic în București.",
          en: "30 minutes with a native teacher, free — online or in person in Bucharest.",
        }}
        href="/trial"
        label={{ ro: "Rezervă lecția de probă", en: "Book the trial lesson" }}
      />


      <h2>{en ? "How to actually use these" : "Cum folosești lista"}</h2>
      <ul>
        <li>{en ? "Pick 5 phrases per week — don't try to memorise all at once." : "Alege 5 expresii pe săptămână — nu încerca să le memorezi pe toate deodată."}</li>
        <li>{en ? "Say each phrase out loud 10 times, then use it in a fake mini-dialogue." : "Spune fiecare expresie cu voce tare de 10 ori, apoi folosește-o într-un mini-dialog imaginar."}</li>
        <li>{en ? "Post one phrase in a Lebanese friend's DMs — real use beats flashcards." : "Trimite o expresie unui prieten libanez pe DM — folosirea reală bate flashcard-urile."}</li>
      </ul>
      <p>
        {en
          ? "A list only gets you so far: phrases stick once someone answers back. That is most of what a lesson is — "
          : "O listă te duce doar până la un punct: expresiile se fixează când cineva îți răspunde. Cam asta e o lecție — "}
        <Link to="/cursuri-araba">{en ? "see the courses" : "vezi cursurile"}</Link>
        {en ? "." : "."}
      </p>

      <ResourceDownloadForm
        resource="100-expresii-libaneze"
        source="/blog/lebanese-arabic-phrases"
        idPrefix="blog-phrases"
        fileHref="/100-expresii-libaneze.pdf"
        title={en ? "Get the free PDF: 100 essential Lebanese phrases" : "Ia PDF-ul gratuit: 100 de expresii libaneze esențiale"}
        description={
          en
            ? "Seven everyday situations, each phrase in arabizi with translation. Sent to your email in seconds."
            : "Șapte situații de zi cu zi, fiecare expresie în arabizi cu traducere. Îl primești pe email în câteva secunde."
        }
      />



      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/cum-saluti-in-libaneza">{en ? "Lebanese greetings guide" : "Ghid complet de salutări libaneze"}</Link>{" · "}
        <Link to="/blog/numere-in-araba-libaneza">{en ? "Numbers in Lebanese Arabic" : "Numerele în libaneză"}</Link>{" · "}
        <Link to="/blog/gramatica-arabei-libaneze">{en ? "Lebanese grammar top 5" : "Gramatica libaneză — top 5"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default LebaneseArabicPhrases;