import { lazy, Suspense, useState } from "react";
import type { UIMessage } from "ai";
import { MessageCircleQuestion, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COPY, loadMessages } from "@/components/ask/copy";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The course assistant — a floating panel on every page.
 *
 * One continuous conversation, kept in the visitor's own browser: no account,
 * no server-side transcript. The model is reached through /api/chat, which
 * holds the gateway key and the course facts.
 *
 * Only the button below is on every page. The chat arrives when someone asks
 * for it, because it brings the AI SDK, streamdown, shiki and mermaid with it —
 * around three megabytes that used to sit in the root route's module graph, so
 * the server parsed all of it before rendering any page.
 */
const AskChat = lazy(() => import("@/components/ask/AskChat"));

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
          <Suspense
            fallback={
              <p className="flex-1 px-4 py-6 text-sm text-muted-foreground">{copy.loading}</p>
            }
          >
            <AskChat initialMessages={initialMessages} lang={lang} />
          </Suspense>
        </div>
      )}
    </>
  );
};

export default AskAssistant;
