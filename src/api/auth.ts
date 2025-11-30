import { api } from './client';

export async function fetchCurrentUser() {
  const client = api();
  const res = await client.get('/auth/me');
  return res.data;
}
