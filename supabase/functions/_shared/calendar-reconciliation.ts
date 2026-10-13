import { lessonNumber } from "./cohort-sessions.ts";
const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";
type Config = { lovableKey?: string | undefined; calendarKey?: string | undefined; from: string; to: string };
type GoogleEvent = { id?: string; status?: string; etag?: string; summary?: string; description?: string; attendees?: Array<Record<string, unknown>>; start?: { dateTime?: string }; end?: { dateTime?: string }; hangoutLink?: string; extendedProperties?: { private?: Record<string, string>; shared?: Record<string, string> } };
/** Synchronize exact existing links. A missing event is an error, never a deletion. */
export async function reconcileCalendar(db: any, config: Config, request: typeof fetch = fetch) {
  const result = { updated: 0, pushed: 0, imported: 0, errors: [] as string[], unmatched: [] as Array<{ id: string; summary: string; start_at: string; end_at: string; guest_email: string | null }> };
  if (!config.lovableKey || !config.calendarKey) throw new Error("Google Calendar connection is unavailable");
  const headers = { Authorization: `Bearer ${config.lovableKey}`, "X-Connection-Api-Key": config.calendarKey, "Content-Type": "application/json" };
  const all = async (table: string, fields: string, orderBy = "id") => {
    const rows: any[] = [];
    for (let offset = 0; ; offset += 1000) {
      const page = await db.from(table).select(fields).order(orderBy).range(offset, offset + 999);
      if (page.error) throw page.error;
      rows.push(...(page.data ?? []));
      if ((page.data ?? []).length < 1000) return rows;
    }
  };
  const bookings = await all("bookings", "id,registration_id,event_type_slug,start_at,end_at,status,google_event_id,google_sync_error,google_contact_email,student_name,student_email,student_phone,meet_link");
  const sessions = await all("cohort_sessions", "id,google_event_id,starts_at,ends_at");
  const events = new Map<string, GoogleEvent>();
  let token: string | undefined;
  do {
    const qs = new URLSearchParams({ singleEvents: "true", showDeleted: "true", timeMin: config.from, timeMax: config.to, maxResults: "2500" });
    if (token) qs.set("pageToken", token);
    const response = await request(`${GATEWAY}/calendars/primary/events?${qs}`, { headers });
    if (!response.ok) throw new Error(`Google Calendar read failed (${response.status})`);
    const page = await response.json();
    if (!Array.isArray(page.items)) throw new Error("Google Calendar returned an invalid event list");
    for (const event of page.items) if (typeof event.id === "string") events.set(event.id, event);
    token = page.nextPageToken;
  } while (token);
  const linked = new Set([...bookings, ...sessions].map(row => row.google_event_id).filter(Boolean));
  const instant = (value: unknown) => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
  for (const booking of bookings) {
    if (!booking.google_event_id) {
      if (booking.status === "confirmed" && Date.parse(booking.start_at) >= Date.parse(config.from) && Date.parse(booking.start_at) < Date.parse(config.to)) result.errors.push(`${booking.id}: Lecția nu are eveniment Google. Folosește Repară din Toate lecțiile.`);
      continue;
    }
    if (booking.status !== "confirmed" && booking.google_sync_error === "cancel_update_pending") {
      try {
        const response = await request(`${GATEWAY}/calendars/primary/events/${encodeURIComponent(booking.google_event_id)}?sendUpdates=all`, { method: "DELETE", headers });
        if (!response.ok && response.status !== 404 && response.status !== 410) throw new Error(`Google cancellation failed (${response.status})`);
        const write = await db.from("bookings").update({ google_sync_error: null }).eq("id", booking.id).eq("status", booking.status).select("id");
        if (write.error || !write.data?.length) throw new Error("Cancellation confirmation could not be saved");
        result.pushed++;
      } catch (error) { result.errors.push(`${booking.id}: ${error instanceof Error ? error.message : "Cancellation sync failed"}`); }
      continue;
    }
    if (booking.status !== "confirmed") continue;
    if (booking.google_sync_error === "calendar_create_pending") {
      try { await repairBookingCalendar(db, booking, config, request); result.pushed++; }
      catch (error) { result.errors.push(`${booking.id}: ${error instanceof Error ? error.message : "Calendar creation retry failed"}`); }
      continue;
    }
    // Include events moved out of this window, but do not poll every old lesson.
    if (!events.has(booking.google_event_id) && !(Date.parse(booking.start_at) >= Date.parse(config.from) && Date.parse(booking.start_at) < Date.parse(config.to)) && !booking.google_sync_error) continue;
    let event = events.get(booking.google_event_id);
    try {
      if (!event || booking.google_sync_error) {
        const response = await request(`${GATEWAY}/calendars/primary/events/${encodeURIComponent(booking.google_event_id)}`, { method: "GET", headers });
        if (response.status === 410) event = { id: booking.google_event_id, status: "cancelled" };
        else if (!response.ok) throw new Error(`Google event unavailable (${response.status})`);
        else event = await response.json();
      }
      if (!event || event.id !== booking.google_event_id) throw new Error("Google event identity mismatch");
      const update = async (patch: Record<string, unknown>) => {
        // Compare-and-set protects a concurrent admin move from stale import.
        let writeQuery = db.from("bookings").update(patch).eq("id", booking.id).eq("status", "confirmed").eq("start_at", booking.start_at);
        for (const field of ["student_name", "student_email", "student_phone"]) {
          writeQuery = booking[field] == null ? writeQuery.is(field, null) : writeQuery.eq(field, booking[field]);
        }
        writeQuery = booking.google_sync_error ? writeQuery.eq("google_sync_error", booking.google_sync_error) : writeQuery.is("google_sync_error", null);
        const write = await writeQuery.select("id");
        if (write.error) throw write.error;
        if (!write.data?.length) throw new Error("Lesson changed during synchronization; retry");
      };
      if (booking.google_sync_error) {
        // An explicit pending admin change takes precedence over importing old Google data.
        if (event.status === "cancelled") throw new Error("Google event was cancelled; review the pending admin change");
        const oldEmail = event.extendedProperties?.private?.student_contact_email ?? booking.google_contact_email ?? booking.student_email;
        const attendees = (event.attendees ?? []).filter(guest => String(guest.email ?? "").toLowerCase() !== String(oldEmail ?? "").toLowerCase());
        if (booking.student_email) attendees.unshift({ email: booking.student_email, displayName: booking.student_name });
        const contact = `Contact cursant: ${booking.student_name}\nEmail: ${booking.student_email ?? ""}\nTelefon: ${booking.student_phone ?? ""}`;
        let originalDescription = (event.description ?? "").split("\n\nContact cursant:")[0] ?? "";
        const originalName = originalDescription.match(/^Student: (.*)$/m)?.[1];
        const generated = originalDescription.startsWith("Student: ");
        if (generated) originalDescription = originalDescription.replace(/^Student:.*$/m, `Student: ${booking.student_name}`).replace(/^Email:.*$/m, `Email: ${booking.student_email ?? ""}`).replace(/^Telefon:.*$/m, `Telefon: ${booking.student_phone ?? ""}`);
        const description = `${originalDescription}\n\n${contact}`;
        const summary = generated && originalName && event.summary?.endsWith(` — ${originalName}`) ? event.summary.slice(0, -originalName.length) + booking.student_name : undefined;
        const contactOnly = booking.google_sync_error === "contact_update_pending";
        const pushedStart = contactOnly ? instant(event.start?.dateTime) : booking.start_at;
        const pushedEnd = contactOnly ? instant(event.end?.dateTime) : booking.end_at;
        if (!pushedStart || !pushedEnd) throw new Error("Google event has an unsupported lesson time");
        const patch = { start: { dateTime: pushedStart, timeZone: "Europe/Bucharest" }, end: { dateTime: pushedEnd, timeZone: "Europe/Bucharest" }, attendees, description, ...(summary ? { summary } : {}), extendedProperties: { ...event.extendedProperties, private: { ...event.extendedProperties?.private, student_contact_email: booking.student_email ?? "" } } };
        const response = await request(`${GATEWAY}/calendars/primary/events/${encodeURIComponent(booking.google_event_id)}?sendUpdates=all`, {
          method: "PATCH", headers: { ...headers, ...(event.etag ? { "If-Match": event.etag } : {}) }, body: JSON.stringify(patch),
        });
        if (!response.ok) throw new Error(`Google Calendar update failed (${response.status})`);
        await update({ google_sync_error: null, google_contact_email: booking.student_email, ...(contactOnly ? { start_at: pushedStart, end_at: pushedEnd } : {}) });
        result.pushed++;
        continue;
      }
      if (event.status === "cancelled") {
        await update({ status: "cancelled", cancelled_at: new Date().toISOString(), google_sync_error: null });
        result.updated++;
        continue;
      }
      const start = instant(event.start?.dateTime), end = instant(event.end?.dateTime);
      if (!start || !end || Date.parse(end) <= Date.parse(start)) throw new Error("Google event has an unsupported lesson time");
      if (Date.parse(start) !== Date.parse(booking.start_at) || Date.parse(end) !== Date.parse(booking.end_at) || (event.hangoutLink && event.hangoutLink !== booking.meet_link)) {
        await update({ start_at: start, end_at: end, ...(event.hangoutLink ? { meet_link: event.hangoutLink } : {}) });
        result.updated++;
      }
    } catch (error) { result.errors.push(`${booking.id}: ${error instanceof Error ? error.message : "Synchronization failed"}`); }
  }
  for (const session of sessions) {
    if (!session.google_event_id) continue;
    if (!events.has(session.google_event_id) && !(Date.parse(session.starts_at) >= Date.parse(config.from) && Date.parse(session.starts_at) < Date.parse(config.to))) continue;
    try {
      let event = events.get(session.google_event_id);
      if (!event) {
        const response = await request(`${GATEWAY}/calendars/primary/events/${encodeURIComponent(session.google_event_id)}`, { method: "GET", headers });
        if (response.status === 410) event = { id: session.google_event_id, status: "cancelled" };
        else if (!response.ok) throw new Error(`Google group event unavailable (${response.status})`);
        else event = await response.json();
      }
      if (!event || event.id !== session.google_event_id) throw new Error("Google group event identity mismatch");
      if (event.status === "cancelled") {
        const write = await db.from("cohort_sessions").delete().eq("id", session.id).eq("starts_at", session.starts_at).select("id");
        if (write.error || !write.data?.length) throw new Error("Group cancellation could not be saved; retry");
        result.updated++; continue;
      }
      const start = instant(event.start?.dateTime), end = instant(event.end?.dateTime);
      if (!start || !end || Date.parse(end) <= Date.parse(start)) throw new Error("Google group event has an unsupported time");
      if (Date.parse(start) !== Date.parse(session.starts_at) || Date.parse(end) !== Date.parse(session.ends_at)) {
        const write = await db.from("cohort_sessions").update({ starts_at: start, ends_at: end, synced_at: new Date().toISOString() }).eq("id", session.id).eq("starts_at", session.starts_at).select("id");
        if (write.error || !write.data?.length) throw new Error("Group lesson changed during synchronization; retry");
        result.updated++;
      }
    } catch (error) { result.errors.push(`${session.id}: ${error instanceof Error ? error.message : "Group synchronization failed"}`); }
  }
  // Running groups and the name their lessons carry in Google ("<name> - L<N>").
  // A new lesson of a group, added or copied in Google, joins the group here;
  // checked before the private-lesson rule, since a group title can also say
  // "araba libaneza".
  const activeGroups = new Set((await all("group_cohorts", "id,is_active,status"))
    .filter((g) => g.is_active === true && !["completed", "cancelled"].includes(g.status)).map((g) => g.id));
  const groupNames = (await all("cohort_calendar", "cohort_id,calendar_title", "cohort_id"))
    .filter((c) => activeGroups.has(c.cohort_id) && typeof c.calendar_title === "string" && c.calendar_title.trim());
  const registrationFor = new Map<string, { id: string; name: string; phone: string | null; format: string | null }>();
  for (const event of events.values()) {
    const start = instant(event.start?.dateTime), end = instant(event.end?.dateTime);
    if (!event.id || linked.has(event.id) || event.status === "cancelled" || !start || !end || Date.parse(end) <= Date.parse(start)) continue;
    const group = groupNames.map((c) => ({ c, n: lessonNumber(event.summary, c.calendar_title) })).find((x) => x.n !== null);
    if (group) {
      const write = await db.from("cohort_sessions").upsert(
        { cohort_id: group.c.cohort_id, lesson_number: group.n, starts_at: start, ends_at: end, google_event_id: event.id, synced_at: new Date().toISOString() },
        { onConflict: "google_event_id" },
      );
      if (write.error) result.errors.push(`${event.id}: Lecția de grupă nu a putut fi salvată`);
      else result.imported++;
      continue;
    }
    const guest = lessonGuest(event);
    if (guest) {
      try {
        if (await autoImportLesson(db, event as GoogleEvent & { id: string }, guest, start, end, registrationFor)) { result.imported++; continue; }
      } catch (error) { result.errors.push(`${event.id}: ${error instanceof Error ? error.message : "Importul lecției a eșuat"}`); continue; }
    }
    // An event with no guest (a personal appointment, other work) is not a lesson; only guest events are listed.
    const guestEmail = firstGuestEmail(event);
    if (guestEmail) result.unmatched.push({ id: event.id, summary: event.summary || "Eveniment Google Calendar", start_at: start, end_at: end, guest_email: guestEmail });
  }
  return result;
}

const plain = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * A lesson the owner put straight into Google (owner-approved rule, 13 Oct
 * 2026): the title names the course ("araba libaneza", any case, with or
 * without diacritics) and the event has exactly one guest besides him. That
 * guest's email is the student. Anything else stays unmatched.
 */
export function lessonGuest(event: GoogleEvent): { email: string; displayName: string | null } | null {
  if (!/araba\s*libaneza/.test(plain(event.summary ?? ""))) return null;
  const guests = (event.attendees ?? []).filter((a) => a.organizer !== true && a.self !== true && typeof a.email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(a.email)));
  if (guests.length !== 1) return null;
  const guest = guests[0]!;
  return { email: String(guest.email).trim().toLowerCase(), displayName: typeof guest.displayName === "string" && guest.displayName.trim() ? guest.displayName.trim() : null };
}

/**
 * The student's name, editable afterwards in admin: the name the owner wrote
 * at the start of the title ("Ioan , lectia 27…"), else the guest's Google
 * name, else the email's local part ("radu.nicolae" → "Radu Nicolae").
 */
export function lessonStudentName(summary: string, email: string, displayName: string | null) {
  const prefix = (summary.split(/[,\-–—(]/)[0] ?? "").trim();
  if (prefix.length >= 2 && !/\d/.test(prefix) && !/^(lectia|lectie|lesson|araba|curs)/.test(plain(prefix))) return prefix.slice(0, 160);
  if (displayName && displayName.length >= 2 && !displayName.includes("@")) return displayName.slice(0, 160);
  const words = (email.split("@")[0] ?? "").split(/[._+-]+/).map((w) => w.replace(/\d+/g, "")).filter(Boolean);
  return words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ") || email;
}

/** "2/20" or "L1/10" in the title gives the package size; otherwise one lesson. */
export function lessonPackageSize(summary: string) {
  const match = summary.match(/(\d+)\s*\/\s*(\d+)/);
  const size = match ? Number.parseInt(match[2]!, 10) : 1;
  return Math.max(1, Math.min(60, Number.isFinite(size) ? size : 1));
}

/**
 * Links one lesson event to the student's most recent private registration
 * with that email (or contact email), creating one when there is none. A new
 * one is unpaid: nothing here knows what was paid. No Google write and no
 * email: the reminder flags are stamped so the reminder job leaves the lesson
 * alone, since the student already has the Google invitation. Returns false
 * when the event cannot be linked (another lesson at that time, or a
 * concurrent sync linked it first), so it stays listed for the owner.
 */
async function autoImportLesson(
  db: any,
  event: GoogleEvent & { id: string },
  guest: { email: string; displayName: string | null },
  start: string,
  end: string,
  registrationFor: Map<string, { id: string; name: string; phone: string | null; format: string | null }>,
) {
  const summary = event.summary ?? "";
  let registration = registrationFor.get(guest.email);
  let created = false;
  if (!registration) {
    const like = guest.email.replace(/[\\%_]/g, (c) => `\\${c}`);
    const found = await db.from("registrations").select("id,name,phone,format").eq("form_type", "private").is("anonymized_at", null)
      .or(`email.ilike."${like}",contact_email.ilike."${like}"`).order("created_at", { ascending: false }).limit(1);
    if (found.error) throw found.error;
    registration = found.data?.[0];
    if (!registration) {
      const name = lessonStudentName(summary, guest.email, guest.displayName);
      const format = /fizic/.test(plain(summary)) && !event.hangoutLink ? "fizic" : "online";
      registration = { id: crypto.randomUUID(), name, phone: null, format };
      const reg = await db.from("registrations").insert({
        id: registration.id, form_type: "private", source: "admin", name, email: guest.email, phone: "", language: "ro", format,
        quantity: lessonPackageSize(summary), payment_status: "unpaid", lead_status: "contacted",
      });
      if (reg.error) throw new Error("Cursantul nu a putut fi salvat.");
      created = true;
    }
    registrationFor.set(guest.email, registration);
  }
  const now = new Date().toISOString();
  const booking = await db.from("bookings").insert({
    registration_id: registration.id, event_type_slug: "paid", start_at: start, end_at: end,
    student_name: registration.name, student_email: guest.email, student_phone: registration.phone || null,
    format: registration.format === "fizic" ? "physical" : "online",
    status: Date.parse(end) <= Date.now() ? "completed" : "confirmed", language: "ro",
    google_event_id: event.id, google_contact_email: guest.email, meet_link: event.hangoutLink ?? null,
    reminder_2d_sent_at: now, reminder_day_of_sent_at: now, reminder_3h_sent_at: now, reminder_1h_sent_at: now, reminder_30m_sent_at: now,
  }).select("id").single();
  if (booking.error || !booking.data) {
    if (created) { await db.from("registrations").delete().eq("id", registration.id); registrationFor.delete(guest.email); }
    const message = String(booking.error?.message ?? "").toLowerCase();
    if (message.includes("duplicate") || message.includes("unique")) return false;
    throw new Error("Lecția nu a putut fi salvată.");
  }
  await db.from("audit_logs").insert({ actor: "calendar-sync", action: "auto_import_calendar_event", registration_id: registration.id, details: { event_id: event.id, at: start, email: guest.email, new_student: created } });
  return true;
}

/** The first guest who is not the organizer: a suggestion for the owner, never used on its own. */
function firstGuestEmail(event: GoogleEvent): string | null {
  const guest = (event.attendees ?? []).find((a) => a.organizer !== true && a.self !== true && typeof a.email === "string");
  return guest ? String(guest.email).toLowerCase() : null;
}

const toInstant = (value: unknown) => typeof value === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;

/**
 * Owner-confirmed import of one unmatched Google event as a private lesson.
 * The owner names the student; nothing is matched or guessed here. The event
 * keeps its own time (read from Google, never from the browser) and becomes
 * the lesson's calendar link, so later moves in Google sync back. No Google
 * write and no email: the student already has the invitation.
 */
export async function importCalendarEvent(
  db: any,
  config: { lovableKey?: string | undefined; calendarKey?: string | undefined },
  input: { eventId: string; name: string; email: string; phone: string | null; quantity: number; paid: boolean; format: "online" | "physical" },
  request: typeof fetch = fetch,
) {
  if (!config.lovableKey || !config.calendarKey) throw new Error("Google Calendar connection is unavailable");
  const headers = { Authorization: `Bearer ${config.lovableKey}`, "X-Connection-Api-Key": config.calendarKey, "Content-Type": "application/json" };
  const response = await request(`${GATEWAY}/calendars/primary/events/${encodeURIComponent(input.eventId)}`, { method: "GET", headers });
  if (!response.ok) throw new Error("Evenimentul Google nu a putut fi citit.");
  const event: GoogleEvent = await response.json();
  if (event.id !== input.eventId || event.status === "cancelled") throw new Error("Evenimentul Google nu mai există.");
  const start = toInstant(event.start?.dateTime), end = toInstant(event.end?.dateTime);
  if (!start || !end || Date.parse(end) <= Date.parse(start)) throw new Error("Evenimentul nu are o oră de lecție validă.");
  for (const table of ["bookings", "cohort_sessions"]) {
    const linked = await db.from(table).select("id").eq("google_event_id", input.eventId).limit(1);
    if (linked.error) throw linked.error;
    if (linked.data?.length) throw new Error("Evenimentul este deja asociat unei lecții.");
  }
  const registrationId = crypto.randomUUID();
  const reg = await db.from("registrations").insert({
    id: registrationId, form_type: "private", source: "admin", name: input.name, email: input.email,
    phone: input.phone ?? "", language: "ro", format: input.format === "physical" ? "fizic" : "online",
    quantity: input.quantity, payment_status: input.paid ? "paid" : "unpaid", lead_status: "contacted",
  });
  if (reg.error) throw new Error("Cursantul nu a putut fi salvat.");
  const status = Date.parse(end) <= Date.now() ? "completed" : "confirmed";
  const booking = await db.from("bookings").insert({
    registration_id: registrationId, event_type_slug: "paid", start_at: start, end_at: end,
    student_name: input.name, student_email: input.email, student_phone: input.phone, format: input.format,
    status, language: "ro", google_event_id: input.eventId, google_contact_email: input.email,
    meet_link: event.hangoutLink ?? null,
  }).select("id").single();
  if (booking.error || !booking.data) {
    await db.from("registrations").delete().eq("id", registrationId);
    const message = String(booking.error?.message ?? "").toLowerCase();
    throw new Error(message.includes("duplicate") || message.includes("unique") ? "Există deja o lecție confirmată la aceeași oră." : "Lecția nu a putut fi salvată.");
  }
  return { registration_id: registrationId, booking_id: booking.data.id as string, start_at: start, end_at: end, status };
}

/** Google event IDs use base32hex characters; SHA-256 hex is a valid subset. */
export async function googleBookingEventId(bookingId: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`booking:${bookingId}`));
  return `b${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")}`;
}
/** Explicit recovery for a saved lesson with no Google link. It creates no registration or booking. */
export async function repairBookingCalendar(db: any, booking: any, config: Omit<Config, "from" | "to">, request: typeof fetch = fetch) {
  if (!config.lovableKey || !config.calendarKey) throw new Error("Google Calendar connection is unavailable");
  const eventId = await googleBookingEventId(booking.id);
  if (booking.status !== "confirmed" || !booking.student_email || (booking.google_event_id && (booking.google_event_id !== eventId || booking.google_sync_error !== "calendar_create_pending"))) throw new Error("Lesson cannot be repaired");
  const headers = { Authorization: `Bearer ${config.lovableKey}`, "X-Connection-Api-Key": config.calendarKey, "Content-Type": "application/json" };
  const contactGuard = (query: any) => {
    for (const field of ["student_name", "student_email", "student_phone"]) query = booking[field] == null ? query.is(field, null) : query.eq(field, booking[field]);
    return query;
  };
  // Persist the exact retry/cleanup identity BEFORE Google can create an invitation.
  let claim = db.from("bookings").update({ google_event_id: eventId, google_sync_error: "calendar_create_pending" }).eq("id", booking.id).eq("status", "confirmed").eq("start_at", booking.start_at);
  claim = booking.google_event_id ? claim.eq("google_event_id", eventId).eq("google_sync_error", "calendar_create_pending") : claim.is("google_event_id", null);
  const claimed = await contactGuard(claim).select("id");
  if (claimed.error || !claimed.data?.length) throw new Error("Lesson changed before repair; reload and retry");
  const body = { id: eventId, summary: `Lecție — ${booking.student_name}`, description: [`Student: ${booking.student_name}`, `Email: ${booking.student_email}`, booking.student_phone ? `Telefon: ${booking.student_phone}` : null, booking.meet_link ? `Link: ${booking.meet_link}` : null, booking.notes ?? null].filter(Boolean).join("\n"),
    start: { dateTime: booking.start_at, timeZone: "Europe/Bucharest" }, end: { dateTime: booking.end_at, timeZone: "Europe/Bucharest" }, attendees: [{ email: booking.student_email, displayName: booking.student_name }],
    extendedProperties: { private: { booking_id: booking.id, student_contact_email: booking.student_email } } };
  let recovered: any = null;
  const created = await request(`${GATEWAY}/calendars/primary/events?sendUpdates=all`, { method: "POST", headers, body: JSON.stringify(body) });
  if (created.status === 409) {
    const existing = await request(`${GATEWAY}/calendars/primary/events/${eventId}`, { method: "GET", headers });
    if (!existing.ok) throw new Error("Existing calendar event could not be verified");
    recovered = await existing.json();
    if (recovered.id !== eventId || recovered.extendedProperties?.private?.booking_id !== booking.id || recovered.status === "cancelled") throw new Error("Calendar event identity mismatch");
    // Recover the exact link without replacing owner edits or additional guests.
    if (!recovered.start?.dateTime || !recovered.end?.dateTime || !Number.isFinite(Date.parse(recovered.start.dateTime)) || !Number.isFinite(Date.parse(recovered.end.dateTime)) || Date.parse(recovered.end.dateTime) <= Date.parse(recovered.start.dateTime)) throw new Error("Recovered calendar event has an unsupported time");
  } else {
    if (!created.ok) throw new Error(`Calendar repair failed (${created.status})`);
    const event = await created.json();
    if (event.id !== eventId) throw new Error("Calendar event identity mismatch");
  }
  const saved = await contactGuard(db.from("bookings").update({ google_sync_error: recovered ? (booking.google_sync_error === "reschedule_update_pending" ? "reschedule_update_pending" : "contact_update_pending") : null, google_contact_email: recovered?.extendedProperties?.private?.student_contact_email ?? booking.student_email,
    ...(recovered && booking.google_sync_error !== "reschedule_update_pending" ? { start_at: new Date(recovered.start.dateTime).toISOString(), end_at: new Date(recovered.end.dateTime).toISOString() } : {}) }).eq("id", booking.id).eq("status", "confirmed").eq("google_event_id", eventId).eq("google_sync_error", "calendar_create_pending").eq("start_at", booking.start_at)).select("id");
  if (saved.error || !saved.data?.length) {
    const owner = await db.from("bookings").select("id").eq("google_event_id", eventId).eq("status", "confirmed").maybeSingle();
    if (owner.error) throw new Error("Repair ownership could not be checked; durable retry remains pending");
    if (!owner.data) {
      // A cancellation can finish while the POST is in flight. Delete only this
      // exact owned event; keep cleanup retry state if Google cannot confirm.
      const removed = await request(`${GATEWAY}/calendars/primary/events/${eventId}?sendUpdates=all`, { method: "DELETE", headers }).catch(() => null);
      const cleaned = !!removed && (removed.ok || removed.status === 404 || removed.status === 410);
      const cleanup = await db.from("bookings").update({ google_sync_error: cleaned ? null : "cancel_update_pending" }).eq("google_event_id", eventId).in("status", ["cancelled", "rescheduled"]).select("id");
      if (cleanup.error) throw new Error("Calendar cleanup retry could not be recorded");
    }
    throw new Error("Lesson changed during repair; its recovery or cleanup remains tracked");
  }
  return { event_id: eventId };
}
