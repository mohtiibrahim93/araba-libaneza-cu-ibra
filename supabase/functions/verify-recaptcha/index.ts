import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json().catch(() => ({ token: null }));
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'missing_token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const secret = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!secret) {
      return new Response(JSON.stringify({ success: false, error: 'missing_secret' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({ secret, response: token });
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await verifyRes.json();

    const score = typeof data.score === 'number' ? data.score : 0;
    const ok = data.success === true && score >= 0.5;

    return new Response(
      JSON.stringify({ success: ok, score, action: data.action ?? null, errors: data['error-codes'] ?? null }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('verify-recaptcha error', err);
    return new Response(JSON.stringify({ success: false, error: 'server_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});