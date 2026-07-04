import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SettingsCategoryContextValue, SettingsCategoryId } from "./settingsTypes";

function shallowEqualRecords<T extends Record<string, unknown>>(left: T, right: T): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => Object.is(left[key], right[key]));
}

export function useSettingsForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState(initial);
  const baselineRef = useRef(initial);

  const isDirty = useMemo(
    () => !shallowEqualRecords(values, baselineRef.current),
    [values],
  );

  const reset = useCallback(() => {
    setValues(baselineRef.current);
  }, []);

  const setBaseline = useCallback((next: T) => {
    baselineRef.current = next;
    setValues(next);
  }, []);

  const markSaved = useCallback(() => {
    baselineRef.current = values;
  }, [values]);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  return {
    values,
    setValues,
    setField,
    setBaseline,
    isDirty,
    reset,
    markSaved,
  };
}

export function useSettingsCategoryRegistration(
  categoryId: SettingsCategoryId,
  isDirty: boolean,
  save: () => Promise<void> | void,
  reset: () => void,
  registerHandlers: SettingsCategoryContextValue["registerHandlers"],
  unregisterHandlers: SettingsCategoryContextValue["unregisterHandlers"],
) {
  useEffect(() => {
    registerHandlers(categoryId, { isDirty, save, reset });
    return () => unregisterHandlers(categoryId);
  }, [categoryId, isDirty, save, reset, registerHandlers, unregisterHandlers]);
}
