"""Checks every price written in prose against src/lib/pricing.ts.

pricing.ts (display) and supabase/functions/_shared/prices.ts (what Stripe
charges) are already asserted equal by server-prices.test.ts. Nothing checked
that the sentences on the pages, in the FAQs and in the blog posts agree with
either — and those are the numbers a customer reads before they pay.
"""
import re, os, sys

# Derived exactly as pricing.ts does: online, and +40% rounded to nearest 10.
GROUP_ONLINE = {"A1": 500, "A2": 600, "B1": 700, "B2": 800, "C1": 900, "C2": 1000}
round10 = lambda n: round(n / 10) * 10
GROUP_PHYSICAL = {k: round10(v * 1.4) for k, v in GROUP_ONLINE.items()}
PRIVATE = 150
KIDS_GROUP = 500

VALID = (
    set(GROUP_ONLINE.values())
    | set(GROUP_PHYSICAL.values())
    | {PRIVATE, KIDS_GROUP, round10(PRIVATE * 1.4), round10(KIDS_GROUP * 1.4)}
)

print("Prices the code will actually charge:")
print(f"  group online   : {sorted(GROUP_ONLINE.values())}")
print(f"  group in-centre: {sorted(GROUP_PHYSICAL.values())}")
print(f"  private 1:1    : {PRIVATE} online / {round10(PRIVATE * 1.4)} in-centre")
print(f"  kids group     : {KIDS_GROUP} online / {round10(KIDS_GROUP * 1.4)} in-centre")
print(f"  => any lei figure in prose should be one of: {sorted(VALID)}\n")

SKIP_DIRS = {"node_modules", "dist", ".git"}
# "500 lei", "700 LEI/lună", "150 lei/lecție", "de la 500 lei"
PRICE_RE = re.compile(r"(\d{2,5})\s*(?:lei|LEI|RON)\b", re.I)

findings = []
for root, dirs, files in os.walk("src"):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in files:
        if not f.endswith((".ts", ".tsx")):
            continue
        path = os.path.join(root, f)
        # pricing.ts is the source; its own numbers are definitionally right.
        if path.endswith(("lib/pricing.ts", "audit/scan-prices.py")):
            continue
        for i, line in enumerate(open(path, encoding="utf-8"), 1):
            for m in PRICE_RE.finditer(line):
                val = int(m.group(1))
                if val in VALID:
                    continue
                findings.append((path, i, val, line.strip()[:120]))

print("=== LEI FIGURES IN PROSE THAT MATCH NO PRICE IN pricing.ts ===")
if not findings:
    print("  none")
for path, i, val, line in findings:
    print(f"  {path}:{i}  ({val} lei)")
    print(f"      {line}")

print(f"\n{'=' * 60}\nPRICE MISMATCHES: {len(findings)}")
sys.exit(0)
