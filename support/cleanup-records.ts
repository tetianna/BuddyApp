import { cancelBirthdayEvent, createApiContext, deleteHostChild } from './api-client';
import { getTrackedRecords, resetTracker, type RecordType, type TrackedRecord } from './record-tracker';

export type TrackedCleanupOptions = {
  dryRun?: boolean;
  typeFilter?: RecordType;
};

export type TrackedCleanupStats = {
  scope: string;
  found: number;
  deleted: number;
  failed: number;
  alreadyRemoved: number;
  had401: boolean;
};

async function deleteTrackedRecord(record: TrackedRecord): Promise<{
  outcome: 'deleted' | 'already_removed' | 'failed' | 'unauthorized';
  status: number;
  message: string;
}> {
  const api = await createApiContext(record.owner);
  try {
    let result: { type: RecordType; id: string; ok: boolean; status: number; message: string };

    switch (record.type) {
      case 'birthday-event':
        result = await cancelBirthdayEvent(api, record.id);
        break;
      case 'host-child':
        result = await deleteHostChild(api, record.id);
        break;
      default: {
        const exhaustive: never = record.type;
        throw new Error(`Unknown tracked record type: ${String(exhaustive)}`);
      }
    }

    if (result.status === 401) {
      return { outcome: 'unauthorized', status: result.status, message: result.message };
    }
    if (result.status === 404) {
      return { outcome: 'already_removed', status: result.status, message: result.message };
    }
    if (result.ok) {
      return { outcome: 'deleted', status: result.status, message: result.message };
    }
    return { outcome: 'failed', status: result.status, message: result.message };
  } finally {
    await api.dispose();
  }
}

/**
 * Deletes records listed in `.test-artifacts/created-records.jsonl` only.
 * Used by global teardown, cleanup reporter, and the test-data-reset script.
 */
export async function cleanupTrackedRecords(
  options: TrackedCleanupOptions = {},
): Promise<TrackedCleanupStats> {
  const { dryRun = false, typeFilter } = options;
  let records = getTrackedRecords();
  if (typeFilter) {
    records = records.filter((record) => record.type === typeFilter);
  }

  const scope = typeFilter ?? 'all tracked types';
  const stats: TrackedCleanupStats = {
    scope,
    found: records.length,
    deleted: 0,
    failed: 0,
    alreadyRemoved: 0,
    had401: false,
  };

  if (dryRun) {
    for (const record of records) {
      console.log(`[dry-run] ${record.type} ${record.id} (owner: ${record.owner})`);
    }
    return stats;
  }

  for (const record of records) {
    const { outcome, status, message } = await deleteTrackedRecord(record);
    switch (outcome) {
      case 'deleted':
        stats.deleted += 1;
        console.log(`Deleted ${record.type} ${record.id}`);
        break;
      case 'already_removed':
        stats.alreadyRemoved += 1;
        console.log(`Already removed ${record.type} ${record.id} (HTTP ${status})`);
        break;
      case 'unauthorized':
        stats.failed += 1;
        stats.had401 = true;
        console.warn(
          `Unauthorized ${record.type} ${record.id}: HTTP ${status} — ${message}. Re-run auth setup.`,
        );
        break;
      case 'failed':
        stats.failed += 1;
        console.warn(`Failed ${record.type} ${record.id}: HTTP ${status} — ${message}`);
        break;
      default:
        break;
    }
  }

  resetTracker();
  return stats;
}

/** Deletes all tracked records via API, logs outcomes, then clears the tracker. */
export async function cleanupCreatedRecords(): Promise<void> {
  await cleanupTrackedRecords({ dryRun: false });
}
