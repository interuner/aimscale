#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SITE_URL = 'https://aimscale.top';
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

function checkSitemapOnlyListsExistingPages(sitemapUrls, htmlFiles, errors) {
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
}

function checkRobots(errors) {
  const robots = read(path.join(ROOT, 'robots.txt'));
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) {
    errors.push('robots.txt: missing sitemap directive');
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
