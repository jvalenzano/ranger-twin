/**
 * useFieldMode Hook
 *
 * Manages high-contrast "Field Mode" for outdoor/field use.
 * Persists setting to localStorage and applies .field-mode class to document.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ranger-field-mode';

/**
 * Hook for managing field mode state.
 * Field mode provides high-contrast UI for outdoor visibility.
 */
export function useFieldMode() {
  const [isFieldMode, setIsFieldMode] = useState<boolean>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Apply/remove .field-mode class on document root
  useEffect(() => {
    const root = document.documentElement;
    if (isFieldMode) {
      root.classList.add('field-mode');
    } else {
      root.classList.remove('field-mode');
    }
  }, [isFieldMode]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isFieldMode));
    } catch {
      // Ignore localStorage errors
    }
  }, [isFieldMode]);

  const toggleFieldMode = useCallback(() => {
    setIsFieldMode((prev) => !prev);
  }, []);

  const setFieldMode = useCallback((enabled: boolean) => {
    setIsFieldMode(enabled);
  }, []);

  return {
    isFieldMode,
    toggleFieldMode,
    setFieldMode,
  };
}

export default useFieldMode;
