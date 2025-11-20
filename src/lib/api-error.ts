export function parseApiError(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Unexpected server error"
  );
}
