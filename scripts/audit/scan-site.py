"""Full-site scan of the built output: duplicates, broken internal links,
orphans, thin pages, head hygiene."""
import re, os, itertools
from collections import defaultdict

DIST, BASE = "dist", "https://centruldearabalibaneza.com"

pages = {}
for dirpath, _d, files in os.walk(DIST):
    if "index.html" not in files:
        continue
    rel = os.path.relpath(dirpath, DIST)
    route = "/" if rel == "." else "/" + rel.replace(os.sep, "/")
    html = open(os.path.join(dirpath, "index.html"), encoding="utf-8").read()
    head, body = html[:html.find("</head>")], html[html.find("<body"):]
    txt = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", body, flags=re.S)
    words = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", txt)).strip().lower().split()
    g = lambda p: (re.search(p, head).group(1).strip() if re.search(p, head) else None)
    pages[route] = {
        "title": g(r"<title>(.*?)</title>"),
        "desc": g(r'name="description" content="(.*?)"'),
        "canonical": g(r'rel="canonical" href="(.*?)"'),
        "noindex": "noindex" in head,
        "h1": [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h)).strip()
               for h in re.findall(r"<h1[^>]*>(.*?)</h1>", body, flags=re.S)],
        "nwords": len(words),
        "words": words,
        "links": sorted({l.split("#")[0].split("?")[0].rstrip("/") or "/"
                         for l in re.findall(r'href="(/[^"]*)"', body)}),
    }

sm = open("public/sitemap.xml", encoding="utf-8").read()
sitemap = {u.replace(BASE, "") or "/" for u in re.findall(r"<loc>(.*?)</loc>", sm)}
routed = set(pages)
norm = lambda r: r.rstrip("/") or "/"
routed_n = {norm(r) for r in routed}

print(f"routes built: {len(pages)} | sitemap: {len(sitemap)}\n")
issues = 0

def section(name):
    print(f"\n=== {name} ===")

section("BROKEN INTERNAL LINKS (href to a path with no built page)")
KNOWN_NON_PAGE = {"/sitemap.xml", "/robots.txt", "/llms.txt"}
bad = defaultdict(list)
for r, p in pages.items():
    for l in p["links"]:
        if l.startswith("//") or l in KNOWN_NON_PAGE or "." in l.rsplit("/", 1)[-1]:
            continue
        if norm(l) not in routed_n:
            bad[l].append(r)
if not bad:
    print("  none")
for l, srcs in sorted(bad.items()):
    issues += 1
    print(f"  {l}  <- linked from {len(srcs)}: {', '.join(sorted(srcs)[:4])}")

section("PAGES WITH NO <h1> OR MORE THAN ONE")
odd = {r: p["h1"] for r, p in pages.items() if len(p["h1"]) != 1}
alias = lambda r: pages[r]["canonical"] and (pages[r]["canonical"].replace(BASE, "") or "/") != r
for r, h in sorted(odd.items()):
    tag = " (alias/redirect — expected)" if alias(r) else ""
    if not tag:
        issues += 1
    print(f"  {r}: {len(h)} h1{tag}")
if not odd:
    print("  none")

section("THIN INDEXABLE PAGES (<250 words, not an alias)")
thin = {r: p["nwords"] for r, p in pages.items()
        if p["nwords"] < 250 and not p["noindex"] and not alias(r)}
if not thin:
    print("  none")
for r, n in sorted(thin.items(), key=lambda x: x[1]):
    issues += 1
    print(f"  {r}: {n} words")

section("DUPLICATE TITLE / DESCRIPTION AMONG INDEXABLE PAGES")
for field in ("title", "desc"):
    d = defaultdict(list)
    for r, p in pages.items():
        if p[field] and not p["noindex"] and not alias(r):
            d[p[field]].append(r)
    for v, rs in sorted(d.items()):
        if len(rs) > 1:
            issues += 1
            print(f"  {field}: {v[:60]!r} -> {', '.join(rs)}")
print("  (aliases excluded — sharing their target's metadata is correct)")

section("DUPLICATE <h1> AMONG INDEXABLE PAGES")
d = defaultdict(list)
for r, p in pages.items():
    if not p["noindex"] and not alias(r):
        for h in p["h1"]:
            d[h].append(r)
found = False
for v, rs in sorted(d.items()):
    if len(rs) > 1 and v:
        issues += 1; found = True
        print(f"  {v[:60]!r} -> {', '.join(rs)}")
if not found:
    print("  none")

section("NEAR-DUPLICATE BODIES (Jaccard 5-shingle > 0.55)")
# Only indexable pages matter here. Two short noindex pages look similar
# simply because the shared nav and footer dominate their word count.
sh = {r: {" ".join(p["words"][i:i+5]) for i in range(max(0, p["nwords"]-4))}
      for r, p in pages.items()
      if p["nwords"] >= 120 and not p["noindex"] and not alias(r)}
found = False
for a, b in itertools.combinations(sorted(sh), 2):
    if not sh[a] or not sh[b]:
        continue
    j = len(sh[a] & sh[b]) / len(sh[a] | sh[b])
    if j > 0.55:
        issues += 1; found = True
        print(f"  {j:.2f}  {a} <-> {b}")
if not found:
    print("  none")

section("ORPHANS (indexable, in sitemap, but nothing links to them)")
inbound = defaultdict(set)
for r, p in pages.items():
    for l in p["links"]:
        inbound[norm(l)].add(r)
orph = [r for r in sorted(sitemap)
        if norm(r) in routed_n and not (inbound[norm(r)] - {r})]
if not orph:
    print("  none")
for r in orph:
    issues += 1
    print(f"  {r}")

section("SITEMAP CONSISTENCY")
for label, val in [
    ("in sitemap, not built", sorted(sitemap - routed)),
    ("indexable, built, not in sitemap", sorted(r for r in routed - sitemap
                                                if not pages[r]["noindex"] and not alias(r))),
    ("noindex pages listed in sitemap", sorted(r for r in sitemap & routed if pages[r]["noindex"])),
    ("sitemap URLs canonicalised elsewhere", sorted(r for r in sitemap & routed if alias(r))),
]:
    if val:
        issues += 1
    print(f"  {label}: {val or 'none'}")

print(f"\n{'=' * 60}\nTOTAL ISSUES: {issues}")
