import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// [number, arabizi, arabic]
const DIGITS: [string, string, string][] = [
  ["0", "sifr", "صفر"],
  ["1", "wa7ad", "واحد"],
  ["2", "tnein", "تنين"],
  ["3", "tlete", "تلاتة"],
  ["4", "arb3a", "أربعة"],
  ["5", "khamse", "خمسة"],
  ["6", "sitte", "ستة"],
  ["7", "sab3a", "سبعة"],
  ["8", "tmene", "تمانية"],
  ["9", "tis3a", "تسعة"],
  ["10", "3ashra", "عشرة"],
];

// [number, arabizi, arabic]
const TENS: [string, string, string][] = [
  ["11", "7da3sh", "حدعش"],
  ["12", "tna3sh", "طنعش"],
  ["20", "3eshrin", "عشرين"],
  ["30", "tletin", "تلاتين"],
  ["50", "khamsin", "خمسين"],
  ["100", "miyye", "مية"],
  ["1000", "alf", "ألف"],
];

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "Numerele libaneze sunt la fel ca în araba standard?", en: "Are Lebanese numbers the same as in Modern Standard Arabic?" },
    a: { ro: "Foarte apropiate, dar pronunția e simplificată în vorbire și unele terminații cad. Cifrele de bază se recunosc ușor între dialecte — e una dintre zonele cu cea mai mică diferență.", en: "Very close, but the pronunciation is simplified in speech and some endings drop. The basic numbers are easily recognised across dialects — it is one of the areas that differs least." },
  },
  {
    q: { ro: "Ce cifre folosesc libanezii când scriu?", en: "Which digits do Lebanese people use when writing?" },
    a: { ro: "În Liban se folosesc cifrele occidentale (1, 2, 3), aceleași ca la noi. Cifrele arabe orientale (١، ٢، ٣) apar mai ales în Golf și în texte formale.", en: "In Lebanon the Western digits (1, 2, 3) are used, the same as in Europe. The Eastern Arabic numerals (١، ٢، ٣) appear mainly in the Gulf and in formal texts." },
  },
  {
    q: { ro: "De ce am nevoie de numere atât de devreme?", en: "Why do I need numbers so early on?" },
    a: { ro: "Pentru că apar în fiecare tranzacție reală: preț, oră, adresă, număr de telefon. Sunt printre puținele cuvinte de care ai nevoie literal din prima zi în Liban.", en: "Because they appear in every real transaction: price, time, address, phone number. They are among the few words you need literally on day one in Lebanon." },
  },
];

const NumereInLibaneza = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="numere-in-araba-libaneza"
      title={{ ro: "Numerele în araba libaneză: de la 0 la 1000 (cu tabel)", en: "Numbers in Lebanese Arabic: from 0 to 1000 (with a table)" }}
      description={{
        ro: "Cum numeri în araba libaneză: cifrele 0–10, zecile, sutele și miile, în arabizi și scriere arabă — plus cum ceri prețul și dai un număr de telefon.",
        en: "How to count in Lebanese Arabic: digits 0–10, tens, hundreds and thousands, in Arabizi and Arabic script — plus how to ask a price and give a phone number.",
      }}
      published="2026-07-17"
      readingMinutes={4}
      faq={FAQ}
      crumb={{ ro: "Numerele în libaneză", en: "Numbers in Lebanese" }}
      lead={{
        ro: "Cifrele de care ai nevoie în piață, în taxi și la cafenea — cu pronunție în arabizi și scriere arabă.",
        en: "The numbers you need at the market, in a taxi and at the café — with Arabizi pronunciation and Arabic script.",
      }}
    >
      <Tldr
        points={[
          { ro: "Numerele apar în fiecare tranzacție reală: preț, oră, adresă, telefon.", en: "Numbers appear in every real transaction: price, time, address, phone." },
          { ro: "În Liban se scriu cu cifre occidentale (1, 2, 3), nu cu cele orientale.", en: "In Lebanon they are written with Western digits (1, 2, 3), not the Eastern ones." },
          { ro: "Pronunția e simplificată față de araba standard, dar rămâne recunoscută peste tot.", en: "Pronunciation is simplified compared with MSA, but stays recognisable everywhere." },
          { ro: "Sunt printre primele cuvinte utile — merită învățate în prima săptămână.", en: "They are among the first genuinely useful words — worth learning in week one." },
        ]}
      />
      <p>
        {en
          ? "Numbers are among the first things you actually use in a new language — prices, time, phone numbers, your age. The good news: in Lebanese you only need a handful to get by. Here they are, with "
          : "Numerele sunt printre primele lucruri pe care le și folosești într-o limbă nouă — prețuri, ore, numere de telefon, vârsta. Vestea bună: în libaneză îți ajung câteva ca să te descurci. Iată-le, cu "}
        <Link to="/blog/ce-este-arabizi">{en ? "Arabizi" : "arabizi"}</Link>
        {en ? " pronunciation and Arabic script." : " și scriere arabă."}
      </p>

      <h2>{en ? "0 to 10" : "De la 0 la 10"}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">{en ? "Number" : "Număr"}</th>
              <th className="py-2 px-3 font-semibold">Arabizi</th>
              <th className="py-2 pl-3 font-semibold">{en ? "Arabic" : "Arabă"}</th>
            </tr>
          </thead>
          <tbody>
            {DIGITS.map(([n, arabizi, arabic]) => (
              <tr key={n} className="border-b border-border/60 align-top">
                <td className="py-2.5 pr-3 font-bold text-primary whitespace-nowrap">{n}</td>
                <td className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">{arabizi}</td>
                <td className="py-2.5 pl-3 font-arabic text-lg text-brand-green" dir="rtl" lang="ar">{arabic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{en ? "Tens, hundreds, thousands" : "Zeci, sute, mii"}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">{en ? "Number" : "Număr"}</th>
              <th className="py-2 px-3 font-semibold">Arabizi</th>
              <th className="py-2 pl-3 font-semibold">{en ? "Arabic" : "Arabă"}</th>
            </tr>
          </thead>
          <tbody>
            {TENS.map(([n, arabizi, arabic]) => (
              <tr key={n} className="border-b border-border/60 align-top">
                <td className="py-2.5 pr-3 font-bold text-primary whitespace-nowrap">{n}</td>
                <td className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">{arabizi}</td>
                <td className="py-2.5 pl-3 font-arabic text-lg text-brand-green" dir="rtl" lang="ar">{arabic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {en
          ? "Between 21 and 99, Lebanese says the unit first, then the ten: 21 is 'wa7ad w 3eshrin' (one-and-twenty), 35 is 'khamse w tletin' (five-and-thirty). The little 'w' means 'and'."
          : "Între 21 și 99, în libaneză spui întâi unitatea, apoi zecea: 21 e „wa7ad w 3eshrin” (unu-și-douăzeci), 35 e „khamse w tletin” (cinci-și-treizeci). Micul „w” înseamnă „și”."}
      </p>

      <h2>{en ? "Where you'll use them right away" : "Unde le folosești imediat"}</h2>
      <ul>
        <li><strong>Addesh?</strong> {en ? "— 'how much?' The answer comes back in these numbers, usually in " : "— „cât costă?” Răspunsul vine în aceste numere, de obicei în "}<em>lira</em> {en ? "or dollars." : "sau dolari."}</li>
        <li>{en ? "Phone numbers are read digit by digit — just string the 0–10 list together." : "Numerele de telefon se citesc cifră cu cifră — înșiri pur și simplu lista de la 0 la 10."}</li>
        <li>{en ? "Your age: 'age' is " : "Vârsta ta: „vârsta” e "}<em>3omr</em>{en ? " — 'omri tletin' means 'I'm thirty'." : " — „3omri tletin” înseamnă „am treizeci de ani”."}</li>
      </ul>

      <InlineCta
        title={{ ro: "Vrei să auzi cum sună?", en: "Want to hear how it sounds?" }}
        text={{
          ro: "30 de minute cu profesor nativ, gratuit — online sau fizic în București.",
          en: "30 minutes with a native teacher, free — online or in person in Bucharest.",
        }}
        href="/trial"
        label={{ ro: "Rezervă lecția de probă", en: "Book the trial lesson" }}
      />


      <h2>{en ? "Practise them out loud" : "Exersează-le cu voce tare"}</h2>
      <p>
        {en
          ? "Numbers stick fastest when you say them for real — counting change, telling the time, giving your phone number. In a "
          : "Numerele se prind cel mai repede când le spui pe bune — numeri restul, spui ora, dai numărul de telefon. La o "}
        <Link to="/trial">{en ? "free trial lesson" : "lecție de probă gratuită"}</Link>
        {en ? " you practise them with a native teacher, and you can continue with the " : " le exersezi cu un profesor nativ, iar apoi poți continua cu "}
        <Link to="/blog/primele-20-de-expresii-libaneze">{en ? "first 20 Lebanese phrases" : "primele 20 de expresii libaneze"}</Link>.
      </p>
      <p>
        {en ? "All our free PDFs — phrasebook, arabizi cheat-sheet and a 30-day plan — are on the " : "Toate PDF-urile noastre gratuite — expresii, cheat-sheet arabizi și planul de 30 de zile — sunt pe "}
        <Link to="/resurse">{en ? "resources page" : "pagina de resurse"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default NumereInLibaneza;
