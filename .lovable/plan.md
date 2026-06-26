## Plan: Remove duplicate WhatsApp button from navbar

The user has highlighted the WhatsApp button in the navbar (Navbar.tsx, line 201-209) and noted there is already another WhatsApp CTA elsewhere on the page, making this one redundant.

### Step 1: Remove WhatsApp link from Navbar.tsx
- Delete the `<a>` element containing the WhatsApp icon + label from the navbar's right-side action area.
- Clean up any now-unused WhatsApp-related imports if this was the only usage.

No other UI or logic changes.