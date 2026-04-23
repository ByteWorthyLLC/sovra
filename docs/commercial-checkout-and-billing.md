# Commercial Checkout and Billing

This repository does not store or expose Stripe secret keys.

## Checkout channels

- Sovra is open source and free under MIT.
- Commercial products in this line (Klienta and Clynova) should route checkout through ByteWorthy channels.
- Primary commercial site: https://byteworthy.io

## Security policy for billing keys

Never place live billing credentials in repository files.

Use managed secrets only:

- GitHub Actions secrets
- deployment platform secret manager
- cloud KMS backed secret stores

Required patterns:

- `STRIPE_SECRET_KEY` only in server environment
- `STRIPE_WEBHOOK_SECRET` only in server environment
- publishable key only in client safe config
- rotate keys on a schedule and after incident events

## Self hosted Sovra billing setup

If you enable Stripe in your own Sovra deployment:

1. Set `STRIPE_SECRET_KEY` in server runtime only.
2. Configure webhook signing with `STRIPE_WEBHOOK_SECRET`.
3. Keep billing route auth and tenant checks enabled.
4. Run `./scripts/ci/release-readiness-checks.sh` before promotion.

## Do not do this

- do not scrape keys from websites
- do not commit keys to `.env.example` or markdown docs
- do not embed secret keys in frontend bundles
