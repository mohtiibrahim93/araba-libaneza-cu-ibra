"""Navigation and link-quality audit of the built site.

Complements scan-site.py: that one looks for duplicates and sitemap drift, this
one looks at whether a visitor can actually get anywhere — click depth from the
homepage, dead anchors, links with no readable label, and menu coverage.
"""
import re, os
from collections import deque, defaultdict

DIST, BASE = "dist", "https://centruldearabalibaneza.com"
norm = lambda r: (r.split("#")[0].split("?")[0].rstrip("/") or "/")

pages = {}
for dp, _d, fs in os.walk(DIST):
    if "index.html" not in fs:
        continue
    rel = os.path.relpath(dp, DIST)
    route = "/" if rel == "." else "/" + rel.replace(os.sep, "/")
    html = open(os.path.join(dp, "index.html"), encoding="utf-8").read()
    head, body = html[: html.find("</head>")], html[html.find("<body") :]
    pages[route] = {
        "noindex": "noindex" in head,
        "canonical": (re.search(r'rel="canonical" href="(.*?)"', head) or [None, None])[1]
        if re.search(r'rel="canonical" href="(.*?)"', head) else None,
        "html": body,
        "ids": set(re.findall(r'id="([^"]+)"', body)),
        "links": re.findall(r'<a\b([^>]*)>(.*?)</a>', body, flags=re.S),
    }

alias = lambda r: pages[r]["canonical"] and (pages[r]["canonical"].replace(BASE, "") or "/") != r
real = [r for r in pages if not pages[r]["noindex"] and not alias(r)]
issues = 0

def href(attrs):
    m = re.search(r'href="([^"]*)"', attrs)
    return m.group(1) if m else None

# --- click depth from the homepage ---------------------------------------
graph = defaultdict(set)
for r, p in pages.items():
    for attrs, _txt in p["links"]:
        h = href(attrs)
        if h and h.startswith("/") and not h.startswith("//"):
            graph[r].add(norm(h))

depth, q = {"/": 0}, deque(["/"])
routed = {norm(r): r for r in pages}
while q:
    cur = q.popleft()
    for nxt in graph.get(routed.get(norm(cur), cur), ()):
        tgt = routed.get(nxt)
        if tgt and tgt not in depth:
            depth[tgt] = depth[cur] + 1
            q.append(tgt)

print("=== CLICK DEPTH FROM THE HOMEPAGE (indexable pages) ===")
by_depth = defaultdict(list)
for r in real:
    by_depth[depth.get(r, 99)].append(r)
for d in sorted(by_depth):
    label = "unreachable" if d == 99 else f"{d} click{'s' if d != 1 else ''}"
    print(f"  {label:>12}: {len(by_depth[d])} page(s)")
    if d >= 3:
        issues += len(by_depth[d])
        for r in sorted(by_depth[d]):
            print(f"                {r}")

# --- menu coverage --------------------------------------------------------
nav = pages["/"]["html"]
header = nav[: nav.find("</header>")] if "</header>" in nav else ""
footer = nav[nav.rfind("<footer") :] if "<footer" in nav else ""
in_menu = {norm(h) for h in re.findall(r'href="(/[^"#?]*)"', header + footer)}
print("\n=== INDEXABLE PAGES NOT LINKED FROM THE HEADER OR FOOTER ===")
missing = sorted(r for r in real if norm(r) not in in_menu)
print(f"  {len(missing)} of {len(real)} (reachable via in-page links instead)")
for r in missing[:12]:
    print(f"    {r}  (depth {depth.get(r, '—')})")
if len(missing) > 12:
    print(f"    … and {len(missing) - 12} more")

# --- dead anchors ---------------------------------------------------------
print("\n=== ANCHOR LINKS POINTING AT AN ID THAT DOES NOT EXIST ===")
dead = []
for r, p in pages.items():
    for attrs, _txt in p["links"]:
        h = href(attrs)
        if not h or "#" not in h:
            continue
        frag = h.split("#", 1)[1]
        if not frag:
            continue
        target = routed.get(norm(h)) if h.startswith("/") else r
        if target and frag not in pages[target]["ids"]:
            dead.append((r, h))
if not dead:
    print("  none")
for r, h in dead[:15]:
    issues += 1
    print(f"  {r} -> {h}")

# --- links with no readable label ----------------------------------------
print("\n=== LINKS WITH NO READABLE LABEL (no text, no aria-label, no title) ===")
bare = []
for r, p in pages.items():
    if pages[r]["noindex"]:
        continue
    for attrs, txt in p["links"]:
        label = re.sub(r"<[^>]+>", "", txt).strip()
        if label or 'aria-label' in attrs or 'title=' in attrs:
            continue
        bare.append((r, (href(attrs) or "?")))
if not bare:
    print("  none")
seen = set()
for r, h in bare:
    if h in seen:
        continue
    seen.add(h)
    issues += 1
    print(f"  {r} -> {h}")

print(f"\n{'=' * 60}\nSTRUCTURE ISSUES: {issues}")
