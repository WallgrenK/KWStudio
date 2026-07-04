import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  SettingsCategoryHandlers,
  SettingsCategoryId,
  SettingsCategoryContextValue,
  SettingsStatus,
} from "./settingsTypes";

type SettingsPageActions = {
  isDirty: boolean;
  isSaving: boolean;
  saveAll: () => Promise<void>;
  resetAll: () => void;
  setIsSaving: (value: boolean) => void;
};

type SettingsContextValue = SettingsCategoryContextValue & SettingsPageActions;

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within SettingsProvider");
  }
  return context;
}

type SettingsProviderProps = {
  searchQuery: string;
  matchedLabels: Set<string>;
  children: ReactNode;
};

export function SettingsProvider({ searchQuery, matchedLabels, children }: SettingsProviderProps) {
  const handlersRef = useRef(new Map<SettingsCategoryId, SettingsCategoryHandlers>());
  const [revision, setRevision] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const registerHandlers = useCallback((categoryId: SettingsCategoryId, handlers: SettingsCategoryHandlers) => {
    handlersRef.current.set(categoryId, handlers);
    setRevision((value) => value + 1);
  }, []);

  const unregisterHandlers = useCallback((categoryId: SettingsCategoryId) => {
    handlersRef.current.delete(categoryId);
    setRevision((value) => value + 1);
  }, []);

  const reportStatus = useCallback((_categoryId: SettingsCategoryId, _status: SettingsStatus | null) => {
    setRevision((value) => value + 1);
  }, []);

  const isDirty = useMemo(() => {
    void revision;
    return Array.from(handlersRef.current.values()).some((handler) => handler.isDirty);
  }, [revision]);

  const saveAll = useCallback(async () => {
    const dirtyHandlers = Array.from(handlersRef.current.values()).filter((handler) => handler.isDirty);
    for (const handler of dirtyHandlers) {
      await handler.save();
    }
  }, []);

  const resetAll = useCallback(() => {
    for (const handler of handlersRef.current.values()) {
      handler.reset();
    }
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      searchQuery,
      matchedLabels,
      registerHandlers,
      unregisterHandlers,
      reportStatus,
      isDirty,
      isSaving,
      saveAll,
      resetAll,
      setIsSaving,
    }),
    [
      searchQuery,
      matchedLabels,
      registerHandlers,
      unregisterHandlers,
      reportStatus,
      isDirty,
      isSaving,
      saveAll,
      resetAll,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
