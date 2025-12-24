'use client';

import { useCallback, useEffect, useRef } from 'react';
import type React from 'react';

type UseUnsavedChangesGuardOptions = {
  hasUnsavedChanges: boolean;
  promptMessage: string;
  onConfirmClose: () => void;
};

export function useUnsavedChangesGuard({
  hasUnsavedChanges,
  promptMessage,
  onConfirmClose,
}: UseUnsavedChangesGuardOptions) {
  const skipUnsavedPromptRef = useRef(false);

  const confirmExitIfDirty = useCallback(() => {
    if (!hasUnsavedChanges) return true;
    return window.confirm(promptMessage);
  }, [hasUnsavedChanges, promptMessage]);

  const handleClose = useCallback(() => {
    if (!confirmExitIfDirty()) return;
    skipUnsavedPromptRef.current = true;
    onConfirmClose();
  }, [confirmExitIfDirty, onConfirmClose]);

  useEffect(() => {
    const onPopState = () => {
      if (skipUnsavedPromptRef.current) {
        skipUnsavedPromptRef.current = false;
        return;
      }

      if (!hasUnsavedChanges) return;

      const shouldExit = window.confirm(promptMessage);
      if (!shouldExit) {
        skipUnsavedPromptRef.current = true;
        window.history.forward();
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [hasUnsavedChanges, promptMessage]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
  );

  return { handleClose, handleBackdropClick };
}
