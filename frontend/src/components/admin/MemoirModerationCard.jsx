import { useState } from 'react'
import { useUpdateMemoirStatus, usePreValidateMemoir } from '../../hooks/useAdmin'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { Eye, Check, X, Phone, Mail } from 'lucide-react'
import { Button } from '../ui/Button'

export default function MemoirModerationCard({ memoir }) {
  const { user } = useAuth()
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [reason, setReason] = useState('')
  
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMemoirStatus()
  const { mutate: preValidate, isPending: isPreValidating } = usePreValidateMemoir()
  
  const isPending = isUpdating || isPreValidating
  const isAmbassador = user?.role === 'ambassador'
  const isAlreadyPreValidated = memoir.status === 'pre_validated'

  const handleAction = () => {
    if (isAmbassador) {
      preValidate(memoir.public_id, {
        onSuccess: () => toast.success("Pré-validation actée."),
        onError: (err) => toast.error(`Erreur: ${err.message}`)
      })
    } else {
      updateStatus({ id: memoir.public_id, status: 'approved' }, {
        onSuccess: () => toast.success("Approbation finalisée."),
        onError: (err) => toast.error(`Erreur: ${err.message}`)
      })
    }
  }

  const handleReject = () => {
    if (!reason.trim()) return
    updateStatus({ id: memoir.public_id, status: 'rejected', rejection_reason: reason }, {
        onSuccess: () => toast.success("Rejet notifié."),
        onError: (err) => toast.error(`Erreur: ${err.message}`)
    })
    setShowRejectForm(false)
  }

  return (
    <div className="bg-white/50 border border-[var(--color-obsidian)]/10 p-8 space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <div className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border ${memoir.status === 'pre_validated' ? 'border-cyan-500/30 text-cyan-600' : 'border-amber-500/30 text-amber-600'}`}>
             {memoir.status === 'pre_validated' ? 'Strate: Pré-validé' : 'Strate: En Attente'}
           </div>
           <div className="font-mono text-[9px] opacity-30 uppercase tracking-widest">{memoir.year}</div>
        </div>

        <h3 className="text-xl font-serif text-[var(--color-obsidian)] leading-tight">{memoir.title}</h3>
        
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 italic">{memoir.author_name}</p>
          <p className="text-[10px] opacity-30 uppercase tracking-[0.2em]">{memoir.degree}</p>
        </div>

        <p className="text-sm font-light opacity-60 line-clamp-2 italic leading-relaxed">{memoir.abstract}</p>

        {/* Private Data */}
        {(memoir.author_email || memoir.author_phone) && (
          <div className="pt-4 border-t border-[var(--color-obsidian)]/5 space-y-2">
            <p className="font-mono text-[8px] uppercase tracking-widest opacity-30">Canaux Privés</p>
            <div className="flex flex-col gap-1 font-mono text-[9px] opacity-60">
              {memoir.author_phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {memoir.author_phone}</p>}
              {memoir.author_email && <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {memoir.author_email}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-[var(--color-obsidian)]/10">
        {!showRejectForm ? (
          <div className="flex gap-4">
            {(!isAmbassador || !isAlreadyPreValidated) && (
              <Button size="sm" variant="primary" className="flex-1 rounded-none" onClick={handleAction} disabled={isPending}>
                {isAmbassador ? 'Pré-valider' : 'Approuver'}
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1 rounded-none border-[var(--color-cinnabar)]/20 text-[var(--color-cinnabar)]" onClick={() => setShowRejectForm(true)} disabled={isPending}>
              Rejeter
            </Button>
            <a href={`/memoirs/${memoir.public_id}`} target="_blank" rel="noopener noreferrer" className="p-3 border border-[var(--color-obsidian)]/10 hover:bg-white transition-all">
              <Eye className="w-4 h-4 opacity-40" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              placeholder="Raison du rejet..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full font-light text-sm bg-transparent border-b border-[var(--color-cinnabar)]/30 py-2 focus:outline-none focus:border-[var(--color-cinnabar)] transition-all"
              rows={2}
            />
            <div className="flex gap-4">
              <Button size="sm" variant="primary" className="flex-1 bg-[var(--color-cinnabar)] border-[var(--color-cinnabar)] rounded-none" onClick={handleReject} disabled={!reason.trim() || isPending}>
                Confirmer Rejet
              </Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-none" onClick={() => { setShowRejectForm(false); setReason('') }}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}