import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { RotateCcw } from "lucide-react";

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
import { COPY, MAX_STORED, STORAGE_KEY, textOf } from "@/components/ask/copy";

/**
 * The conversation itself: the transcript, the composer, and the markdown
 * renderer for an answer.
 *
 * Split out of AskAssistant so none of it — the AI SDK, streamdown, shiki,
 * mermaid — reaches a page until someone opens the panel. The root route
 * imported it, so every server render began by parsing all of it.
 */
export default function AskChat({ initialMessages, lang }: { initialMessages: UIMessage[]; lang: "ro" | "en" }) {
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
