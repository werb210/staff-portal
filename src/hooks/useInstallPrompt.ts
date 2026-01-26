import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "bf-install-dismissed";

export const useInstallPrompt = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) === "true";
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      if (isDismissed) return;
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isDismissed]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    setPromptEvent(null);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DISMISS_KEY, "true");
    }
  }, []);

  const promptInstall = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome !== "accepted") {
      dismiss();
    }
    setPromptEvent(null);
  }, [dismiss, promptEvent]);

  return {
    canInstall: Boolean(promptEvent) && !isDismissed,
    promptInstall,
    dismiss
  };
};
