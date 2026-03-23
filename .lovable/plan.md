

# Add CEFR Level Tabs to Group Course Card

## Overview
Replace the single static "Cursuri de Grup" card in the Programs section with a tabbed card showing all 6 levels (A1-C2) as pill buttons. A1 shows full details (current schedule, price, features). Levels A2-C2 show a "Coming soon / Contact us" state.

## Changes

### 1. Update i18n translations (`src/lib/i18n.tsx`)
- Add keys for each level label (A1, A2, B1, B2, C1, C2)
- Add "coming soon" / "contact us" text in both RO and EN
- Add level-specific subtitle text (e.g., "Nivel A0→A1", "Nivel A1→A2", etc.)

### 2. Redesign Group Course card in `ProgramsSection.tsx`
- Replace the simple group card with a custom card that has **pill-style tab buttons** across the top: `A1 | A2 | B1 | B2 | C1 | C2`
- **A1 tab (active by default)**: Shows current content — description, 4 features, CTA button linking to `#inscriere`
- **A2-C2 tabs**: Shows a "Coming soon" message with a WhatsApp or contact CTA instead of the registration button
- Private and Kids cards remain unchanged
- Layout: Group card spans full width on top (or stays in the 3-column grid but with the tabs inside)

### 3. Add level selector to Group registration form (`GroupCourseForm.tsx`)
- Add a `level` select/dropdown defaulting to "A1"
- Save the selected level in the `registrations` table (use existing `notes` or `format` field, or add via the form data)
- Only A1 is selectable for now; others disabled or hidden

### 4. Database
- No schema changes needed — level can be stored in an existing field or as part of form metadata

## Visual Design
- Pill buttons: small rounded buttons in a row, primary color when active, muted border when inactive
- Responsive: pills wrap on mobile
- Kids card stays exactly as-is — no levels

