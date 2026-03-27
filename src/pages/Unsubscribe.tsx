import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [status, setStatus] = useState<"loading" | "valid" | "used" | "invalid" | "success" | "error">("loading");
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) setStatus("invalid");
        else if (data.valid === false) setStatus("used");
        else setStatus("valid");
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dezabonare</h1>

        {status === "loading" && <p className="text-muted-foreground">Se verifică...</p>}

        {status === "valid" && (
          <>
            <p className="text-muted-foreground">Ești sigur că dorești să te dezabonezi de la emailurile noastre?</p>
            <button
              onClick={handleUnsubscribe}
              className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              Confirmă dezabonarea
            </button>
          </>
        )}

        {status === "used" && <p className="text-muted-foreground">Ești deja dezabonat.</p>}
        {status === "invalid" && <p className="text-muted-foreground">Link invalid sau expirat.</p>}
        {status === "success" && <p className="text-primary font-semibold">Te-ai dezabonat cu succes.</p>}
        {status === "error" && <p className="text-destructive">A apărut o eroare. Încearcă din nou.</p>}

        <a href="/" className="inline-block text-sm text-primary underline mt-4">← Înapoi la pagina principală</a>
      </div>
    </div>
  );
};

export default Unsubscribe;
