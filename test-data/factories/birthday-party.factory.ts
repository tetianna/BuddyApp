import { faker } from '@faker-js/faker';

/** Host-family children listed under **Whose birthday? (optional)** (AQPBT-6 AC 3). */
export enum BirthdayChild {
  Mia = 'Mia',
  Maria = 'Maria',
}

/** Invitation card radiogroup options (AQPBT-6 AC 7). */
export enum InvitationCardTheme {
  NoCard = 'No card',
  Balloons = 'Balloons',
  BirthdayCake = 'Birthday cake',
  Dinosaur = 'Dinosaur',
  Space = 'Space',
  UnderTheSea = 'Under the sea',
  Rainbow = 'Rainbow',
}

/** Invite children checkboxes on the main practicum account (AQPBT-6 AC 5). */
export enum BirthdayPartyInvitee {
  EthanTheNguyens = 'Ethan The Nguyens',
  SofiaThePetrovs = 'Sofia The Petrovs',
  ZaraTheAhmeds = 'Zara The Ahmeds',
}

/** Placeholder option for **Whose birthday? (optional)** when no child is selected. */
export const WHOSE_BIRTHDAY_PLACEHOLDER = 'Whose birthday? (optional)';

/** Values the create-party form accepts (confirmed on `/birthdays`, test env). */
export type BirthdayPartyFormInput = {
  /** `null` keeps the placeholder; otherwise selects **Mia** or **Maria**. */
  birthdayChild: BirthdayChild | null;
  invitees: readonly BirthdayPartyInvitee[];
  /** Required; `maxLength` 120 on live form. */
  partyTitle: string;
  /** Required `datetime-local` value (`YYYY-MM-DDTHH:mm`). */
  scheduledAt: string;
  /** Optional; `maxLength` 200 on live form. */
  venue: string;
  /** Optional; `maxLength` 1000 on live form. */
  guestDetails: string;
  invitationCard: InvitationCardTheme;
};

/** Formats a future local date/time for the required `datetime-local` input. */
export function buildFuturePartyDatetimeLocal(daysAhead = 14): string {
  const unique = Date.now();
  const d = new Date();
  d.setDate(d.getDate() + daysAhead + (unique % 14));
  d.setHours(15, unique % 45, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Builds a complete, valid birthday party form payload with unique title and text fields. */
export function buildBirthdayPartyFormInput(
  overrides: Partial<BirthdayPartyFormInput> = {},
): BirthdayPartyFormInput {
  const unique = Date.now();
  const defaults: BirthdayPartyFormInput = {
    birthdayChild: BirthdayChild.Mia,
    invitees: [BirthdayPartyInvitee.EthanTheNguyens],
    partyTitle: `Birthday ${faker.word.adjective()} ${unique}`,
    scheduledAt: buildFuturePartyDatetimeLocal(),
    venue: `${faker.location.city()} ${unique}`.slice(0, 200),
    guestDetails: `${faker.lorem.sentence()} (${unique})`.slice(0, 1000),
    invitationCard: InvitationCardTheme.Balloons,
  };

  return { ...defaults, ...overrides };
}
