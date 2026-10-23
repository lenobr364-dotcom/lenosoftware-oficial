# ChemVault Global — operations manual (Leno)

Concise guide for **license-related secrets**, **database migrations (including formula indexes)**, and **backups**. Keep this file internal; rotate credentials if it is ever exposed.

## 1. Environment and license-related keys

Store production values in the host secret manager (Vercel / GCP / etc.), not in chat or tickets.

| Area | Variables (examples) | Notes |
|------|----------------------|--------|
| **Core session / vault** | `CHEMVAULT_SESSION_SECRET`, `AUTH_MASTER_KEY` (legacy) | Long random strings; changing them invalidates existing CEO and core-license cookies. |
| **CEO login** | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Change default password before go-live; prefer MFA (`CHEMVAULT_ADMIN_MFA`, `CHEMVAULT_ADMIN_TOTP_SECRET`). |
| **Formula encryption** | `CHEMVAULT_FORMULA_ENCRYPTION_KEY` | Optional 64 hex chars; if unset, key is derived from session secret. Rotating requires a controlled re-encryption plan. |
| **Payments** | `STRIPE_SECRET_KEY`, webhooks; `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | Restrict Stripe dashboard to production URLs only; rotate on staff changes. |
| **Public URL** | `NEXT_PUBLIC_APP_URL` | Canonical HTTPS origin (no trailing slash) — used in metadata, checkout return URLs, and Open Graph. |
| **HTTPS / edge** | `CHEMVAULT_DISABLE_HTTPS_REDIRECT=1` | Set only on a **non-TLS** lab; never in public production. |
| **HSTS** | `CHEMVAULT_ENABLE_HSTS=1` or deploy on **Vercel** (`VERCEL=1`) | Sends `Strict-Transport-Security` on all routes when enabled. |

**Weekly:** confirm `NEXT_PUBLIC_APP_URL` matches the live hostname and that Stripe/PayPal dashboards still list the correct webhook and return URLs.

## 2. Database — formula catalog indexes (production)

Search and listing paths use `Formula` ordering and filters (`nome`, `categoria`, `licenciada`). Production should apply Prisma migrations so SQLite (or your provider) has the composite and single-column indexes.

After each deploy with new migrations:

```bash
npx prisma migrate deploy
```

Project script (same effect):

```bash
npm run db:index:formulas
```

The migration `20260509190000_formula_catalog_search_indexes` creates idempotent SQLite indexes on `nome`, `categoria`, and `(licenciada, nome)`. For **non-SQLite** production, add a provider-specific migration if you move off SQLite.

**Health check:** `GET /api/health` runs a light DB probe; watch logs for `[db-integrity]` warnings (integrity or slow licensing aggregates).

## 3. Backups

| Command | Purpose |
|---------|---------|
| `npm run backup` | Local PowerShell backup (Windows). |
| `npm run backup:cloud` | GCS daily backup script (`tsx scripts/backup-gcs-daily.mts`) — requires GCP credentials in env. |

**Monitor:** ensure scheduled jobs (cron / Cloud Scheduler) call the same scripts and that failure notifications reach your inbox. Periodically **restore a backup to a scratch DB** and verify Prisma `migrate deploy` + app boot.

## 4. Build and release checklist

1. `npm run build` (runs lint + i18n + Next production build).  
2. `npx prisma migrate deploy` on the production database.  
3. Confirm HTTPS-only access and HSTS policy for your host.  
4. Smoke: `/api/health`, localized landing, `/pricing`, `/about`, CEO login, formula dashboard lazy load.

---

*Partnership surface: Leno César & Lumen Onel — ChemVault Global (leno.software).*
