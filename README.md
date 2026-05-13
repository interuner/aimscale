# AimScale MVP

AimScale is a small static website experiment for English search traffic. The first page is a mouse sensitivity, eDPI, and cm/360 calculator for FPS players.

## Files

- `index.html` - single-file static site with styles and calculator logic.
- `data/games.json` - game constants, review status, and calculation scope.
- `scripts/test-formulas.js` - formula smoke tests for eDPI, cm/360, and core conversions.
- `scripts/check-site.js` - static site quality checks for SEO basics, sitemap coverage, internal links, and risky claims.
- `methodology.html` - formula, scope, limitations, and review process.
- `edpi-calculator.html` - focused eDPI calculator and guide.
- `valorant-edpi-calculator.html` - Valorant-specific eDPI calculator and cm/360 estimate.
- `cs2-edpi-calculator.html` - CS2-specific eDPI calculator and cm/360 estimate.
- `cm-360-calculator.html` - focused cm/360 calculator and guide.
- `valorant-cm-360-calculator.html` - Valorant-specific cm/360 calculator.
- `dpi-sensitivity-converter.html` - DPI change sensitivity converter.
- `AGENTS.md` - maintenance rules for Codex and other coding agents.
- `README.md` - deployment and launch notes.

## Formula Tests

Run:

```bash
node scripts/test-formulas.js
```

The tests cover eDPI, cm/360, CS2 to Valorant, Valorant to CS2, DPI changes, and invalid input handling.

## Site Quality Check

Run:

```bash
node scripts/check-site.js
```

The checker validates titles, meta descriptions, canonical URLs, one H1 per page, sitemap coverage, internal links, Methodology links, early-stage placeholders, premature ad code, and high-risk claims.

## Deploy

Recommended first deployment path:

1. Create a GitHub repository.
2. Push this folder to the repository.
3. Connect the repository to Cloudflare Pages or Vercel.
4. Use root directory `/`.
5. Leave build command empty.
6. Use output directory `/`.
7. Add a custom domain.
8. Enable HTTPS.

GitHub Pages also works for this MVP if you publish from the repository root.

## Before Applying For AdSense

Add separate pages for:

- About
- Contact
- Privacy Policy
- Terms

Then add:

- Google Search Console
- Google Analytics
- Cookie consent for EEA, UK, and Switzerland traffic
- `ads.txt` after AdSense gives the publisher ID
- A sitemap once the final domain is known

Do not show visible ad placeholders before applying for AdSense. Keep ads away from the calculator area.

## Next Pages To Build

- CS2 to Valorant sensitivity converter
- Valorant to CS2 sensitivity converter
- Apex Legends sensitivity converter
- What is cm/360?
- DPI vs eDPI for FPS games
- Best sensitivity ranges by game, with clear sourcing and caveats
- CS2 cm/360 calculator
- Valorant scoped sensitivity explainer
- CS2 to Apex sensitivity converter

## Notes

The current constants are a practical MVP baseline and should be reviewed before publishing a serious calculator at scale. Scoped sensitivity, FOV, acceleration, and per-game settings can change how the result feels in practice.
