// src/components/memoir/MemoirCard.jsx
import { Link } from 'react-router-dom'
import { Eye, Building2 } from 'lucide-react'
import { DEGREE_LABELS } from '../../utils/constants'


const DEGREE_COLORS = {
  licence:   'bg-blue-100 text-blue-700',
  master:    'bg-purple-100 text-purple-700',
  doctorat:  'bg-red-100 text-red-700',
  ingenieur: 'bg-green-100 text-green-700',
  bts:       'bg-orange-100 text-orange-700',
  dut:       'bg-yellow-100 text-yellow-700',
}

export default function MemoirCard({ memoir }) {
  return (
    <Link
      to={`/memoirs/${memoir.public_id}`}
      className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 p-5 gap-4 relative overflow-hidden group"
    >
      {/* Ligne décorative en haut au hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
          {memoir.title}
        </h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${DEGREE_COLORS[memoir.degree]}`}>
          {DEGREE_LABELS[memoir.degree]}
        </span>
      </div>

      {/* Résumé */}
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
        {memoir.abstract}
      </p>

      {/* Université */}
      {memoir.university?.name && (
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-gray-400">
          <Building2 className="w-3 h-3 text-indigo-500/60" />
          <span className="truncate">{memoir.university.name}</span>
        </div>
      )}

      {/* Métadonnées */}
      <div className="mt-auto flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
        <span className="font-medium text-gray-600">{memoir.author_name}</span>
        <div className="flex items-center gap-3">
          <span>{memoir.year}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {memoir.view_count}
          </span>

        </div>
      </div>
    </Link>
  )
}