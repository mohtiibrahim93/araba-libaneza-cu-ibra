import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";

const FAQ = [
  {
    q: "Care e diferența dintre araba levantină și araba din Golf?",
    a: "Levantina se vorbește în Liban, Siria, Iordania și Palestina; araba din Golf (khaliji) în Kuweit, Bahrain, Qatar, Emirate și estul Arabiei Saudite. Cel mai audibil semn e litera ق: levantina urbană o pronunță ca oprire glotală (ʾāl), Golful ca un „g” dur (gāl). Diferă și prefixele verbale: în levantină b- marchează prezentul, în Golf marchează mai degrabă intenția sau viitorul.",
  },
  {
    q: "Dacă știu levantină, mă înțeleg în Dubai sau Doha?",
    a: "Da, în general. Vorbitorii din Golf sunt expuși masiv la media levantină și egipteană, deci te înțeleg bine. În sens invers e mai greu: o conversație rapidă în khaliji, cu vocabularul ei propriu, cere obișnuință. În plus, în orașele din Golf mediul de lucru e adesea în engleză.",
  },
  {
    q: "Ce dialect se vorbește în Emiratele Arabe Unite?",
    a: "Arabă din Golf (khaliji), în varianta emirateză. Face parte din același grup cu vorbirea din Kuweit, Bahrain, Qatar și estul Arabiei Saudite. Populația e însă majoritar expatriată, așa că pe stradă auzi la fel de des engleză, hindi, urdu sau tagalog.",
  },
  {
    q: "Merită să învăț khaliji dacă lucrez în Golf?",
    a: "Dacă lucrezi direct cu vorbitori nativi din regiune — clienți, administrație, familii — da. Dacă ești într-un mediu corporativ internațional, engleza acoperă ziua de lucru, iar o bază de levantină sau egipteană îți deschide relațiile personale, pentru că ambele sunt larg înțelese acolo.",
  },
  {
    q: "Khaliji e mai aproape de araba standard decât levantina?",
    a: "În unele privințe da: păstrează mai des consoane pe care levantina urbană le-a pierdut, de pildă ث și ذ. Asta nu îl face mai ușor de învățat, pentru că vocabularul curent și intonația se îndepărtează la fel de mult de fusha ca oriunde altundeva.",
  },
];

const LevantinaVsGolf = () => (
  <LandingLayout
    slug="dialecte-arabe/levantina-vs-golf"
    title="Araba levantină vs. araba din Golf"
    metaTitle="Araba Levantină vs Araba din Golf (Khaliji)"
    description="Levantină sau khaliji? Compară pronunția, verbele și vocabularul, vezi cine pe cine înțelege și ce dialect îți folosește dacă lucrezi în Golf."
    crumb="Levantină vs. Golf"
    parents={DIALECT_PARENTS}
    lead="Două familii de dialecte separate de o mie de kilometri de deșert. Se înțeleg parțial — și nu în aceeași măsură în ambele sensuri."
    enHref="/en/arabic-dialects-guide/levantine-vs-gulf-arabic"
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      <strong>Levantina (shami)</strong> e vorbită în Liban, Siria, Iordania și Palestina.{" "}
      <strong>Araba din Golf (khaliji)</strong> acoperă Kuweit, Bahrain, Qatar, Emiratele și estul
      Arabiei Saudite. Sunt înrudite, dar nu interschimbabile: diferă pronunția mai multor
      consoane, o parte din morfologia verbului și un strat consistent de vocabular. Un vorbitor
      din Golf înțelege levantina mai ușor decât invers, pentru că media levantină și egipteană
      circulă peste tot, iar cea din Golf mult mai puțin.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Araba levantină comparată cu araba din Golf"
      columns={["Criteriu", "Levantină (shami)", "Golf (khaliji)"]}
      rows={[
        ["Unde se vorbește", "Liban, Siria, Iordania, Palestina.", "Kuweit, Bahrain, Qatar, Emirate, estul Arabiei Saudite."],
        ["Litera ق", "Oprire glotală în vorbirea urbană: ʾāl.", "„g” dur: gāl."],
        ["Litera ك", "Rămâne „k” peste tot.", "Devine des „ch” lângă vocale anterioare."],
        ["ث și ذ", "De obicei se pierd, devenind t și d.", "Se păstrează mai des ca în araba standard."],
        ["Prefixul b-", "Marchează prezentul: baʿrif — „știu”.", "Marchează mai degrabă intenția sau viitorul."],
        ["Acțiunea în desfășurare", "ʿam + verb: ʿam bishrab.", "Verb simplu, sau gāʿid înaintea lui."],
        ["„Ce faci?”", "kīfak", "shlōnak"],
        ["„Vreau”", "baddi", "abī / arīd"],
        ["Împrumuturi", "Franceză, engleză, ceva turcă.", "Persană, engleză, hindi și urdu."],
        ["Acoperire media", "Muzică și seriale difuzate în toată regiunea.", "Producție mai locală, mai puțin exportată."],
      ]}
    />

    <h2>Aceeași propoziție, în ambele</h2>
    <p><em>„Vreau să beau o cafea.”</em></p>
    <ul>
      <li><strong>Levantină (libaneză):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Golf:</strong> <em>abī ashrab gahwa</em></li>
    </ul>
    <p>
      Același cuvânt pentru cafea, pronunțat cu cele două valori ale lui ق — <em>ʾahwe</em> la
      Beirut, <em>gahwa</em> la Kuweit. Verbul „a vrea” e complet diferit, iar asta se întâmplă
      exact la cuvintele pe care le folosești cel mai des.
    </p>

    <h2>Cine pe cine înțelege</h2>
    <p>
      Asimetric, ca aproape peste tot în lumea arabă. Vorbitorii din Golf urmăresc fără probleme
      seriale libaneze și filme egiptene, deci înțeleg levantina bine. Un vorbitor de levantină
      care aude pentru prima dată khaliji rapid prinde ideea, dar pierde detaliile — mai ales
      vocabularul local. Contextul salvează mult: în regiune se comută des spre un registru
      neutru, apropiat de egipteană sau de araba standard.
    </p>

    <h2>Ce alegi, în funcție de scop</h2>
    <ul>
      <li><strong>Familie sau prieteni din Levant</strong> → levantină. Vezi <Link to="/cursuri-limba-araba">cursurile de arabă libaneză</Link>.</li>
      <li><strong>Muncă în Emirate, Qatar sau Kuweit, cu clienți nativi</strong> → khaliji e cel mai direct, dar o bază levantină sau egipteană te ține în conversație.</li>
      <li><strong>Vrei acoperirea cea mai largă în lumea arabă</strong> → levantina sau egipteana, nu khaliji.</li>
      <li><strong>Documente, contracte, presă</strong> → arabă standard. Vezi <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link>.</li>
    </ul>

    <h2>Unde stau celelalte dialecte</h2>
    <p>
      Golful nu e singurul vecin al levantinei. Pentru restul hărții: {" "}
      <Link to="/dialecte-arabe/levantina-vs-irakiana">levantina vs. araba irakiană</Link>,{" "}
      <Link to="/dialecte-arabe/levantina-vs-peninsulara">levantina vs. araba din Peninsula Arabică</Link>{" "}
      și <Link to="/dialecte-arabe/levantina-vs-maghrebina">levantina vs. araba maghrebină</Link>.
      Privirea de ansamblu e în <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.
    </p>
  </LandingLayout>
);

export default LevantinaVsGolf;
