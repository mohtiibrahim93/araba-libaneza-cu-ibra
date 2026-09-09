"""Finds pages that are trying to rank for the same thing.

Search Console showed 78 page-appearances across just 10 Romanian commercial
queries — 7.8 pages per query. "cursuri adolescenti araba" pulls in 13 different
URLs, including /privacy. When a site offers Google that many near-identical
candidates it usually picks none of them confidently and falls back to the
homepage, which is what happens here: the homepage takes 312 impressions for
"meditatii araba" at position 26 while the page built for that query sits at
position 14 with 163.

This is the offline half of that diagnosis. It reads the built HTML and groups
pages by the keyword signature of their <title> and <h1>. Pages sharing a
signature are competing with each other, and the fix is editorial — one page per
intent — not technical.

Run after `npm run build`.
"""
import os, re, sys
from collections import defaultdict

DIST = "dist"
# Words that carry no distinguishing intent: every page here is about Arabic.
STOP = {
    "de", "in", "la", "si", "cu", "pentru", "din", "un", "o", "a", "al", "ale",
    "araba", "arabă", "arabic", "limba", "libaneza", "libaneză", "lebanese",
    "ibra", "centrul", "and", "the", "for", "with", "your", "you",
    "online", "bucuresti", "bucurești", "bucharest", "native", "profesor",
    "nativ", "teacher", "gratuita", "gratuită", "free", "curs", "cursuri",
    "course", "courses", "lectii", "lecții", "lessons", "2026",
}
norm = lambda s: re.sub(r"[^a-z0-9ăâîșț ]", " ", s.lower())

pages = {}
for dp, _d, fs in os.walk(DIST):
    if "index.html" not in fs:
        continue
    rel = os.path.relpath(dp, DIST)
    route = "/" if rel == "." else "/" + rel.replace(os.sep, "/")
    html = open(os.path.join(dp, "index.html"), encoding="utf-8").read()
    head = html[: html.find("</head>")]
    if "noindex" in head:
        continue
    # A retired alias carries a canonical pointing at its replacement. It is
    # meant to look identical — that is the whole point — so it is not an
    # overlap to fix. scan-site.py excludes them the same way.
    canon = re.search(r'rel="canonical" href="([^"]*)"', head)
    if canon:
        target = canon.group(1).replace("https://centruldearabalibaneza.com", "") or "/"
        if target.rstrip("/") != (route.rstrip("/") or "/"):
            continue
    title = (re.search(r"<title>(.*?)</title>", html) or [None, ""])[1]
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    h1 = re.sub(r"<[^>]+>", " ", h1.group(1)) if h1 else ""
    words = [w for w in norm(f"{title} {h1}").split() if w and w not in STOP and len(w) > 2]
    # An hreflang twin is the same page in another language. It is supposed to
    # say the same thing, and hreflang is what tells Google these are variants
    # rather than rivals — so a RO/EN pair is not a competing-pages problem.
    # Without this, any pair whose keywords survive translation ("private",
    # "A1") reads as a duplicate. Keyed by the pair so each is grouped once.
    alts = sorted(
        m.replace("https://centruldearabalibaneza.com", "") or "/"
        for m in re.findall(r'rel="alternate" hreflang="(?:ro|en)" href="([^"]*)"', head)
    )
    pages[route] = {"title": title.strip(), "sig": frozenset(words), "pair": tuple(alts)}

groups = defaultdict(list)
seen_pairs = set()
for route, p in pages.items():
    if not p["sig"]:
        continue
    if p["pair"]:
        if p["pair"] in seen_pairs:
            continue
        seen_pairs.add(p["pair"])
    groups[p["sig"]].append(route)

print(f"indexable pages examined: {len(pages)}\n")
print("=== PAGES WITH AN IDENTICAL TITLE/H1 KEYWORD SIGNATURE ===")
dupes = {k: v for k, v in groups.items() if len(v) > 1}
if not dupes:
    print("  none")
for sig, routes in sorted(dupes.items(), key=lambda kv: -len(kv[1])):
    print(f"  [{', '.join(sorted(sig))}]")
    for r in sorted(routes):
        print(f"      {r:<40} {pages[r]['title'][:58]}")

# Near-overlap: signatures sharing most of their words.
print("\n=== PAGES WHOSE SIGNATURES OVERLAP HEAVILY (Jaccard > 0.6) ===")
items = [(r, p["sig"]) for r, p in pages.items() if len(p["sig"]) >= 2]
near = []
for i, (r1, s1) in enumerate(items):
    for r2, s2 in items[i + 1 :]:
        if not s1 or not s2:
            continue
        j = len(s1 & s2) / len(s1 | s2)
        if j > 0.6 and groups[s1] != groups[s2]:
            near.append((round(j, 2), r1, r2))
if not near:
    print("  none")
for j, r1, r2 in sorted(near, reverse=True)[:20]:
    print(f"  {j}  {r1}  ~  {r2}")

issues = sum(len(v) - 1 for v in dupes.values()) + len(near)
print(f"\n{'=' * 60}\nOVERLAPPING PAGES: {issues}")
