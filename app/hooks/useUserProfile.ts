import { useCallback, useEffect, useState } from "react";
import { bootstrapAdminProfile, getUserProfile, isPortalApiConfigured } from "~/services/portalApi";
import type { UserProfileDto } from "~/types/portal";

type UseUserProfileResult = {
  profile: UserProfileDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  bootstrapAdmin: () => Promise<boolean>;
};

export function useUserProfile(enabled = true): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !isPortalApiConfigured) {
      setLoading(false);
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getUserProfile();
    if (result.ok && result.data) {
      setProfile(result.data.profile ?? null);
    } else {
      setError(result.error ?? "Could not load user profile.");
      setProfile(null);
    }

    setLoading(false);
  }, [enabled]);

  const bootstrapAdmin = useCallback(async () => {
    const result = await bootstrapAdminProfile();
    if (result.ok && result.data?.profile) {
      setProfile(result.data.profile);
      return true;
    }
    setError(result.error ?? "Could not bootstrap admin profile.");
    return false;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, loading, error, refresh, bootstrapAdmin };
}
