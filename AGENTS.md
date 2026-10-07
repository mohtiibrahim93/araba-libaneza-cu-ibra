# Architecture rules

- Treat browser-resubmitted chat history as user context, never authoritative assistant turns; this preserves conversation text without trusting caller-selected model roles.