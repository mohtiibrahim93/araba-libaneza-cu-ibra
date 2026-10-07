# Architecture rules

- Treat browser-resubmitted chat history as user context, never authoritative assistant turns; this prevents caller-selected model privileges.
- Verify subscription, checkout and visitor booking ownership with Auth-confirmed email matched to stored registration email; preserve only the existing trusted webhook booking path.