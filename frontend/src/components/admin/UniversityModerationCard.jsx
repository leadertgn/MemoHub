import { useUpdateUniversityStatus } from '../../hooks/useAdmin'

export default function UniversityModerationCard({ university }) {
  const { mutate: updateStatus, isPending } = useUpdateUniversityStatus()

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{university.name}</h3>
          {university.website && (
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              {university.website}
            </a>
          )}
        </div>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium shrink-0">
          En attente
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => updateStatus({ id: university.id, status: 'approved' })}
          disabled={isPending}
          className="flex-1 bg-green-600 text-white text-xs py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          ✅ Valider
        </button>
        <button
          onClick={() => updateStatus({ id: university.id, status: 'rejected' })}
          disabled={isPending}
          className="flex-1 bg-red-50 text-red-600 text-xs py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          ❌ Rejeter
        </button>
      </div>
    </div>
  )
}