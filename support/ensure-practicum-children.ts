import type { Page } from '@playwright/test';

import { DashboardPage } from '../pages/dashboard.page';
import { PRACTICUM_HOST_CHILDREN } from '../test-data/factories/practicum-child.factory';

const EXPECTED_ORDER = PRACTICUM_HOST_CHILDREN.map((child) => child.firstName);

/**
 * Ensures the main-family dashboard lists exactly **Mia** then **Maria** (AQPBT-6 AC3).
 * Removes stray or duplicate kids (e.g. DelTest*) and recreates the practicum pair when needed.
 */
export async function ensurePracticumHostChildren(page: Page): Promise<void> {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.waitForKidsSectionReady();

  const current = await dashboard.readChildFirstNames();
  if (current.length === EXPECTED_ORDER.length && current.every((name, i) => name === EXPECTED_ORDER[i])) {
    return;
  }

  await dashboard.removeAllChildren();

  for (const child of PRACTICUM_HOST_CHILDREN) {
    await dashboard.addHostChild(child);
  }
}
