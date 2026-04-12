import { useUpdateUniversityStatus } from '../../hooks/useAdmin'
import { toast } from 'sonner'
import { Check, X, ExternalLink, User } from 'lucide-react'

export default function UniversityModerationCard({ university }) {
  const { mutate: updateStatus, isPending } = useUpdateUniversityStatus()

  const handleApprove = () => {
    updateStatus({ id: university.public_id || university.id, status: 'approved' }, {
      onSuccess: () => toast.success("Université validée avec succès !"),
      onError: (err) => toast.error(`Erreur: ${err.message}`)
    })
  }

  const handleReject = () => {
    const reason = window.prompt("Quel est le motif de refus de cette université (envoyé par email) ?");
    if (!reason) return;
    updateStatus({ id: university.public_id || university.id, status: 'rejected', rejection_reason: reason }, {
      onSuccess: () => toast.success("Université rejetée, un e-mail a été envoyé avec le motif."),
      onError: (err) => toast.error(`Erreur: ${err.message}`)
    });
  }

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
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              {university.website}
            </a>
          )}
        </div>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium shrink-0">
          En attente
        </span>
      </div>

      {/* Suggestion par */}
      <div className="flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-xs text-gray-500">
          Suggérée par {university.submitted_by_name || 'utilisateur inconnu'}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-xs py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          Valider
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 text-xs py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Rejeter
        </button>
      </div>
    </div>
  )
}
