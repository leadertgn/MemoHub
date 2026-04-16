// src/pages/Search.jsx
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMemoirs } from '../hooks/useMemoirs'
import MemoirCard from '../components/memoir/MemoirCard'
import MemoirFilters from '../components/memoir/MemoirFilters'
import { SearchX } from 'lucide-react'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

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
    <div className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Bouton Filtre Mobile */}
      <div className="md:hidden flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Catalogue</h1>
        <button 
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          {showFiltersMobile ? 'Masquer' : 'Filtres'}
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* Barre de filtres (En haut sur desktop, stack sur mobile) */}
        <aside className={`w-full ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <MemoirFilters filters={filters} onChange={handleFiltersChange} />
        </aside>

        {/* Section résultats */}
        <div className="flex-1 space-y-6">

        {/* En-tête résultats */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4">
            {isLoading ? 'Recherche en cours...' : `${memoirs?.total ?? 0} mémoire(s) trouvé(s)`}
          </h2>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="md:hidden h-px bg-gray-200 w-full mb-4"></div>

        {/* États */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse shadow-sm" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-red-500">Une erreur serveur l'empêche de s'afficher correctement.</p>
          </div>
        )}

        {!isLoading && !isError && (!memoirs?.items || memoirs.items.length === 0) && (
          <div className="bg-white border text-center py-24 rounded-2xl space-y-4 shadow-sm border-gray-100 hover:shadow-md transition-shadow">
            <SearchX className="w-16 h-16 text-gray-300 mx-auto" />
            <p className="text-gray-800 font-bold text-xl">Aucun manuscrit trouvé</p>
            <p className="text-gray-500 max-w-sm mx-auto">Votre recherche est peut-être trop restrictive. Essayez de retirer quelques filtres ou de chercher par mots-clés plus larges.</p>
          </div>
        )}

        {!isLoading && !isError && memoirs?.items?.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memoirs.items.map(memoir => (
                <MemoirCard key={memoir.id} memoir={memoir} />
              ))}
            </div>

            {/* Pagination API */}
            <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-6">
              <span className="text-sm font-medium text-gray-500">
                Page <span className="text-gray-900 font-bold">{memoirs.page}</span> sur {memoirs.total_pages} ({memoirs.total} résultats)
              </span>
              <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={memoirs.page === 1}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm disabled:opacity-40 hover:bg-gray-50 hover:text-blue-600 transition-all"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={memoirs.page >= memoirs.total_pages}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm disabled:opacity-40 hover:bg-gray-50 hover:text-blue-600 transition-all"
                  >
                    Suivant →
                  </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  )
}