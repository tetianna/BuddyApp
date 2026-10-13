import { faker } from '@faker-js/faker';

/** Unique display name for unsaved-edit checks on `/profile` (AQPBT-15). */
export function buildDisplayName(): string {
  return `${faker.person.firstName()} QA ${Date.now()}`;
}
