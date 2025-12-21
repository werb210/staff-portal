export function normalizeArray<T>(input: any): T[] {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.items)) return input.items;
  return [];
}
