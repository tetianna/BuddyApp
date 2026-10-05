import { cleanupCreatedRecords } from './cleanup-records';

/** API teardown for any records still tracked after tests finish. */
export default async function globalTeardown(): Promise<void> {
  await cleanupCreatedRecords();
}
