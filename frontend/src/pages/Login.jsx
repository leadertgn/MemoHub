import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`;

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirige si déjà connecté
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    // Generate CSRF state token to prevent CSRF attacks
    const state =
      Math.random().toString(36).substring(7) + Date.now().toString(36);
    localStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      state: state,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Decoratif */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-50/80 via-indigo-50/50 to-white -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-100/40 rounded-full blur-3xl -z-10" />

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] p-10 w-full max-w-sm space-y-8 text-center relative z-10 transform transition-all">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-linear-to-tr from-blue-100 to-indigo-100 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 bg-linear-to-r from-blue-700 to-indigo-600 bg-clip-text">
            MemoHub
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Accédez à la plus grande base de mémoires académiques.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white shadow-sm rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continuer avec Google
        </button>

        <p className="text-xs text-gray-400 font-medium leading-relaxed px-4">
          En vous connectant, vous acceptez nos{" "}
          <a href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
            conditions générales d'utilisation
          </a>.
        </p>
      </div>
    </div>
  );
}
