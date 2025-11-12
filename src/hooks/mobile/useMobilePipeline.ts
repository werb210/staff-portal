import { useEffect, useState } from 'react';

export function useMobilePipelineInteractions() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const announceDrag = (stageName: string) => {
    if (!isTouchDevice) return;
    setAnnouncement(`Moved to ${stageName}`);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Moved to ${stageName}`);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return { isTouchDevice, announcement, announceDrag };
}
