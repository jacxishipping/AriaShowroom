# Sadozai Motors Herat

Dealership inventory, sales, CRM, and accounting application for Sadozai Motors in Herat, Afghanistan. It is built with Next.js App Router, TypeScript, Prisma, PostgreSQL, NextAuth, Zustand, Tailwind CSS, and MUI.

> **Current database state:** The configured database was reset and verified to contain only the admin account `admin@sadozaimotors.af`. Vehicles, customers, sales, and accounting records are empty. Use the admin password supplied separately when the reset was performed. Do not put that password in this file, source code, or screenshots.

## Contents

- [Prerequisites](#prerequisites)
- [Run locally](#run-locally)
- [Routes and access](#routes-and-access)
- [First-time setup](#first-time-setup)
- [Daily workflow tutorial](#daily-workflow-tutorial)
- [Photos and document uploads](#photos-and-document-uploads)
- [Currency and languages](#currency-and-languages)
- [Database and backup safety](#database-and-backup-safety)
- [Environment variables](#environment-variables)
- [Validation and production build](#validation-and-production-build)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)

## Prerequisites

- Node.js 20 LTS or newer and npm.
- PostgreSQL database reachable from the application.
- The repository's environment variables configured in `.env`.
- Optional: Vercel Blob read/write token for persistent remote photo uploads.

## Run locally

From the repository root in PowerShell:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` with the admin email and the password supplied when the current database was reset.

The local development server uses the credentials in `.env`. Keep that file private; it is ignored by Git. Do not paste its contents into issues, chats, screenshots, or commits.

## Routes and access

| Route | Purpose | Access |
| --- | --- | --- |
| `/login` | Staff sign-in | Public |
| `/` | Operations cockpit, KPIs, and fleet overview | Signed-in staff |
| `/inventory` | Search, filter, compare, and manage vehicles | Signed-in staff |
| `/intake` | Create a vehicle record and add photos | Signed-in staff; creating a vehicle is admin-only at the API |
| `/admin` | CRM leads, sales desk, and related workflows | Signed-in staff |
| `/accounting` | Accounting overview, invoices, payments, suppliers, expenses, and chart of accounts | Admin or accountant |
| `/logistics` | Transit and customs workflow | Signed-in staff |
| `/scanner` | Lot VIN/stock lookup and yard-location update | Signed-in staff |
| `/compare` | Compare selected vehicles | Signed-in staff |
| `/vehicles/[id]` | Vehicle detail view | Route is available; data access depends on its API and current session |
| `/vehicles/[id]/deed` | Sales deed/contract view | Signed-in staff |
| `/vehicles/[id]/settlement` | Sale settlement workflow | Signed-in staff |
| `/verify` and `/verify/[id]` | Document/record verification pages | Public |

API routes under `/api` provide persistence for vehicles, customers, sales, expenses, suppliers, invoices, vouchers, accounting records, uploads, and authentication. API-side role checks are authoritative; hiding a button in the interface is not a substitute for server authorization.

## First-time setup

### 1. Configure `.env`

Copy the example if you do not already have a `.env`:

```powershell
Copy-Item .env.example .env
```

Set at least:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-long-random-secret"
```

Generate a random NextAuth secret in PowerShell without printing any existing environment secrets:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `.env` as `NEXTAUTH_SECRET`. Use the exact PostgreSQL connection string from your database provider for `DATABASE_URL`; never commit it.

For persistent photo uploads, also set `BLOB_READ_WRITE_TOKEN` as described in [Photos and document uploads](#photos-and-document-uploads).

### 2. Generate Prisma client and apply the schema

```powershell
npm run db:generate
npm run db:push
```

`db:push` synchronizes the Prisma schema with the selected database. Review the target database and take a backup before schema changes, especially for an existing production database.

### 3. Sign in

Open `/login` and sign in with the admin email and password provisioned for your database. Authentication reads user accounts from PostgreSQL and validates the stored password hash. Demo accounts and shared demo passwords are disabled.

The current database has **one admin account and no business records**. Start by adding a vehicle in intake. There is no in-app user-management or password-change screen at this time; provision additional staff accounts through a secure administrative process, not by sharing the admin login.

## Daily workflow tutorial

### A. Add a vehicle

1. Sign in and open **Vehicle Intake** (`/intake`).
2. Complete the four intake stages:
   - Identification and VIN.
   - Technical specifications and customs details.
   - Purchase price and landed-cost inputs.
   - Photos and final vehicle dossier.
3. Enter a unique stock number and VIN. Check the make, model, year, mileage, origin, fuel, transmission, steering, condition, and status before saving.
4. Enter purchase price, freight, customs duty, and repair/detailing cost. The intake form calculates landed cost from these inputs; enter the asking price as the selling price.
5. Upload photos if Blob storage is configured. See the upload notes below.
6. Submit the intake form. Confirm the vehicle appears in inventory before starting a sale.

The API currently restricts vehicle creation, updates, and deletion to the `ADMIN` role. Vehicle cost fields are financial information and are not returned by the vehicle-list API to unauthenticated or sales-role users.

### B. Search and maintain inventory

1. Open `/inventory`.
2. Use the filter bar to narrow by search text, make, model, year, price, fuel, transmission, steering, origin, or status.
3. Select a vehicle to inspect its dossier. Comparison selection is limited to three vehicles.
4. Update status as the vehicle moves through transit, preparation, available, reserved, or sold.
5. Use batch actions carefully; a failed server write is surfaced as an error. Confirm records after an update.

The operations cockpit at `/` summarizes inventory and activity. CSV export and comparison are available from the inventory experience.

### C. Track customers and record a sale

1. Open `/admin` and choose the CRM/leads workflow.
2. Add a customer with their name and phone; include identity details only when appropriate and authorized.
3. Move the lead through the available lead stages as follow-up progresses.
4. Open the sales workflow, select an available vehicle, and enter the buyer details, sale amount, payment type, and exchange rate.
5. Review the details before submitting. The sale API records the sale, marks the vehicle sold, and records related ledger entries. Installment sales create an outstanding installment entry.
6. Verify the sale and associated invoice/payment records in the sales or accounting screens.

Use the deed and settlement routes for the associated contract and payment workflows. Review generated documents for correctness before printing or signing; the application does not replace legal or accounting review.

### D. Record accounting activity

Open `/accounting`. Available sections include:

- **Overview / P&L:** financial summaries from the current records.
- **Invoices:** create invoices, generate invoice PDFs, and update invoice status.
- **Payments and Sarrafi vouchers:** record payment vouchers with amount, method, and reference information.
- **Suppliers:** maintain supplier records, bills, and settlements.
- **Expenses:** record overhead or vehicle-related expenses.
- **Chart of accounts / journal:** inspect accounts and accounting entries.

Accounting pages are limited to admin and accountant roles. Validate currency, exchange rate, party, references, and amount before saving because accounting writes can create corresponding ledger entries.

### E. Follow customs and yard operations

- Open `/logistics` to review the transit/customs pipeline and clearance estimates.
- Open `/scanner` to find vehicles by stock/VIN and update their yard bay.
- Verify customs paperwork and vehicle status against the actual supporting records; computed duty and logistics values are estimates unless confirmed externally.

### F. Verify a record

Use `/verify` to open the verification interface and search a stock, VIN, contract, or invoice reference where applicable. The verifier can only confirm records available to the application; it is not an external government or customs verification service.

## Photos and document uploads

Vehicle intake uses `/api/upload` for photo uploads.

- If `BLOB_READ_WRITE_TOKEN` is configured, files are sent to Vercel Blob and the returned URLs can be persisted.
- Without the token, the endpoint returns **simulated URLs** for local/demo use. Those URLs do not represent durable uploads. Do not use simulated uploads for real vehicle records.
- Configure a valid Vercel Blob token before uploading business photos. Keep it private and rotate it if exposed.
- Upload only files you are authorized to store and publish. Avoid uploading customer identity documents to public Blob storage.

## Currency and languages

- The interface supports English, Dari/Persian, and Pashto, including right-to-left layout for Dari and Pashto.
- The workspace has a USD/AFN display currency and exchange-rate setting. Check the rate used for each transaction; changing the display rate does not retroactively correct saved accounting entries.
- Prices and ledger conversions should be confirmed against the actual transaction rate.

## Database and backup safety

- Back up PostgreSQL before schema changes, account maintenance, or bulk updates.
- The `db:seed` command is destructive to the sample-data tables it manages. It deletes existing seeded users, vehicles, customers, sales, expenses, and vehicle images/documents before inserting sample dealership records and three staff accounts. It does **not** create an admin-only empty database.
- To run that seed script, `.env` must explicitly contain `ALLOW_DESTRUCTIVE_SEED=true` and separate, unique `SEED_ADMIN_PASSWORD`, `SEED_SALES_PASSWORD`, and `SEED_ACCOUNTANT_PASSWORD` values, each at least 12 characters.
- Never run `npm run db:seed` against a database that contains records you need. Unset `ALLOW_DESTRUCTIVE_SEED` again immediately after a deliberate disposable-database seed.
- The current database has already been reset to one admin account and no business records. **Do not run the seed command** if you want to keep that state.
- Do not reset, truncate, or manually delete production data without confirming the database target and a restorable backup.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign/encrypt NextAuth sessions |
| `NEXTAUTH_URL` | Yes for deployment; recommended locally | Canonical application URL |
| `BLOB_READ_WRITE_TOKEN` | Optional | Enables persistent Vercel Blob uploads |
| `BLOB_STORE_ID` | Optional | Blob store identifier, if used by your deployment |
| `ALLOW_DESTRUCTIVE_SEED` | No | Must explicitly be `true` to permit destructive sample seeding |
| `SEED_ADMIN_PASSWORD` | Only for seeding | Unique seed admin password, minimum 12 characters |
| `SEED_SALES_PASSWORD` | Only for seeding | Unique seed sales password, minimum 12 characters |
| `SEED_ACCOUNTANT_PASSWORD` | Only for seeding | Unique seed accountant password, minimum 12 characters |

The repository ignores `.env` and `.env*.local`; keep secrets in your hosting provider's environment settings for deployed environments.

## Validation and production build

```powershell
npm run lint
npm run build
npm run start
```

`npm run lint` runs the TypeScript compiler with `--noEmit`. `npm run build` generates the Prisma client and builds the Next.js application. The production server is intended to run after the build using `npm run start`.

## Troubleshooting

### Cannot sign in

- Check that `DATABASE_URL` points to the expected PostgreSQL database and that the database is reachable.
- Confirm the user exists and uses the correct email address.
- If the account was created before demo authentication was removed, reset its password to a new private password; the old shared demo passwords are rejected.
- Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`; restart the server after changing `.env`.

### Inventory is empty

The current database was intentionally reset and contains no vehicle records. Add vehicles through `/intake`; do not seed the database unless you want the destructive sample dataset and three sample staff users.

### Photo upload says simulated

Set a valid `BLOB_READ_WRITE_TOKEN` in `.env`, restart the development server, then upload again. Simulated URLs are not persistent assets.

### A save failed

Read the error toast, confirm you are signed in with a role allowed to perform the operation, and check the database connection. Reload and verify the record before retrying a financial transaction to avoid accidental duplicate entries.

## Project structure

```text
prisma/
  schema.prisma       PostgreSQL models and enums
  seed.ts             Destructive sample-data seed (guarded)
src/
  app/                App Router pages and API routes
  components/         Shared UI and business workflow components
  lib/                Authentication, Prisma, ledger, PDF, and utilities
  store/              Zustand application state and API synchronization
```

For implementation details, start with `prisma/schema.prisma`, `src/middleware.ts`, `src/lib/auth.ts`, and the relevant route under `src/app`.
