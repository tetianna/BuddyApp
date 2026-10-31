import type { CreateHostChildPayload } from '../../support/api-client';

/** Unique host-child payload for API setup (`POST /api/v1/children`). */
export function buildChildPayload(): CreateHostChildPayload {
  return {
    firstName: `LayerChild${Date.now()}`,
    birthYear: 2019,
    birthMonth: 8,
    gender: 'boy',
    avatarKey: 'fox',
    interests: [],
  };
}

/** Dashboard kid summary line (e.g. `Mia, 8 · Girl`) from create response fields. */
export function formatDashboardChildRow(
  firstName: string,
  age: number,
  gender: string,
): string {
  const genderLabel =
    gender.toLowerCase() === 'boy' ? 'Boy' : gender.toLowerCase() === 'girl' ? 'Girl' : gender;
  return `${firstName}, ${age} · ${genderLabel}`;
}
