import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { isSupabaseConfigured, supabase } from "~/lib/supabase";

const AuthLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      navigate("/admin", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="admin-login-form">
      <div>
        <Label htmlFor="admin-email">E-post</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="kim@kwstudio.se"
          required
        />
      </div>

      <div>
        <Label htmlFor="admin-password">Lösenord</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Ditt lösenord"
          required
        />
      </div>

      <div className="admin-login-options">
        <div className="admin-login-checkbox">
          <Checkbox id="remember-device" />
          <Label htmlFor="remember-device">Kom ihåg den här enheten</Label>
        </div>
        <Link to="/" className="admin-login-muted-link">
          Behöver hjälp?
        </Link>
      </div>

      {errorMessage ? <p className="admin-login-error">{errorMessage}</p> : null}

      <Button type="submit" className="admin-login-submit" disabled={isSubmitting}>
        {isSubmitting ? "Loggar in..." : "Logga in"}
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </form>
  );
};

export default AuthLogin;
