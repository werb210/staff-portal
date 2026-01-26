export type ApiRequestTrace = {
  path: string;
  method?: string;
  status?: number;
  requestId?: string;
  timestamp: number;
};

let lastRequest: ApiRequestTrace | null = null;

export const setLastApiRequest = (trace: ApiRequestTrace) => {
  lastRequest = trace;
};

export const getLastApiRequest = () => lastRequest;

export const clearLastApiRequest = () => {
  lastRequest = null;
};
