import type { FullResult, Reporter } from '@playwright/test';

import { cleanupCreatedRecords } from './cleanup-records';

/** Safety net: clean tracked records when the run ends (after failures or skipped teardown). */
class CleanupReporter implements Reporter {
  async onEnd(_result: FullResult): Promise<void> {
    await cleanupCreatedRecords();
  }
}

export default CleanupReporter;
