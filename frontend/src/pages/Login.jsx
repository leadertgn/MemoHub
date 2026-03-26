import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/auth/callback'

export default function Login() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirige si déjà connecté
  useEffect(() => {
    if (isAuthenticated) navigate('/')
  }, [isAuthenticated, navigate])

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      redirect_uri:  REDIRECT_URI,
      response_type: 'code',
      scope:         'openid email profile',
      access_type:   'offline',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 w-full max-w-sm space-y-6 text-center">

        <div className="space-y-2">
          <span className="text-4xl">📚</span>
          <h1 className="text-xl font-bold text-gray-900">Connexion à MemoHub</h1>
          <p className="text-sm text-gray-500">
            Accède à des milliers de mémoires académiques
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4"
          />
          Continuer avec Google
        </button>

        <p className="text-xs text-gray-400 leading-relaxed">
          En te connectant, tu acceptes nos{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            conditions d'utilisation
          </a>
        </p>

      </div>
    </div>
  )
}