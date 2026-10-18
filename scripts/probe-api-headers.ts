import dotenv from 'dotenv';

import { createApiContext, createUnauthenticatedApiContext } from '../support/api-client';

dotenv.config();

const paths = [
  '/api/v1/me',
  '/api/v1/connections',
  '/api/v1/communities',
  '/api/v1/availability',
  '/api/v1/playdates',
  '/api/v1/matches',
  '/api/v1/events',
];

async function main(): Promise<void> {
  const mainApi = await createApiContext('main');
  const anonApi = await createUnauthenticatedApiContext();
  for (const p of paths) {
    const r = await mainApi.get(p);
    const ct = (r.headers()['content-type'] ?? '').split(';')[0];
    const a = await anonApi.get(p);
    console.log(`${p}\tauth=${r.status()}\tct=${ct}\tanon=${a.status()}`);
  }
  const comm = await mainApi.get('/api/v1/communities');
  const list = (await comm.json()) as { id: string }[];
  if (list[0]?.id) {
    const path = `/api/v1/communities/${list[0].id}`;
    const d = await mainApi.get(path);
    const ct = (d.headers()['content-type'] ?? '').split(';')[0];
    const da = await anonApi.get(path);
    console.log(`${path}\tauth=${d.status()}\tct=${ct}\tanon=${da.status()}`);
  }
  await mainApi.dispose();
  await anonApi.dispose();
}

main();
