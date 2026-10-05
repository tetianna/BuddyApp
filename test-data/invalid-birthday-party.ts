import type { BirthdayPartyFormInput } from './factories/birthday-party.factory';

/**
 * Open questions (Confluence / AQPBT-6) — not invalid cases until the story says so:
 * - Whether at least one **Invite children** checkbox is required before **Create party**.
 * - Max-length or other HTML constraints beyond empty required **Party title** / date-time (AC 8 only).
 */

/** Chromium native message when a required field is empty (AQPBT-6 AC 8). */
export const CHROMIUM_REQUIRED_FIELD_MESSAGE = 'Please fill out this field.' as const;

type InvalidBirthdayPartyInput = Pick<BirthdayPartyFormInput, 'partyTitle' | 'scheduledAt'>;

/** Invalid create-party payloads described in AQPBT-6 acceptance criteria only. */
export const invalidBirthdayPartyInputs = [
  {
    partyTitle: '', // AC 8: Party title empty
    scheduledAt: '', // AC 8: date/time input empty
  },
] as const satisfies readonly InvalidBirthdayPartyInput[];
