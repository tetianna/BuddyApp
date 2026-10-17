import { BirthdayChild } from './birthday-party.factory';

/** Default host-child rows for the main practicum family (AQPBT-6 AC3). */
export type PracticumHostChild = {
  firstName: BirthdayChild;
  birthYear: string;
  birthMonth: string;
  gender: 'Boy' | 'Girl';
  avatar: string;
};

export const PRACTICUM_HOST_CHILDREN: readonly PracticumHostChild[] = [
  {
    firstName: BirthdayChild.Mia,
    birthYear: '2018',
    birthMonth: '6',
    gender: 'Girl',
    avatar: 'Fox',
  },
  {
    firstName: BirthdayChild.Maria,
    birthYear: '2017',
    birthMonth: '3',
    gender: 'Girl',
    avatar: 'Cat',
  },
];

export const PRACTICUM_HOST_CHILD_FIRST_NAMES: readonly string[] = PRACTICUM_HOST_CHILDREN.map(
  (child) => child.firstName,
);
