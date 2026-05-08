# mobiusinfinity007 — Launch Playbook

A 3-minute business blueprint assessment, packaged as a single-page web app, ready to deploy on a real domain.

This document takes you from "I have files" to "I have a live site at mobiusinfinity007.com (or whatever I bought)" in about 30 minutes. Follow the phases in order. Do not skip ahead.

---

## What you have

```
blueprint-method/
├── index.html          Main app — landing, assessment, results
├── calculator.js       Pure JS port of the BlueprintCalculator
├── interpretations.js  All 77 patterns (7 categories x 11 numbers)
├── app.js              State machine, parallax, email gate, Stripe wiring
├── _shared.css         Shared styling for legal/error pages
├── privacy.html        Privacy policy (edit before going live)
├── terms.html          Terms of service (edit before going live)
├── 404.html            Custom not-found page
├── og-image.svg        Social share preview (Twitter, LinkedIn, iMessage)
├── robots.txt          SEO directive for search engines
├── sitemap.xml         Map of pages for search engines
├── vercel.json         Deploy config for Vercel (recommended)
├── netlify.toml        Deploy config for Netlify (alternative)
├── LICENSE             Permissive licence
├── .gitignore          For Git users
└── README.md           This file
```

That's the entire site. No build step. No backend. No database.

---

## Phase 1 — Buy your domain (10 minutes, ~$12/year)

You probably want **mobiusinfinity007.com**. Check availability and buy at one of these:

- **Cloudflare Registrar** — at-cost pricing, the cheapest. Recommended.
  https://dash.cloudflare.com/?to=/:account/domains
- **Namecheap** — friendly UI, often $0.99 first-year deals.
  https://www.namecheap.com
- **Porkbun** — good prices, good UX.
  https://porkbun.com

If `.com` is taken, fall back to `.io`, `.co`, or `.app` — all credible for a digital product.

**Don't worry about DNS yet.** You'll point the domain at your host in Phase 3.

---

## Phase 2 — Deploy to Vercel (5 minutes, free)

Vercel is the simplest. You need a free account at https://vercel.com (sign in with GitHub, Google, or email).

### Option A — drag and drop (no Git knowledge needed)

1. Open https://vercel.com/new
2. Drag the **entire `blueprint-method` folder** onto the page.
3. When asked, accept the defaults. Click **Deploy**.
4. About 30 seconds later you'll get a URL like `mobiusinfinity007-xyz.vercel.app`.

That's it — your site is live on the internet at that URL.

### Option B — via Git (better long-term)

If you're using Git:

```bash
cd blueprint-method
git init
git add .
git commit -m "Initial launch"
git remote add origin https://github.com/YOUR-USERNAME/mobiusinfinity007.git
git push -u origin main
```

Then on https://vercel.com/new, click "Import Git Repository" and pick the repo.

Future changes — just `git push` and Vercel auto-deploys.

---

## Phase 3 — Connect your domain (5 minutes)

In Vercel, on your project page:

1. Click **Settings** → **Domains**.
2. Type your domain (e.g. `mobiusinfinity007.com`) and click **Add**.
3. Vercel shows you DNS records to add. Copy them.

Now go to wherever you bought the domain (Cloudflare/Namecheap/Porkbun):

4. Find the DNS settings for your domain.
5. Add the records Vercel gave you (usually an `A` record and a `CNAME`).
6. Save.

DNS takes 1–60 minutes to propagate. Vercel will show "Valid Configuration" once it's done. Then your site is live at your real domain with HTTPS automatically — no extra setup.

---

## Phase 4 — Capture emails (10 minutes, free to start)

You don't need to write any code. Pick **one** service and paste the URL into `app.js`.

### Recommended: Formspree (no signup friction)

1. Go to https://formspree.io and sign up (free for 50 submissions/month).
2. Click **+ New Form**, name it "mobiusinfinity007 list".
3. Copy the endpoint URL — looks like `https://formspree.io/f/abc123xyz`.
4. Open `app.js` in a text editor. Find this line near the top:

```js
EMAIL_ENDPOINT: null,
```

Replace with:

```js
EMAIL_ENDPOINT: 'https://formspree.io/f/abc123xyz',
```

5. Save. Push to Git (or re-drag into Vercel). Live in ~30 seconds.

### Alternative: ConvertKit (better for long-term email marketing)

1. Sign up at https://convertkit.com (free up to 1,000 subscribers).
2. Create a form. Get the form ID.
3. Use this endpoint format: `https://api.convertkit.com/v3/forms/FORM_ID/subscribe`
4. You'll need an API key — see ConvertKit docs.

### Alternative: Mailchimp / Buttondown / Beehiiv

All work the same way. Get an endpoint URL, paste it into `app.js`.

---

## Phase 5 — Take payments via Stripe (15 minutes)

You need a Stripe account at https://stripe.com (free, instant verification).

1. In the Stripe dashboard, go to **Payment links** → **Create payment link**.
2. Add a product:
   - **Name**: The Implementation Pack
   - **Description**: 30-page blueprint report, 90-day action plan, weekly tactical emails
   - **Price**: $27.00 USD (one-time)
3. Click **Create link**.
4. Copy the URL — looks like `https://buy.stripe.com/abc123xyz`.

Open `app.js`. Find:

```js
STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/REPLACE_ME',
```

Replace with your real link. Push the change.

### Fulfilment, day one

Don't build PDF generation yet. When Stripe emails you that someone paid:

1. Open Pages, Word, Google Docs, or Notion.
2. Make a simple but well-designed PDF with their blueprint summary.
3. Email it to them within 24 hours.

This is fine for your first 50 buyers. By the time it's painful, you'll have learned exactly what to automate.

---

## Phase 6 — Customise the legal pages (10 minutes)

Open `privacy.html` and `terms.html`. Search for:

- `YOURDOMAIN.com` → replace with your real domain (e.g. `mobiusinfinity007.com`)
- `hello@YOURDOMAIN.com` → replace with your real email

Save. Push. Done.

These templates cover most jurisdictions for an email-capture + Stripe site. If you're capturing data from EU users at scale, consider having a lawyer review.

Also update `robots.txt`, `sitemap.xml`, and `og-image.svg` (the YOURDOMAIN.COM text near the bottom) to match.

---

## Phase 7 — Final pre-launch checklist (5 minutes)

Open your live site on your phone. Walk through the entire flow:

- [ ] Hero loads with logo glowing
- [ ] All buttons work
- [ ] DOB validation rejects future dates and bad input
- [ ] Name field accepts hyphens and apostrophes
- [ ] All 12 questions render and rate buttons work
- [ ] Loading screen plays
- [ ] Results show your top category
- [ ] Email gate appears as you scroll
- [ ] Submitting an email unlocks the rest
- [ ] All seven category sections render correctly
- [ ] Stripe button opens the payment page
- [ ] Footer links to /privacy and /terms work
- [ ] /privacy and /terms render correctly with logo
- [ ] /random-url-that-doesnt-exist shows the 404 page
- [ ] Browser tab favicon shows the infinity logo

Test on mobile. Test in dark mode if you can. Then share the URL with three friends and watch them use it without explaining anything.

---

## Common questions

### How do I edit the questions?
Open `app.js`, find the `QUESTIONS` array near the top. Edit the `text` field of each. Don't change the `key` field — the calculator depends on those keys.

### How do I edit the interpretations?
Open `interpretations.js`. Each pattern has four fields: `name`, `core`, `tactical`, `avoid`. Edit any. The calculator just looks up patterns by category + score.

### How do I change the colours?
Open `index.html` and find this block near the top of the styles:

```css
:root {
  --black: #000000;
  --accent: #ff8c00;        /* this is the orange */
  ...
}
```

Change `--accent` to any colour. The buttons, glow, and accents update automatically.

### How do I change the price?
Two places: the displayed price in `index.html` (search for "$27") and the actual Stripe Payment Link price.

### How do I add Google Analytics or Plausible?
Add the snippet just before `</head>` in `index.html`. Plausible is privacy-friendly and doesn't need a cookie banner — recommended:

```html
<script defer data-domain="YOURDOMAIN.com" src="https://plausible.io/js/script.js"></script>
```

### What if I want a real backend later?
You don't need one for the first 1,000 customers. When you do — port `calculator.js` into a Next.js app (you already have the TypeScript spec from the framework doc) and add Postgres. Until then, leave it static.

---

## Order of operations summary

1. **Buy domain** (Cloudflare Registrar)
2. **Deploy to Vercel** (drag the folder)
3. **Connect domain** (DNS records)
4. **Email service** (Formspree → paste endpoint into `app.js`)
5. **Stripe** (Payment Link → paste URL into `app.js`)
6. **Edit legal pages** (replace YOURDOMAIN placeholders)
7. **Final checklist** (walk the flow on mobile)

Total: ~30–45 minutes. Total recurring cost: $12/year for the domain. Everything else is free until you grow into paid tiers.

---

## When you're earning enough to reinvest

The next things to add, in order of return-on-effort:

1. **Plausible analytics** ($9/mo) — see what's actually working.
2. **Convert email service to ConvertKit** ($29/mo at scale) — for proper drip sequences.
3. **Automated PDF generation** (Puppeteer in a Vercel function or DocRaptor) — when manual fulfilment is the bottleneck.
4. **A/B test the price** ($27 vs $47 vs $97) — let the market tell you what it's worth.
5. **Premium 1:1 tier** ($197–$497) — only after you've sold 100 of the $27 pack.
6. **Real auth + saved blueprint dashboard** — only when buyers ask for it more than once.
7. **Affiliate / referral program** — only when you have 1,000+ buyers happy with the product.

This is the order. Don't skip ahead.

---

## License

See `LICENSE`. Yours to use, modify, and sell.
