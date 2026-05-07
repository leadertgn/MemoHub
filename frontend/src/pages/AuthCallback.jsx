import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = localStorage.getItem("oauth_state");

    // Verify CSRF state to prevent attacks
    if (!code || !state || state !== storedState) {
      localStorage.removeItem("oauth_state");
      navigate("/login");
      return;
    }

    // Clear the used state
    localStorage.removeItem("oauth_state");

    // Envoie le code à ton backend FastAPI
    authApi.loginWithGoogle(
        code, 
        import.meta.env.VITE_REDIRECT_URI
    ).then((data) => {
        // data contient : access_token, user_id, role, full_name, avatar_url
        login(
          {
            id: data.user_id,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            role: data.role,
          },
          data.access_token,
          data.refresh_token
        );
        navigate("/");
      })
      .catch(() => navigate("/login"));
  }, [login, navigate, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-10 h-px bg-[var(--color-obsidian)]/20 animate-pulse mx-auto" />
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-40 animate-pulse">Authentification...</p>
      </div>
    </div>
  );
}
