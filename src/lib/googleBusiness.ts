/**
 * The centre's Google Business Profile.
 *
 * Both links come from the profile itself (Share, and Ask for reviews), so
 * they point at the listing rather than at a search for the address.
 */
export const GOOGLE_MAPS_PROFILE_URL = "https://maps.app.goo.gl/2ZCZZjv3Tu8q3wKU9";
export const GOOGLE_REVIEW_URL = "https://g.page/r/CWtW4ZQEuS9lEBM/review";

/**
 * Keyless embed, searched by the business name and street so Google can match
 * the pin to the profile rather than to the venue that hosts the lessons.
 */
export const GOOGLE_MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  "Centrul de Arabă Libaneză, Strada Icoanei 80, București",
)}&output=embed`;
