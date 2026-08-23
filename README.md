# Campus Lost & Found Registry

A university platform where students and staff can report, browse, verify, and claim lost and found belongings.

## Module - Member 4: Item Details + Ownership Verification + Claim/Status System

- **Route:** `/item/:id`
- **Features:**
  - View full item details (image, category, location, date, reporter info)
  - Ownership Verification form for found items
  - Found Item report form for lost items
  - Form validation with inline error messaging
  - Item status updates (Open -> Claimed -> Archived) stored in `campusItems` Local Storage key
  - Responsive design aligned with Campus Lost & Found blue/navy theme

## Getting Started

```bash
npm install
npm run dev
```
