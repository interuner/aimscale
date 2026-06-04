#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://aimscale.top';
const DEFAULT_LASTMOD = '2026-05-28';
const updatedPages = new Map([
  ['/', '2026-06-04'],
  ['/mouse-sensitivity-converter', '2026-06-04'],
  ['/cm-360-calculator', '2026-05-29'],
  ['/cs2-edpi-calculator', '2026-06-01'],
  ['/cs2-to-valorant-sensitivity', '2026-05-29'],
  ['/valorant-edpi-calculator', '2026-06-01'],
  ['/valorant-to-cs2-sensitivity', '2026-05-29'],
  ['/fps-sensitivity-conversion-guide', '2026-06-04'],
  ['/privacy', '2026-05-29'],
  ['/edpi-calculator', '2026-05-29'],
  ['/dpi-sensitivity-converter', '2026-05-29'],
  ['/valorant-cm-360-calculator', '2026-05-29'],
  ['/apex-legends-sensitivity-converter', '2026-06-01'],
  ['/overwatch-2-sensitivity-converter', '2026-05-29'],
  ['/rainbow-six-siege-sensitivity-converter', '2026-05-29'],
  ['/best-cm-360-for-valorant', '2026-05-29'],
  ['/best-cm-360-for-cs2', '2026-05-29'],
  ['/about', '2026-05-29'],
  ['/contact', '2026-05-29'],
  ['/what-is-cm-360', '2026-06-01'],
  ['/dpi-vs-edpi', '2026-06-01'],
  ['/cs2-to-apex-sensitivity', '2026-06-01'],
  ['/valorant-to-apex-sensitivity', '2026-06-01'],
  ['/apex-edpi-calculator', '2026-06-01'],
  ['/methodology', '2026-06-04']
]);

const featuredPages = [
  ['/', 'FPS sensitivity calculator'],
  ['/cm-360-calculator', 'cm/360 calculator'],
  ['/edpi-calculator', 'eDPI calculator'],
  ['/dpi-sensitivity-converter', 'DPI sensitivity converter'],
  ['/mouse-sensitivity-converter', 'Mouse sensitivity converter matrix'],
  ['/cs2-to-valorant-sensitivity', 'CS2 to Valorant sensitivity converter'],
  ['/valorant-to-cs2-sensitivity', 'Valorant to CS2 sensitivity converter'],
  ['/cs2-to-apex-sensitivity', 'CS2 to Apex sensitivity converter'],
  ['/valorant-to-apex-sensitivity', 'Valorant to Apex sensitivity converter'],
  ['/apex-edpi-calculator', 'Apex Legends eDPI calculator'],
  ['/rainbow-six-siege-sensitivity-converter', 'Rainbow Six Siege sensitivity converter'],
  ['/fps-sensitivity-conversion-guide', 'FPS sensitivity conversion guide']
];

const toolPages = new Map([
  ['/cm-360-calculator', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Calculate cm/360 from DPI, sensitivity, and yaw',
      'Compare FPS mouse settings by physical turn distance',
      'Estimate inches/360 and eDPI'
    ]
  }],
  ['/apex-edpi-calculator', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Calculate Apex Legends eDPI from DPI and sensitivity',
      'Estimate Apex Legends cm/360',
      'Copy the result or share a URL with calculator inputs'
    ]
  }],
  ['/cs2-edpi-calculator', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Calculate CS2 eDPI from DPI and sensitivity',
      'Estimate CS2 cm/360',
      'Compare equivalent CS2 mouse settings'
    ]
  }],
  ['/dpi-sensitivity-converter', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert sensitivity after changing mouse DPI',
      'Keep eDPI consistent inside one FPS game',
      'Compare equivalent 400, 800, and 1600 DPI settings'
    ]
  }],
  ['/edpi-calculator', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Calculate eDPI from mouse DPI and in-game sensitivity',
      'Compare equivalent DPI and sensitivity pairs',
      'Check when eDPI is useful for FPS settings'
    ]
  }],
  ['/cs2-to-valorant-sensitivity', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert CS2 sensitivity to Valorant sensitivity',
      'Adjust conversion by source and target DPI',
      'Copy the result or share a URL with calculator inputs'
    ]
  }],
  ['/cs2-to-apex-sensitivity', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert CS2 sensitivity to Apex Legends sensitivity',
      'Adjust conversion by source and target DPI',
      'Copy the result or share a URL with calculator inputs'
    ]
  }],
  ['/valorant-edpi-calculator', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Calculate Valorant eDPI from DPI and sensitivity',
      'Estimate Valorant cm/360',
      'Compare equivalent Valorant mouse settings'
    ]
  }],
  ['/valorant-to-cs2-sensitivity', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert Valorant sensitivity to CS2 sensitivity',
      'Adjust conversion by source and target DPI',
      'Copy the result or share a URL with calculator inputs'
    ]
  }],
  ['/valorant-to-apex-sensitivity', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert Valorant sensitivity to Apex Legends sensitivity',
      'Adjust conversion by source and target DPI',
      'Copy the result or share a URL with calculator inputs'
    ]
  }],
  ['/valorant-cm-360-calculator', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Calculate Valorant cm/360 from DPI and sensitivity',
      'Estimate Valorant eDPI and inches/360',
      'Compare practical Valorant turn-distance ranges'
    ]
  }],
  ['/apex-legends-sensitivity-converter', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert FPS sensitivity into Apex Legends',
      'Adjust Apex conversion by source and target DPI',
      'Copy the result or share a URL with calculator inputs'
    ]
  }],
  ['/overwatch-2-sensitivity-converter', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert FPS sensitivity into Overwatch 2',
      'Adjust Overwatch 2 conversion by source and target DPI',
      'Copy the result or share a URL with calculator inputs'
    ]
  }],
  ['/rainbow-six-siege-sensitivity-converter', {
    applicationCategory: 'UtilitiesApplication',
    featureList: [
      'Convert FPS sensitivity into Rainbow Six Siege',
      'Adjust Siege conversion by source and target DPI',
      'Copy the result or share a URL with calculator inputs'
    ]
  }]
]);

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
    .replace(/\s+\|\s+.*$/, '')
    .replace(/\s+-\s+AimScale$/i, '')
    .replace(/^AimScale\s+-\s+/i, '')
    .trim();
}

function lastmodForPage(pagePath) {
  return updatedPages.get(pagePath) || DEFAULT_LASTMOD;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanText(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFaqs(html) {
  const start = html.search(/<h2[^>]*>\s*Common Questions\s*<\/h2>/i);
  if (start === -1) return [];

  const rest = html.slice(start);
  const end = rest.search(/<h2[^>]*>\s*Related Pages\s*<\/h2>/i);
  const section = end === -1 ? rest : rest.slice(0, end);
  const faqs = [];
  const pattern = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pattern.exec(section))) {
    const question = cleanText(match[1]);
    const answer = cleanText(match[2]);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
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
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: 'AimScale',
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        dateModified: lastmodForPage('/'),
        inLanguage: 'en'
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

function pageSchema(file, title, description, canonical, html) {
  const pagePath = pagePathFromFile(file);
  const name = pageNameFromTitle(title);
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      dateModified: lastmodForPage(pagePath),
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
  ];

  const toolPage = toolPages.get(pagePath);
  if (toolPage) {
    graph.push({
      '@type': ['WebApplication', 'SoftwareApplication'],
      '@id': `${canonical}#calculator`,
      name,
      url: canonical,
      applicationCategory: toolPage.applicationCategory,
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      description,
      featureList: toolPage.featureList
    });
  }

  const faqs = extractFaqs(html);
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer
        }
      }))
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
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
    : pageSchema(file, title, description, canonical, html);
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
      const nextLastmod = updatedPages.get(pagePath) || DEFAULT_LASTMOD;
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
