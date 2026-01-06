export type AuthFailureReason = "missing-token" | "unauthorized" | "forbidden";

type AuthFailureHandler = (reason: AuthFailureReason) => void;

let handler: AuthFailureHandler | null = null;

export const registerAuthFailureHandler = (next: AuthFailureHandler) => {
  handler = next;
  return () => {
    if (handler === next) {
      handler = null;
    }
  };
};

export const reportAuthFailure = (reason: AuthFailureReason) => {
  handler?.(reason);
};
