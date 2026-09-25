import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { ASK_SYSTEM_PROMPT } from "@/lib/askKnowledge.server";

type ChatRequestBody = { messages?: unknown };

/**
 * The course assistant's only backend. The visitor's browser holds the
 * conversation and resends it here on every turn; nothing is stored server
 * side, and the gateway key never leaves this handler.
 */
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }
        // A marketing-site widget has no reason to carry a long transcript;
        // cap it so one visitor cannot push an unbounded prompt through.
        if (messages.length > 40) {
          return new Response("Conversation too long", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        // The SDK is loaded here rather than at the top of the file. Imported
        // normally, the provider and the AI SDK sat in the module graph the
        // worker parses before it can render *any* page — and a cold start
        // spent on this handler's dependencies is the first byte of a page that
        // never calls it. Warm requests already serve HTML as fast as a static
        // file; the slow ones are the isolate booting.
        const [{ createOpenAI }, { convertToModelMessages, streamText }] = await Promise.all([
          import("@ai-sdk/openai"),
          import("ai"),
        ]);

        const initialRunId = getLovableAiGatewayRunId(request);
        const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key, // satisfies the SDK; the gateway authenticates on the header
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });

        const result = streamText({
          model: lovable.responses("openai/gpt-6-astra"),
          system: ASK_SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              // The gateway is stateless: prior turns are resent as content,
              // never as item references.
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });

        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
          }),
          runIdFetch,
        );
      },
    },
  },
});
