import { Link } from 'react-router-dom'
import { Eye, Building2 } from 'lucide-react'
import { DEGREE_LABELS } from '../../utils/constants'

export default function MemoirCard({ memoir }) {
  return (
    <Link
      to={`/memoirs/${memoir.public_id}`}
      className="group relative flex flex-col h-full bg-white/50 backdrop-blur-sm border border-[var(--color-obsidian)]/10 p-8 transition-all hover:border-[var(--color-cinnabar)] hover:bg-white"
    >
      {/* Index Monospace */}
      <div className="absolute top-4 right-6 font-mono text-[9px] uppercase tracking-widest text-[var(--color-obsidian)]/50 font-bold">
        Année : {memoir.year}
      </div>

      <div className="space-y-6">
        {/* Titre Serif */}
        <h3 className="text-xl font-serif text-[var(--color-obsidian)] leading-tight group-hover:text-[var(--color-cinnabar)] transition-colors line-clamp-3">
          {memoir.title}
        </h3>

        {/* Institution */}
        {memoir.university?.name && (
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest opacity-60 font-bold">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{memoir.university.name}</span>
          </div>
        )}

        {/* Résumé */}
        <p className="text-sm font-light text-[var(--color-obsidian)]/80 line-clamp-2 leading-relaxed italic">
          {memoir.abstract}
        </p>

        {/* Footer Ledger */}
        <div className="pt-6 border-t border-[var(--color-obsidian)]/5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-obsidian)] font-bold">{memoir.author_name}</p>
            <p className="text-[10px] opacity-60 uppercase tracking-[0.2em] font-medium">{DEGREE_LABELS[memoir.degree]}</p>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] opacity-60 font-bold">
             <span className="flex items-center gap-1.5">
               <Eye className="w-3 h-3" /> {memoir.view_count}
             </span>
          </div>
        </div>
      </div>
    </Link>
  )
}