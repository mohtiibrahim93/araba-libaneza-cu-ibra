// The right of withdrawal, as the site states it before payment and the
// confirmation email repeats it (owner, 17 November 2026: the lawyer's draft
// dropped, "apply the proposed things"). Pure text, no imports: read by the
// sign-up confirmation emails and checked against the Terms by the tests.
//
// WITHDRAWAL_PARAGRAPH is section 4's 14-day paragraph of the Terms, word for
// word (src/pages/Terms.tsx); the confirmation email repeats it so the student
// keeps it on a durable medium. MODEL_WITHDRAWAL_FORM is the model form of
// Directive 2011/83/EU, annex I part B (OUG 34/2014, annex 1 part B), in the
// official Romanian and English texts (EUR-Lex, read on 17 Nov 2026), with
// the trader's details filled in from section 9 of the Terms.

export const WITHDRAWAL_PARAGRAPH = {
  ro: "Dreptul legal de retragere (14 zile): dacă te-ai înscris și ai plătit online, ai dreptul să te retragi din contract în 14 zile de la data înscrierii, fără să dai un motiv (OUG nr. 34/2014). Ne anunți cu butonul „Retrage-te din contract aici” din Contul meu sau printr-o declarație clară pe email la marhaba@centruldearabalibaneza.com, și îți confirmăm primirea pe email, cu data și ora. Îți returnăm toate sumele plătite, în cel mult 14 zile de la data la care ne-ai anunțat, prin aceeași metodă de plată, fără comision de procesare și fără taxă administrativă de anulare. Dacă ai cerut expres ca lecțiile să înceapă înainte să treacă cele 14 zile și te retragi după ce cursul a început, plătești doar lecțiile ținute până la data retragerii, proporțional cu prețul total al cursului. Pentru o grupă care începe în cele 14 zile, această cerere este necesară ca să intri în grupa respectivă: o faci bifând căsuța din formularul de înscriere, de la plată sau din Contul meu, ori scriindu-ne pe email sau pe WhatsApp. Dacă nu vrei, te poți înscrie la o grupă care începe mai târziu. După cele 14 zile se aplică regulile de anulare de mai jos.",
  en: "Legal right of withdrawal (14 days): if you signed up and paid online, you have the right to withdraw from the contract within 14 days of signing up, without giving a reason (Government Emergency Ordinance 34/2014). You tell us with the “Withdraw from the contract here” button in My account, or with a clear statement by email to marhaba@centruldearabalibaneza.com, and we confirm receipt by email, with the date and time. We refund everything you paid within 14 days of the day you told us, by the same payment method, with no processing fee and no administrative cancellation fee kept. If you expressly asked for lessons to begin before the 14 days were over and you withdraw after the course has started, you pay only for the lessons held up to the withdrawal date, in proportion to the total price of the course. For a group that starts within the 14 days, this request is needed to join that group: you make it by ticking the box in the sign-up form, at payment or in My account, or by writing to us by email or on WhatsApp. If you would rather not, you can sign up for a group that starts later. After the 14 days, the cancellation rules below apply.",
} as const;

/** The school, as section 9 of the Terms names it. */
export const TRADER = {
  name: "E-SERVICES TODAY S.R.L. (Centrul de Arabă Libaneză)",
  // As section 9 writes it, in both languages.
  address:
    "Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025",
  phone: "+40 763 124 514",
  email: "marhaba@centruldearabalibaneza.com",
} as const;

export const MODEL_WITHDRAWAL_FORM = {
  ro: {
    title: "Model de formular de retragere",
    note: "(prezentul formular se trimite înapoi completat doar dacă doriți să vă retrageți din contract)",
    lines: [
      `Către ${TRADER.name}, ${TRADER.address}, telefon ${TRADER.phone}, e-mail ${TRADER.email}:`,
      "Vă informez/vă informăm (*) prin prezenta cu privire la retragerea mea/noastră (*) din contractul referitor la vânzarea următoarelor bunuri (*)/prestarea următoarelor servicii (*)",
      "Comandate la data (*)/primite la data (*)",
      "Numele consumatorului (consumatorilor)",
      "Adresa consumatorului (consumatorilor)",
      "Semnătura consumatorului (consumatorilor) (doar în cazul în care acest formular este notificat pe hârtie)",
      "Data",
    ],
    footnote: "(*) A se elimina mențiunea inutilă, după caz.",
  },
  en: {
    title: "Model withdrawal form",
    note: "(complete and return this form only if you wish to withdraw from the contract)",
    lines: [
      `To ${TRADER.name}, ${TRADER.address}, Romania, phone ${TRADER.phone}, e-mail ${TRADER.email}:`,
      "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*),",
      "Ordered on (*)/received on (*),",
      "Name of consumer(s),",
      "Address of consumer(s),",
      "Signature of consumer(s) (only if this form is notified on paper),",
      "Date",
    ],
    footnote: "(*) Delete as appropriate.",
  },
} as const;

/** The line that introduces the form, in the email and in the Terms. */
export const MODEL_FORM_USE = {
  ro: "Poți folosi modelul de formular de retragere, dar nu este obligatoriu: orice declarație clară este suficientă.",
  en: "You may use the model withdrawal form, but you do not have to: any clear statement is enough.",
} as const;
