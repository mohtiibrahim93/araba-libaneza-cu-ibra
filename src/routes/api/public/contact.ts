import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Contact form endpoint. Until now the form only wrote a row to
 * contact_messages, so a message sat in the database until someone opened the
 * admin panel. This route keeps that record and also emails the school inbox
 * with the visitor's address as Reply-To, so answering happens from the phone.
 */
const requestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
  language: z.enum(["ro", "en"]).default("ro"),
  gdpr: z.literal(true),
});

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(bytes).toString("hex");
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "invalid request" }, { status: 400 });

        const { name, email, phone, message, language } = parsed.data;
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Same abuse guard the table trigger applied for direct inserts: five
        // messages per hour per connection, and three per email address.
        const [ipBucket, emailBucket] = await Promise.all([digest(ip), digest(email.toLowerCase())]);
        const [ipLimit, emailLimit] = await Promise.all([
          supabaseAdmin.rpc("check_and_record_rate_limit", {
            p_bucket: `contact_form_ip:${ipBucket}`,
            p_max: 5,
            p_window_seconds: 3600,
          }),
          supabaseAdmin.rpc("check_and_record_rate_limit", {
            p_bucket: `contact_form_email:${emailBucket}`,
            p_max: 3,
            p_window_seconds: 3600,
          }),
        ]);
        if (ipLimit.error || emailLimit.error) {
          console.error("[contact] rate limit check failed", ipLimit.error ?? emailLimit.error);
          return Response.json({ error: "service unavailable" }, { status: 503 });
        }
        if (!ipLimit.data || !emailLimit.data) {
          return Response.json({ error: "too many requests" }, { status: 429 });
        }

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("contact_messages")
          .insert({
            name,
            email,
            phone: phone ? phone : null,
            message,
            language,
            source: "contact_page",
          })
          .select("id")
          .single();

        if (insertError || !inserted) {
          console.error("[contact] insert failed", insertError);
          return Response.json({ error: "service unavailable" }, { status: 503 });
        }

        // The message is safely stored; a mail failure must not lose it.
        try {
          const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
          await sendTemplateEmail("admin-contact-message", "", {
            templateData: { name, email, phone: phone || undefined, language, message },
            idempotencyKey: `contact-msg-${inserted.id}`,
            replyTo: email,
          });
        } catch (error) {
          console.error("[contact] notification email failed", error);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
