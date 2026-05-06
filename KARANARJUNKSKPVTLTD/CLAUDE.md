# CLAUDE.md — Fiinny ERP SaaS (KARANARJUNKSKPVTLTD)

AI context file for safe code modifications. Read this before making any change.

---

## 1. Project Overview

**Fiinny ERP** is a production SaaS ERP for Indian retail businesses.

**Key modules:**
- **POS** — Point-of-sale billing (`/pos`, `POSPage`)
- **B2B Invoice** — GST-compliant invoicing (`/b2b-invoice`, `B2BInvoicePage`)
- **Khata** — Digital credit ledger (`/digital-khata`, `DigitalKhataPage`)
- **Inventory** — Rate sheets, batches, warehouses, barcodes (`/rates`, `/inventory-batches`, `/warehouses`, `/barcode`)
- **Analytics** — Dashboards for B2B, B2C, online channels, master analytics, GST & financial reports
- **Payments** — Payment links, reminders, Razorpay integration
- **Worklist** — Sales order lifecycle (quotations → orders → delivery challans → invoices)
- **Portals** — Separate UX for retailers (`/retailer-portal`) and manufacturers (`/manufacturer-portal`)
- **Admin** — Role matrix, user management, invoice templates, schema builder, store management
- **AI Advisor** — Claude-powered business insights (`/ai-advisor`)

---

## 2. Architecture Overview

### Frontend (`src/`)
```
src/
├── App.tsx              # ALL routing + nav config + layout (do not split without explicit instruction)
├── firebase.ts          # Firebase SDK init (Auth, Firestore, Storage, Functions, AppCheck)
├── main.tsx             # Entry point
├── pages/               # 50 lazy-loaded page components (one per route)
├── components/          # Shared UI + landing page components
├── contexts/            # AuthContext (roles/permissions), SchemaContext, ToastContext
├── services/            # invoiceTemplateService, schemaService
├── utils/               # invoiceEngine, gstCalculator, gstinValidator, tenantPath, constants
├── types/               # TypeScript interfaces
└── locales/en|hi|mr/    # i18n translation files
```

### Backend (`functions/src/`)
- `karanArjunAI.ts` — AI advisor HTTP endpoint
- `payments.ts` — Razorpay order creation + webhook verification
- `monitoring.ts` — Daily metrics aggregation + Firestore backups
- `whatsappReceipts.ts` — WhatsApp receipt delivery

**Region:** `asia-south1`

### Database (Firestore)
**Multi-tenant structure:**
- Root-level: `users`, `retailers`, `manufacturers`, `salesOrders`, `onlineOrders`, `paymentLinks_public`, `publicConfig`
- Tenant-scoped: `/tenants/{tenantId}/{collection}` — use `getTenantCollection()` from `src/utils/tenantPath.ts`

**Key tenant collections:** `products`, `invoices`, `salesOrders`, `quotations`, `purchaseOrders`, `deliveryChallans`, `paymentLinks`, `rateSheet`, `inventoryBatches`, `godowns`, `settings/invoiceBranding`, `settings/rolePermissions`, `invoice_templates`

### Data Flow
```
User Action → React Page Component
           → Firestore (direct reads/writes via SDK)
           → OR Firebase Cloud Function (payments, AI, WhatsApp)
           → Firestore updated → UI reacts via real-time listeners
```

---

## 3. Engineering Principles

- **Never break existing routes.** All 44 routes in `App.tsx` must remain functional unless explicitly told to remove one.
- **Never delete components** unless the instruction explicitly says "delete" or "remove."
- **Prefer extension over modification.** Add new items alongside existing ones; don't replace working code.
- **Keep changes modular and reversible.** Prefer isolated additions; avoid global refactors.
- **Separation of concerns.** Business logic stays in `utils/` and Cloud Functions. Pages handle UI state only.
- **Use existing utilities.** Always use `getTenantCollection()` for Firestore. Always use `invoiceEngine.ts` for invoice math. Always use `gstCalculator.ts` for tax.
- **Never hardcode tenant IDs** or user roles. Pull from `AuthContext`.

---

## 4. UI/UX Rules

- **Navigation items** are defined as two arrays in `App.tsx`: `mainNavItems` (lines ~114–139) and `adminItems` (lines ~147–160). To add/reorder items, edit these arrays only.
- **Route paths must not change** when renaming a nav label. Label changes are safe; `path` changes break bookmarks and deep links.
- **Do not add inline styles.** Use Tailwind classes or existing CSS modules.
- **Avoid hardcoding strings** visible to users — add them to `src/locales/en/translation.json` (and hi/mr).
- **Role-aware rendering** — always check permissions via `AuthContext` before showing UI. Never render admin UI based on hardcoded role strings.

---

## 5. Firestore Rules

- **Do not add new collections** without updating `firestore.rules` with appropriate read/write rules.
- **Do not change document schema** (add/remove/rename fields) without checking all pages and Cloud Functions that read those fields.
- **Tenant isolation is mandatory.** Never read/write `/tenants/{tenantId}/` with a different tenantId than the logged-in user's.
- **Minimize reads.** Avoid fetching entire collections when a query with `where()` will suffice. Never read in a loop.
- **Batch writes** for multi-document updates — never fire multiple independent `setDoc()` calls for atomic operations.
- **Do not rename collection names** — this is a breaking change with no migration path in NoSQL.
Do not commit the changes without my permission

---

## 6. Backend (Cloud Functions) Rules

- **Secure logic stays in Cloud Functions.** Payment verification, Razorpay secret usage, and AI API keys must never move to frontend code.
- **Do not add new HTTP functions** without adding Firebase App Check enforcement.
- **Region is fixed:** `asia-south1` — do not change.
- **Admin SDK only in functions.** Never import `firebase-admin` in `src/`.
- **Test functions locally** with the Firebase Emulator before deploying.

---

## 7. Safe Change Workflow

Follow this sequence for every change:

1. **Identify scope** — which files, routes, Firestore collections, and roles are affected?
2. **Read before writing** — read the target file fully before editing.
3. **Check dependencies** — search for all imports/usages of the symbol you're changing.
4. **Make the smallest possible change** — one concern per edit.
5. **Verify types compile** — run `npm run build` or `tsc --noEmit`.
6. **Check translations** — if you added user-visible text, add keys to all three locale files (en/hi/mr).
7. **Do not proceed to the next change** until the current one is verified.

---

## 8. Current Refactor Context (as of May 2026)

**Branch:** `refactor/navbar`

**Goal:** Restructure the navigation drawer to show only priority features. The full menu remains as fallback.

**Rules for this refactor:**
- Edit `mainNavItems` and `adminItems` arrays in `App.tsx` only — do not modify route definitions.
- Items removed from the visible nav must still have their routes and page components intact.
- Do not delete any page component or route during this refactor.
- Consider adding a "More" or collapsed section for deprioritized items rather than removing them entirely.
- `screenKey` values on nav items drive permission checks — do not change them without auditing `AuthContext`.

---

## 9. Key File Reference

| Purpose | File |
|---|---|
| All routes + nav config | `src/App.tsx` |
| Firebase init | `src/firebase.ts` |
| Auth + roles | `src/contexts/AuthContext.tsx` |
| Multi-tenant Firestore helper | `src/utils/tenantPath.ts` |
| Invoice calculation | `src/utils/invoiceEngine.ts` |
| GST calculation | `src/utils/gstCalculator.ts` |
| GSTIN validation | `src/utils/gstinValidator.ts` |
| Firestore security rules | `firestore.rules` |
| Cloud Functions | `functions/src/` |
| i18n translations | `src/locales/{en,hi,mr}/translation.json` |
