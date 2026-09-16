import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS } from "./parents";

const FAQ = [
  {
    q: "Care e diferența dintre araba levantină și araba irakiană?",
    a: "Irakiana (mesopotamiană) pronunță ق ca un „g” dur — de aici și numele grupului, gelet, „am spus” — acolo unde levantina urbană folosește o oprire glotală. Irakiana marchează acțiunea în desfășurare cu prefixul da- (da-aktib, „scriu acum”), levantina cu ʿam. Vocabularul irakian are un strat vizibil de cuvinte turcești și persane pe care levantina nu îl are.",
  },
  {
    q: "Un libanez înțelege un irakian?",
    a: "Parțial, și cu efort la început. Structura e aceeași și multe cuvinte se suprapun, dar pronunția și vocabularul local cer obișnuință. Irakienii înțeleg de obicei levantina mai bine decât invers, pentru că serialele și muzica levantină circulă în toată regiunea.",
  },
  {
    q: "Araba irakiană e mai grea decât cea libaneză?",
    a: "Nu ca sistem gramatical — ambele au renunțat la terminațiile cazuale ale arabei standard. Pentru un începător din România, irakiana e în practică mai greu de exersat: are mult mai puține materiale didactice, mai puține seriale subtitrate și mai puțini profesori disponibili.",
  },
  {
    q: "Ce dialect se vorbește în Irak?",
    a: "În cea mai mare parte a țării, araba mesopotamiană, cu vorbirea din Bagdad ca varietate de referință. În nord se vorbesc și varietăți mesopotamiene de tip qeltu, iar kurda e limbă oficială alături de arabă, deci în regiunea Kurdistanului araba nu e limba de zi cu zi a tuturor.",
  },
  {
    q: "Dacă am prieteni irakieni, ce curs ar trebui să fac?",
    a: "Un curs de levantină îți dă o bază pe care o poți ajusta: gramatica e comună, iar diferențele se învață din conversație. Dacă vrei direct accentul irakian, are sens o meditație 1:1 cu cineva care îl vorbește, nu un curs de grup.",
  },
];

const LevantinaVsIrakiana = () => (
  <LandingLayout
    slug="dialecte-arabe/levantina-vs-irakiana"
    title="Araba levantină vs. araba irakiană"
    metaTitle="Araba Levantină vs Araba Irakiană (Mesopotamiană)"
    description="Cât de diferită e araba irakiană de cea levantină? Pronunție, prefixe verbale, împrumuturi turcești și persane și cât se înțeleg vorbitorii între ei."
    crumb="Levantină vs. irakiană"
    parents={DIALECT_PARENTS}
    lead="Două familii vecine, cu aceeași gramatică de bază și două sunete care le despart imediat la ureche."
    enHref="/en/arabic-dialects-guide/levantine-vs-iraqi-arabic"
    faq={FAQ}
  >
    <h2>Pe scurt</h2>
    <p>
      <strong>Araba irakiană</strong>, numită și mesopotamiană, e vecina de est a levantinei. Cele
      două împart scheletul gramatical al dialectelor arabe moderne, dar se despart la pronunție
      și la vocabularul de zi cu zi. Semnul cel mai rapid: irakiana spune <em>gāl</em> („a spus”)
      unde Beirutul spune <em>ʾāl</em>, și marchează acțiunea în desfășurare cu <em>da-</em> acolo
      unde levantina folosește <em>ʿam</em>. În plus, irakiana poartă un strat de cuvinte turcești
      și persane pe care levantina nu îl are.
    </p>

    <h2>Comparație pe puncte</h2>
    <ComparisonTable
      caption="Araba levantină comparată cu araba irakiană"
      columns={["Criteriu", "Levantină (shami)", "Irakiană (mesopotamiană)"]}
      rows={[
        ["Unde se vorbește", "Liban, Siria, Iordania, Palestina.", "Irak, plus zone de graniță din Siria de est și sud-vestul Iranului."],
        ["Litera ق", "Oprire glotală în vorbirea urbană: ʾāl.", "„g” dur: gāl. De aici și numele grupului, gelet."],
        ["Litera ك", "Rămâne „k”.", "Devine des „ch” lângă vocale anterioare."],
        ["Acțiunea în desfășurare", "ʿam + verb: ʿam aktub.", "Prefixul da-: da-aktib."],
        ["Viitorul", "raḥ / ḥa- înaintea verbului.", "raḥ, la fel."],
        ["„Ce faci?”", "kīfak", "shlōnak"],
        ["„Vreau”", "baddi", "arīd"],
        ["Posesia", "Sufixe, plus tabaʿ: l-bēt tabaʿi.", "Sufixe, plus māl: l-bēt māli."],
        ["Împrumuturi", "Franceză, engleză, ceva turcă.", "Turcă și persană, într-un strat mult mai gros."],
        ["Materiale de învățat", "Multe: cursuri, seriale, muzică, aplicații.", "Puține în afara Irakului."],
      ]}
    />

    <h2>Aceeași propoziție, în ambele</h2>
    <p><em>„Vreau să beau o cafea.”</em></p>
    <ul>
      <li><strong>Levantină (libaneză):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Irakiană:</strong> <em>arīd ashrab gahwa</em></li>
    </ul>
    <p>
      Verbul „a bea” e identic, cafeaua e același cuvânt cu alt ق, iar „a vrea” e din nou altul.
      Tiparul se repetă în toată lumea arabă: rădăcinile sunt comune, cuvintele de mare
      frecvență nu.
    </p>

    <h2>Cine pe cine înțelege</h2>
    <p>
      Irakienii urmăresc de obicei levantina fără probleme — serialele libaneze și siriene se văd
      peste tot. În sens invers, un vorbitor de levantină are nevoie de câteva zile de expunere
      ca să se obișnuiască cu <em>g</em>-ul irakian, cu prefixul <em>da-</em> și cu vocabularul
      local. Nu e o barieră de limbă, e o barieră de obișnuință.
    </p>

    <h2>Contează pentru România</h2>
    <p>
      Comunitatea arabă din București vine în bună parte din Liban, Siria, Palestina și Irak. O
      bază levantină acoperă direct primele trei și îți dă un start bun pentru a patra: vei
      înțelege, vei fi înțeles și vei ajusta din mers. Detaliile despre cursurile fizice sunt la{" "}
      <Link to="/cursuri-araba-bucuresti">cursuri de arabă în București</Link>.
    </p>

    <h2>Ce faci mai departe</h2>
    <ul>
      <li><strong>Prieteni sau colegi irakieni</strong> → începe cu levantina și ajustează accentul la <Link to="/meditatii-araba">meditațiile 1:1</Link>.</li>
      <li><strong>Vrei harta completă</strong> → <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link>.</li>
      <li><strong>Vrei comparația cu vecinii de sud</strong> → <Link to="/dialecte-arabe/levantina-vs-golf">levantina vs. araba din Golf</Link>.</li>
      <li><strong>Nu știi de unde începi</strong> → <Link to="/trial">lecția de probă gratuită</Link> clarifică în 30 de minute.</li>
    </ul>
  </LandingLayout>
);

export default LevantinaVsIrakiana;
