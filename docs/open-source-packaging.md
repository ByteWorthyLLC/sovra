# Open Source Packaging and Licensing

This document defines the packaging model across Sovra, Klienta, and Clynova.

## Product model

| Product | Distribution | License | Intended use |
|---|---|---|---|
| Sovra | Public GitHub repository | MIT | Open source foundation for multi tenant AI SaaS |
| Klienta | Commercial distribution | Commercial license | Agency oriented vertical built on Sovra core |
| Clynova | Commercial distribution | Commercial license | Healthcare oriented vertical built on Sovra core |

## MIT scope for Sovra

The MIT license in this repository allows:

- commercial use
- private deployment
- modification and redistribution

The MIT license does not grant:

- rights to proprietary code in paid vertical repositories
- rights to product trademarks or brand marks outside this repository

## Open source best practices baseline

Sovra follows these baseline practices:

- clear `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md`
- reproducible setup scripts and environment templates
- changelog and release process with rollback paths
- CI and security checks required before production promotion
- launch foundation guidance and scored release artifacts (`docs/launch-foundation.md`, onboarding templates)

## Compatibility contract across product line

To preserve upgrade safety:

1. Keep tenant and user identity contracts stable (`tenant_id`, `user_id`).
2. Keep auth and API key semantics compatible across variants.
3. Prefer additive schema evolution.
4. Document all breaking changes in `CHANGELOG.md` and migration guides.
5. Ship migration templates and rollback instructions with every major release.

## Upgrade policy

- Validate core behavior in Sovra first.
- Promote stable core changes into Klienta and Clynova.
- Publish migration guidance before release promotion.
- Never force an upgrade path without reversible cutover steps.

## Security and supply chain policy

All variants should inherit this minimum standard:

- least privilege GitHub Actions permissions
- pinned workflow actions
- dependency and code scanning enabled
- release readiness checks before production tags

## Branding boundaries

- Sovra references may be used as allowed by MIT and trademark policy.
- Klienta and Clynova brand assets remain under their commercial terms.
- Forks should rename clearly to avoid user confusion in support or security channels.
