import { expect, type APIRequestContext } from '@playwright/test';

/** From api/CATALOG.md — authenticated GET contract. */
export const CATALOG_AUTH_STATUS = 200;
export const CATALOG_CONTENT_TYPE = 'application/json';
/** From api/CATALOG.md — unauthenticated GET (recorded in API test pass). */
export const CATALOG_UNAUTH_STATUS = 401;

export async function expectCatalogAuthenticatedGet(
  api: APIRequestContext,
  path: string,
  assertTopLevel: (body: unknown) => void,
): Promise<void> {
  const response = await api.get(path);
  expect(response.status()).toBe(CATALOG_AUTH_STATUS);
  const contentType = response.headers()['content-type'] ?? '';
  expect(contentType).toContain(CATALOG_CONTENT_TYPE);
  const body: unknown = await response.json();
  assertTopLevel(body);
}

export async function expectCatalogUnauthenticatedGet(
  anonApi: APIRequestContext,
  path: string,
): Promise<void> {
  const response = await anonApi.get(path);
  expect(response.status()).toBe(CATALOG_UNAUTH_STATUS);
}

export function expectKeys(body: unknown, keys: string[]): void {
  expect(body).toBeTruthy();
  expect(typeof body).toBe('object');
  for (const key of keys) {
    expect(body as Record<string, unknown>).toHaveProperty(key);
  }
}

export function expectArray(body: unknown): void {
  expect(Array.isArray(body)).toBeTruthy();
}

export function jsonIncludesValue(root: unknown, target: string): boolean {
  if (root === target) return true;
  if (Array.isArray(root)) {
    return root.some((item) => jsonIncludesValue(item, target));
  }
  if (root && typeof root === 'object') {
    return Object.values(root as Record<string, unknown>).some((value) =>
      jsonIncludesValue(value, target),
    );
  }
  return false;
}
