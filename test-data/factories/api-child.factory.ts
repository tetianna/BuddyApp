import type { CreateHostChildPayload } from '../../support/api-client';

/** Unique host-child payload for API tests (`POST /api/v1/children`). */
export function buildApiTestChildPayload(): CreateHostChildPayload {
  return {
    firstName: `ApiChild${Date.now()}`,
    birthYear: 2019,
    birthMonth: 8,
    gender: 'boy',
    avatarKey: 'fox',
    interests: [],
  };
}
