export function handleSessionError(error: unknown) {
  if (error instanceof Error && error.message === "unauthorized") {
    window.location.href = "/login";
  }
}
