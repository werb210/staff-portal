import { getRequestId } from "@/utils/requestId";
import { setUiFailure } from "@/utils/uiFailureStore";

let guardInstalled = false;

const hasRequestId = (args: unknown[]) =>
  args.some((arg) => {
    if (!arg || typeof arg !== "object") return false;
    return "requestId" in (arg as Record<string, unknown>);
  });

export const enforceRequestIdOnConsoleError = () => {
  if (guardInstalled) return;
  guardInstalled = true;

  const originalError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    if (!hasRequestId(args)) {
      const requestId = getRequestId();
      originalError("console.error called without requestId", {
        requestId,
        args
      });
      setUiFailure({
        message: "Developer error detected: missing requestId in console.error.",
        details: `Request ID: ${requestId}`,
        timestamp: Date.now()
      });
      throw new Error(`console.error called without requestId (requestId: ${requestId})`);
    }
    return originalError(...args);
  };
};
