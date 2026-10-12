/**
 * The centre's Google Business Profile.
 *
 * Both links come from the profile itself (Share, and Ask for reviews), so
 * they point at the listing rather than at a search for the address.
 *
 * The listing is this one, and the id is the part worth writing down: the
 * `0x…:0x652fb90494e1566b` pair in the embed URL below is Google's own
 * identifier for the place, and its second half is the CID.
 *
 *   0x652fb90494e1566b = 7291249751064925803
 *
 * That matters because a `maps.app.goo.gl/…` share link is opaque — nothing
 * in it says which place it opens, so there is no way to check it short of
 * following it, and no way to tell a stale one from a good one. The profile
 * link is therefore written as the canonical CID URL instead: same listing,
 * and anyone can see that it is the same listing.
 *
 * The review link stays in Google's `g.page/r/<key>/review` form, which is
 * the only form that opens the review box directly. It is not opaque: the key
 * base64url-decodes to 09 6b 56 e1 94 04 b9 2f 65 10 13, whose eight bytes
 * after the leading tag are 0x652fb90494e1566b little-endian — the same CID.
 * Checked that way rather than by following it.
 */
export const GOOGLE_BUSINESS_CID = "7291249751064925803";
export const GOOGLE_MAPS_PROFILE_URL = `https://www.google.com/maps?cid=${GOOGLE_BUSINESS_CID}`;
export const GOOGLE_REVIEW_URL = "https://g.page/r/CWtW4ZQEuS9lEBM/review";

/**
 * The embed Google generates for the listing (Share → Embed a map). Unlike a
 * ?q=…&output=embed search, this URL is meant to be framed, so Google does not
 * refuse it, and it opens on the profile itself.
 */
export const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5696.331180464962!2d26.106999685277728!3d44.45027565070877!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1f9d660560841%3A0x652fb90494e1566b!2zQ2VudHJ1bCBkZSBBcmFiYSBMaWJhbmV6YSAoQXJhYmEgbGliYW5lemEgY3UgSWJyYSkgN2tpIGxlYm5lZW5lLSDYrdmD2Yog2YTYqNmG2KfZhtmK!5e0!3m2!1sen!2sro!4v1791385631673!5m2!1sen!2sro";
