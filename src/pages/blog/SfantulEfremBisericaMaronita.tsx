import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// The link to Gibran is the owner's reading, told as an echo, not as a claim
// of influence.
const FAQ = [
  {
    q: { ro: "Sfântul Efrem a fost libanez?", en: "Was Saint Ephrem Lebanese?" },
    a: { ro: "Nu. S-a născut la Nisibis (Nusaybin, în Turcia de azi) și a murit la Edessa. Dar a scris în siriacă, limba tradiției din care face parte și Biserica Maronită, care îl cinstește până azi.", en: "No. He was born in Nisibis (Nusaybin, in today's Turkey) and died in Edessa. But he wrote in Syriac, the language of the tradition the Maronite Church belongs to, which honours him to this day." },
  },
  {
    q: { ro: "Ce limbă se folosește în liturghia maronită?", en: "What language is used in the Maronite liturgy?" },
    a: { ro: "Araba și siriaca. Multe rugăciuni și cântări, mai ales cele vechi, se spun sau se cântă și azi în siriacă.", en: "Arabic and Syriac. Many prayers and hymns, especially the old ones, are still said or sung in Syriac today." },
  },
  {
    q: { ro: "Se poate vizita valea Qadisha?", en: "Can you visit the Qadisha valley?" },
    a: { ro: "Da. Valea și Pădurea Cedrilor Domnului sunt în patrimoniul mondial UNESCO din 1998; se pot vizita mănăstiri, schituri și Muzeul Gibran din Bsharri.", en: "Yes. The valley and the Forest of the Cedars of God have been a UNESCO World Heritage site since 1998; you can visit monasteries, hermitages and the Gibran Museum in Bsharri." },
  },
];

const SfantulEfremBisericaMaronita = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="sfantul-efrem-sirul-si-biserica-maronita"
      title={{
        ro: "Sfântul Efrem Sirul și Biserica Maronită",
        en: "Saint Ephrem the Syrian and the Maronite Church",
      }}
      description={{
        ro: "Poetul care a pus teologia pe muzică, Biserica Maronită care cântă și azi în siriacă și valea Qadisha, inima ei — până la Gibran.",
        en: "The poet who set theology to music, the Maronite Church that still sings in Syriac, and the Qadisha valley at its heart — all the way to Gibran.",
      }}
      published="2026-10-04"
      readingMinutes={5}
      faq={FAQ}
      crumb={{ ro: "Sfântul Efrem", en: "Saint Ephrem" }}
      lead={{
        ro: "În secolul al IV-lea, un diacon din Nisibis a scris imnuri în siriacă și le-a dat corurilor să le cânte. Le numim și azi pe numele lui: Sfântul Efrem Sirul, „Harpa Duhului”. Tradiția lui trăiește în Biserica Maronită și în valea Qadisha din Liban.",
        en: "In the 4th century, a deacon from Nisibis wrote hymns in Syriac and gave them to choirs to sing. We still know them by his name: Saint Ephrem the Syrian, the \"Harp of the Spirit\". His tradition lives on in the Maronite Church and in Lebanon's Qadisha valley.",
      }}
    >
      <Tldr
        points={[
          { ro: "Efrem (c. 306–373) a fost cel mai mare poet al limbii siriace.", en: "Ephrem (c. 306–373) was the greatest poet of the Syriac language." },
          { ro: "A scris teologie ca imnuri, cântate de coruri.", en: "He wrote theology as hymns, sung by choirs." },
          { ro: "Biserica Maronită păstrează siriaca în liturghie, alături de arabă.", en: "The Maronite Church keeps Syriac in its liturgy, alongside Arabic." },
          { ro: "Valea Qadisha, inima ei, e în patrimoniul UNESCO din 1998.", en: "The Qadisha valley, its heart, has been UNESCO heritage since 1998." },
        ]}
      />

      <h2>{en ? "1. Who Saint Ephrem was" : "1. Cine a fost Sfântul Efrem"}</h2>
      <p>
        {en
          ? "Ephrem was born around 306 in Nisibis, today's Nusaybin in Turkey, and served there as a deacon and teacher. When the city passed to Persia in 363, he moved to Edessa, where he died in 373. He wrote in Syriac, the Aramaic of Edessa, and is remembered as its greatest poet. In 1920 Pope Benedict XV declared him a Doctor of the Church."
          : "Efrem s-a născut în jurul anului 306 la Nisibis, azi Nusaybin, în Turcia, unde a slujit ca diacon și învățător. Când orașul a trecut la Persia, în 363, s-a mutat la Edessa, unde a murit în 373. A scris în siriacă, aramaica Edessei, și e amintit ca cel mai mare poet al ei. În 1920, Papa Benedict al XV-lea l-a declarat Învățător al Bisericii."}
      </p>

      <h2>{en ? "2. Theology you sing" : "2. Teologie care se cântă"}</h2>
      <p>
        {en
          ? "Ephrem did not write treatises. He wrote madrāshē — teaching hymns set to known melodies — and, according to tradition, trained choirs, including choirs of women, to sing them. For him, poetry, music and faith were not separate things but one. That is why he is called the \"Harp of the Spirit\"."
          : "Efrem nu a scris tratate. A scris madrāshē — imnuri de învățătură pe melodii cunoscute — și, după tradiție, a format coruri, inclusiv coruri de femei, care să le cânte. Pentru el, poezia, muzica și credința nu erau lucruri separate, ci unul singur. De aceea e numit „Harpa Duhului”."}
      </p>

      <h2>{en ? "3. The Maronite Church" : "3. Biserica Maronită"}</h2>
      <p>
        {en
          ? "The Maronite Church takes its name from Saint Maron, a Syrian monk who died around 410. His followers settled in Mount Lebanon, and the church became one of the pillars of Lebanese history. It belongs to the Syriac tradition, is in communion with Rome, and its patriarch resides in Bkerke. Its liturgy uses Arabic and Syriac: many of the old prayers and hymns are still sung in the language Ephrem wrote in."
          : "Biserica Maronită își ia numele de la Sfântul Maron, un călugăr sirian mort în jurul anului 410. Ucenicii lui s-au așezat în Muntele Liban, iar biserica a devenit unul dintre stâlpii istoriei libaneze. Face parte din tradiția siriacă, e în comuniune cu Roma, iar patriarhul ei are reședința la Bkerke. Liturghia folosește araba și siriaca: multe dintre rugăciunile și cântările vechi se cântă și azi în limba în care scria Efrem."}
      </p>

      <h2>{en ? "4. The Qadisha valley" : "4. Valea Qadisha"}</h2>
      <p>
        {en
          ? "Qadisha means \"holy\" in Syriac. For centuries this deep valley in northern Lebanon sheltered hermits, monasteries and the Maronite patriarchs. Above it, near Bsharri, grows Arz er-Rab, the Forest of the Cedars of God. Together they have been a UNESCO World Heritage site since 1998."
          : "Qadisha înseamnă „sfânt” în siriacă. Timp de secole, această vale adâncă din nordul Libanului a adăpostit pustnici, mănăstiri și patriarhii maroniți. Deasupra ei, lângă Bsharri, crește Arz er-Rab, Pădurea Cedrilor Domnului. Împreună sunt în patrimoniul mondial UNESCO din 1998."}
      </p>

      <h2>{en ? "5. An echo in Gibran" : "5. Un ecou la Gibran"}</h2>
      <p>
        {en
          ? "Kahlil Gibran was born in Bsharri in 1883, at the edge of this valley, and is buried there. Reading him, many Lebanese hear the same sensibility Ephrem left behind centuries earlier: art, music and the spiritual as one body, not three separate things."
          : "Kahlil Gibran s-a născut în 1883 la Bsharri, la marginea acestei văi, și e înmormântat acolo. Citindu-l, mulți libanezi aud aceeași sensibilitate pe care Efrem a lăsat-o cu sute de ani înainte: arta, muzica și spiritualitatea ca un singur corp, nu ca trei lucruri separate."}
      </p>

      <InlineCta
        title={{ ro: "Vrei să înțelegi Libanul din interior?", en: "Want to understand Lebanon from the inside?" }}
        text={{
          ro: "Predăm dialectul libanez, cu profesor nativ. Grupe A1–C2 și lecții 1:1.",
          en: "We teach the Lebanese dialect with a native teacher. Groups A1–C2 and 1-on-1 lessons.",
        }}
        href="/cursuri-limba-araba"
        label={{ ro: "Vezi cursurile", en: "See the courses" }}
      />

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/garshuni-si-tiparnita-de-la-qozhaya">{en ? "Garshuni and the Qozhaya press" : "Garshuni și tiparnița de la Qozhaya"}</Link>{" · "}
        <Link to="/blog/fenicienii-si-identitatea-libaneza">{en ? "The Phoenicians and Lebanese identity" : "Fenicienii și identitatea libaneză"}</Link>{" · "}
        <Link to="/blog/siriaca-in-araba-libaneza">{en ? "The Syriac inside Lebanese Arabic" : "Siriaca din araba libaneză"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default SfantulEfremBisericaMaronita;
