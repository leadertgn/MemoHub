import { useParams, Link } from 'react-router-dom'
import { useMemoirDetail } from '../hooks/useMemoirs'
import { useAuth } from '../context/AuthContext'

const DEGREE_LABELS = {
  licence: 'Licence', master: 'Master', doctorat: 'Doctorat',
  ingenieur: 'Ingénieur', bts: 'BTS', dut: 'DUT',
}

export default function MemoirDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { data: memoir, isLoading, isError } = useMemoirDetail(id)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-40 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (isError || !memoir) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">😕</p>
        <p className="text-gray-500 font-medium">Mémoire introuvable</p>
        <Link to="/search" className="text-blue-600 text-sm hover:underline">
          Retour à la recherche
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400">
        <Link to="/search" className="hover:text-blue-600">Recherche</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-600">{memoir.title}</span>
      </nav>

      {/* En-tête */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 leading-snug flex-1">
            {memoir.title}
          </h1>
          <span className="shrink-0 text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            {DEGREE_LABELS[memoir.degree]}
          </span>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Auteur',      value: memoir.author_name },
            { label: 'Année',       value: memoir.year },
            { label: 'Langue',      value: memoir.language?.toUpperCase() },
            { label: 'Vues',        value: memoir.view_count },
          ].map(item => (
            <div key={item.label} className="space-y-0.5">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="font-medium text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Résumé</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{memoir.abstract}</p>
      </div>

      {/* Accès au document */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Document</h2>

        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Connecte-toi pour consulter ce mémoire
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <div className="flex gap-3">
            <a 
              href={`${import.meta.env.VITE_API_URL}/memoirs/${memoir.id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📖 Consulter en ligne
            </a>

            {!memoir.is_premium ? (
              <a
                href={`${import.meta.env.VITE_API_URL}/memoirs/${memoir.id}/download`}
                className="flex-1 text-center border border-blue-600 text-blue-600 text-sm py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                ⬇️ Télécharger
              </a>
            ) : (
              <button
                disabled
                className="flex-1 text-center border border-gray-200 text-gray-400 text-sm py-2 rounded-lg cursor-not-allowed"
                title="Réservé aux membres premium"
              >
                🔒 Premium uniquement
              </button>
            )}
          </div>
        )}
      </div>

      {/* Retour */}
      <Link
        to="/search"
        className="inline-block text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        ← Retour à la recherche
      </Link>

    </div>
  )
}