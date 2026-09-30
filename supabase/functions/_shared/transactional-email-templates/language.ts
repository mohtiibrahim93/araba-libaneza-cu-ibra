/**
 * Language for a transactional email.
 *
 * The registrations row already carries `language` — the language the visitor
 * was reading the site in when they signed up. It was written on every row and
 * read by nothing: every confirmation template was Romanian-only, so someone
 * who enrolled in English, on a cohort taught in English, still received a
 * Romanian email.
 *
 * Templates stay single files rather than splitting into -ro/-en pairs. The
 * layout, the styles and the conditional sections are the hard part and are
 * identical in both languages; only the strings differ, and keeping them side
 * by side is what stops one language drifting from the other.
 *
 * Romanian is the fallback everywhere. An unknown value, a missing column, or
 * an older row with no language at all must not produce an English email for a
 * Romanian reader — Romanian is the site's primary language.
 */
export type EmailLanguage = 'ro' | 'en'

export const emailLanguage = (value: unknown): EmailLanguage =>
  String(value ?? '').toLowerCase() === 'en' ? 'en' : 'ro'

/** `t(lang)('Salut', 'Hello')` — Romanian first, matching the site's T() helper. */
export const translator = (lang: EmailLanguage) => (ro: string, en: string) => (lang === 'en' ? en : ro)
