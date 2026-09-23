import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircleQuestion, X, RotateCcw } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The course assistant — a floating panel on every page.
 *
 * One continuous conversation, kept in the visitor's own browser: no account,
 * no server-side transcript. The model is reached through /api/chat, which
 * holds the gateway key and the course facts.
 */
const STORAGE_KEY = "ask-ibra-chat-v1";
const MAX_STORED = 40;

const COPY = {
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
function loadMessages(): UIMessage[] {
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

const textOf = (message: UIMessage): string =>
  message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();

function AskChat({ initialMessages, lang }: { initialMessages: UIMessage[]; lang: "ro" | "en" }) {
  const copy = COPY[lang];
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: "ask-ibra",
    messages: initialMessages,
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  // The transcript lives in this browser only.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      /* private mode or a full quota — the chat still works for this visit */
    }
  }, [messages]);

  // Keep the box ready to type in, on open and after each answer.
  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  const ask = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      void sendMessage({ text: trimmed });
    },
    [busy, sendMessage],
  );

  const clear = useCallback(() => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    textareaRef.current?.focus();
  }, [setMessages]);

  return (
    <>
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="gap-4 px-4 py-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              className="gap-4 px-0 py-6"
              title={copy.emptyTitle}
              description={copy.emptyDesc}
            >
              <div className="space-y-1 text-center">
                <h3 className="font-semibold text-sm">{copy.emptyTitle}</h3>
                <p className="text-muted-foreground text-sm">{copy.emptyDesc}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {copy.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => {
              const text = textOf(message);
              if (!text) return null;
              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.role === "assistant" ? (
                      <MessageResponse>{text}</MessageResponse>
                    ) : (
                      <span className="whitespace-pre-wrap">{text}</span>
                    )}
                  </MessageContent>
                </Message>
              );
            })
          )}

          {status === "submitted" && (
            <Shimmer className="text-sm">{copy.thinking}</Shimmer>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {copy.error}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border px-3 py-3">
        <PromptInput
          onSubmit={(message, event) => {
            event.preventDefault();
            ask(message.text);
          }}
        >
          <PromptInputTextarea ref={textareaRef} placeholder={copy.placeholder} />
          <PromptInputFooter className="justify-between">
            <button
              type="button"
              onClick={clear}
              disabled={messages.length === 0 || busy}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" />
              {copy.reset}
            </button>
            <PromptInputSubmit status={status} disabled={busy} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">{copy.disclaimer}</p>
      </div>
    </>
  );
}

const AskAssistant = () => {
  const { lang } = useI18n();
  const copy = COPY[lang];
  const [open, setOpen] = useState(false);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);

  const openPanel = () => {
    // Read the saved conversation at open time: the server HTML never contains it.
    if (initialMessages === null) setInitialMessages(loadMessages());
    setOpen(true);
  };

  return (
    <>
      {!open && (
        <Button
          type="button"
          onClick={openPanel}
          aria-label={copy.open}
          className="fixed bottom-5 left-5 z-40 h-12 gap-2 rounded-full pl-4 pr-5 shadow-lg"
        >
          <MessageCircleQuestion className="size-5" />
          <span className="hidden text-sm sm:inline">{copy.open}</span>
        </Button>
      )}

      {open && initialMessages !== null && (
        <div
          className={cn(
            "fixed z-40 flex flex-col overflow-hidden border border-border bg-background shadow-2xl",
            "inset-x-3 bottom-3 max-h-[80vh] rounded-2xl",
            "sm:inset-x-auto sm:bottom-5 sm:left-5 sm:h-[560px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[400px]",
          )}
          role="dialog"
          aria-label={copy.title}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{copy.title}</p>
              <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={copy.close}
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <AskChat initialMessages={initialMessages} lang={lang} />
        </div>
      )}
    </>
  );
};

export default AskAssistant;
