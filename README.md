# AimScale

AimScale is a lightweight static website for FPS mouse sensitivity tools, focused on eDPI, cm/360, DPI changes, and practical game-to-game sensitivity conversion.

Live site: https://aimscale.top/

## Current Status

- Deployed on Cloudflare Pages from the `main` branch.
- Production domain uses the non-www canonical host: `https://aimscale.top/`.
- Sitemap submitted in Google Search Console: `https://aimscale.top/sitemap.xml`.
- Redirect validation has started in Google Search Console.
- Google Analytics 4 and Microsoft Clarity tracking are installed.
- Current site quality checks cover SEO basics, sitemap coverage, internal links, formula safety, analytics tags, game constant metadata, limitation notices, and risky claims.
- Last project note update: 2026-05-14.

## Site Structure

- `index.html` - homepage, main calculator entry, and tool map.
- `edpi-calculator.html` - general eDPI calculator.
- `cm-360-calculator.html` - general cm/360 calculator.
- `dpi-sensitivity-converter.html` - DPI change sensitivity converter.
- `cs2-to-valorant-sensitivity.html` - CS2 to Valorant conversion.
- `valorant-to-cs2-sensitivity.html` - Valorant to CS2 conversion.
- `valorant-edpi-calculator.html` - Valorant eDPI calculator.
- `cs2-edpi-calculator.html` - CS2 eDPI calculator.
- `valorant-cm-360-calculator.html` - Valorant cm/360 calculator.
- `apex-legends-sensitivity-converter.html` - Apex Legends conversion page.
- `overwatch-2-sensitivity-converter.html` - Overwatch 2 conversion page.
- `rainbow-six-siege-sensitivity-converter.html` - Rainbow Six Siege conversion page.
- `what-is-cm-360.html` - educational guide.
- `dpi-vs-edpi.html` - educational guide.
- `best-cm-360-for-cs2.html` - CS2 sensitivity range guide.
- `best-cm-360-for-valorant.html` - Valorant sensitivity range guide.
- `methodology.html` - formula, limitations, and review process.
- `about.html`, `contact.html`, `privacy.html`, `terms.html` - trust and policy pages.
- `sitemap.xml` - submitted sitemap.
- `robots.txt` - crawl instructions.
- `_redirects` - Cloudflare Pages redirects for canonical URL cleanup.
- `data/games.json` - game constants, confidence levels, and calculation scope.
- `scripts/test-formulas.js` - formula smoke tests.
- `scripts/check-site.js` - static site quality checker.
- `AGENTS.md` - maintenance rules for future coding agents.

## Local Checks

Run formula tests:

```bash
node scripts/test-formulas.js
```

Run the site quality checker:

```bash
node scripts/check-site.js
```

The checker validates titles, meta descriptions, canonical URLs, one H1 per page, sitemap coverage, internal links, Methodology links, last reviewed dates, FAQ coverage, converter limitation notices, analytics tags, game constant metadata, premature ad code, and high-risk claims such as "perfect" or "guaranteed".

## Deployment Notes

Cloudflare Pages settings:

- Repository: `interuner/aimscale`
- Branch: `main`
- Build command: none
- Output directory: `/`
- Production domain: `https://aimscale.top/`

Canonical URL rules:

- Use extensionless canonical URLs, such as `/edpi-calculator`.
- Redirect `.html` URLs to extensionless URLs.
- Redirect `/index.html` to `/`.
- Keep `www` redirected to the non-www host.

## Operating Workflow

Weekly routine:

1. Check Google Search Console for indexing status, impressions, clicks, CTR, and average position.
2. Update the operating tracker in `../outputs/aimscale-ops-tracker/AimScale运营跟踪表.xlsx`.
3. Improve pages with impressions but weak CTR by updating titles and meta descriptions.
4. Improve pages stuck in "Discovered - currently not indexed" by adding internal links, examples, and clearer page value.
5. Build the next page batch from real GSC queries rather than guessing.

## Next Pages To Build

Priority candidates:

- `cs2-cm-360-calculator`
- `apex-legends-edpi-calculator`
- `overwatch-2-edpi-calculator`
- `valorant-sensitivity-to-cm-360`
- `cs2-sensitivity-to-cm-360`
- `apex-to-valorant-sensitivity`
- `valorant-to-apex-sensitivity`
- `fps-sensitivity-glossary`

## Content Rules

- Never change formulas without updating tests.
- Never invent game constants.
- Treat results as practical hip-fire baselines, not guaranteed identical game feel.
- Every converter page must include a limitation notice and link to `/methodology`.
- Every new public page must include title, meta description, canonical URL, H1, internal links, and sitemap entry.
- Do not place ads above or inside the core calculator.
- Do not publish pro player settings without source and review date.

## AdSense Readiness

Current trust pages are in place: About, Contact, Privacy Policy, Terms, Methodology.

Before applying for AdSense:

- Keep expanding useful calculator and guide pages.
- Confirm enough pages are indexed.
- Confirm the current analytics and privacy/cookie setup is appropriate for target regions.
- Keep `ads.txt` aligned with the actual AdSense publisher ID before applying.
- Keep ads away from the calculator interaction area.

## Notes

The current constants are a practical MVP baseline. Scoped sensitivity, FOV, acceleration, zoom settings, and per-game input behavior can change how results feel in practice.
