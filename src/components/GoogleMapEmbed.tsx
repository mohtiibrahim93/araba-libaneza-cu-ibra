/**
 * The Google map, loaded only when the visitor asks for it.
 *
 * An embedded map is a request to Google that can set its cookies, and the
 * site asks for consent before anything of the kind (analytics start denied).
 * So the frame is not in the page until the button is pressed; until then it
 * is a placeholder that costs nothing and still links to the profile.
 */
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GOOGLE_MAPS_EMBED_URL, GOOGLE_MAPS_PROFILE_URL } from "@/lib/googleBusiness";

const COPY = {
  ro: {
    title: "Harta: Centrul de Arabă Libaneză, Strada Icoanei 80, București",
    show: "Afișează harta",
    note: "Harta se încarcă de la Google Maps, care poate seta cookies.",
    open: "Deschide în Google Maps",
  },
  en: {
    title: "Map: Centrul de Arabă Libaneză, Strada Icoanei 80, Bucharest",
    show: "Show the map",
    note: "The map loads from Google Maps, which may set cookies.",
    open: "Open in Google Maps",
  },
} as const;

/** `compact` is the footer's version: a shorter map. */
const GoogleMapEmbed = ({
  lang,
  compact = false,
  className = "",
}: {
  lang: "ro" | "en";
  compact?: boolean;
  className?: string;
}) => {
  const c = COPY[lang];
  const height = compact ? "h-48" : "h-80";
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      {loaded ? (
        // Clicks inside the frame stay inside Google's map (drag, zoom); the
        // link row underneath is the way out to the Business Profile.
        <iframe
          src={GOOGLE_MAPS_EMBED_URL}
          title={c.title}
          className={`block ${height} w-full border-0`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className={`flex ${height} flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center`}>
          <MapPin className="h-8 w-8 text-primary" />
          <Button type="button" variant="outline" onClick={() => setLoaded(true)}>
            {c.show}
          </Button>
          <p className="max-w-xs text-xs text-muted-foreground">{c.note}</p>
        </div>
      )}
      <div className="border-t border-border px-4 py-3 text-sm">
        <a
          href={GOOGLE_MAPS_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <MapPin className="h-4 w-4" /> {c.open} →
        </a>
      </div>
    </div>
  );
};

export default GoogleMapEmbed;
