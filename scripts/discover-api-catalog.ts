/**
 * API catalog discovery (Prompt 1). Not a test.
 */
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import { chromium } from '@playwright/test';

import { DashboardPage } from '../pages/dashboard.page';
import { AppRoute } from '../test-data/routes';
import { AUTH_FILE } from '../support/auth.constants';

dotenv.config();

const ROUTES: { page: string; path: string }[] = [
  { page: 'Dashboard', path: AppRoute.Dashboard },
  { page: 'Friends', path: AppRoute.Friends },
  { page: 'Communities', path: AppRoute.Communities },
  { page: 'Availability', path: AppRoute.Availability },
  { page: 'Playdates', path: AppRoute.Playdates },
  { page: 'Birthdays', path: AppRoute.Birthdays },
  { page: 'Profile', path: AppRoute.Profile },
];

type CatalogEntry = {
  method: string;
  path: string;
  pages: string[];
  auth: string;
  status: number;
  requestFields: string;
  responseShape: string;
  evidence: 'executed' | 'inspected only';
  safeForTests: string;
  reqBodySample?: string;
};

const SKIP_URL_RE =
  /\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|css|js)(\?|$)/i;
const SKIP_PATH_RE =
  /^\/(_next\/static|_next\/image|favicon|__nextjs|_vercel|ingest|analytics)/i;

function normalizePath(url: string): string {
  const u = new URL(url);
  let p = u.pathname;
  p = p.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '/{id}',
  );
  p = p.replace(/\/\d+(?=\/|$)/g, '/{id}');
  return p;
}

function shouldSkip(url: string, resourceType: string, baseOrigin: string): boolean {
  if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
    return true;
  }
  const u = new URL(url);
  if (u.pathname.startsWith('/api')) return false;
  if (u.origin !== baseOrigin) return true;
  if (u.pathname.includes('_next/data')) return true;
  if (SKIP_URL_RE.test(url) || SKIP_PATH_RE.test(u.pathname)) return true;
  if (u.pathname.startsWith('/_next')) return true;
  if (resourceType === 'document') return true;
  return !['fetch', 'xhr', 'other'].includes(resourceType);
}

function topLevelTypes(obj: unknown): string {
  if (obj === null || obj === undefined) return 'null';
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'array(0)';
    const first = obj[0];
    return `array<${typeof first === 'object' ? 'object' : typeof first}>`;
  }
  if (typeof obj !== 'object') return typeof obj;
  const parts = Object.entries(obj as Record<string, unknown>)
    .slice(0, 14)
    .map(([k, v]) => {
      if (v === null) return `${k}:null`;
      if (Array.isArray(v)) return `${k}:array(${v.length})`;
      return `${k}:${typeof v}`;
    });
  const keys = Object.keys(obj as object);
  return `{ ${parts.join(', ')}${keys.length > 14 ? ', …' : ''} }`;
}

function parseBodyFields(body: string): string {
  if (!body) return '—';
  try {
    const j = JSON.parse(body) as Record<string, unknown>;
    return Object.keys(j).join(', ');
  } catch {
    return '(non-JSON)';
  }
}

function authHint(headers: Record<string, string>): string {
  if (headers.authorization || headers.Authorization) return 'Authorization header';
  if (headers.cookie || headers.Cookie) return 'session cookie (storageState)';
  return 'unknown';
}

function safeLabel(method: string, path: string, pages: string[]): string {
  if (method === 'GET' || method === 'HEAD') return 'yes';
  if (method === 'POST' && path.includes('/children') && pages.some((p) => p.includes('remove'))) {
    return 'yes (create+delete observed on Dashboard)';
  }
  if (method === 'DELETE' && path.includes('/children')) return 'yes (delete observed on Dashboard)';
  return 'no (write without observed undo)';
}

async function main(): Promise<void> {
  const baseURL = process.env.APP_URL;
  if (!baseURL) throw new Error('APP_URL missing');
  const authPath = path.resolve(AUTH_FILE);
  if (!fs.existsSync(authPath)) throw new Error(`Missing ${authPath}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL,
    storageState: authPath,
    locale: 'en-CA',
  });
  const page = await context.newPage();
  const catalog = new Map<string, CatalogEntry>();
  const baseOrigin = new URL(baseURL).origin;
  const pending: Promise<void>[] = [];

  const record = async (
    pageName: string,
    response: import('@playwright/test').Response,
  ): Promise<void> => {
      const req = response.request();
      const url = req.url();
      const method = req.method();
      const rt = req.resourceType();
      if (shouldSkip(url, rt, baseOrigin)) return;

      const norm = normalizePath(url);
      const key = `${method} ${norm}`;
      let reqBody = '';
      try {
        reqBody = req.postData() ?? '';
      } catch {
        reqBody = '';
      }
      let resBody = '';
      try {
        const ct = response.headers()['content-type'] ?? '';
        if (ct.includes('json') || ct.includes('text')) {
          resBody = await response.text();
        }
      } catch {
        resBody = '';
      }
      let resJson: unknown = null;
      try {
        resJson = resBody ? JSON.parse(resBody) : null;
      } catch {
        resJson = null;
      }

      const headers = req.headers();
      const existing = catalog.get(key);
      if (existing) {
        if (!existing.pages.includes(pageName)) existing.pages.push(pageName);
        return;
      }
      catalog.set(key, {
        method,
        path: norm,
        pages: [pageName],
        auth: authHint(headers),
        status: response.status(),
        requestFields: parseBodyFields(reqBody),
        responseShape: resJson !== null ? topLevelTypes(resJson) : resBody ? '(text)' : '—',
        evidence: 'executed',
        safeForTests: '',
        reqBodySample: reqBody.slice(0, 800),
      });
  };

  const flush = async (): Promise<void> => {
    await Promise.all(pending);
    pending.length = 0;
  };

  for (const { page: pageName, path: routePath } of ROUTES) {
    page.on('response', (r) => {
      pending.push(record(pageName, r));
    });
    await page.goto(routePath, { waitUntil: 'networkidle', timeout: 90_000 });
    await page.waitForTimeout(1200);
    page.removeAllListeners('response');
    await flush();
  }

  const dashboard = new DashboardPage(page);
  const uniqueName = `ApiCat${Date.now()}`;

  page.on('response', (r) => {
    pending.push(record('Dashboard (add child)', r));
  });
  await dashboard.goto();
  await dashboard.waitForKidsSectionReady();
  await dashboard.childFirstNameField.fill(uniqueName);
  await dashboard.birthYearField.fill('2019');
  await dashboard.birthMonthField.fill('8');
  await dashboard.genderCombobox.selectOption({ label: 'Boy' });
  await page.getByRole('button', { name: 'Fox', exact: true }).click();
  await dashboard.addChildButton.click();
  await dashboard.kidsSection.getByText(new RegExp(`^${uniqueName}, \\d+`)).waitFor();
  await page.waitForTimeout(1500);
  page.removeAllListeners('response');
  await flush();

  page.on('response', (r) => {
    pending.push(record('Dashboard (remove child)', r));
  });
  const removed = await page.evaluate((childName: string) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      if (btn.textContent?.trim() !== 'remove') continue;
      const block = btn.closest('.card') ?? btn.parentElement?.parentElement;
      if (block?.textContent?.includes(childName)) {
        btn.click();
        return true;
      }
    }
    return false;
  }, uniqueName);
  if (!removed) throw new Error(`Could not remove child ${uniqueName}`);
  await dashboard.waitForKidsSectionReady();
  await page.waitForTimeout(1500);
  page.removeAllListeners('response');
  await flush();

  await browser.close();

  for (const entry of catalog.values()) {
    entry.safeForTests = safeLabel(entry.method, entry.path, entry.pages);
  }

  const outPath = path.join(__dirname, 'discover-api-catalog-output.json');
  const rows = [...catalog.values()].sort(
    (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
  );
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`Captured ${rows.length} API rows → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
