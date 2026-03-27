import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WHATSAPP_NUMBER = "40763124514";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, email, form_type, center, format, notes } = await req.json();

    // Build notification message
    const lines = [
      `📝 Înscriere nouă (${form_type})`,
      `👤 ${name}`,
      `📞 ${phone}`,
    ];
    if (email) lines.push(`📧 ${email}`);
    if (center) lines.push(`📍 ${center}`);
    if (format) lines.push(`💻 ${format}`);
    if (notes) lines.push(`📌 ${notes}`);

    const message = lines.join("\n");

    // Send WhatsApp notification via wa.me API (opens prefilled message)
    // For automated WhatsApp, you'd need WhatsApp Business API
    // For now, we log the notification
    console.log("New registration notification:", message);

    // Could also send email notification here if email infra is set up
    // For now we just log it for the admin to see in edge function logs

    return new Response(JSON.stringify({ success: true, message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
