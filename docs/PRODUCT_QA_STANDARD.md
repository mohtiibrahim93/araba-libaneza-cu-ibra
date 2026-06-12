Centrul de Arabă Libaneză

Final QA Standard & Product Management Specification

Student Experience + Admin Experience + Website Management + Technical Architecture

Version 1.1

1. Purpose of This Document

This document defines the QA standard for the website and management system of Centrul de Arabă Libaneză. It should be used as the central reference for all future frontend, Supabase, admin, content, and product tasks. The recommended file name in the project would be: MASTER_SPEC.md or: PRODUCT_QA_STANDARD.md Every future feature should be checked against this document before implementation. The website should not be treated as a collection of random pages. It should be treated as a cohort-based enrollment platform. The system must support:

student discovery

course understanding

schedule visibility

cohort formation

registration tracking

WhatsApp communication

admin management

payment status

course requests

bilingual English/Romanian content

future tutor expansion

clear data integrity

mobile-first student experience The main product goal is:

Convert a visitor into a qualified lead, then into a confirmed student, while allowing the admin to clearly manage every step.

2. Current Product Reality

The school currently has:

one tutor

one main physical location

weekday evening availability

possible online weekend availability

Lebanese Arabic as the core product

Romanian and English target audiences

students who may be beginners, heritage learners, partners of Lebanese people, travelers, or culture-focused learners Current physical location: Raduga Cultural Center Strada Icoanei 80 București, Romania Current main weekday availability: Monday to Friday 19:00–20:30 Romania time Weekday classes may be:

physical

online Weekend classes are mostly:

online

possible as Saturday/Sunday cohorts

possible as weekend intensives

possible as conversation or trial formats The current operational model should support one tutor now, but the system should not be hardcoded in a way that prevents adding more tutors later.

3. Current Codebase Reality

The current project appears to be more advanced than a simple presentation website. It includes or appears to support:

React frontend

Vite

TypeScript

Tailwind/shadcn UI structure

Supabase integration

registration-related flows

admin management screens

cohort management concepts

group capacity logic

booking or trial lesson logic

notifications

email status tracking

WhatsApp status tracking

payment-related logic

privacy and terms pages

bilingual/i18n content structure

SEO metadata

mobile CTA elements Therefore, the main problem is not:

"Does the website have a form?" The main problem is: "Is the full system logically organized around the real student journey and the real admin workflow?" The current codebase already has many useful parts. The QA priority is to make the operating model stricter, cleaner, and more consistent.

4. Technical Architecture Clarification

The project should not be treated as a traditional Node.js backend application. The Node TypeScript configuration shown only includes: vite.config.ts This suggests that the Node TypeScript configuration is used mainly for tooling/build configuration, not for a full Node/Express backend server. Therefore, when this document says "backend," it should be understood as:

Supabase database layer, migrations, policies, Edge Functions, admin data logic, serverless functions, and form/payment/notification logic. It should not be understood as: A traditional Node.js server backend. The technical QA should focus on:

Supabase tables

Supabase migrations

Supabase Row Level Security policies

Supabase Edge Functions

admin authentication logic

registration/form submission logic

cohort counters

enrollment status updates

payment status updates

notification functions

email/WhatsApp tracking

database integrity

frontend-to-Supabase consistency The frontend QA should focus on:

React components

routing

forms

i18n

mobile UX

public course/cohort display

admin dashboard screens

admin workflows

error handling

student confirmation states Node-specific backend QA is not a priority unless a real Node backend server is added later.

5. Technical QA Consequence Questions

Because the Node config only appears to cover Vite tooling, QA must ask these questions:

5.1 TypeScript coverage

Does the main application TypeScript configuration check the full src/ directory? If only vite.config.ts is covered by the Node config, then the project must also have a main app TypeScript configuration that covers the actual frontend source code.

5.2 Supabase function checking

Are Supabase Edge Functions type-checked separately? If Edge Functions exist, they may need their own TypeScript or Deno validation flow.

5.3 Migration consistency

Do Supabase migrations match what the frontend/admin interface expects? For example:

if frontend expects cohort.status, does the database actually have it?

if admin expects track_preference, does the database store it?

if counters depend on enrollment_status, is that field present and reliable?

5.4 Public counter accuracy

Are public cohort counters calculated from database truth, not hardcoded frontend numbers? A counter should not be manually faked in a card.

5.5 Admin protection

Are admin actions protected by Supabase/auth/serverless logic, not only hidden in the frontend? Hiding an admin page in React is not enough security.

5.6 No false Node assumptions

Are future tasks avoiding references to an Express/Node backend unless one is actually introduced? Tasks should say:

Supabase function

database migration

RLS policy

admin data logic

frontend component not:

Node route

Express controller

server middleware unless those actually exist.

5.7 Build and lint reliability

Can the project be built and type-checked without relying on missing assumptions? QA should verify:

frontend TypeScript checks

Vite build succeeds

Supabase functions validate

unused code does not break deployment

environment variables are documented

6. Core Product Principle

The website should be managed as a cohort-based enrollment system, not as a simple language-school brochure. The student journey should be: Visitor → understands Lebanese Arabic → chooses goal → chooses Arabizi or Arabic alphabet → chooses level → sees available/forming cohorts → registers interest or reserves place → receives confirmation → admin follows up → cohort reaches minimum → payment/confirmation → course starts The admin journey should be: New lead arrives → lead is categorized → lead is matched to cohort or course request → lead is contacted → status is updated → payment/confirmation is tracked → cohort count updates → course opens when threshold is met Everything must support these two journeys.

7. WhatsApp vs Structured Registration

The website should not choose between WhatsApp and forms. It should use both. WhatsApp is useful for:

trust

quick questions

hesitant students

personal reassurance

choosing the right course

converting unsure visitors But WhatsApp alone is not enough because it does not automatically track:

interested students

confirmed students

requested schedules

group formation counters

payment status

lead source

cohort capacity

admin follow-up Therefore, the correct model is:

Form-backed WhatsApp-first enrollment. This means:

the student can ask questions on WhatsApp

the student can also complete a structured form

every serious WhatsApp lead should be added to the database

admin should be able to manually create a lead from WhatsApp

public counters should use database records, not memory or chat history The database remains the source of truth. WhatsApp is the communication layer.

8. Recommended Enrollment Model

There should be three public paths.

Path 1 — Join Existing Cohort

For a cohort that already exists. CTA examples:

Join this group

Reserve your interest

Request a seat

Register for this cohort The form should record:

student name

phone

email, if available

level

track

format

cohort ID

schedule

preferred language

source

Path 2 — Request a Course

For students who do not find a suitable schedule. CTA examples:

Request a course

Can't find your schedule?

Join interest list for another time The form should record:

level

track

preferred days

preferred time

online/physical preference

phone/WhatsApp

location preference

notes This should create a structured course request, not just a generic message.

Path 3 — Ask on WhatsApp

For unsure students. CTA examples:

Ask on WhatsApp

Not sure? Message us

Need help choosing? After a serious WhatsApp conversation, admin should be able to create a lead manually. Admin action:

Add lead from WhatsApp That lead can then be assigned to a cohort or request group.

9. Status Definitions

The system needs strict status separation. Do not use one vague status for everything. There should be separate statuses for:

lead status

cohort status

enrollment status

payment status

communication status This avoids confusion between:

someone who asked a question

someone who registered interest

someone who reserved a place

someone who paid

someone who is confirmed

someone who completed the course

10. Lead Status

A lead is a person who showed interest. Recommended lead statuses:

New

Submitted form, not yet reviewed.

Contacted

Admin contacted the person.

Qualified

Person is real and interested.

Not Suitable

The course is not right for them.

No Response

Admin contacted them, but they did not answer.

Spam / Invalid

Invalid or fake submission.

Converted

Lead became a confirmed student/enrollment. Recommended technical values:

new

contacted

qualified

no_response

not_suitable

spam

converted QA rule: A lead should not be counted as confirmed just because they submitted a form.

11. Cohort Status

A cohort is a concrete group with:

level

schedule

track

format

tutor

start date

capacity Recommended cohort statuses:

Draft

Admin-only. Not visible publicly.

Forming

Visible publicly. Students can join interest list.

Minimum Reached

Enough qualified students exist, but admin has not confirmed the course yet.

Confirmed

Course will start.

Full

No more confirmed seats.

In Progress

Course has started.

Completed

Course ended.

Cancelled

Course will not happen. Recommended technical values:

draft

forming

minimum_reached

confirmed

full

in_progress

completed

cancelled QA rule: is_active alone is not enough. A cohort can be active but still forming, confirmed, full, or in progress.

12. Enrollment Status

An enrollment connects a student to a cohort. Recommended enrollment statuses:

Interested

Student showed interest.

Invited

Admin invited student to confirm.

Reserved

Student said yes, but payment may not be complete.

Confirmed

Seat is confirmed.

Waitlist

Cohort is full or not ready.

Cancelled

Student cancelled.

Completed

Student completed the course. Recommended technical values:

interested

invited

reserved

confirmed

waitlist

cancelled

completed QA rule: Enrollment status must not be mixed with payment status.

13. Payment Status

Payment status should be separate from enrollment status. Recommended payment statuses:

not_required_yet

pending

paid

failed

refunded

waived

manual_payment QA rule: For forming groups, payment should not be requested unless the policy is clear. Recommended public wording:

No payment is required until the group is confirmed. If deposits are introduced later: Deposit is refundable if the group does not open. Only use this if it is actually true.

14. Communication Status

Communication should be tracked separately. Recommended fields:

email_sent_at

email_status

whatsapp_sent_at

whatsapp_status

last_contacted_at

contact_channel

follow_up_due_at

communication_notes Recommended WhatsApp statuses:

not_sent

sent

replied

no_reply

follow_up_needed

closed QA rule: Opening WhatsApp should not automatically mean the student was successfully contacted unless admin confirms it. Better workflow:

Admin clicks WhatsApp.

WhatsApp opens.

Admin returns to dashboard.

System asks: "Mark WhatsApp as sent?"

Admin confirms manually.

15. Counter Logic

Counters must be honest and database-based. There are two different counters.

Formation Counter

Used when a group is forming. Example:

4 / 6 interested students Need 2 more to open This should count qualified interest only. Recommended logic: Count leads/enrollments linked to the cohort where status is:

interested

invited

reserved

confirmed

qualified Exclude:

spam

cancelled

no_response

not_suitable

Seat Counter

Used when a group is confirmed. Example:

2 seats left Recommended formula: seats_left = max_students - confirmed_enrollments QA rule: Do not confuse formation count with seat count. For forming cohorts, show interest progress. For confirmed cohorts, show seats left.

16. Minimum Students Rule

Current business rule:

A group opens when at least 6 students are interested/qualified. This should be configurable. Recommended default:

min_students: 6

max_students: configurable

current tutor count: 1

tutor availability must be respected Admin should be able to set:

minimum students per cohort

maximum students per cohort

whether the cohort may open below minimum manually

whether the cohort is public or private QA rule: A course should not automatically become confirmed just because a number is reached. Admin should review the leads first.

17. Tutor Logic

Current reality:

one tutor

tutor is the brand

the public-facing trust depends heavily on the tutor Future reality:

more tutors may join The frontend can show one tutor now. The Supabase/data model should allow more tutors later. Recommended tutor fields:

tutor_id

name

bio_ro

bio_en

photo

active

languages

available_formats

availability

assigned_cohorts Each cohort should have:

tutor_id QA rule: Do not hardcode the whole system around one tutor, even if only one tutor is visible now.

18. Schedule Logic

Current real availability:

Weekdays

Monday to Friday 19:00–20:30 Romania time Can be:

physical

online

Weekends

Mostly online. Possible weekend formats:

Saturday only

Sunday only

Saturday + Sunday

weekend intensive

online conversation club

online private lessons The system must not hardcode only one weekday combination. Valid examples:

Monday + Wednesday, 19:00–20:30

Tuesday + Thursday, 19:00–20:30

Monday + Friday, 19:00–20:30

Saturday + Sunday, 10:00–11:30

Saturday + Sunday, 17:00–18:30 QA rule: The system should support multiple cohort schedule patterns without code changes.

19. Structured Schedule Fields

Display labels are useful, but they are not enough. Example display labels:

Monday & Wednesday, 19:00–20:30

Luni și miercuri, 19:00–20:30 But the data layer should also store structured fields. Recommended fields:

days_of_week

start_time

end_time

timezone

format

location_id

duration_minutes

recurrence_pattern QA risks if schedules are only free text:

English and Romanian labels may contradict each other

admin may enter invalid times

physical cohort may lack a location

two cohorts may overlap

public cards may show wrong information

counters may be correct but schedule is unclear QA rule: Display labels can exist, but structured schedule data should be the source of truth.

20. Location Logic

Current physical location: Raduga Cultural Center Strada Icoanei 80 București Every physical cohort must show:

location name

full address

city

map link

whether the location is confirmed

whether online alternative exists Recommended future location fields:

location_id

name

address_ro

address_en

city

map_url

active

notes QA rule: No physical course should be public without a visible address.

21. Course vs Cohort Separation

Courses and cohorts must be separate.

Course

General product. Example:

Beginner Lebanese Arabic Fields:

course_id

level

title_ro

title_en
description_ro

description_en

outcomes_ro

outcomes_en

active

Cohort

Specific group students join. Example:

Beginner Lebanese Arabic — Monday & Wednesday — 19:00–20:30 — Arabizi Track Fields:

cohort_id

course_id

tutor_id

status

track

format

days

time

location

min_students

max_students

start_date

end_date

price

public_visibility QA rule: A student registers for a cohort, not just an abstract course.

22. Track Logic: Arabizi vs Arabic Alphabet

This is a core differentiator. Every relevant course/cohort should specify track.

Arabizi Track

For students who want to speak first. Examples:

kifak?

ana mnih

shu akhbarak?

Arabic Script Track

For students who want to read and write Arabic letters. Examples:

كيفك؟

أنا منيح

شو أخبارك؟ Recommended lead field: track_preference Allowed values:

arabizi

arabic_script

not_sure Recommended cohort field: track Allowed values:

arabizi

arabic_script

mixed

not_applicable QA rule: A student should know before submitting whether the course uses Arabizi, Arabic script, or both.

23. Lebanese Arabic Positioning

The website must consistently clarify:

This is Lebanese Arabic dialect. It is not primarily:

Modern Standard Arabic

Quranic Arabic

classical Arabic

religious Arabic

formal media Arabic Lebanese Arabic is ideal for:

speaking with Lebanese family

speaking with a Lebanese partner/spouse

travel to Lebanon

Lebanese culture

heritage learners

Lebanese friends

Lebanese music/media/food

work with Lebanese people QA rule: Remove religion as a primary enrollment goal. If religion appears, clarify gently:

This course teaches spoken Lebanese Arabic. For religious, classical, or formal Arabic, Standard Arabic may be more appropriate.

24. Level Naming

Do not show only:

A1

A2

B1

B2 Most students do not understand these labels. Use human-readable labels first:

Beginner

No previous Arabic required.

Elementary

Can introduce yourself and understand simple phrases.

Intermediate

Can handle everyday conversations.

Advanced

Can understand natural speech, media, and nuanced conversation. CEFR labels can appear second. Example:

Beginner Lebanese Arabic A0–A1 QA rule: A complete beginner should understand which course is for them without knowing CEFR.

25. Bilingual Content Rule

The website must exist in:

English

Romanian But the content should not be literal translation. The logic can be shared. The copy should be native.

English tone

Clear, international, direct, beginner-friendly. Example:

Learn Lebanese Arabic for real conversations with Lebanese people.

Romanian tone

Natural Romanian, practical, adult, clear. Example:

Învață araba libaneză pentru conversații reale, nu doar reguli de gramatică. QA rule: Romanian should not feel translated from English. English should not feel like Romanian structure forced into English.

26. Bilingual Technical Structure

Recommended long-term routing:

/ro

/en Examples:

/ro/cursuri

/en/courses

/ro/program

/en/schedule A single route with language state can work short-term, but localized routes are better long-term for:

SEO

clarity

shareable links

user trust

Romanian landing pages

English landing pages QA rule: Changing language should not reset the user's current task. If a student is viewing a cohort in Romanian and switches to English, they should remain on the same cohort/page.

27. Admin Experience: Main Principle

The admin panel should answer one question immediately:

What do I need to do today? The admin interface should not be only a collection of tables. It should be task-oriented. Recommended admin dashboard order:

urgent actions

cohorts that can open

new leads needing contact

unassigned course requests

pending payments

upcoming bookings/classes

notifications needing action

recent registrations

cohort management

settings QA rule: Admin should not need to inspect five different pages to know today's priorities.

28. Admin Dashboard Cards

At the top of admin, show cards such as:

New Leads

Number of new leads not yet contacted.

Follow-ups Due

People who need WhatsApp/email follow-up.

Cohorts Near Minimum

Example:

Beginner Arabizi — 5 / 6

Minimum Reached

Cohorts ready for admin review.

Pending Payments

Students who reserved but have not paid.

Email/WhatsApp Issues

Messages not sent, failed, or awaiting confirmation.

Upcoming Classes

Today/this week's trial, private, or group sessions. QA rule: Dashboard cards should lead to action, not just display numbers.

29. Admin Lead Management

The registrations table should behave like a small CRM. Each lead row should show:

name

phone

email

source

course type

level

track preference

format preference

preferred schedule

linked cohort

lead status

enrollment status

payment status

last contacted

next follow-up

notes

actions Recommended actions:

open WhatsApp

mark contacted

qualify

assign to cohort

move to request list

mark no response

mark not suitable

mark spam

confirm seat

mark paid

export

archive QA rule: Deletion should not be the default workflow. Most leads should be statused or archived, not deleted.

30. WhatsApp Admin Workflow

WhatsApp is important, but it needs structure. Required admin actions:

open WhatsApp with prefilled message

mark WhatsApp sent

mark replied

mark no reply

add note from conversation

create lead from WhatsApp manually

assign WhatsApp lead to cohort/request

set follow-up date Recommended WhatsApp status values:

not_sent

sent

replied

no_reply

follow_up_needed

closed QA rule: WhatsApp should support conversion, but the database must preserve tracking.

31. Manual WhatsApp Lead Capture

If someone messages directly on WhatsApp without filling a form, admin must be able to add them manually. Admin form:

Add WhatsApp Lead

Fields:

name

phone

preferred language

course interest

level

track

schedule preference

format

notes

source: WhatsApp

linked cohort/request QA rule: No serious student should remain only inside WhatsApp chat history.

32. Registration vs Interest vs Confirmation

The wording must be precise. For forming groups, the student is not fully registered yet.

Public language for forming cohorts

Use:

Join interest list

Register your interest

Join group formation Avoid:

Confirm seat

Pay now

Enroll now unless the course is actually confirmed.

Public language for confirmed cohorts

Use:

Reserve your seat

Join this group

Register for this course

Admin language

Use precise internal states:

lead

interest

reservation

confirmed enrollment

payment pending

paid QA rule: Do not call someone a confirmed student just because they submitted a form.

33. Course Formation Admin Workflow

Admin should be able to manage the full lifecycle.

Step 1 — Create Cohort

Admin creates:

course

level

track

schedule

format

location

tutor

min students

max students

estimated start date

status: forming

Step 2 — Collect Interest

Students join via:

public form

request-a-course form

WhatsApp manual lead

Step 3 — Minimum Reached

System highlights:

Minimum reached: 6 / 6 Admin then:

reviews lead quality

contacts students

confirms start date

requests payment

changes status to confirmed

Step 4 — Confirm Seats

Admin marks students as:

confirmed

paid

waitlist

cancelled

Step 5 — Start Course

Admin changes cohort to:

in_progress

Step 6 — Complete Course

Admin changes cohort to:

completed QA rule: Cohort status changes should be intentional admin actions, not accidental side effects.

34. Request-a-Course Admin Workflow

Course requests are not the same as registrations. Admin should see request clusters. Examples:

A1 Arabizi, Saturday morning, online — 4 requests

A2 Arabic Script, Monday & Friday 19:00, online — 3 requests

Beginner physical Bucharest, Tuesday/Thursday — 5 requests Admin actions:

create cohort from request cluster

merge similar requests

contact all interested students

mark request cluster as active cohort

archive request cluster QA rule: Course requests should become usable demand data, not disappear into notes.

35. Request Clustering Logic

Do not let every student create a completely unique schedule. Use predefined blocks first. Recommended weekday options:

Monday & Wednesday, 19:00–20:30

Tuesday & Thursday, 19:00–20:30

Monday & Friday, 19:00–20:30 Recommended weekend options:

Saturday morning

Saturday afternoon

Sunday morning

Sunday afternoon

Saturday & Sunday intensive Optional:

I need another schedule QA rule: Free text can exist, but structured options should come first.

36. Admin Cohort Management

Admin should be able to manage:

cohort status

track

format

location

min students

max students

tutor

structured days/times

public visibility

estimated start date

confirmed start date

notes

assigned leads

confirmed enrollments Admin actions should include:

create cohort

edit cohort

deactivate cohort

duplicate cohort

mark as forming

mark as confirmed

mark as full

mark as in progress

mark as completed

assign students

remove students

view public card preview QA rule: Admin should not need a programmer to open a new group.

37. Capacity Management

Capacity must be cohort-specific. There are two capacity types.

Default capacity

Example:

Beginner default min 6, max 10

Cohort capacity

Example:

Beginner Monday/Wednesday July cohort min 6, max 8 Cohort capacity should override default capacity. QA rule: The public counter should use cohort-level capacity, not only generic course-level capacity.

38. Booking Management

Booking functionality can support:

trial lessons

private lessons

consultations

placement calls Admin should be able to:

view bookings

filter by confirmed/cancelled/completed

cancel booking

reschedule booking

see linked registration

see payment status

see meeting link

see format online/physical

see calendar status Booking should connect to the lead lifecycle. Example: Lead → trial booked → trial attended → converted to course QA rule: A booking should not be isolated from the student profile.

39. Student Profile / Lead Detail Page

Every lead should eventually have a detail page. A student profile should show:

Basic Information

name

phone

email

preferred language

source

created date

Interest

course type

level

track

format

schedule preference

goal

Cohort Relation

assigned cohort

cohort status

enrollment status

payment status

Communication

WhatsApp sent

email sent

last contact

notes

follow-up date

Timeline

submitted form

contacted

replied

assigned to cohort

payment requested

paid

course started

Admin Actions

open WhatsApp

send email

change status

assign cohort

mark paid

add note

archive QA rule: Admin should not need to search across multiple tables to understand one student.

40. Admin Notifications

Admin notifications should be priority-based.

Critical

payment failed

email failed

cohort minimum reached

class starts soon but students unpaid

Today

new leads not contacted

WhatsApp follow-ups due

trial tomorrow

pending confirmation

Low Priority

old no-response leads

archived leads

completed courses QA rule: Notifications should tell admin what action to take.

41. Admin Authentication and Access

If the current admin uses a password-based Supabase function and session storage, that may be acceptable for an early version, but it should not be the long-term standard. Recommended future standard:

Supabase Auth

admin user role

no shared password

role-based access

audit log for admin changes

session expiration

password reset

two-factor authentication if needed Current QA should verify:

admin page is not publicly readable

password is not exposed in frontend

wrong password fails

session clears on logout

admin functions require authentication/authorization

Supabase service role is never exposed client-side QA rule: Frontend hiding is not security.

42. Data Protection / GDPR

Because the site collects personal data, QA must check:

GDPR checkbox exists before form submission

privacy policy is accessible

terms are accessible

data purpose is clear

students know they may be contacted by WhatsApp/email/phone

admin can delete or export data if requested

unnecessary data is not collected

sensitive notes are not publicly exposed Recommended consent meaning: The student agrees that their data may be stored and used for:

course enrollment

communication

WhatsApp/phone/email follow-up

course scheduling QA rule: Do not collect more data than needed at the first step.

43. Form QA Standard

Every form must pass these tests.

Required Fields

missing name shows clear error

missing phone shows clear error

missing course/level shows clear error

missing GDPR consent blocks submission

physical course without location blocks submission

group course without level blocks submission

invalid email does not break submission

Submission

button shows loading state

duplicate clicks are prevented

successful submission creates database record

confirmation view appears

admin notification is triggered

email is sent if email exists

WhatsApp CTA remains visible

form clears only after success

Error States

database error shows understandable message

network error does not erase form

anti-spam or reCAPTCHA failure is handled

user can retry QA rule: A failed submission should not make the student rewrite everything.

44. Admin Data Integrity Rules

Counters and dashboards only work if data is clean. Rules:

Rule 1

Do not count spam, cancelled, or no-response leads in public counters.

Rule 2

Do not count unpaid students as confirmed unless admin manually confirms them.

Rule 3

Do not allow confirmed students beyond max capacity unless admin overrides intentionally.

Rule 4

Do not delete real leads unless necessary. Use archive/status instead.

Rule 5

Every confirmed enrollment should be linked to one cohort.

Rule 6

Every physical cohort must have a location.

Rule 7

Every cohort must have a tutor.

Rule 8

Every public cohort must have clear status.

Rule 9

Every displayed counter must be traceable to database records. QA rule: Admin numbers must match public numbers.

45. Frontend Student QA Standard

The student should be able to answer these questions quickly.

Within 10 seconds

Is this Lebanese Arabic?

Is it for real conversations?

Can beginners join?

Can I use Arabizi?

Is Arabic alphabet optional?

Within 30 seconds

What courses exist?

What level am I?

What does A1/A2 mean?

What schedule is available?

Is there an online option?

Is there a physical option in Bucharest?

Before submitting

What am I registering for?

Is the group forming or confirmed?

How many students are needed?

What happens next?

Will someone contact me?

Do I need to pay now?

After submitting

Was my request received?

What did I request?

What is the group status?

Will I be contacted?

Can I contact on WhatsApp? QA rule: The website should reduce uncertainty at every step.

46. Public CTA Rules

CTAs must match the real status.

For forming cohort

Use:

Join interest list

Register interest

Join group formation Do not use:

Confirm seat

Pay now

Enroll now unless payment/confirmation is actually possible.

For confirmed cohort with seats

Use:

Reserve your seat

Join this group

Register for this course

For full cohort

Use:

Join waitlist

For no matching schedule

Use:

Request a course

Suggest another schedule

For unsure student

Use:

Ask on WhatsApp QA rule: A CTA should never promise more than the system can deliver.

47. Payment QA Standard

Payment must be clear. For forming groups, payment should not be requested unless the policy is explicit. Recommended default:

No payment is required until the group is confirmed. If deposits are introduced: Deposit is refundable if the group does not open. Only write this if it is legally and operationally true. Admin must distinguish:

interest

payment pending

paid

manual bank transfer

Stripe payment

refunded

waived QA rule: A student should never wonder whether they paid for a group that may not happen.

48. Homepage QA Standard

Homepage sections should be ordered by student decision-making. Recommended order:

Hero

Current groups / forming groups

Arabizi vs Arabic alphabet

Why Lebanese Arabic

Programs

How it works

Instructor

Outcomes

Testimonials

FAQ

Final CTA QA rule: Real availability should appear early. The student should not have to search for schedule information.

49. Schedule Page QA Standard

A dedicated schedule page should exist. It should allow filtering by:

level

track

online/physical

weekday/weekend

forming/confirmed

Bucharest/online

start date Each schedule card should show:

course name

level

track

days

time

timezone

format

location

tutor

status

interested count or seats left

start date

price

CTA QA rule: A student should know within 15 seconds whether there is a group that fits their life.

50. Quiz QA Standard

The quiz should recommend a real next action. It should ask:

who is learning

why they want Lebanese Arabic

current level

Arabizi or Arabic script preference

online/physical preference

schedule preference The result should show:

recommended course

recommended track

available cohort

forming cohort

request-a-course option

WhatsApp support Bad result:

You are A1. Good result: Recommended: Beginner Lebanese Arabic, Arabizi Track. Best match: Monday & Wednesday, 19:00–20:30, online. Status: 4 / 6 interested. Next step: Join group formation. QA rule: The quiz should not send the student back to browse manually.

51. Admin QA Test Scenarios

Scenario 1 — New group lead arrives

Expected:

lead appears in admin

status is New

cohort is visible if selected

counter updates if eligible

admin can WhatsApp them

admin can mark contacted

admin can qualify or reject lead

Scenario 2 — WhatsApp-only student

Expected:

admin can manually create lead

source is WhatsApp

lead can be linked to cohort

lead can count toward formation if qualified

Scenario 3 — Cohort reaches 6 students

Expected:

dashboard highlights cohort

status shows minimum reached

admin can contact students

admin can confirm start date

admin can move cohort to confirmed

Scenario 4 — Student pays

Expected:

payment status updates

enrollment status becomes confirmed if appropriate

seat counter updates

admin sees paid status

student receives confirmation

Scenario 5 — Student requests Saturday online

Expected:

request is stored structurally

admin sees it in requested schedules

similar requests group together

admin can create cohort from requests

Scenario 6 — Physical class

Expected:

Raduga address visible

location stored

schedule clear

no physical cohort exists without location

Scenario 7 — Romanian/English switch

Expected:

language changes naturally

route/task is preserved

Romanian text does not sound translated

English text does not sound forced

Scenario 8 — Supabase/data layer mismatch

Expected:

frontend fields exist in database

admin actions update correct tables

counters use real records

no hardcoded fake enrollment numbers

52. Admin UX Risk List

QA should watch for these risks.

Risk 1 — Too many admin sections without priority

Solution: Create dashboard with urgent actions first.

Risk 2 — WhatsApp bypasses database

Solution: Add manual WhatsApp lead creation.

Risk 3 — Counters count wrong people

Solution: Separate interested, qualified, reserved, confirmed, paid.

Risk 4 — Cohort labels are free text only

Solution: Add structured schedule fields.

Risk 5 — One tutor hardcoded everywhere

Solution: Add tutor model, default to current tutor.

Risk 6 — Public CTA overpromises

Solution: Match CTA to cohort status.

Risk 7 — Form says registration but group is only forming

Solution: Use interest language until confirmed.

Risk 8 — Admin deletes leads instead of closing them

Solution: Add archive/status options.

Risk 9 — Romanian and English content become literal translations

Solution: Write native copy separately.

Risk 10 — Course request data disappears into notes

Solution: Create structured course request entity.

Risk 11 — Technical tasks assume a Node backend that does not exist

Solution: Use Supabase/data-layer terminology unless a real Node backend is added.

53. Recommended Supabase/Data Entities

The future data model should support these entities.

Tutor

id

name

bio_ro

bio_en

photo

active

availability

Course

id

level

title_ro

title_en

description_ro

description_en

outcomes_ro

outcomes_en

active

Cohort

id

course_id

tutor_id

status

track

format

location_id

days_of_week

start_time

end_time

timezone

min_students

max_students

estimated_start_date

confirmed_start_date

price

is_public

Lead

id

name

phone

email

preferred_language

source

goal

level

track_preference

format_preference

schedule_preference

status

notes

created_at

Course Request

id

lead_id

level

track

preferred_days

preferred_time_block

format

location_preference

status

matched_cohort_id

Enrollment

id

lead_id

cohort_id

enrollment_status

payment_status

created_at

Communication Log

id

lead_id

channel

direction

status

message_summary

created_at

follow_up_at

Payment

id

enrollment_id

amount

currency

method

status

paid_at

external_reference QA rule: These entities should be implemented through Supabase/database structures, not assumed to exist in a Node server.

54. Recommended Build Priority

Priority 1 — Operating Model Fixes

These should come before visual polishing.

Create master spec file.

Define statuses clearly.

Separate lead, request, cohort, enrollment, and payment.

Add cohort status beyond active/inactive.

Add track preference: Arabizi / Arabic script / not sure.

Add structured schedule fields.

Add WhatsApp manual lead creation.

Make counters use qualified database records only.

Add technical clarification that backend tasks mean Supabase/data-layer tasks.

Priority 2 — Admin Workflow

Dashboard with urgent actions.

Lead detail page for all lead types.

Assign lead to cohort.

Create cohort from course requests.

Mark payment manually.

Follow-up reminders.

Archive instead of delete.

Confirm WhatsApp actions manually.

Priority 3 — Student Conversion

Current groups high on homepage.

Request-a-course flow.

Quiz result linked to real cohort.

Better CTA wording based on cohort status.

Arabizi/script selector visible.

Schedule page.

Clear post-submit confirmation.

Priority 4 — Technical Reliability

Confirm main TypeScript config checks src/.

Confirm Supabase functions are validated/type-checked.

Confirm migrations match frontend fields.

Confirm RLS/admin protection.

Confirm public counters are database-driven.

Confirm build/deploy process works.

Document required environment variables.

Priority 5 — Long-Term Growth

Student portal.

Attendance tracker.

Progress tracker.

Referral system.

Community/WhatsApp group management.

Multi-tutor management.

Reports and analytics.

55. Final QA Approval Standard

A feature is approved only if it passes these questions.

Student-side approval

Does it help the student answer:

What is Lebanese Arabic?

Is this course right for me?

Can I start without Arabic script?

What level am I?

What schedule can I attend?

Is the group forming or confirmed?

How many students are needed?

What happens after I submit?

Can I ask questions easily?

Admin-side approval

Does it help admin answer:

Who needs attention today?

Which leads are new?

Which students were contacted?

Which cohorts can open?

Which students are confirmed?

Who has paid?

Who requested a different schedule?

Which WhatsApp leads need to be entered?

What should I do next?

Data-side approval

Does it preserve:

correct counters

clear statuses

no duplicate/conflicting data

no misleading public information

no untracked WhatsApp-only students

no confirmed seats without cohort

no physical classes without location

no public cohorts without schedule

no hardcoded fake counters

Technical-side approval

Does it respect the real architecture?

React/Vite frontend

Supabase data layer

Supabase functions where needed

no imaginary Node backend assumptions

database-driven counters

protected admin actions

migration/frontend consistency

clear deployment requirements

Business-side approval

Does it support:

one tutor now

more tutors later

weekday evening courses

weekend online courses

physical Bucharest courses

online students outside Bucharest

Romanian and English audiences

cohort-based growth

request-driven course creation

56. Final Recommendation

The website should not choose between forms and WhatsApp. It should use both. The correct system is:

Public form for structured tracking. WhatsApp for human trust and conversion. Admin panel to connect both into one lead/cohort database. Supabase/data layer as the source of truth. WhatsApp should reduce anxiety. The form should preserve data. The admin panel should turn that data into cohorts. The counter should only display what the database can justify. The technical implementation should reflect the real architecture: React/Vite frontend + Supabase database/functions/admin logic. Not: traditional Node backend. The final product standard is: Every student action must be trackable, every cohort must be manageable, every counter must be honest, every admin screen must tell you what to do next, and every technical task must match the real architecture of the project.