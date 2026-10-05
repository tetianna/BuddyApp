import { cancelBirthdayEvent, createApiContext } from './api-client';
import { getTrackedRecords, resetTracker, type RecordType, type TrackedRecord } from './record-tracker';

async function deleteTrackedRecord(record: TrackedRecord): Promise<void> {
  const api = await createApiContext(record.owner);
  try {
    let result: { type: RecordType; id: string; ok: boolean; status: number; message: string };

    switch (record.type) {
      case 'birthday-event':
        result = await cancelBirthdayEvent(api, record.id);
        break;
      default: {
        const exhaustive: never = record.type;
        throw new Error(`Unknown tracked record type: ${String(exhaustive)}`);
      }
    }

    if (result.ok) {
      console.log(`Deleted ${result.type} ${result.id}`);
    } else {
      console.warn(
        `Failed to delete ${result.type} ${result.id}: HTTP ${result.status} — ${result.message}`,
      );
    }
  } finally {
    await api.dispose();
  }
}

/** Deletes all tracked records via API, logs outcomes, then clears the tracker. */
export async function cleanupCreatedRecords(): Promise<void> {
  const records = getTrackedRecords();
  for (const record of records) {
    await deleteTrackedRecord(record);
  }
  resetTracker();
}
