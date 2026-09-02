# Frovely public beta

## What is ready in this repository

- PWA manifest and service worker. Only static application files are cached; API responses and private data are excluded.
- Account currency, IANA time zone, email reminder settings, beta entitlements, account export, and account deletion.
- A Render cron job that runs `npm run reminders:send --workspace backend` every fifteen minutes. Deliveries are unique per subscription, renewal date, channel, and reminder offset.
- Anonymous daily counters only: verified signups, completed onboarding, created subscriptions, and enabled reminders.

## Required before opening registration

1. Register `frovely.app` and configure `https://app.frovely.app` for the static site and `https://api.frovely.app` for the API. Do not substitute another domain without a new product decision.
2. In Render, set `CLIENT_ORIGIN` and `CLIENT_ORIGINS` to `https://app.frovely.app`, and `VITE_API_URL` to `https://api.frovely.app/api`.
3. Keep `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=lax`. The `app` and `api` subdomains must share the same registrable domain.
4. Configure a verified Resend sending domain, `EMAIL_FROM`, `EMAIL_REPLY_TO`, and the same `RESEND_API_KEY` for the API and reminder cron job.
5. Complete the publisher identity, support contact, privacy policy, terms, retention periods, and governing-law details in the legal pages. The placeholder pages intentionally state that public launch is blocked until then.
6. Apply migrations with `npm run db:deploy` before the API starts. Do not run a public beta against a database without the `20260901000000_add_beta_international_foundation` migration.
7. Keep `PUBLIC_REGISTRATION_ENABLED=false`, set `BETA_INVITE_ONLY=true` and `BETA_INVITE_LIMIT=30` for the private cohort. Set public registration to `true` only after the preceding legal and email requirements have been completed.

## Beta and Premium controls

- `BETA_ACCESS_ENABLED=true` gives verified beta invitees the `BETA` entitlement.
- `PREMIUM_FEATURES_ENABLED=false` keeps reminder preferences available during beta.
- When billing is introduced, set `BETA_ACCESS_ENABLED=false`, set `PREMIUM_FEATURES_ENABLED=true`, and update entitlements only from verified Stripe webhooks. Stripe is deliberately not integrated until its account, price IDs, tax setup, and signing secret exist.

## Phone validation

1. Deploy a manual Render preview or staging environment over HTTPS.
2. Create a beta invitation as an administrator, then on Android Chrome and iPhone Safari register from the private link, verify the email, complete onboarding, add an subscription, and install Frovely from the browser menu.
3. Confirm that a reload retains the session and that the service worker never makes subscriptions available offline.
4. Trigger the Render cron job manually after creating a renewal in the configured reminder window. Check one email and ensure a second trigger does not send a duplicate.

Push notifications are intentionally deferred. Their release requires VAPID keys, explicit browser permission, a push-subscription API, and the same delivery ledger with email fallback.
