import { useUpdateUniversityStatus } from '../../hooks/useAdmin'
import { toast } from 'sonner'
import { Check, X, ExternalLink, User } from 'lucide-react'
import { Button } from '../ui/Button'

export default function UniversityModerationCard({ university }) {
  const { mutate: updateStatus, isPending } = useUpdateUniversityStatus()

  const handleApprove = () => {
    updateStatus({ id: university.public_id || university.id, status: 'approved' }, {
      onSuccess: () => toast.success("Institution validée."),
      onError: (err) => toast.error(`Erreur: ${err.message}`)
    })
  }

  const handleReject = () => {
    const reason = window.prompt("Motif du refus ?");
    if (!reason) return;
    updateStatus({ id: university.public_id || university.id, status: 'rejected', rejection_reason: reason }, {
      onSuccess: () => toast.success("Institution rejetée."),
      onError: (err) => toast.error(`Erreur: ${err.message}`)
    });
  }

  return (
    <div className="bg-white/50 border border-[var(--color-obsidian)]/10 p-8 space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-serif text-[var(--color-obsidian)] leading-tight">{university.name}</h3>
          <div className="font-mono text-[9px] uppercase tracking-widest text-amber-600 border border-amber-500/20 px-2 py-1">En Examen</div>
        </div>

        <div className="space-y-2">
            {university.website && (
              <a href={university.website} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] uppercase text-blue-600 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> {university.website}
              </a>
            )}
            <div className="flex items-center gap-2 font-mono text-[9px] opacity-40 uppercase">
              <User className="w-3 h-3" />
              Suggérée par {university.submitted_by_name || 'Anonyme'}
            </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-[var(--color-obsidian)]/5">
        <Button size="sm" variant="primary" className="flex-1 rounded-none" onClick={handleApprove} disabled={isPending}>Valider</Button>
        <Button size="sm" variant="outline" className="flex-1 rounded-none border-[var(--color-cinnabar)]/20 text-[var(--color-cinnabar)]" onClick={handleReject} disabled={isPending}>Rejeter</Button>
      </div>
    </div>
  )
}
