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

/** Finds a host child id under GET `/api/v1/me` → `family` by first name. */
export function findHostChildIdInMe(meBody: unknown, firstName: string): string | undefined {
  let found: string | undefined;

  const walk = (node: unknown): void => {
    if (found || !node || typeof node !== 'object') {
      return;
    }
    const record = node as Record<string, unknown>;
    if (record.firstName === firstName && typeof record.id === 'string') {
      found = record.id;
      return;
    }
    for (const value of Object.values(record)) {
      walk(value);
    }
  };

  if (!meBody || typeof meBody !== 'object') {
    return undefined;
  }
  const family = (meBody as { family?: unknown }).family;
  walk(family);
  return found;
}

export type HostChildRef = { id: string; firstName: string };

/** First host child under GET `/api/v1/me` → `family` (any practicum child). */
export function findFirstHostChildInMe(meBody: unknown): HostChildRef | undefined {
  let found: HostChildRef | undefined;

  const walk = (node: unknown): void => {
    if (found || !node || typeof node !== 'object') {
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.id === 'string' && typeof record.firstName === 'string') {
      found = { id: record.id, firstName: record.firstName };
      return;
    }
    for (const value of Object.values(record)) {
      walk(value);
    }
  };

  if (!meBody || typeof meBody !== 'object') {
    return undefined;
  }
  const family = (meBody as { family?: unknown }).family;
  walk(family);
  return found;
}
