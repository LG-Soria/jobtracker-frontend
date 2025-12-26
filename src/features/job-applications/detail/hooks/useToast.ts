import { useCallback, useEffect, useRef, useState } from 'react';

const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 220;

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const clearToast = useCallback(() => {
    clearTimers();
    setIsToastVisible(false);
    hideTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      hideTimeoutRef.current = null;
    }, EXIT_ANIMATION_MS);
  }, [clearTimers]);

  const showToast = useCallback(
    (message: string) => {
      clearTimers();
      setToastMessage(message);
      requestAnimationFrame(() => setIsToastVisible(true));

      toastTimeoutRef.current = setTimeout(() => {
        clearToast();
      }, AUTO_DISMISS_MS);
    },
    [clearToast, clearTimers]
  );

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    toastMessage,
    isToastVisible,
    showToast,
    clearToast,
  };
}
