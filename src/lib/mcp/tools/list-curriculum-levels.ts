import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const LEVELS = [
  { id: "a1", title: "A1 — Beginner (Survival)", lessons: 30, hours: 45, track: "Spoken" },
  { id: "a2", title: "A2 — Elementary", lessons: 30, hours: 45, track: "Spoken" },
  { id: "b1", title: "B1 — Intermediate", lessons: 30, hours: 45, track: "Spoken" },
  { id: "b2", title: "B2 — Upper-Intermediate", lessons: 30, hours: 45, track: "Spoken" },
  { id: "c1", title: "C1 — Advanced", lessons: 30, hours: 45, track: "Spoken + Written" },
  { id: "c2", title: "C2 — Mastery", lessons: 30, hours: 45, track: "Thematic modules" },
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