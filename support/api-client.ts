import fs from 'fs';
import path from 'path';

import { request, type APIRequestContext } from '@playwright/test';

import { ALT_AUTH_FILE, AUTH_FILE } from './auth.constants';
import type { RecordOwner, RecordType } from './record-tracker';

type StorageStateFile = {
  origins?: Array<{ localStorage?: Array<{ name: string; value: string }> }>;
};

export type CleanupResult = {
  type: RecordType;
  id: string;
  ok: boolean;
  status: number;
  message: string;
};

type BirthdayEventListItem = {
  id: string;
  kind: string;
  status: string;
};

function resolveBaseURL(): string {
  const baseURL = process.env.APP_URL;
  if (!baseURL) {
    throw new Error('APP_URL must be set for API cleanup.');
  }
  return baseURL.replace(/^https:\/\/https:\/\//, 'https://').replace(/\/$/, '');
}

function readBearerToken(storageStatePath: string): string {
  const resolved = path.resolve(storageStatePath);
  const state = JSON.parse(fs.readFileSync(resolved, 'utf8')) as StorageStateFile;
  for (const origin of state.origins ?? []) {
    for (const entry of origin.localStorage ?? []) {
      if (entry.name === 'bt_token' && entry.value) {
        return entry.value;
      }
    }
  }
  throw new Error(`bt_token not found in ${storageStatePath}. Re-run global setup.`);
}

/** Playwright API context with no Bearer token (for unauthenticated contract checks). */
export async function createUnauthenticatedApiContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: resolveBaseURL(),
  });
}

/** Playwright API context authenticated as the given family (`storageState` + Bearer JWT). */
export async function createApiContext(owner: RecordOwner): Promise<APIRequestContext> {
  const storageState = owner === 'main' ? AUTH_FILE : ALT_AUTH_FILE;
  const token = readBearerToken(storageState);
  return request.newContext({
    baseURL: resolveBaseURL(),
    storageState,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/** Alias used by API fixtures — same as {@link createApiContext}. */
export const createApiContextForOwner = createApiContext;

type HostChildResponse = {
  id: string;
  firstName: string;
  birthYear: number;
  birthMonth: number;
  age: number;
  gender: string;
  interests: string[];
  avatarKey: string;
};

export type CreateHostChildPayload = {
  firstName: string;
  birthYear: number;
  birthMonth: number;
  gender: string;
  avatarKey: string;
  interests: string[];
};

/** Creates a host child (`POST /api/v1/children`). */
export async function createHostChild(
  api: APIRequestContext,
  payload: CreateHostChildPayload,
): Promise<HostChildResponse> {
  const response = await api.post('/api/v1/children', { data: payload });
  if (response.status() !== 201) {
    throw new Error(`createHostChild failed: HTTP ${response.status()} ${await response.text()}`);
  }
  return (await response.json()) as HostChildResponse;
}

/** Removes a host child (`DELETE /api/v1/children/{id}`). */
export async function deleteHostChild(
  api: APIRequestContext,
  childId: string,
): Promise<CleanupResult> {
  const type: RecordType = 'host-child';
  const response = await api.delete(`/api/v1/children/${childId}`);
  const message = response.statusText() || (await response.text().catch(() => ''));
  return {
    type,
    id: childId,
    ok: response.ok() || response.status() === 204,
    status: response.status(),
    message: message.slice(0, 200),
  };
}

/** Cancels a birthday event created via `POST /api/v1/events` (discovery: cancel, not DELETE). */
export async function cancelBirthdayEvent(
  api: APIRequestContext,
  eventId: string,
): Promise<CleanupResult> {
  const type: RecordType = 'birthday-event';
  const response = await api.post(`/api/v1/events/${eventId}/cancel`);

  let message = response.statusText();
  try {
    const body = (await response.json()) as { message?: string; status?: string };
    if (body.message) {
      message = body.message;
    } else if (body.status) {
      message = body.status;
    }
  } catch {
    const text = await response.text().catch(() => '');
    if (text) message = text.slice(0, 200);
  }

  const ok = response.ok();
  return {
    type,
    id: eventId,
    ok,
    status: response.status(),
    message,
  };
}

/** Cancels every active birthday on the host list (shared-account prep for empty-state ACs). */
export async function cancelAllActiveBirthdayEvents(owner: RecordOwner): Promise<void> {
  const api = await createApiContext(owner);
  try {
    const response = await api.get('/api/v1/events');
    if (!response.ok()) {
      return;
    }
    const events = (await response.json()) as BirthdayEventListItem[];
    for (const event of events) {
      if (event.kind !== 'birthday' || event.status !== 'active') {
        continue;
      }
      await cancelBirthdayEvent(api, event.id);
    }
  } finally {
    await api.dispose();
  }
}
