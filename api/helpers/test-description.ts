import type { TestDetails } from '@playwright/test';

/** Shown in the HTML report as a test description (see api/CATALOG.md). */
export function testDescription(description: string): TestDetails {
  return {
    annotation: [{ type: 'description', description }],
  };
}
