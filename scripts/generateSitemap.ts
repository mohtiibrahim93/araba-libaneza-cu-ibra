/**
 * Writes public/sitemap.xml. The content is built by src/lib/sitemap.ts; this
 * script exists so the build can regenerate the file, and so importing the
 * builder (in tests) never has the side effect of writing it.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildSitemap } from "../src/lib/sitemap";

const xml = buildSitemap();
writeFileSync(resolve(process.cwd(), "public/sitemap.xml"), xml, "utf8");
console.log(`[sitemap] wrote ${(xml.match(/<loc>/g) || []).length} URLs`);
