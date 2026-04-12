import { useState } from 'react'
import { useUpdateMemoirStatus } from '../../hooks/useAdmin'
import { toast } from 'sonner'
import { Eye, Check, X, Phone, Mail } from 'lucide-react'

export default function MemoirModerationCard({ memoir }) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [reason, setReason] = useState('')
  const { mutate: updateStatus, isPending } = useUpdateMemoirStatus()

  const handleApprove = () => {
    updateStatus({ id: memoir.id, status: 'approved' }, {
        onSuccess: () => toast.success("Mémoire approuvé avec succès !"),
        onError: (err) => toast.error(`Erreur: ${err.message}`)
    })
  }

  const handleReject = () => {
    if (!reason.trim()) return
    updateStatus({ id: memoir.id, status: 'rejected', rejection_reason: reason }, {
        onSuccess: () => toast.success("Mémoire rejeté, l'auteur a été notifié."),
        onError: (err) => toast.error(`Erreur: ${err.message}`)
    })
    setShowRejectForm(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">

      {/* Titre + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">
            {memoir.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            par <span className="font-medium">{memoir.author_name}</span>
            {' · '}{memoir.year}
            {' · '}<span className="capitalize">{memoir.degree}</span>
          </p>
        </div>
        {memoir.status === 'pre_validated' ? (
          <span className="text-xs bg-cyan-50 text-cyan-600 px-2 py-1 rounded-full font-medium shrink-0">
            Pré-validé
          </span>
        ) : (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium shrink-0">
            En attente
          </span>
        )}
      </div>

      {/* Résumé */}
      <p className="text-xs text-gray-500 line-clamp-2">{memoir.abstract}</p>

      {/* Info privées */}
      {(memoir.author_email || memoir.author_phone) && (
        <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs space-y-1">
          <p className="font-semibold text-blue-900 pb-1">Vérification identité (Privé)</p>
          <div className="flex flex-col gap-1 text-blue-700">
            {memoir.author_phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {memoir.author_phone}</p>}
            {memoir.author_email && <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {memoir.author_email}</p>}
          </div>
        </div>
      )}

      {/* Actions */}
      {!showRejectForm ? (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-xs py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Approuver
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 text-xs py-2 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Rejeter
          </button>
          <a
            href={`/memoirs/${memoir.public_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 flex items-center justify-center bg-gray-50 text-gray-600 text-xs py-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Voir le mémoire dans un nouvel onglet"
          >
            <Eye className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <textarea
            placeholder="Raison du rejet (obligatoire)..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            className="w-full text-xs border border-red-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={!reason.trim() || isPending}
              className="flex-1 bg-red-600 text-white text-xs py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Confirmer le rejet
            </button>
            <button
              onClick={() => { setShowRejectForm(false); setReason('') }}
              className="flex-1 bg-gray-100 text-gray-600 text-xs py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}