import fs from 'fs';
import path from 'path';

export const TRACKER_PATH = path.join('.test-artifacts', 'created-records.jsonl');

export type RecordOwner = 'main' | 'alt';

export type RecordType = 'birthday-event' | 'host-child';

export type TrackedRecord = {
  type: RecordType;
  id: string;
  owner: RecordOwner;
};

function ensureTrackerDir(): void {
  fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true });
}

/** Clears the tracker file at the start of a test run. */
export function initTracker(): void {
  ensureTrackerDir();
  fs.writeFileSync(TRACKER_PATH, '', 'utf8');
}

/** Appends a created record for teardown (deduped on read). */
export function trackRecord(record: TrackedRecord): void {
  ensureTrackerDir();
  fs.appendFileSync(TRACKER_PATH, `${JSON.stringify(record)}\n`, 'utf8');
}

/** Returns tracked records, unique by `type` + `id`. */
export function getTrackedRecords(): TrackedRecord[] {
  if (!fs.existsSync(TRACKER_PATH)) {
    return [];
  }

  const seen = new Set<string>();
  const records: TrackedRecord[] = [];

  for (const line of fs.readFileSync(TRACKER_PATH, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parsed = JSON.parse(trimmed) as TrackedRecord;
    const key = `${parsed.type}:${parsed.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    records.push(parsed);
  }

  return records;
}

/** Removes the tracker file after successful cleanup pass. */
export function resetTracker(): void {
  if (fs.existsSync(TRACKER_PATH)) {
    fs.unlinkSync(TRACKER_PATH);
  }
}
