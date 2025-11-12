export function cacheKey(endpoint: string, payload?: unknown) {
  const base = `${endpoint}`;
  if (!payload) return base;
  return `${base}:${JSON.stringify(payload)}`;
}

export async function storeOffline(endpoint: string, payload: unknown) {
  const key = cacheKey(endpoint, payload);
  try {
    localStorage.setItem(key, JSON.stringify({ payload, createdAt: Date.now() }));
  } catch (error) {
    console.error('Failed to persist offline payload', error);
  }
}

export function retrieveOffline(endpoint: string, payload?: unknown) {
  const key = cacheKey(endpoint, payload);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse offline cache', key, error);
    return null;
  }
}
