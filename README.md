# WNJetWashing — website

A brand-new, **standalone** marketing site for WNJetWashing (decking, patio & driveway jet washing across Essex, Hertfordshire & North East London). No Shopify, no build step, no framework — just static HTML/CSS/vanilla JS that you can host anywhere.

> Rebuilt from the old Shopify store (used only for reference). Design direction: **"Editorial Trust"** — a confident serif masthead, a palette sampled from the real action photos, and a signature drag-to-clean before/after interaction in place of a hero cover photo.

## Run locally

Any static file server works. For example:

```bash
cd wnj-jetwashing
python3 -m http.server 4178
# open http://localhost:4178
```

## Deploy

It's a static site, so drop the whole `wnj-jetwashing/` folder onto any static host:

- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder, or point it at the repo. No build command; publish directory is the folder root.
- **GitHub Pages** — push and enable Pages on the branch/folder.
- **Any web host** — upload the files; `index.html` is the entry point.

Fonts are **self-hosted** in `assets/fonts/` (Fraunces + Inter, latin subset) — there is no Google Fonts runtime dependency.

## What's on the page

| Section | Notes |
|---|---|
| Sticky nav | Wordmark, anchor links, quote-basket icon (count badge), "Book your quote now!" |
| Hero | **No cover photo** — type-led, with a draggable before/after "specimen slab" + stat counters |
| Trust strip | Credential ticks + auto-scrolling town marquee |
| Services (01–03) | The **3 real photos** (decking / patio / driveway) showing each cleaning technique + "Add to quote" |
| Process | Initial Cleaning → After Care (self-sealing sand) |
| Before/After band | Drag a real driveway photo from grimy to restored |
| Service areas | Essex / Herts / NE London + line-art coverage map |
| Testimonials | 3 reviews, one promoted pull-quote |
| Leave a review | Name, town, interactive star rating, message |
| Newsletter | Email capture |
| Final CTA | Quote-basket summary + "Book your quote now" |
| Footer | Wordmark, nav, Instagram + TikTok, repeat CTA |

A slide-out **quote basket** (persisted in `localStorage`) lets visitors collect services, then "Request your quote" → WhatsApp with those exact services pre-filled.

## Things to wire up before go-live

These are intentionally left as easy single-line swaps:

1. **WhatsApp number (required)** — every "Book your quote now" button, the basket's "Request your quote", the footer WhatsApp icon and the floating green button all open a WhatsApp chat. Set the number once in `assets/js/app.js`:
   ```js
   const WHATSAPP_NUMBER = '447000000000'; // ← replace with the real number
   ```
   Use **international format, digits only** (no `+`, spaces or `00`). A UK mobile `07123 456789` becomes `447123456789`.

   - With an **empty basket**, the chat opens pre-filled with the three services as a `1 / 2 / 3` selection.
   - If the visitor **added services to the basket**, the message pre-fills exactly those services instead.
   - Edit the message wording in the `whatsappMessage()` function in the same file.
   - (Calendly was swapped out for WhatsApp per the brief. To switch back, point `openBooking()` at a booking URL instead.)

2. **Forms (already wired for Netlify)** — the review form and newsletter are set up for **Netlify Forms**: they carry `data-netlify="true"` + a hidden `form-name`, and JS POSTs the data on submit. If you deploy to **Netlify, they work with zero extra setup** — submissions show up in your Netlify dashboard under *Forms* as `reviews` and `newsletter` (each with a honeypot for spam). The visitor always sees the friendly on-page confirmation.
   - Hosting elsewhere? The POST is ignored and the confirmation still shows. To use Formspree/Web3Forms/your own API instead, change the target URL in the `postForm()` function in `assets/js/app.js`.
   - Reviews are shown "submitted for approval" — they are **not** auto-published to the page; you moderate them.

3. **Social links** — already set to the existing accounts:
   - Instagram: `https://www.instagram.com/wnjetwashing/`
   - TikTok: `https://www.tiktok.com/@wnjetwashing`

## Files

```
wnj-jetwashing/
├── index.html
├── assets/
│   ├── css/   styles.css, fonts.css
│   ├── js/    app.js
│   ├── fonts/ Fraunces + Inter (woff2, self-hosted)
│   └── img/   decking/patio/driveway (.jpg + -sm), favicon.svg
└── README.md
```

## Accessibility & motion

Built to WCAG AA contrast, keyboard-operable (slider, star rating, drawer, menu), with visible focus rings. All animation is gated behind `prefers-reduced-motion` — counters jump to final values, sliders show a static split, the marquee stops, and ambient droplets are disabled.
