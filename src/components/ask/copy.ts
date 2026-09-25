import type { UIMessage } from "ai";

/**
 * The assistant's text, and the transcript kept in the visitor's browser.
 *
 * Its own module because src/components/AskAssistant.tsx loads the chat itself
 * only when someone opens it. Importing any value from the chat module would
 * pull streamdown, mermaid, shiki and the AI SDK back into every page — about
 * three megabytes the server parses on each cold start, which is what made the
 * first byte slow. A type import costs nothing at runtime, so UIMessage stays.
 */
export const STORAGE_KEY = "ask-ibra-chat-v1";
export const MAX_STORED = 40;

export const COPY = {
  ro: {
    open: "Întreabă despre cursuri",
    title: "Întrebări despre cursuri",
    subtitle: "Răspunsuri automate, pe baza informațiilor din site.",
    close: "Închide",
    reset: "Conversație nouă",
    emptyTitle: "Ce vrei să afli?",
    emptyDesc: "Prețuri, niveluri, orar, cursuri pentru copii sau lecția de probă.",
    placeholder: "Scrie întrebarea ta…",
    thinking: "Se gândește…",
    loading: "Se încarcă…",
    error: "Nu am putut răspunde acum. Încearcă din nou în câteva momente sau scrie-ne pe WhatsApp.",
    disclaimer: "Asistent automat. Pentru confirmări, vorbește cu Ibrahim.",
    suggestions: [
      "Cât costă cursul de grup?",
      "Ce nivel mi se potrivește?",
      "Aveți cursuri pentru copii?",
    ],
  },
  en: {
    open: "Ask about the courses",
    title: "Questions about the courses",
    subtitle: "Automatic answers, based on the information on this site.",
    close: "Close",
    reset: "New conversation",
    emptyTitle: "What would you like to know?",
    emptyDesc: "Prices, levels, schedule, kids' courses or the free trial lesson.",
    placeholder: "Type your question…",
    thinking: "Thinking…",
    loading: "Loading…",
    error: "I couldn't answer just now. Try again in a moment, or message us on WhatsApp.",
    disclaimer: "Automated assistant. For confirmations, talk to Ibrahim.",
    suggestions: [
      "How much is the group course?",
      "Which level suits me?",
      "Do you teach children?",
    ],
  },
} as const;

/** Read the saved conversation. Only ever called from the browser. */
export function loadMessages(): UIMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is UIMessage =>
        typeof m === "object" && m !== null && "role" in m && "parts" in m,
    );
  } catch {
    return [];
  }
}

export const textOf = (message: UIMessage): string =>
  message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
