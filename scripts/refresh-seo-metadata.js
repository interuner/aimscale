#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://aimscale.top';
const DEFAULT_LASTMOD = '2026-05-28';
const UPDATED_LASTMOD = '2026-05-29';
const updatedPages = new Set([
  '/',
  '/cs2-to-valorant-sensitivity',
  '/valorant-to-cs2-sensitivity',
  '/fps-sensitivity-conversion-guide'
]);

const featuredPages = [
  ['/', 'FPS sensitivity calculator'],
  ['/cm-360-calculator', 'cm/360 calculator'],
  ['/edpi-calculator', 'eDPI calculator'],
  ['/dpi-sensitivity-converter', 'DPI sensitivity converter'],
  ['/cs2-to-valorant-sensitivity', 'CS2 to Valorant sensitivity converter'],
  ['/valorant-to-cs2-sensitivity', 'Valorant to CS2 sensitivity converter'],
  ['/rainbow-six-siege-sensitivity-converter', 'Rainbow Six Siege sensitivity converter'],
  ['/fps-sensitivity-conversion-guide', 'FPS sensitivity conversion guide']
];

function listHtmlFiles() {
  return fs.readdirSync(ROOT).filter((file) => file.endsWith('.html')).sort();
}

function pagePathFromFile(file) {
  return file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content);
}

function extractTitle(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1].trim() || '';
}

function extractMetaDescription(html) {
  return html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1] || '';
}

function extractCanonical(html) {
  return html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] || '';
}

function jsonScript(data) {
  return [
    '  <script type="application/ld+json">',
    JSON.stringify(data, null, 2).split('\n').map((line) => `  ${line}`).join('\n'),
    '  </script>'
  ].join('\n');
}

function pageNameFromTitle(title) {
  return title
    .replace(/\s+-\s+AimScale$/i, '')
    .replace(/^AimScale\s+-\s+/i, '')
    .trim();
}

function homepageSchema(description) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'AimScale',
        description,
        inLanguage: 'en'
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'AimScale',
        url: `${SITE_URL}/`,
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@aimscale.top',
          contactType: 'customer support'
        }
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#fps-sensitivity-calculator`,
        name: 'FPS Sensitivity Calculator and Converter',
        url: `${SITE_URL}/`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        description
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/#calculator-list`,
        name: 'AimScale calculators and guides',
        itemListElement: featuredPages.map(([pagePath, name], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
          url: `${SITE_URL}${pagePath === '/' ? '/' : pagePath}`
        }))
      }
    ]
  };
}

function pageSchema(title, description, canonical) {
  const name = pageNameFromTitle(title);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en'
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'AimScale',
            item: `${SITE_URL}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name,
            item: canonical
          }
        ]
      }
    ]
  };
}

function upsertJsonLd(file) {
  const html = read(file);
  const title = extractTitle(html);
  const description = extractMetaDescription(html);
  const canonical = extractCanonical(html);
  if (!title || !description || !canonical) {
    throw new Error(`${file}: missing title, description, or canonical`);
  }

  const schema = file === 'index.html'
    ? homepageSchema(description)
    : pageSchema(title, description, canonical);
  const script = jsonScript(schema);

  const withoutExisting = html.replace(/\n\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '\n');
  const next = withoutExisting.replace(
    /(<link rel="canonical" href="[^"]+" \/>\n)/,
    `$1${script}\n`
  );
  if (next === withoutExisting) {
    throw new Error(`${file}: could not insert JSON-LD after canonical link`);
  }
  write(file, next);
}

function refreshSitemap() {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  sitemap = sitemap.replace(
    /(<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>)([^<]+)(<\/lastmod>)/g,
    (match, prefix, loc, currentLastmod, suffix) => {
      const pagePath = loc.replace(SITE_URL, '') || '/';
      const nextLastmod = updatedPages.has(pagePath) ? UPDATED_LASTMOD : DEFAULT_LASTMOD;
      return `${prefix}${nextLastmod}${suffix}`;
    }
  );
  fs.writeFileSync(sitemapPath, sitemap);
}

for (const file of listHtmlFiles()) {
  upsertJsonLd(file);
}
refreshSitemap();

console.log(`Refreshed SEO metadata for ${listHtmlFiles().length} HTML pages.`);
