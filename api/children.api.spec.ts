import { createHostChild, deleteHostChild } from '../support/api-client';
import { buildApiTestChildPayload } from '../test-data/factories/api-child.factory';
import { expect, test, trackRecord } from './fixtures';
import { jsonIncludesValue } from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

test.describe('Children API', () => {
  test(
    'POST create, GET me finds child, DELETE undo @api',
    testDescription(
      'Creates a host child with a unique name (factory), registers trackRecord for teardown, asserts 201 response fields from api/CATALOG.md, finds the name under GET /api/v1/me family, deletes with DELETE /api/v1/children/{id} (HTTP 204), using support/api-client helpers.',
    ),
    async ({ mainApi, recordOwner }) => {
      const payload = buildApiTestChildPayload();
      const created = await createHostChild(mainApi, payload);

      trackRecord({
        type: 'host-child',
        id: created.id,
        owner: recordOwner,
      });

      expect(typeof created.id).toBe('string');
      expect(created.firstName).toBe(payload.firstName);
      expect(typeof created.birthYear).toBe('number');
      expect(typeof created.birthMonth).toBe('number');
      expect(typeof created.age).toBe('number');
      expect(typeof created.gender).toBe('string');
      expect(Array.isArray(created.interests)).toBeTruthy();
      expect(typeof created.avatarKey).toBe('string');

      const meResponse = await mainApi.get('/api/v1/me');
      expect(meResponse.status()).toBe(200);
      const meBody: unknown = await meResponse.json();
      expect(jsonIncludesValue(meBody, payload.firstName)).toBeTruthy();

      const deleted = await deleteHostChild(mainApi, created.id);
      expect(deleted.status).toBe(204);
    },
  );
});
