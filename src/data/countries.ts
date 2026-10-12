/**
 * Countries for the phone input's prefix picker.
 *
 * Kept deliberately small: ISO code, English and Romanian name, dial code.
 * The flag emoji is derived from the ISO code, so it does not need storing.
 * PINNED_COUNTRIES come first in the picker (where our students actually
 * are); OTHER_COUNTRIES follow alphabetically by English name.
 */
export interface Country {
  /** ISO 3166-1 alpha-2 */
  iso: string;
  en: string;
  ro: string;
  /** Digits only, without the leading "+" */
  dial: string;
}

/** Regional-indicator flag emoji from a two-letter ISO code. */
export const flagEmoji = (iso: string) =>
  String.fromCodePoint(
    ...iso
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );

export const DEFAULT_COUNTRY: Country = {
  iso: "RO",
  en: "Romania",
  ro: "România",
  dial: "40",
};

export const PINNED_COUNTRIES: Country[] = [
  DEFAULT_COUNTRY,
  { iso: "LB", en: "Lebanon", ro: "Liban", dial: "961" },
  { iso: "MD", en: "Moldova", ro: "Republica Moldova", dial: "373" },
  { iso: "GB", en: "United Kingdom", ro: "Regatul Unit", dial: "44" },
  { iso: "DE", en: "Germany", ro: "Germania", dial: "49" },
  { iso: "FR", en: "France", ro: "Franța", dial: "33" },
  { iso: "IT", en: "Italy", ro: "Italia", dial: "39" },
  { iso: "ES", en: "Spain", ro: "Spania", dial: "34" },
  { iso: "US", en: "United States / Canada", ro: "SUA / Canada", dial: "1" },
  {
    iso: "AE",
    en: "United Arab Emirates",
    ro: "Emiratele Arabe Unite",
    dial: "971",
  },
];

const REST: Country[] = [
  { iso: "AF", en: "Afghanistan", ro: "Afganistan", dial: "93" },
  { iso: "AL", en: "Albania", ro: "Albania", dial: "355" },
  { iso: "DZ", en: "Algeria", ro: "Algeria", dial: "213" },
  { iso: "AD", en: "Andorra", ro: "Andorra", dial: "376" },
  { iso: "AO", en: "Angola", ro: "Angola", dial: "244" },
  { iso: "AR", en: "Argentina", ro: "Argentina", dial: "54" },
  { iso: "AM", en: "Armenia", ro: "Armenia", dial: "374" },
  { iso: "AU", en: "Australia", ro: "Australia", dial: "61" },
  { iso: "AT", en: "Austria", ro: "Austria", dial: "43" },
  { iso: "AZ", en: "Azerbaijan", ro: "Azerbaidjan", dial: "994" },
  { iso: "BH", en: "Bahrain", ro: "Bahrain", dial: "973" },
  { iso: "BD", en: "Bangladesh", ro: "Bangladesh", dial: "880" },
  { iso: "BY", en: "Belarus", ro: "Belarus", dial: "375" },
  { iso: "BE", en: "Belgium", ro: "Belgia", dial: "32" },
  { iso: "BJ", en: "Benin", ro: "Benin", dial: "229" },
  { iso: "BO", en: "Bolivia", ro: "Bolivia", dial: "591" },
  {
    iso: "BA",
    en: "Bosnia and Herzegovina",
    ro: "Bosnia și Herțegovina",
    dial: "387",
  },
  { iso: "BR", en: "Brazil", ro: "Brazilia", dial: "55" },
  { iso: "BG", en: "Bulgaria", ro: "Bulgaria", dial: "359" },
  { iso: "BF", en: "Burkina Faso", ro: "Burkina Faso", dial: "226" },
  { iso: "KH", en: "Cambodia", ro: "Cambodgia", dial: "855" },
  { iso: "CM", en: "Cameroon", ro: "Camerun", dial: "237" },
  { iso: "CA", en: "Canada", ro: "Canada", dial: "1" },
  { iso: "CL", en: "Chile", ro: "Chile", dial: "56" },
  { iso: "CN", en: "China", ro: "China", dial: "86" },
  { iso: "CO", en: "Colombia", ro: "Columbia", dial: "57" },
  { iso: "CR", en: "Costa Rica", ro: "Costa Rica", dial: "506" },
  { iso: "CI", en: "Côte d'Ivoire", ro: "Coasta de Fildeș", dial: "225" },
  { iso: "HR", en: "Croatia", ro: "Croația", dial: "385" },
  { iso: "CU", en: "Cuba", ro: "Cuba", dial: "53" },
  { iso: "CY", en: "Cyprus", ro: "Cipru", dial: "357" },
  { iso: "CZ", en: "Czechia", ro: "Cehia", dial: "420" },
  { iso: "CD", en: "DR Congo", ro: "Republica Democrată Congo", dial: "243" },
  { iso: "DK", en: "Denmark", ro: "Danemarca", dial: "45" },
  {
    iso: "DO",
    en: "Dominican Republic",
    ro: "Republica Dominicană",
    dial: "1",
  },
  { iso: "EC", en: "Ecuador", ro: "Ecuador", dial: "593" },
  { iso: "EG", en: "Egypt", ro: "Egipt", dial: "20" },
  { iso: "EE", en: "Estonia", ro: "Estonia", dial: "372" },
  { iso: "ET", en: "Ethiopia", ro: "Etiopia", dial: "251" },
  { iso: "FI", en: "Finland", ro: "Finlanda", dial: "358" },
  { iso: "GE", en: "Georgia", ro: "Georgia", dial: "995" },
  { iso: "GH", en: "Ghana", ro: "Ghana", dial: "233" },
  { iso: "GR", en: "Greece", ro: "Grecia", dial: "30" },
  { iso: "GT", en: "Guatemala", ro: "Guatemala", dial: "502" },
  { iso: "GN", en: "Guinea", ro: "Guineea", dial: "224" },
  { iso: "HN", en: "Honduras", ro: "Honduras", dial: "504" },
  { iso: "HK", en: "Hong Kong", ro: "Hong Kong", dial: "852" },
  { iso: "HU", en: "Hungary", ro: "Ungaria", dial: "36" },
  { iso: "IS", en: "Iceland", ro: "Islanda", dial: "354" },
  { iso: "IN", en: "India", ro: "India", dial: "91" },
  { iso: "ID", en: "Indonesia", ro: "Indonezia", dial: "62" },
  { iso: "IR", en: "Iran", ro: "Iran", dial: "98" },
  { iso: "IQ", en: "Iraq", ro: "Irak", dial: "964" },
  { iso: "IE", en: "Ireland", ro: "Irlanda", dial: "353" },
  { iso: "IL", en: "Israel", ro: "Israel", dial: "972" },
  { iso: "JM", en: "Jamaica", ro: "Jamaica", dial: "1" },
  { iso: "JP", en: "Japan", ro: "Japonia", dial: "81" },
  { iso: "JO", en: "Jordan", ro: "Iordania", dial: "962" },
  { iso: "KZ", en: "Kazakhstan", ro: "Kazahstan", dial: "7" },
  { iso: "KE", en: "Kenya", ro: "Kenya", dial: "254" },
  { iso: "XK", en: "Kosovo", ro: "Kosovo", dial: "383" },
  { iso: "KW", en: "Kuwait", ro: "Kuweit", dial: "965" },
  { iso: "KG", en: "Kyrgyzstan", ro: "Kârgâzstan", dial: "996" },
  { iso: "LV", en: "Latvia", ro: "Letonia", dial: "371" },
  { iso: "LY", en: "Libya", ro: "Libia", dial: "218" },
  { iso: "LI", en: "Liechtenstein", ro: "Liechtenstein", dial: "423" },
  { iso: "LT", en: "Lithuania", ro: "Lituania", dial: "370" },
  { iso: "LU", en: "Luxembourg", ro: "Luxemburg", dial: "352" },
  { iso: "MG", en: "Madagascar", ro: "Madagascar", dial: "261" },
  { iso: "MY", en: "Malaysia", ro: "Malaezia", dial: "60" },
  { iso: "ML", en: "Mali", ro: "Mali", dial: "223" },
  { iso: "MT", en: "Malta", ro: "Malta", dial: "356" },
  { iso: "MR", en: "Mauritania", ro: "Mauritania", dial: "222" },
  { iso: "MU", en: "Mauritius", ro: "Mauritius", dial: "230" },
  { iso: "MX", en: "Mexico", ro: "Mexic", dial: "52" },
  { iso: "MC", en: "Monaco", ro: "Monaco", dial: "377" },
  { iso: "MN", en: "Mongolia", ro: "Mongolia", dial: "976" },
  { iso: "ME", en: "Montenegro", ro: "Muntenegru", dial: "382" },
  { iso: "MA", en: "Morocco", ro: "Maroc", dial: "212" },
  { iso: "MZ", en: "Mozambique", ro: "Mozambic", dial: "258" },
  { iso: "NP", en: "Nepal", ro: "Nepal", dial: "977" },
  { iso: "NL", en: "Netherlands", ro: "Țările de Jos", dial: "31" },
  { iso: "NZ", en: "New Zealand", ro: "Noua Zeelandă", dial: "64" },
  { iso: "NI", en: "Nicaragua", ro: "Nicaragua", dial: "505" },
  { iso: "NE", en: "Niger", ro: "Niger", dial: "227" },
  { iso: "NG", en: "Nigeria", ro: "Nigeria", dial: "234" },
  { iso: "MK", en: "North Macedonia", ro: "Macedonia de Nord", dial: "389" },
  { iso: "NO", en: "Norway", ro: "Norvegia", dial: "47" },
  { iso: "OM", en: "Oman", ro: "Oman", dial: "968" },
  { iso: "PK", en: "Pakistan", ro: "Pakistan", dial: "92" },
  { iso: "PS", en: "Palestine", ro: "Palestina", dial: "970" },
  { iso: "PA", en: "Panama", ro: "Panama", dial: "507" },
  { iso: "PY", en: "Paraguay", ro: "Paraguay", dial: "595" },
  { iso: "PE", en: "Peru", ro: "Peru", dial: "51" },
  { iso: "PH", en: "Philippines", ro: "Filipine", dial: "63" },
  { iso: "PL", en: "Poland", ro: "Polonia", dial: "48" },
  { iso: "PT", en: "Portugal", ro: "Portugalia", dial: "351" },
  { iso: "QA", en: "Qatar", ro: "Qatar", dial: "974" },
  { iso: "RU", en: "Russia", ro: "Rusia", dial: "7" },
  { iso: "RW", en: "Rwanda", ro: "Rwanda", dial: "250" },
  { iso: "SM", en: "San Marino", ro: "San Marino", dial: "378" },
  { iso: "SA", en: "Saudi Arabia", ro: "Arabia Saudită", dial: "966" },
  { iso: "SN", en: "Senegal", ro: "Senegal", dial: "221" },
  { iso: "RS", en: "Serbia", ro: "Serbia", dial: "381" },
  { iso: "SG", en: "Singapore", ro: "Singapore", dial: "65" },
  { iso: "SK", en: "Slovakia", ro: "Slovacia", dial: "421" },
  { iso: "SI", en: "Slovenia", ro: "Slovenia", dial: "386" },
  { iso: "SO", en: "Somalia", ro: "Somalia", dial: "252" },
  { iso: "ZA", en: "South Africa", ro: "Africa de Sud", dial: "27" },
  { iso: "KR", en: "South Korea", ro: "Coreea de Sud", dial: "82" },
  { iso: "LK", en: "Sri Lanka", ro: "Sri Lanka", dial: "94" },
  { iso: "SD", en: "Sudan", ro: "Sudan", dial: "249" },
  { iso: "SE", en: "Sweden", ro: "Suedia", dial: "46" },
  { iso: "CH", en: "Switzerland", ro: "Elveția", dial: "41" },
  { iso: "SY", en: "Syria", ro: "Siria", dial: "963" },
  { iso: "TW", en: "Taiwan", ro: "Taiwan", dial: "886" },
  { iso: "TJ", en: "Tajikistan", ro: "Tadjikistan", dial: "992" },
  { iso: "TZ", en: "Tanzania", ro: "Tanzania", dial: "255" },
  { iso: "TH", en: "Thailand", ro: "Thailanda", dial: "66" },
  { iso: "TG", en: "Togo", ro: "Togo", dial: "228" },
  { iso: "TN", en: "Tunisia", ro: "Tunisia", dial: "216" },
  { iso: "TR", en: "Türkiye", ro: "Turcia", dial: "90" },
  { iso: "TM", en: "Turkmenistan", ro: "Turkmenistan", dial: "993" },
  { iso: "UG", en: "Uganda", ro: "Uganda", dial: "256" },
  { iso: "UA", en: "Ukraine", ro: "Ucraina", dial: "380" },
  { iso: "UY", en: "Uruguay", ro: "Uruguay", dial: "598" },
  { iso: "UZ", en: "Uzbekistan", ro: "Uzbekistan", dial: "998" },
  { iso: "VE", en: "Venezuela", ro: "Venezuela", dial: "58" },
  { iso: "VN", en: "Vietnam", ro: "Vietnam", dial: "84" },
  { iso: "YE", en: "Yemen", ro: "Yemen", dial: "967" },
  { iso: "ZM", en: "Zambia", ro: "Zambia", dial: "260" },
  { iso: "ZW", en: "Zimbabwe", ro: "Zimbabwe", dial: "263" },
];

export const OTHER_COUNTRIES: Country[] = [...REST].sort((a, b) =>
  a.en.localeCompare(b.en),
);

export const ALL_COUNTRIES: Country[] = [
  ...PINNED_COUNTRIES,
  ...OTHER_COUNTRIES,
];

/**
 * The country whose dial code is the longest prefix of `digits` (no "+").
 * Shared codes resolve to one country: +1 to the pinned US/Canada entry
 * (the first match), +7 to Russia rather than Kazakhstan.
 */
const SHARED_DIAL_PREFERENCE: Record<string, string> = { "7": "RU" };

export function countryForDigits(digits: string): Country | undefined {
  let best: Country | undefined;
  for (const c of ALL_COUNTRIES) {
    if (!digits.startsWith(c.dial)) continue;
    if (
      !best ||
      c.dial.length > best.dial.length ||
      SHARED_DIAL_PREFERENCE[c.dial] === c.iso
    )
      best = c;
  }
  return best;
}
