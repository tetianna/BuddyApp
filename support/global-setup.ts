import type { FullConfig } from '@playwright/test';

import runGlobalAuthSetup from './global-auth.setup';
import { initTracker } from './record-tracker';

/** Auth storage states, then an empty created-records tracker for this run. */
export default async function globalSetup(config: FullConfig): Promise<void> {
  await runGlobalAuthSetup(config);
  initTracker();
}
