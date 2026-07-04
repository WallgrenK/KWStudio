import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "~/hooks/useAdminAuth";
import { getPortalMe, isPortalApiConfigured } from "~/services/portalApi";
import type { PortalMeDto } from "~/types/portal";

type UsePortalAuthResult = {
  session: ReturnType<typeof useAdminAuth>["session"];
  loading: boolean;
  me: PortalMeDto | null;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

export function usePortalAuth(): UsePortalAuthResult {
  const auth = useAdminAuth();
  const [me, setMe] = useState<PortalMeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!auth.session || !isPortalApiConfigured) {
      setMe(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getPortalMe();
    if (result.ok && result.data) {
      setMe({
        profile: result.data.profile,
        contact: result.data.contact,
        client: result.data.client,
      });
    } else {
      setMe(null);
      setError(result.error ?? "Could not load portal profile.");
    }

    setLoading(false);
  }, [auth.session]);

  useEffect(() => {
    if (auth.loading) return;
    void refresh();
  }, [auth.loading, refresh]);

  return {
    session: auth.session,
    loading: auth.loading || loading,
    me,
    error,
    refresh,
    signOut: auth.signOut,
  };
}
