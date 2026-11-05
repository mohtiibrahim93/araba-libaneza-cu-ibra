import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const LEVELS = [
  {
    id: "a1",
    title: "A1 — Beginner (Survival)",
    lessons: 32,
    hours: 48,
    track: "Spoken",
    schedule:
      "In person at Strada Icoanei 80: Monday 19:00 and Wednesday 18:30, 32 lessons. If everything goes as planned, lesson 32 is on Monday 21 December 2026. Online: Saturday 12:00–13:30 and Sunday 17:30–19:00, 32 lessons. If everything goes as planned, lesson 32 is on Sunday 20 December 2026. Both dates are estimates: holidays and other events may push them later. Live progress is on the level page, under Groups in progress (Grupe în desfășurare) at /cursuri/grup/a1: if lesson 16 is done, it shows 16 of 32.",
  },
  {
    id: "a2",
    title: "A2 — Elementary",
    lessons: 56,
    hours: 84,
    track: "Spoken",
    schedule:
      "In person at Strada Icoanei 80: Tuesday and Thursday at 19:00, 56 lessons (7 months). If everything goes as planned, lesson 56 is on Tuesday 16 March 2027. That date is an estimate: holidays and other events may push it later. Live progress is on the level page, under Groups in progress (Grupe în desfășurare) at /cursuri/grup/a2: if lesson 18 is done, it shows 18 of 56.",
  },
  {
    id: "b1",
    title: "B1 — Intermediate",
    lessons: 72,
    hours: 108,
    track:
      "Spoken · optional Arabic-script writing if the whole group wants it",
    schedule:
      "~9 months (72 lessons) · opens after A2. No group is running yet, so there is no end date. Once it starts, live progress is on the level page under Groups in progress.",
  },
  {
    id: "b2",
    title: "B2 — Upper-Intermediate",
    lessons: 72,
    hours: 108,
    track:
      "Spoken · optional Arabic-script writing if the whole group wants it",
    schedule:
      "~9 months (72 lessons) · opens after B1. No group is running yet, so there is no end date. Once it starts, live progress is on the level page under Groups in progress.",
  },
  {
    id: "c1",
    title: "C1 — Advanced",
    lessons: 72,
    hours: 108,
    track: "Spoken + Written",
    schedule: "~9 months (72 lessons) · opens after B2. No group is running yet, so there is no end date. Once it starts, live progress is on the level page under Groups in progress.",
  },
  {
    id: "c2",
    title: "C2 — Mastery",
    lessons: 72,
    hours: 108,
    track: "Thematic modules",
    schedule: "~9 months (72 lessons) · opens after C1. No group is running yet, so there is no end date. Once it starts, live progress is on the level page under Groups in progress.",
  },
];

export default defineTool({
  name: "list_curriculum_levels",
  title: "List CEFR curriculum levels",
  description:
    "List the six CEFR levels (A1–C2) offered for Lebanese Arabic, with lesson counts, hours, and track focus.",
  inputSchema: {},
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(LEVELS, null, 2) }],
    structuredContent: { levels: LEVELS },
  }),
});
