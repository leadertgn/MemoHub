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
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Connexion en cours...</p>
      </div>
    </div>
  );
}
