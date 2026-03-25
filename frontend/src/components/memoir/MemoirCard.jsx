// src/components/memoir/MemoirCard.jsx
import { Link } from 'react-router-dom'

const DEGREE_LABELS = {
  licence:   'Licence',
  master:    'Master',
  doctorat:  'Doctorat',
  ingenieur: 'Ingénieur',
  bts:       'BTS',
  dut:       'DUT',
}

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
      to={`/memoirs/${memoir.id}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 space-y-3"
    >
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

      {/* Métadonnées */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
        <span className="font-medium text-gray-600">{memoir.author_name}</span>
        <div className="flex items-center gap-3">
          <span>{memoir.year}</span>
          <span className="flex items-center gap-1">
            👁 {memoir.view_count}
          </span>
          {memoir.is_premium && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
              Premium
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}