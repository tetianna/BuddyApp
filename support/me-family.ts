/** Counts host-child objects (`id` + `firstName`) under GET `/api/v1/me` → `family`. */
export function countHostChildrenInMe(meBody: unknown): number {
  if (!meBody || typeof meBody !== 'object') {
    return 0;
  }

  const family = (meBody as { family?: unknown }).family;
  if (!family || typeof family !== 'object') {
    return 0;
  }

  let count = 0;
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') {
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.id === 'string' && typeof record.firstName === 'string') {
      count += 1;
    }
    for (const value of Object.values(record)) {
      walk(value);
    }
  };

  walk(family);
  return count;
}
