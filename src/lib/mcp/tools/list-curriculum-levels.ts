import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const LEVELS = [
  { id: "a1", title: "A1 — Beginner (Survival)", lessons: 26, hours: 39, track: "Spoken", schedule: "Mondays & Wednesdays · 10 Aug – 4 Nov 2026 (~3 months) · enrollment open, limited spots" },
  { id: "a2", title: "A2 — Elementary", lessons: 54, hours: 81, track: "Spoken", schedule: "Tuesdays & Thursdays · 11 Aug 2026 – 11 Feb 2027 (~6 months) · runs in parallel with A1 · enrollment open, limited spots" },
  { id: "b1", title: "B1 — Intermediate", lessons: 70, hours: 105, track: "Spoken", schedule: "~8 months · opens after A2 — future enrollment" },
  { id: "b2", title: "B2 — Upper-Intermediate", lessons: 70, hours: 105, track: "Spoken", schedule: "~8–9 months · opens after B1 — future enrollment" },
  { id: "c1", title: "C1 — Advanced", lessons: 70, hours: 105, track: "Spoken + Written", schedule: "~10 months · opens after B2 — future enrollment" },
  { id: "c2", title: "C2 — Mastery", lessons: 80, hours: 120, track: "Thematic modules", schedule: "~10 months · opens after C1 — future enrollment" },
];

export default defineTool({
  name: "list_curriculum_levels",
  title: "List CEFR curriculum levels",
  description:
    "List the six CEFR levels (A1–C2) offered for Lebanese Arabic, with lesson counts, hours, and track focus.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(LEVELS, null, 2) }],
    structuredContent: { levels: LEVELS },
  }),
});