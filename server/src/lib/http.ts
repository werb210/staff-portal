export async function http<T>(fn: () => Promise<{ data: T }>): Promise<T> {
  const res = await fn();
  return res.data;
}
