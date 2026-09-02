import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Unde se țin cursurile de arabă în București?",
    a: "La Raduga Creative Center, Strada Icoanei 80, sector 2 — zona Universitate/Piața Rosetti, cu acces ușor cu metroul (M2 Piața Romană / M1 Piața Universității) și tramvai. Sala e mică și liniștită, cu maxim 10 studenți per grupă.",
  },
  {
    q: "Sunt cursuri de arabă în București pentru începători?",
    a: "Da, nivelul A1 pornește de la zero — nu ai nevoie de nicio cunoștință prealabilă. Cohorta fizică curentă începe luni și miercuri, 19:00–20:30. Vezi și pagina „arabă pentru începători” pentru ce anume înveți în primele luni.",
  },
  {
    q: "Cât costă un curs de arabă în București?",
    a: "500 lei/lună online sau 700 lei/lună fizic (2 lecții de 90 min pe săptămână). Cu 10% reducere la plata integrală a nivelului. Meditațiile 1:1 costă 150 lei/lecție. Prima lecție de probă este gratuită.",
  },
  {
    q: "Există și cursuri de arabă pentru copii în București?",
    a: "Da, avem un curs dedicat pentru copii 6–10 ani, fizic în București, cu învățare prin joc, cântece și povești. Detalii pe pagina de curs pentru copii.",
  },
];

const CursuriArabaBucuresti = () => (
  <>
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://centruldearabalibaneza.com/cursuri-araba-bucuresti#localbusiness",
          parentOrganization: { "@id": "https://centruldearabalibaneza.com/#organization" },
          name: "Centrul de Arabă Libaneză cu Ibra — București",
          description:
            "Cursuri de arabă libaneză în București: grupe mici A1–C2, meditații 1:1 și curs pentru copii. Profesor nativ. Str. Icoanei 80, sector 2.",
          url: "https://centruldearabalibaneza.com/cursuri-araba-bucuresti",
          image: "https://centruldearabalibaneza.com/og-image.png",
          telephone: "+40763124514",
          email: "marhaba@centruldearabalibaneza.com",
          priceRange: "500–700 RON/lună",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Raduga Creative Center, Strada Icoanei 80",
            addressLocality: "București",
            addressRegion: "Sector 2",
            postalCode: "020451",
            addressCountry: "RO",
          },
          geo: { "@type": "GeoCoordinates", latitude: 44.446, longitude: 26.1053 },
          areaServed: [
            { "@type": "City", name: "București" },
            { "@type": "AdministrativeArea", name: "Ilfov" },
          ],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Wednesday"],
              opens: "19:00",
              closes: "20:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "10:00",
              closes: "12:00",
            },
          ],
          // No aggregateRating — see the note in Index.tsx. The Preply rating is
          // real but off-site, and Google's guidelines forbid aggregating another
          // site's ratings into your own markup. It stays visible on the page
          // instead, attributed and linked.
        })}
      </script>
    </Helmet>
  <LandingLayout
    slug="cursuri-araba-bucuresti"
    enHref="/en/arabic-classes-near-me"
    title="Cursuri de arabă libaneză în București — profesor nativ, grupe mici"
    metaTitle="Cursuri Arabă București 2026 | Prima Lecție Gratuită"
    description="Cursuri de arabă în București, str. Icoanei 80: grupe mici A1–C2 de la 700 lei/lună, meditații 1:1 și curs pentru copii. Prima lecție de probă e gratuită."
    crumb="Cursuri de arabă libaneză București"
    lead="Cursuri de arabă libaneză în București cu profesor nativ, la Raduga Creative Center (Str. Icoanei 80, sector 2). Grupe mici, niveluri A1–C2, adulți și copii."
    faq={FAQ}
  >
    <p>
      Cauți un curs de arabă <strong>în București</strong>, cu profesor nativ și grupă mică, într-o
      locație accesibilă? La <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> predăm fizic la{" "}
      <strong>Raduga Creative Center, Strada Icoanei 80</strong> — zona Piața Rosetti, la 5 min de
      metroul Piața Romană.
    </p>

    <h2>Zone din București din care ne vin studenți</h2>
    <p>
      Sala e în <strong>sectorul 2</strong>, la mijloc între Piața Romană și Piața Universității,
      așa că e ușor accesibilă din aproape orice zonă a orașului:
    </p>
    <ul>
      <li>
        <strong>Centru & sector 1</strong> (Dorobanți, Aviatorilor, Victoriei, Cotroceni) — 10–15
        min cu metroul M2.
      </li>
      <li>
        <strong>Sector 2 & 3</strong> (Moșilor, Obor, Colentina, Iancului, Titan) — 15–20 min cu
        tramvaiul 21 sau metroul M1.
      </li>
      <li>
        <strong>Sector 4 & 5</strong> (Tineretului, Unirii, Rahova) — 15–20 min cu M2 până la Piața
        Romană.
      </li>
      <li>
        <strong>Sector 6 & Militari</strong> — 25 min cu M3 → M2, sau alegi{" "}
        <Link to="/araba-online">varianta online</Link>.
      </li>
      <li>
        <strong>Pipera, Băneasa, Ilfov (Voluntari, Otopeni)</strong> — cel mai simplu pe M2 până la
        Piața Romană; parcarea în zonă e ok seara.
      </li>
    </ul>

    <h2>Ce cursuri de arabă găsești în București</h2>
    <ul>
      <li>
        <strong><Link to="/cursuri/grup">Curs de grup adulți A1–C2</Link></strong> — 2 lecții/săpt.,
        seara (19:00–20:30), grupe de max 10. De la 700 lei/lună fizic.
      </li>
      <li>
        <strong><Link to="/meditatii-araba">Meditații de arabă 1:1</Link></strong> — 150 lei/lecție, program
        flexibil, la sală sau la tine acasă (în funcție de zonă).
      </li>
      <li>
        <strong><Link to="/cursuri/copii">Curs pentru copii 6–10 ani</Link></strong> — sâmbătă
        dimineața, prin joc și povești, fizic în București.
      </li>
    </ul>

    <h2>Cum ajungi la sală</h2>
    <p>
      <strong>Adresă:</strong> Raduga Creative Center, Strada Icoanei 80, sector 2, București.
      <br />
      <strong>Metrou:</strong> M2 Piața Romană (5 min pe jos) sau M1/M3 Piața Universității (8 min).
      <br />
      <strong>Tramvai:</strong> stații pe Bd. Carol I și Bd. Dacia.
      <br />
      <strong>Parcare:</strong> stradală (contra cost, aplicație parcare); zonă rezidențială
      liniștită.
    </p>

    <h2>De ce fizic în București vs online</h2>
    <p>
      Fizic ai relația directă cu profesorul, colegi de grupă cu care exersezi și un ritual
      săptămânal care te ține pe cale. Online e mai flexibil și mai ieftin, dar pierzi din energia
      grupei. Dacă locuiești în București și programul îți permite, <strong>fizic e alegerea mai
      bună</strong>. Dacă locuiești în alt oraș sau în diaspora, ai{" "}
      <Link to="/araba-online">cursuri online</Link> cu aceeași metodă.
    </p>

    <p>
      Începe cu o <Link to="/trial">lecție de probă gratuită de 30 min</Link>, fizic la sală sau
      online.
    </p>
  </LandingLayout>
  </>
);

export default CursuriArabaBucuresti;
