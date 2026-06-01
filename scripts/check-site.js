#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SITE_URL = 'https://aimscale.top';
const GA_MEASUREMENT_ID = 'G-FMTDQMDKNS';
const CLARITY_PROJECT_ID = 'wqzi6cdcrr';
const ROOT = path.resolve(__dirname, '..');
const HIGH_RISK_PATTERNS = [
  /\bperfect\b/i,
  /\bguaranteed\b/i,
  /\b100%\s+accurate\b/i,
  /\bbest\s+sensitivity\b/i,
  /\bproven\s+best\b/i
];
const EARLY_STAGE_PATTERNS = [
  /\bBeta\b/,
  /Monetization slot/i,
  /Responsive ad slot/i,
  /email address above should be routed/i,
  /pagead2\.googlesyndication\.com/i
];
const FLAGSHIP_PAGE_FILES = new Set([
  'apex-legends-sensitivity-converter.html',
  'cm-360-calculator.html',
  'cs2-edpi-calculator.html',
  'cs2-to-apex-sensitivity.html',
  'cs2-to-valorant-sensitivity.html',
  'dpi-sensitivity-converter.html',
  'edpi-calculator.html',
  'overwatch-2-sensitivity-converter.html',
  'rainbow-six-siege-sensitivity-converter.html',
  'valorant-edpi-calculator.html',
  'valorant-cm-360-calculator.html',
  'valorant-to-apex-sensitivity.html',
  'valorant-to-cs2-sensitivity.html'
]);

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listHtmlFiles() {
  return fs
    .readdirSync(ROOT)
    .filter((file) => file.endsWith('.html'))
    .sort();
}

function pagePathFromFile(file) {
  if (file === 'index.html') return '/';
  return `/${file.replace(/\.html$/, '')}`;
}

function fileFromPagePath(pagePath) {
  if (pagePath === '/') return 'index.html';
  return `${pagePath.replace(/^\//, '')}.html`;
}

function extractAttribute(tag, attr) {
  const pattern = new RegExp(`${attr}=["']([^"']+)["']`, 'i');
  return tag.match(pattern)?.[1] || '';
}

function extractCanonical(html) {
  const tag = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i)?.[0];
  return tag ? extractAttribute(tag, 'href') : '';
}

function extractDescription(html) {
  const tag = html.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i)?.[0];
  return tag ? extractAttribute(tag, 'content') : '';
}

function extractTitle(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1].trim() || '';
}

function extractInternalLinks(html) {
  const links = [];
  const pattern = /href=["'](\/[^"'#?]*)/g;
  let match;
  while ((match = pattern.exec(html))) {
    links.push(match[1]);
  }
  return links;
}

function extractJsonLdBlocks(html) {
  return [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim());
}

function flattenSchemaTypes(value, types = []) {
  if (Array.isArray(value)) {
    for (const item of value) flattenSchemaTypes(item, types);
    return types;
  }
  if (!value || typeof value !== 'object') return types;

  if (value['@type']) {
    if (Array.isArray(value['@type'])) types.push(...value['@type']);
    else types.push(value['@type']);
  }
  for (const child of Object.values(value)) {
    flattenSchemaTypes(child, types);
  }
  return types;
}

function parseSitemap() {
  const sitemap = read(path.join(ROOT, 'sitemap.xml'));
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  return new Set(locs);
}

function fail(errors, file, message) {
  errors.push(`${file}: ${message}`);
}

function checkHtmlPage(file, sitemapUrls, htmlFiles, errors) {
  const filePath = path.join(ROOT, file);
  const html = read(filePath);
  const pagePath = pagePathFromFile(file);
  const expectedCanonical = `${SITE_URL}${pagePath === '/' ? '/' : pagePath}`;

  const title = extractTitle(html);
  if (!title) fail(errors, file, 'missing <title>');
  if (title.length > 65) fail(errors, file, `title is long (${title.length} chars)`);

  const description = extractDescription(html);
  if (!description) fail(errors, file, 'missing meta description');
  if (description && (description.length < 70 || description.length > 170)) {
    fail(errors, file, `meta description should be 70-170 chars (${description.length} chars)`);
  }

  const canonical = extractCanonical(html);
  if (!canonical) fail(errors, file, 'missing canonical link');
  if (canonical && canonical !== expectedCanonical) {
    fail(errors, file, `canonical should be ${expectedCanonical}, got ${canonical}`);
  }

  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count !== 1) fail(errors, file, `expected exactly one H1, found ${h1Count}`);

  if (!sitemapUrls.has(expectedCanonical)) {
    fail(errors, file, `missing from sitemap: ${expectedCanonical}`);
  }

  if (!html.includes('href="/methodology"') && file !== 'methodology.html') {
    fail(errors, file, 'missing Methodology internal link');
  }

  const jsonLdBlocks = extractJsonLdBlocks(html);
  if (jsonLdBlocks.length === 0) {
    fail(errors, file, 'missing JSON-LD structured data');
  } else {
    const schemaTypes = [];
    for (const block of jsonLdBlocks) {
      try {
        schemaTypes.push(...flattenSchemaTypes(JSON.parse(block)));
      } catch (error) {
        fail(errors, file, `invalid JSON-LD: ${error.message}`);
      }
    }
    if (file === 'index.html') {
      for (const type of ['WebSite', 'Organization', 'WebApplication', 'ItemList']) {
        if (!schemaTypes.includes(type)) fail(errors, file, `missing homepage schema type: ${type}`);
      }
    } else {
      for (const type of ['WebPage', 'BreadcrumbList']) {
        if (!schemaTypes.includes(type)) fail(errors, file, `missing page schema type: ${type}`);
      }
      if (FLAGSHIP_PAGE_FILES.has(file)) {
        if (!schemaTypes.includes('FAQPage')) {
          fail(errors, file, 'missing flagship schema type: FAQPage');
        }
        if (!schemaTypes.includes('WebApplication') && !schemaTypes.includes('SoftwareApplication')) {
          fail(errors, file, 'missing flagship schema type: WebApplication or SoftwareApplication');
        }
      }
    }
  }

  if (!html.includes(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`)) {
    fail(errors, file, 'missing GA4 script tag');
  }
  if (!html.includes(`gtag("config", "${GA_MEASUREMENT_ID}")`)) {
    fail(errors, file, 'missing GA4 config call');
  }
  if (!html.includes(`"clarity", "script", "${CLARITY_PROJECT_ID}"`)) {
    fail(errors, file, 'missing Clarity project tag');
  }

  if (file === 'index.html') {
    if (!html.includes('id="faq"')) fail(errors, file, 'missing homepage FAQ section');
    if (!html.includes("trackEvent('calculator_used'")) fail(errors, file, 'missing calculator_used event');
    if (!html.includes("trackEvent('result_copied'")) fail(errors, file, 'missing result_copied event');
    if (/finals\s*:/.test(html)) {
      fail(errors, file, 'experimental The Finals support should not be in the homepage converter');
    }
  }

  if (file === 'privacy.html') {
    for (const text of ['Google Analytics', 'Microsoft Clarity', 'non-identifying analytics events']) {
      if (!html.includes(text)) fail(errors, file, `missing analytics privacy disclosure: ${text}`);
    }
  }

  for (const pattern of EARLY_STAGE_PATTERNS) {
    if (pattern.test(html)) fail(errors, file, `contains early-stage placeholder or premature ad code: ${pattern}`);
  }

  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(html)) fail(errors, file, `contains high-risk claim: ${pattern}`);
  }

  for (const link of extractInternalLinks(html)) {
    const targetFile = fileFromPagePath(link);
    if (!htmlFiles.has(targetFile)) {
      fail(errors, file, `broken internal link: ${link}`);
    }
  }
}

function checkGameData(errors) {
  const dataPath = path.join(ROOT, 'data', 'games.json');
  if (!fs.existsSync(dataPath)) {
    errors.push('data/games.json: missing game data file');
    return;
  }

  let data;
  try {
    data = JSON.parse(read(dataPath));
  } catch (error) {
    errors.push(`data/games.json: invalid JSON: ${error.message}`);
    return;
  }

  const allowedConfidence = new Set(['verified', 'reviewed', 'experimental']);
  for (const game of data.games || []) {
    if (!game.id) errors.push('data/games.json: game missing id');
    if (!game.name) errors.push(`data/games.json: ${game.id || 'unknown'} missing name`);
    if (!Number.isFinite(game.yaw) || game.yaw <= 0) {
      errors.push(`data/games.json: ${game.id} has invalid yaw`);
    }
    if (!allowedConfidence.has(game.confidence)) {
      errors.push(`data/games.json: ${game.id} has invalid confidence: ${game.confidence}`);
    }
    if (!Array.isArray(game.sourceUrls) || game.sourceUrls.length === 0) {
      errors.push(`data/games.json: ${game.id} missing sourceUrls`);
    }
    for (const sourceUrl of game.sourceUrls || []) {
      if (!/^https:\/\/[^ ]+$/i.test(sourceUrl)) {
        errors.push(`data/games.json: ${game.id} source URL should be absolute HTTPS: ${sourceUrl}`);
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(game.lastReviewed || '')) {
      errors.push(`data/games.json: ${game.id} has invalid lastReviewed date`);
    }
  }

  const finals = (data.games || []).find((game) => game.id === 'finals');
  if (finals && finals.confidence !== 'experimental') {
    errors.push('data/games.json: The Finals should remain experimental until source agreement improves');
  }
}

function checkSitemapOnlyListsExistingPages(sitemapUrls, htmlFiles, errors) {
  const sitemap = read(path.join(ROOT, 'sitemap.xml'));
  for (const url of sitemapUrls) {
    if (!url.startsWith(SITE_URL)) {
      errors.push(`sitemap.xml: external or invalid URL listed: ${url}`);
      continue;
    }
    const pagePath = url.slice(SITE_URL.length) || '/';
    const targetFile = fileFromPagePath(pagePath);
    if (!htmlFiles.has(targetFile)) {
      errors.push(`sitemap.xml: URL has no matching HTML file: ${url}`);
    }
  }
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  if (lastmods.length !== sitemapUrls.size) {
    errors.push('sitemap.xml: every URL should have a lastmod value');
  }
  for (const lastmod of lastmods) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      errors.push(`sitemap.xml: invalid lastmod date: ${lastmod}`);
    }
  }
}

function checkRobots(errors) {
  const robots = read(path.join(ROOT, 'robots.txt'));
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
    errors.push('robots.txt: missing sitemap directive');
  }
}

function checkRedirects(errors) {
  const redirectsPath = path.join(ROOT, '_redirects');
  if (!fs.existsSync(redirectsPath)) {
    errors.push('_redirects: missing Cloudflare Pages redirect file');
    return;
  }

  const redirects = read(redirectsPath);
  if (!redirects.includes('/index.html / 301')) {
    errors.push('_redirects: missing /index.html canonical redirect');
  }
  if (!redirects.includes('/:slug.html /:slug 301')) {
    errors.push('_redirects: missing top-level .html canonical redirect');
  }
}

function run() {
  assert.ok(fs.existsSync(path.join(ROOT, 'sitemap.xml')), 'Missing sitemap.xml');
  assert.ok(fs.existsSync(path.join(ROOT, 'robots.txt')), 'Missing robots.txt');

  const htmlFiles = new Set(listHtmlFiles());
  const sitemapUrls = parseSitemap();
  const errors = [];

  for (const file of htmlFiles) {
    checkHtmlPage(file, sitemapUrls, htmlFiles, errors);
  }
  checkSitemapOnlyListsExistingPages(sitemapUrls, htmlFiles, errors);
  checkRobots(errors);
  checkRedirects(errors);
  checkGameData(errors);

  if (errors.length) {
    console.error(`Site quality check failed with ${errors.length} issue(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Site quality check passed for ${htmlFiles.size} HTML pages.`);
}

run();
