export type AuthFailureReason = "missing-token" | "unauthorized" | "forbidden";

type AuthFailureHandler = (reason: AuthFailureReason) => void;

const handlers = new Set<AuthFailureHandler>();

export const registerAuthFailureHandler = (next: AuthFailureHandler) => {
  handlers.add(next);
  return () => {
    handlers.delete(next);
  };
};

export const reportAuthFailure = (reason: AuthFailureReason) => {
  handlers.forEach((handler) => handler(reason));
};
