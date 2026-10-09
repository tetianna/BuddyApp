/**
 * Reset test data from the tracker file only.
 * Run from repo root: npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts [--dry-run] [--type birthday-event]
 */
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

import { ALT_AUTH_FILE, AUTH_FILE } from '../../../../support/auth.constants';
import { cleanupTrackedRecords } from '../../../../support/cleanup-records';
import { getTrackedRecords, type RecordType } from '../../../../support/record-tracker';

dotenv.config();

const VALID_TYPES: readonly RecordType[] = ['birthday-event'];

function parseArgs(argv: string[]): { dryRun: boolean; typeFilter?: RecordType } {
  let dryRun = false;
  let typeFilter: RecordType | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--type') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--type requires a value (e.g. birthday-event)');
      }
      if (!VALID_TYPES.includes(value as RecordType)) {
        throw new Error(`Unknown type "${value}". Valid: ${VALID_TYPES.join(', ')}`);
      }
      typeFilter = value as RecordType;
      i += 1;
      continue;
    }
    if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return { dryRun, typeFilter };
}

function ensureAuthFilesForOwners(owners: Set<'main' | 'alt'>): void {
  const missing: string[] = [];
  if (owners.has('main') && !fs.existsSync(path.resolve(AUTH_FILE))) {
    missing.push(AUTH_FILE);
  }
  if (owners.has('alt') && !fs.existsSync(path.resolve(ALT_AUTH_FILE))) {
    missing.push(ALT_AUTH_FILE);
  }
  if (missing.length > 0) {
    console.error(`Missing storage state: ${missing.join(', ')}`);
    console.error('Re-run auth setup, e.g. npx playwright test tests/auth.storage.spec.ts');
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const { dryRun, typeFilter } = parseArgs(process.argv.slice(2));

  let records = getTrackedRecords();
  if (typeFilter) {
    records = records.filter((record) => record.type === typeFilter);
  }

  const owners = new Set(records.map((record) => record.owner));
  if (records.length > 0) {
    ensureAuthFilesForOwners(owners);
  }

  const stats = await cleanupTrackedRecords({ dryRun, typeFilter });

  console.log('');
  console.log('## Result');
  console.log(`Scope: ${stats.scope}${dryRun ? ' (dry-run)' : ''}`);
  console.log(`Found: ${stats.found}`);
  if (dryRun) {
    console.log('Deleted: 0');
    console.log('Failed: 0');
  } else {
    console.log(`Deleted: ${stats.deleted} (${stats.alreadyRemoved} already removed / HTTP 404)`);
    console.log(`Failed: ${stats.failed}`);
  }

  if (stats.had401) {
    console.error('Storage state expired (401). Re-run auth setup before retrying deletes.');
    process.exit(1);
  }

  if (!dryRun && stats.failed > 0) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
