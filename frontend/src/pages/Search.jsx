import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMemoirs } from '../hooks/useMemoirs'
import MemoirCard from '../components/memoir/MemoirCard'
import MemoirFilters from '../components/memoir/MemoirFilters'
import { SearchX, Filter } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  const [filters, setFilters] = useState({
    search:            searchParams.get('search') || '',
    degree:            searchParams.get('degree') || '',
    domain_id:         searchParams.get('domain_id') || '',
    country_id:        searchParams.get('country_id') || '',
    university_id:     searchParams.get('university_id') || '',
    field_of_study_id: searchParams.get('field_of_study_id') || '',
    year:              searchParams.get('year') || '',
  })

  const { data: memoirs, isLoading, isError } = useMemoirs({ ...filters, page, limit: 12 })

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
    const params = {}
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  return (
    <div className="relative pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-24 px-6 max-w-[1600px] mx-auto space-y-16">
        {/* Header Archive */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-obsidian)] pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-cinnabar)]">
              <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
              Bibliothèque / Archive Universelle
            </div>
            <h1 className="text-6xl md:text-8xl font-serif text-[var(--color-obsidian)] leading-none tracking-tighter">
              Catalogue <br /> <span className="italic opacity-30">Vivant.</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest opacity-40">
             <span>{isLoading ? 'Scanning...' : `${memoirs?.total ?? 0} Documents`}</span>
             <button 
               onClick={() => setShowFiltersMobile(!showFiltersMobile)}
               className="md:hidden flex items-center gap-2 text-[var(--color-cinnabar)]"
             >
               <Filter className="w-3 h-3" /> Filtres
             </button>
          </div>
        </div>

        <div className="space-y-12">
          {/* Filtres Horizontaux (Design Ledger) */}
          <div className={`${showFiltersMobile ? 'block' : 'hidden md:block'} border-b border-[var(--color-obsidian)]/10 pb-12`}>
             <h2 className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-60 mb-8">Paramètres d'Indexation</h2>
             <MemoirFilters filters={filters} onChange={handleFiltersChange} />
          </div>

          {/* Résultats Archive */}
          <div className="space-y-12">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-obsidian)]/10 border border-[var(--color-obsidian)]/10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/50 h-80 animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && !isError && (!memoirs?.items || memoirs.items.length === 0) && (
              <div className="border border-[var(--color-obsidian)]/10 p-24 text-center space-y-6">
                <SearchX className="w-12 h-12 opacity-10 mx-auto" />
                <p className="font-serif italic text-2xl opacity-40">Aucun manuscrit n'a été trouvé dans cette strate.</p>
              </div>
            )}

            {!isLoading && !isError && memoirs?.items?.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {memoirs.items.map((memoir) => (
                    <MemoirCard key={memoir.public_id || memoir.id} memoir={memoir} />
                  ))}
                </div>

                {/* Pagination Ledger */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-[var(--color-obsidian)]/10 font-mono text-[10px] uppercase tracking-widest">
                  <div className="opacity-40">
                    Strate {memoirs.page} / {memoirs.total_pages} — {memoirs.total} Unités
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                      disabled={memoirs.page === 1}
                      className="rounded-none border-[var(--color-obsidian)]/20"
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                      disabled={memoirs.page >= memoirs.total_pages}
                      className="rounded-none border-[var(--color-obsidian)]/20"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}