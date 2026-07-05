import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getPublicSettings,
  getSettingsCategory,
  isSettingsApiConfigured,
} from "~/services/settingsApi";
import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_PUBLIC_SETTINGS,
  getDefaultCategorySettings,
} from "./settingsDefaults";
import type {
  CategorySettingsState,
  PublicSettingsState,
  SettingsCategoryId,
  SettingsDtoMap,
} from "./settingsTypes";

type CategoryCache = {
  [K in SettingsCategoryId]?: SettingsDtoMap[K];
};
type CategoryErrors = Partial<Record<SettingsCategoryId, string>>;
type CategorySources = Partial<Record<SettingsCategoryId, "api">>;

export type AppSettingsContextValue = {
  publicSettings: PublicSettingsState;
  getCategoryState: <K extends SettingsCategoryId>(category: K) => CategorySettingsState<K>;
  ensureCategoryLoaded: (category: SettingsCategoryId) => Promise<void>;
  refreshCategory: (category: SettingsCategoryId) => Promise<void>;
  invalidateCategory: (category?: SettingsCategoryId) => void;
  refreshPublicSettings: () => Promise<void>;
  isApiConfigured: boolean;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function logSettingsError(scope: string, error: string) {
  console.error(`[AppSettings] ${scope}: ${error}`);
}

function applyBrandCssVariable(color: string) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--kw-brand", color);
}

type AppSettingsProviderProps = {
  children: ReactNode;
};

function setCachedCategory<K extends SettingsCategoryId>(
  cache: CategoryCache,
  category: K,
  value: SettingsDtoMap[K],
) {
  cache[category] = value;
}

export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const cacheRef = useRef<CategoryCache>({});
  const errorsRef = useRef<CategoryErrors>({});
  const sourcesRef = useRef<CategorySources>({});
  const loadingRef = useRef<Set<SettingsCategoryId>>(new Set());
  const inflightRef = useRef<Map<SettingsCategoryId, Promise<void>>>(new Map());

  const [revision, setRevision] = useState(0);
  const [publicSettings, setPublicSettings] = useState<PublicSettingsState>({
    data: DEFAULT_PUBLIC_SETTINGS,
    isLoading: false,
    error: null,
    source: "default",
  });

  const bump = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  const refreshPublicSettings = useCallback(async () => {
    if (!isSettingsApiConfigured) {
      setPublicSettings({
        data: DEFAULT_PUBLIC_SETTINGS,
        isLoading: false,
        error: null,
        source: "default",
      });
      applyBrandCssVariable(DEFAULT_PUBLIC_SETTINGS.branding.brandColor);
      return;
    }

    setPublicSettings((current) => ({ ...current, isLoading: true, error: null }));

    const result = await getPublicSettings();
    if (result.ok && result.data?.settings) {
      setPublicSettings({
        data: result.data.settings,
        isLoading: false,
        error: null,
        source: "api",
      });
      applyBrandCssVariable(result.data.settings.branding.brandColor);
      return;
    }

    const error = result.error ?? "Could not load public settings.";
    logSettingsError("public", error);
    setPublicSettings({
      data: DEFAULT_PUBLIC_SETTINGS,
      isLoading: false,
      error,
      source: "default",
    });
    applyBrandCssVariable(DEFAULT_PUBLIC_SETTINGS.branding.brandColor);
  }, []);

  useEffect(() => {
    void refreshPublicSettings();
  }, [refreshPublicSettings]);

  const fetchCategory = useCallback(async <K extends SettingsCategoryId>(category: K, force = false) => {
    if (!force && cacheRef.current[category]) return;

    if (!isSettingsApiConfigured) {
      errorsRef.current[category] = "API not configured. Set VITE_KWSTUDIO_API_URL.";
      logSettingsError(category, errorsRef.current[category]);
      bump();
      return;
    }

    const result = await getSettingsCategory(category);
    if (result.ok && result.data?.settings) {
      setCachedCategory(cacheRef.current, category, result.data.settings);
      sourcesRef.current[category] = "api";
      delete errorsRef.current[category];

      if (category === "branding") {
        applyBrandCssVariable((result.data.settings as SettingsDtoMap["branding"]).brandColor);
      }
      return;
    }

    const error = result.error ?? `Could not load ${category} settings.`;
    errorsRef.current[category] = error;
    logSettingsError(category, error);
  }, [bump]);

  const ensureCategoryLoaded = useCallback(async (category: SettingsCategoryId) => {
    if (cacheRef.current[category]) return;

    const inflight = inflightRef.current.get(category);
    if (inflight) {
      await inflight;
      return;
    }

    const promise = (async () => {
      loadingRef.current.add(category);
      bump();

      try {
        await fetchCategory(category);
      } finally {
        loadingRef.current.delete(category);
        bump();
      }
    })();

    inflightRef.current.set(category, promise);

    try {
      await promise;
    } finally {
      inflightRef.current.delete(category);
    }
  }, [bump, fetchCategory]);

  const refreshCategory = useCallback(async (category: SettingsCategoryId) => {
    delete cacheRef.current[category];
    delete sourcesRef.current[category];
    delete errorsRef.current[category];
    bump();

    loadingRef.current.add(category);
    bump();

    try {
      await fetchCategory(category, true);
    } finally {
      loadingRef.current.delete(category);
      bump();
    }
  }, [bump, fetchCategory]);

  const invalidateCategory = useCallback((category?: SettingsCategoryId) => {
    if (category) {
      delete cacheRef.current[category];
      delete sourcesRef.current[category];
      delete errorsRef.current[category];
    } else {
      cacheRef.current = {};
      sourcesRef.current = {};
      errorsRef.current = {};
    }
    bump();
  }, [bump]);

  const getCategoryState = useCallback(<K extends SettingsCategoryId>(category: K): CategorySettingsState<K> => {
    void revision;

    const cached = cacheRef.current[category];
    const data = (cached ?? getDefaultCategorySettings(category)) as SettingsDtoMap[K];

    return {
      data,
      isLoading: loadingRef.current.has(category),
      error: errorsRef.current[category] ?? null,
      source: sourcesRef.current[category] ?? "default",
    };
  }, [revision]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      publicSettings,
      getCategoryState,
      ensureCategoryLoaded,
      refreshCategory,
      invalidateCategory,
      refreshPublicSettings,
      isApiConfigured: isSettingsApiConfigured,
    }),
    [
      publicSettings,
      getCategoryState,
      ensureCategoryLoaded,
      refreshCategory,
      invalidateCategory,
      refreshPublicSettings,
    ],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider.");
  }
  return context;
}

export function useOptionalAppSettings(): AppSettingsContextValue | null {
  return useContext(AppSettingsContext);
}

export { DEFAULT_BRAND_COLOR };
