import { ArrowRight, BarChart3, Lock, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import AuthLogin from "./authforms/loginForm";
import { useAdminAuth } from "~/hooks/useAdminAuth";

const Login = () => {
  const navigate = useNavigate();
  const { loading, session } = useAdminAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate("/admin", { replace: true });
    }
  }, [loading, navigate, session]);

  return (
    <main className="admin-login-page">
      <section className="admin-login-shell" aria-labelledby="admin-login-title">
        <div className="admin-login-brand">
          <Link to="/" className="admin-login-logo" aria-label="KWStudio home">
            <span>KW</span>
            <strong>KWStudio</strong>
          </Link>
          <Link to="/" className="admin-login-public-link">
            Till webbplatsen
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="admin-login-grid">
          <div className="admin-login-copy">
            <p className="eyebrow">KWStudio Admin</p>
            <h1 id="admin-login-title">Logga in till studions kontrollrum.</h1>
            <p>
              Hantera leads, projekt, rapporter och ekonomi från en samlad
              arbetsyta byggd för KWStudios dagliga drift.
            </p>

            <div className="admin-login-highlights" aria-label="Admin features">
              <article>
                <ShieldCheck size={20} aria-hidden="true" />
                <span>Säker åtkomst</span>
                <strong>Intern adminyta</strong>
              </article>
              <article>
                <BarChart3 size={20} aria-hidden="true" />
                <span>Överblick</span>
                <strong>Leads och projekt</strong>
              </article>
              <article>
                <Lock size={20} aria-hidden="true" />
                <span>Workspace</span>
                <strong>KWStudio drift</strong>
              </article>
            </div>
          </div>

          <div className="admin-auth-card admin-login-card">
            <p className="eyebrow">Admin login</p>
            <h2>Välkommen tillbaka</h2>
            <p>Logga in för att fortsätta till dashboarden.</p>
            <AuthLogin />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
