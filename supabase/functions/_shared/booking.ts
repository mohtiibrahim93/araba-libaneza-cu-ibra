// Shared helpers for the native booking system.
// Timezone is fixed to Europe/Bucharest for the instructor.

export const TZ = "Europe/Bucharest";
export const GCAL_GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";
export const SITE_URL = "https://centruldearabalibaneza.com";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Convert a local Y-M-D H:M in `tz` to a UTC Date. Handles DST. */
export function zonedToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  tz = TZ,
): Date {
  // First guess: treat the local time as UTC.
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // See what wall-clock the guess lands on in the target tz.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date(guess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  let h = get("hour");
  if (h === 24) h = 0;
  const asLocal = Date.UTC(get("year"), get("month") - 1, get("day"), h, get("minute"));
  const offset = guess - asLocal; // ms diff between intended local and what UTC produced
  return new Date(guess + offset);
}

/** Returns Y-M-D parts of a UTC Date as observed in tz. */
export function utcToZonedParts(d: Date, tz = TZ) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour") === "24" ? "0" : get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday"),
  };
}

/** 0 = Sunday … 6 = Saturday for a UTC instant as observed in tz. */
export function weekdayInTz(d: Date, tz = TZ): number {
  const wd = utcToZonedParts(d, tz).weekday;
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

/** Parse "HH:MM" or "HH:MM:SS" into [h, m]. */
export function parseHM(t: string): [number, number] {
  const [h, m] = t.split(":").map(Number);
  return [h, m || 0];
}

/** Google Calendar freebusy via gateway. Returns array of {start, end} UTC ISO strings. */
export async function gcalFreebusy(
  timeMinISO: string,
  timeMaxISO: string,
): Promise<Array<{ start: string; end: string }>> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) {
    console.warn("[booking] GCal keys missing — skipping freebusy");
    return [];
  }
  try {
    const res = await fetch(`${GCAL_GATEWAY}/freeBusy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gcalKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: timeMinISO,
        timeMax: timeMaxISO,
        timeZone: TZ,
        items: [{ id: "primary" }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[booking] freebusy failed", res.status, text);
      return [];
    }
    const data = await res.json();
    const busy = data?.calendars?.primary?.busy ?? [];
    return busy as Array<{ start: string; end: string }>;
  } catch (err) {
    console.error("[booking] freebusy error", err);
    return [];
  }
}

export interface GCalEventInput {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  attendeeName?: string;
  withMeet?: boolean;
}

export async function gcalCreateEvent(input: GCalEventInput): Promise<{
  id?: string;
  meetLink?: string;
  ok: boolean;
  error?: string;
}> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) {
    // Loud on purpose. This returned silently before, so every booking fell
    // through to the "meet link only" branch and no calendar event was ever
    // created — with nothing in the logs to say why.
    console.error(
      "[booking] GCal keys missing — no calendar event created. " +
        `LOVABLE_API_KEY=${lovableKey ? "set" : "MISSING"} ` +
        `GOOGLE_CALENDAR_API_KEY=${gcalKey ? "set" : "MISSING"}`,
    );
    return { ok: false, error: "missing-keys" };
  }

  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.startISO, timeZone: TZ },
    end: { dateTime: input.endISO, timeZone: TZ },
    attendees: [{ email: input.attendeeEmail, displayName: input.attendeeName }],
    reminders: { useDefault: true },
  };
  if (input.withMeet) {
    body.conferenceData = {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  try {
    const url = `${GCAL_GATEWAY}/calendars/primary/events?conferenceDataVersion=${input.withMeet ? 1 : 0}&sendUpdates=all`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gcalKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[booking] gcal create failed", res.status, data);
      return { ok: false, error: `${res.status}` };
    }
    const meetLink: string | undefined =
      data?.hangoutLink ??
      data?.conferenceData?.entryPoints?.find((e: { entryPointType?: string; uri?: string }) => e.entryPointType === "video")?.uri;
    return { ok: true, id: data?.id, meetLink };
  } catch (err) {
    console.error("[booking] gcal create error", err);
    return { ok: false, error: String(err) };
  }
}

export async function gcalPatchEvent(
  eventId: string,
  startISO: string,
  endISO: string,
): Promise<boolean> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) {
    console.error("[booking] GCal keys missing — calendar not updated");
    return false;
  }
  try {
    const res = await fetch(
      `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": gcalKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: { dateTime: startISO, timeZone: TZ },
          end: { dateTime: endISO, timeZone: TZ },
        }),
      },
    );
    if (!res.ok) {
      console.error("[booking] gcal patch failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[booking] gcal patch error", err);
    return false;
  }
}

export async function gcalDeleteEvent(eventId: string): Promise<boolean> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gcalKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
  if (!lovableKey || !gcalKey) {
    console.error("[booking] GCal keys missing — calendar not updated");
    return false;
  }
  try {
    const res = await fetch(
      `${GCAL_GATEWAY}/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": gcalKey,
        },
      },
    );
    return res.ok || res.status === 410 || res.status === 404;
  } catch (err) {
    console.error("[booking] gcal delete error", err);
    return false;
  }
}

/** Returns true if [aStart,aEnd) overlaps [bStart,bEnd). All Date or ISO. */
export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/** Build candidate slot starts (UTC ISO) for a given local date and rule windows. */
export function generateSlotsForDate(
  year: number,
  month: number,
  day: number,
  windows: Array<{ start_time: string; end_time: string }>,
  durationMin: number,
  stepMin = 30,
): string[] {
  const out: string[] = [];
  for (const w of windows) {
    const [sh, sm] = parseHM(w.start_time);
    const [eh, em] = parseHM(w.end_time);
    const startUtc = zonedToUtc(year, month, day, sh, sm).getTime();
    const endUtc = zonedToUtc(year, month, day, eh, em).getTime();
    for (let t = startUtc; t + durationMin * 60_000 <= endUtc; t += stepMin * 60_000) {
      out.push(new Date(t).toISOString());
    }
  }
  return out;
}