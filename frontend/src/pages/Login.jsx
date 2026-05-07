import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`;

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    const state = Math.random().toString(36).substring(7) + Date.now().toString(36);
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
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-cinnabar)]/5 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-lg px-6 space-y-12 text-center relative z-10">
        {/* Branding Prestigieux */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--color-cinnabar)] mb-4">
            <span className="w-12 h-px bg-[var(--color-cinnabar)]" />
            Portail d'Accès
          </div>
          <h1 className="text-6xl md:text-7xl font-serif text-[var(--color-obsidian)] leading-none tracking-tighter">
            Memo<span className="italic text-[var(--color-cinnabar)]">Hub</span>
          </h1>
          <p className="text-xl font-light text-[var(--color-obsidian)]/60 italic leading-relaxed max-w-sm mx-auto">
            "Le savoir est le seul trésor qui s'accroît quand on le partage."
          </p>
        </div>

        {/* Action de Connexion */}
        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex items-center justify-center gap-4 bg-[var(--color-obsidian)] text-white px-8 py-5 text-[11px] font-mono uppercase tracking-[0.3em] overflow-hidden transition-all hover:bg-[var(--color-obsidian)]/90 border border-[var(--color-obsidian)]"
          >
            <div className="absolute inset-0 w-full h-full bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="relative z-10 font-bold">Authentification Académique Google</span>
          </button>

          <div className="flex items-center justify-center gap-4 opacity-20">
            <span className="w-8 h-px bg-[var(--color-obsidian)]" />
            <span className="font-mono text-[9px] uppercase tracking-widest">Sécurisé par OAuth 2.0</span>
            <span className="w-8 h-px bg-[var(--color-obsidian)]" />
          </div>
        </div>

        {/* Footer de Page de Garde */}
        <p className="text-[10px] font-mono text-[var(--color-obsidian)]/40 uppercase tracking-widest leading-loose max-w-xs mx-auto">
          En franchissant ce portail, vous acceptez notre{" "}
          <Link to="/terms" className="text-[var(--color-cinnabar)] hover:underline">
            Contrat Social
          </Link>{" "}
          & notre{" "}
          <Link to="/privacy" className="text-[var(--color-cinnabar)] hover:underline">
            Charte de Confidentialité
          </Link>.
        </p>
      </div>
    </div>
  );
}
