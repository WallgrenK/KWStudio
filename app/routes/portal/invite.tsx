import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { PortalAuthLayout } from "~/components/portal/PortalAuthLayout";
import { supabase } from "~/lib/supabase";
import { activatePortalInvite, isPortalApiConfigured, lookupPortalInvite } from "~/services/portalApi";

type InvitePageState = "loading" | "ready" | "invalid" | "expired" | "used" | "submitting" | "success";

export default function PortalInvitePage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [pageState, setPageState] = useState<InvitePageState>("loading");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInvite() {
      if (!token) {
        setPageState("invalid");
        return;
      }

      if (!isPortalApiConfigured) {
        setError("Portal API is not configured.");
        setPageState("invalid");
        return;
      }

      const result = await lookupPortalInvite(token);
      if (cancelled) return;

      if (result.ok && result.data?.status === "ready" && result.data.email) {
        setEmail(result.data.email);
        setPageState("ready");
        return;
      }

      const status = result.data?.status ?? (result.status === 410 ? "expired" : result.status === 409 ? "used" : "invalid");
      if (status === "expired") {
        setPageState("expired");
        return;
      }
      if (status === "used") {
        setPageState("used");
        return;
      }

      setError(result.error ?? "Invalid invite.");
      setPageState("invalid");
    }

    void loadInvite();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the terms.");
      return;
    }

    setPageState("submitting");

    const result = await activatePortalInvite(token, {
      firstName,
      lastName,
      password,
      confirmPassword,
      acceptedTerms,
    });

    if (!result.ok) {
      setError(result.error ?? "Activation failed.");
      setPageState("ready");
      return;
    }

    const signIn = await supabase.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      setError(signIn.error.message);
      setPageState("ready");
      return;
    }

    setPageState("success");
    navigate("/portal/dashboard", { replace: true });
  }

  if (pageState === "loading") {
    return (
      <PortalAuthLayout title="Loading invite" description="Checking your invitation…">
        <p className="text-sm text-gray-500">Please wait…</p>
      </PortalAuthLayout>
    );
  }

  if (pageState === "invalid") {
    return (
      <PortalAuthLayout title="Invalid invite" description="This invitation link is not valid.">
        <p className="text-sm text-red-700">{error ?? "Ask your KWStudio contact for a new invite link."}</p>
      </PortalAuthLayout>
    );
  }

  if (pageState === "expired") {
    return (
      <PortalAuthLayout title="Invite expired" description="This invitation link has expired.">
        <p className="text-sm text-gray-600">Contact KWStudio to request a new portal invite.</p>
      </PortalAuthLayout>
    );
  }

  if (pageState === "used") {
    return (
      <PortalAuthLayout title="Invite already used" description="This invitation has already been accepted.">
        <p className="text-sm text-gray-600">Sign in to access your client portal if you already created an account.</p>
      </PortalAuthLayout>
    );
  }

  return (
    <PortalAuthLayout
      title="Activate your account"
      description="Create your KWStudio client portal password to continue."
    >
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Email
          <input
            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700"
            type="email"
            value={email}
            readOnly
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            First name
            <input
              className="h-11 rounded-lg border border-gray-200 px-4 text-sm"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Last name
            <input
              className="h-11 rounded-lg border border-gray-200 px-4 text-sm"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Password
          <input
            className="h-11 rounded-lg border border-gray-200 px-4 text-sm"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Confirm password
          <input
            className="h-11 rounded-lg border border-gray-200 px-4 text-sm"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          I accept the terms
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button className="btn btn-primary w-full" type="submit" disabled={pageState === "submitting"}>
          {pageState === "submitting" ? "Creating account…" : "Create account"}
        </button>
      </form>
    </PortalAuthLayout>
  );
}
