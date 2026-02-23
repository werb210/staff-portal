export function reportError(error: unknown) {
  if (import.meta.env.PROD) {
    // future: send to monitoring service
    return;
  }

  console.error(error);
}
