# AimScale MVP

AimScale is a small static website experiment for English search traffic. The first page is a mouse sensitivity, eDPI, and cm/360 calculator for FPS players.

## Files

- `index.html` - single-file static site with styles and calculator logic.
- `README.md` - deployment and launch notes.

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

## Next Pages To Build

- CS2 to Valorant sensitivity converter
- Valorant to CS2 sensitivity converter
- Apex Legends sensitivity converter
- What is cm/360?
- DPI vs eDPI for FPS games
- Best sensitivity ranges by game, with clear sourcing and caveats

## Notes

The current constants are a practical MVP baseline and should be reviewed before publishing a serious calculator at scale. Scoped sensitivity, FOV, acceleration, and per-game settings can change how the result feels in practice.
