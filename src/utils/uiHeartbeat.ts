import { getRequestId } from "@/utils/requestId";
import { setUiFailure } from "@/utils/uiFailureStore";

const HEARTBEAT_TIMEOUT_MS = 500;

const scheduleUiFailure = (reason: string) => {
  const requestId = getRequestId();
  setUiFailure({
    message: "UI rendering stalled.",
    details: `${reason} | Request ID: ${requestId}`,
    timestamp: Date.now()
  });
  throw new Error(`${reason} (requestId: ${requestId})`);
};

export const startUiHeartbeat = (root: HTMLElement) => {
  let emptyTimer: number | null = null;

  const startEmptyTimer = (reason: string) => {
    if (emptyTimer !== null) return;
    emptyTimer = window.setTimeout(() => {
      emptyTimer = null;
      if (!root.hasChildNodes()) {
        scheduleUiFailure(reason);
      }
    }, HEARTBEAT_TIMEOUT_MS);
  };

  if (!root.hasChildNodes()) {
    startEmptyTimer("Root node has no children after initial render");
  }

  const observer = new MutationObserver(() => {
    if (root.hasChildNodes()) {
      if (emptyTimer !== null) {
        window.clearTimeout(emptyTimer);
        emptyTimer = null;
      }
    } else {
      startEmptyTimer("Root node rendered empty");
    }
  });

  observer.observe(root, { childList: true });

  return () => {
    observer.disconnect();
    if (emptyTimer !== null) {
      window.clearTimeout(emptyTimer);
      emptyTimer = null;
    }
  };
};
