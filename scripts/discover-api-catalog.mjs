/**
 * One-off API catalog discovery (Prompt 1). Not a test.
 * Uses storage state + dashboard add/remove child.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
dotenv.config({ path: path.join(root, '.env') });

const baseURL = process.env.APP_URL;
const authFile = path.join(root, 'playwright', '.auth', 'user.json');

const ROUTES = [
  { page: 'Dashboard', path: '/app' },
  { page: 'Friends', path: '/friends' },
  { page: 'Communities', path: '/communities' },
  { page: 'Availability', path: '/availability' },
  { page: 'Playdates', path: '/playdates' },
  { page: 'Birthdays', path: '/birthdays' },
  { page: 'Profile', path: '/profile' },
];

const SKIP_URL_RE =
  /\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|css|js)(\?|$)/i;
const SKIP_PATH_RE =
  /^\/(_next\/static|_next\/image|favicon|__nextjs|_vercel|ingest|analytics)/i;

function normalizePath(url) {
  try {
    const u = new URL(url);
    let p = u.pathname;
    p = p.replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '/{id}',
    );
    p = p.replace(/\/\d+(?=\/|$)/g, '/{id}');
    return p;
  } catch {
    return url;
  }
}

function shouldSkip(url, resourceType, baseOrigin) {
  if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
    return true;
  }
  try {
    const u = new URL(url);
    const sameOrigin = u.origin === baseOrigin;
    if (u.pathname.startsWith('/api')) return false;
    if (!sameOrigin) return true;
    if (u.pathname.includes('_next/data')) return true;
    if (SKIP_URL_RE.test(url) || SKIP_PATH_RE.test(u.pathname)) return true;
    if (u.pathname.startsWith('/_next')) return true;
    if (resourceType === 'document') return true;
    return !['fetch', 'xhr', 'other'].includes(resourceType);
  } catch {
    return true;
  }
}

function topLevelTypes(obj) {
  if (obj === null || obj === undefined) return 'null';
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'array(0)';
    const t = typeof obj[0];
    return `array<${t === 'object' ? 'object' : t}>`;
  }
  if (typeof obj !== 'object') return typeof obj;
  const parts = Object.entries(obj)
    .slice(0, 12)
    .map(([k, v]) => {
      if (v === null) return `${k}:null`;
      if (Array.isArray(v)) return `${k}:array(${v.length})`;
      return `${k}:${typeof v}`;
    });
  return `{ ${parts.join(', ')}${Object.keys(obj).length > 12 ? ', …' : ''} }`;
}

function parseBodyFields(body) {
  if (!body) return '—';
  try {
    const j = JSON.parse(body);
    if (typeof j !== 'object' || j === null) return typeof j;
    return Object.keys(j).join(', ');
  } catch {
    return '(non-JSON)';
  }
}

function authHint(headers) {
  const h = headers || {};
  const cookie = h['cookie'] || h['Cookie'];
  const auth = h['authorization'] || h['Authorization'];
  if (auth) return 'Authorization header';
  if (cookie) return 'session cookie (storageState)';
  return 'unknown';
}

async function main() {
  if (!baseURL) throw new Error('APP_URL missing');
  if (!fs.existsSync(authFile)) throw new Error(`Missing ${authFile}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL,
    storageState: authFile,
    locale: 'en-CA',
  });
  const page = await context.newPage();
  const catalog = new Map();
  const baseOrigin = new URL(baseURL).origin;

  const attach = (pageName) => {
    page.on('response', async (response) => {
      const req = response.request();
      const url = req.url();
      const method = req.method();
      const rt = req.resourceType();
      if (shouldSkip(url, rt, baseOrigin)) return;

      const norm = normalizePath(url);
      const key = `${method} ${norm}`;
      let reqBody = '';
      try {
        reqBody = req.postData() || '';
      } catch {
        reqBody = '';
      }
      let resBody = '';
      try {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('json') || ct.includes('text')) {
          resBody = await response.text();
        }
      } catch {
        resBody = '';
      }
      let resJson = null;
      try {
        resJson = resBody ? JSON.parse(resBody) : null;
      } catch {
        resJson = null;
      }

      const existing = catalog.get(key);
      const entry = {
        method,
        path: norm,
        page: pageName,
        auth: authHint(req.headers()),
        status: response.status(),
        requestFields: parseBodyFields(reqBody),
        responseShape: resJson !== null ? topLevelTypes(resJson) : resBody ? '(text)' : '—',
        evidence: 'executed',
        write: method !== 'GET' && method !== 'HEAD',
        reqBodySample: reqBody.slice(0, 500),
      };
      if (!existing) {
        catalog.set(key, entry);
      } else if (!existing.pages?.includes(pageName)) {
        existing.pages = [...(existing.pages || [existing.page]), pageName];
      }
    });
  };

  for (const { page: pageName, path: routePath } of ROUTES) {
    attach(pageName);
    await page.goto(routePath, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    page.removeAllListeners('response');
  }

  // Dashboard: add + remove one child
  const uniqueName = `Cat${Date.now()}`;
  attach('Dashboard (add child)');
  await page.goto('/app', { waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: "Child's first name" }).fill(uniqueName);
  await page.getByRole('spinbutton', { name: 'Birth year' }).fill('2019');
  await page.getByRole('spinbutton', { name: 'Month' }).fill('7');
  await page.getByRole('combobox', { name: 'Gender' }).selectOption({ label: 'Boy' });
  await page.getByRole('button', { name: 'Fox', exact: true }).click();
  await page.getByRole('button', { name: 'Add child', exact: true }).click();
  await page.getByText(new RegExp(`^${uniqueName}, \\d+`)).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1000);
  page.removeAllListeners('response');

  attach('Dashboard (remove child)');
  const kidsSection = page
    .locator('div')
    .filter({
      has: page.getByRole('textbox', { name: "Child's first name" }),
      has: page.getByRole('button', { name: 'Add child', exact: true }),
    })
    .first();
  const childLine = kidsSection.getByText(new RegExp(`^${uniqueName}, \\d+`));
  await childLine.locator('..').getByRole('button', { name: 'remove' }).click();
  await page.waitForTimeout(2000);
  page.removeAllListeners('response');

  await browser.close();

  const rows = [...catalog.values()].sort((a, b) =>
    a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
  );
  const outPath = path.join(root, 'scripts', 'discover-api-catalog-output.json');
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} entries to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
