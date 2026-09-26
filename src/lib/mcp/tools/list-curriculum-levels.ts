import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const LEVELS = [
  { id: "a1", title: "A1 — Beginner (Survival)", lessons: 32, hours: 48, track: "Spoken", schedule: "In person: Mon & Wed 19:00–20:30 group, 2 Sep – 21 Dec 2026 (32 lessons), Strada Icoanei 80 · in progress · Online: the Sat 12:00–13:30 / Sun 17:30–19:00 group is in progress and full; new online groups taught in Romanian and in English, max 6 each, are open for registration — dates on /cursuri/grup/a1" },
  { id: "a2", title: "A2 — Elementary", lessons: 54, hours: 81, track: "Spoken", schedule: "In person: Tue & Thu 19:00–20:30, 1 Sep 2026 – 4 Mar 2027 (54 lessons), Strada Icoanei 80 · runs in parallel with A1 · in progress" },
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