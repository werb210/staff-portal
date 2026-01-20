import { useEffect } from "react";
import { startLoaderWatchdog } from "@/utils/loaderWatchdog";

const AppLoading = () => {
  useEffect(() => {
    const stopWatchdog = startLoaderWatchdog();
    return () => stopWatchdog();
  }, []);

  return (
    <div className="app-loading">
      <div className="spinner" aria-label="Loading" />
      <p>Loading experience...</p>
    </div>
  );
};

export default AppLoading;
