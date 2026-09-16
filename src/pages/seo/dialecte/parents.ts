/**
 * The trail every dialect comparison sits at the end of.
 *
 * The hierarchy is deliberate: "ce arabă să înveți" is the decision page,
 * "dialectele arabe" is the survey underneath it, and each comparison is a
 * leaf of that survey. Declared once so the six pages cannot drift apart.
 */
export const DIALECT_PARENTS = [
  { name: "Ce arabă să înveți", href: "/ce-araba-sa-inveti" },
  { name: "Dialectele arabe", href: "/dialecte-arabe" },
];
