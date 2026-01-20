export type UiFailureState = {
  message: string;
  details?: string;
  timestamp: number;
};

let currentFailure: UiFailureState | null = null;
const listeners = new Set<(state: UiFailureState | null) => void>();

export const setUiFailure = (failure: UiFailureState) => {
  currentFailure = failure;
  listeners.forEach((listener) => listener(currentFailure));
};

export const clearUiFailure = () => {
  currentFailure = null;
  listeners.forEach((listener) => listener(currentFailure));
};

export const getUiFailure = () => currentFailure;

export const subscribeUiFailure = (listener: (state: UiFailureState | null) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
