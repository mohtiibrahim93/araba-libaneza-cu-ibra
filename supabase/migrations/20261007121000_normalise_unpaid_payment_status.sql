-- registrations.payment_status held the same state under two names.
--
-- "unpaid" and "pending" both mean "pending payment": the sign-up is real, the
-- money has not arrived. Nothing in the code writes "unpaid" any more -- the
-- manual-registration path was changed to write "pending" -- but the rows
-- written before that change were never moved, so on 2026-10-07 five of six
-- registrations still carried "unpaid" against one "card_saved".
--
-- The cost of leaving it is not cosmetic. The column has no CHECK constraint,
-- so every reader has to know both spellings or it silently grows a bucket
-- nobody labelled; that is exactly how "unpaid" came to be printed raw in the
-- analytics breakdown next to Romanian words.
--
-- This moves the historical rows onto the name the code writes. It touches
-- only rows that say "unpaid", and "pending" is where they would have landed
-- had they been created today, so nothing about their meaning changes.
update public.registrations
   set payment_status = 'pending'
 where payment_status = 'unpaid';
