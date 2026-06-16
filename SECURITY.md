# Security

This is a **static** website (HTML/CSS/vanilla JS) — there is no server, database, login, payment, or user account. The attack surface is intentionally tiny.

## Hardening in place

- **No third-party runtime code.** Fonts, CSS, JS and images are all self-hosted (`'self'`). No CDN scripts, no trackers, no analytics, no external embeds.
- **Strict Content-Security-Policy** (meta tag): `default-src 'self'`, `script-src 'self'` (inline scripts disallowed), `object-src 'none'`, `base-uri 'self'`, `upgrade-insecure-requests`.
- **No secrets.** Nothing sensitive is committed; the only "credential" is the public WhatsApp number, which is meant to be public.
- **DOM-XSS defence in depth.** The quote basket only accepts a fixed allowlist of service names, persisted data from `localStorage` is filtered against that allowlist, and any dynamic string is HTML-escaped before rendering.
- **Anti-clickjacking** frame-buster in JS, plus `frame-ancestors 'none'` in the CSP.
- **External links** use `rel="noopener noreferrer"`; referrer policy is `strict-origin-when-cross-origin`.
- **HTTPS** enforced by the host.

## Header-level controls (need a real HTTP host/proxy)

GitHub Pages cannot send custom response headers. For the strongest posture, put the site behind **Cloudflare** (free) and add:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` (enforced as a header)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

Cloudflare also adds free DDoS protection, a WAF, and bot mitigation.

## Reporting a vulnerability

Please report any security issue via WhatsApp (https://wa.me/447926999623) or the contact in [/.well-known/security.txt](.well-known/security.txt). We aim to respond within a few days.
