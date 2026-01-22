import { useSyncExternalStore } from "react";
import { getUiFailure, subscribeUiFailure } from "@/utils/uiFailureStore";

const UiFailureBanner = () => {
  const failure = useSyncExternalStore(subscribeUiFailure, getUiFailure, getUiFailure);

  if (!failure) return null;

  return (
    <div
      role="alert"
      className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 shadow"
    >
      <div className="flex flex-col gap-1">
        <strong className="text-sm font-semibold">We hit an issue</strong>
        <span className="text-sm">{failure.message}</span>
        {failure.details && <span className="text-xs text-red-700">{failure.details}</span>}
      </div>
    </div>
  );
};

export default UiFailureBanner;
