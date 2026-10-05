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
    title: "Harta: Raduga Creative Center, Strada Icoanei 80, București",
    show: "Afișează harta",
    note: "Harta se încarcă de la Google Maps, care poate seta cookies.",
    open: "Deschide în Google Maps",
  },
  en: {
    title: "Map: Raduga Creative Center, Strada Icoanei 80, Bucharest",
    show: "Show the map",
    note: "The map loads from Google Maps, which may set cookies.",
    open: "Open in Google Maps",
  },
} as const;

const GoogleMapEmbed = ({ lang, className = "" }: { lang: "ro" | "en"; className?: string }) => {
  const c = COPY[lang];
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      {loaded ? (
        <iframe
          src={GOOGLE_MAPS_EMBED_URL}
          title={c.title}
          className="block h-80 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="flex h-80 flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center">
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
          className="font-medium text-primary hover:underline"
        >
          {c.open} →
        </a>
      </div>
    </div>
  );
};

export default GoogleMapEmbed;
