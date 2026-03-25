// src/pages/Search.jsx
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMemoirs } from '../hooks/useMemoirs'
import MemoirCard from '../components/memoir/MemoirCard'
import MemoirFilters from '../components/memoir/MemoirFilters'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)

  // Initialise les filtres depuis l'URL
  const [filters, setFilters] = useState({
    search:            searchParams.get('search') || '',
    degree:            searchParams.get('degree') || '',
    domain_id:         searchParams.get('domain_id') || '',
    country_id:        searchParams.get('country_id') || '',
    university_id:     searchParams.get('university_id') || '',
    field_of_study_id: searchParams.get('field_of_study_id') || '',
    year:              searchParams.get('year') || '',
  })

  const { data: memoirs, isLoading, isError } = useMemoirs({ ...filters, page, limit: 20 })

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1) // reset page quand les filtres changent
    // Met à jour l'URL pour pouvoir partager la recherche
    const params = {}
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  return (
    <div className="flex gap-6">

      {/* Colonne filtres */}
      <aside className="w-64 shrink-0">
        <MemoirFilters filters={filters} onChange={handleFiltersChange} />
      </aside>

      {/* Colonne résultats */}
      <div className="flex-1 space-y-4">

        {/* En-tête résultats */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            {isLoading ? 'Chargement...' : `${memoirs?.length ?? 0} mémoire(s) trouvé(s)`}
          </h1>
        </div>

        {/* États */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-32 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-red-500">Une erreur est survenue. Vérifie ta connexion.</p>
          </div>
        )}

        {!isLoading && !isError && memoirs?.length === 0 && (
          <div className="text-center py-20 space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-gray-500 font-medium">Aucun mémoire trouvé</p>
            <p className="text-sm text-gray-400">Essaie de modifier tes filtres</p>
          </div>
        )}

        {!isLoading && !isError && memoirs?.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4">
              {memoirs.map(memoir => (
                <MemoirCard key={memoir.id} memoir={memoir} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Précédent
              </button>
              <span className="text-sm text-gray-500">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={memoirs.length < 20}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Suivant →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}