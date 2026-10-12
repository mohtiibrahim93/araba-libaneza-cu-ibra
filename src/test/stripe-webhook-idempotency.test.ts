import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A webhook event that fails is retried, not forgotten.
 *
 * stripe-webhook writes the event id to stripe_events before processing, so a
 * redelivery of an event that already went through is skipped. But the row
 * used to stay even when processing threw: the handler answered 500, Stripe
 * retried, the retry found the id and answered 200 "duplicate", and the event
 * was never processed — a paid registration left unpaid, with nothing to say so.
 *
 * Now the id is a claim that is released when processing fails. Source
 * assertions, like the other webhook tests: the function runs on Deno against
 * live Stripe, and deleting the release would fail silently.
 */
const webhook = readFileSync(resolve(process.cwd(), "supabase/functions/stripe-webhook/index.ts"), "utf8");

describe("stripe-webhook idempotency", () => {
  it("still skips an event that was already processed", () => {
    expect(webhook).toContain("ignoreDuplicates: true");
    expect(webhook).toContain("duplicate: true");
  });

  it("releases the claim when processing fails, so Stripe's retry is processed", () => {
    const catchStart = webhook.lastIndexOf("} catch (err) {");
    expect(catchStart).toBeGreaterThan(-1);
    const handler = webhook.slice(catchStart);
    expect(handler).toMatch(/if \(claimed\)[\s\S]*from\("stripe_events"\)\.delete\(\)\.eq\("id", event\.id\)/);
    // Released before answering 500, which is what makes Stripe retry.
    expect(handler.indexOf('from("stripe_events").delete()')).toBeLessThan(handler.indexOf("status: 500"));
  });

  it("only releases a claim this delivery made", () => {
    expect(webhook).toContain("claimed = !logErr;");
  });
});
