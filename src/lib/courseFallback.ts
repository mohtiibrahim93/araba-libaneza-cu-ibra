import { getCurriculum, type CurriculumLevel } from "@/data/curriculum";

// Bridges the new DB-backed course model to the existing per-level curriculum
// content in src/data/curriculum.ts. When a course row hasn't been filled in
// yet (no title / objectives / curriculum in the DB), the new course pages fall
// back to this so nothing shows up empty — the owner's DB edits override it.

export interface CourseFallback {
  title?: string;
  objective?: string;
  curriculum?: string;
  sessionCount?: number;
  totalHours?: number;
  schedule?: string[];
}

function buildCurriculumText(lvl: CurriculumLevel): string {
  const parts: string[] = [];
  if (lvl.items?.length) {
    parts.push(lvl.items.map((it, i) => `${i + 1}. ${it}`).join("\n"));
  }
  if (lvl.spokenCore) {
    parts.push(`${lvl.spokenCore.intro}\n` + lvl.spokenCore.items.map((it) => `• ${it}`).join("\n"));
  }
  if (lvl.writingStrand) {
    parts.push(`${lvl.writingStrand.intro}\n` + lvl.writingStrand.items.map((it) => `• ${it}`).join("\n"));
  }
  if (lvl.blocks?.length) {
    parts.push(lvl.blocks.map((b) => `${b.title}\n` + b.items.map((it) => `• ${it}`).join("\n")).join("\n\n"));
  }
  return parts.join("\n\n");
}

export function courseFallback(level: string | null | undefined, lang: "ro" | "en"): CourseFallback {
  if (!level) return {};
  const id = level.toLowerCase();
  const lvl = getCurriculum(lang).find((l) => l.id === id);
  if (!lvl) return {};
  return {
    title: lvl.title,
    objective: lvl.objective,
    curriculum: buildCurriculumText(lvl),
    sessionCount: lvl.lessons,
    totalHours: lvl.hours,
    ...(lvl.schedule !== undefined ? { schedule: lvl.schedule } : {}),
  };
}
