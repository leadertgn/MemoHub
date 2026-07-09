import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { SearchX, FileText, Lock, Download, CheckCircle, ArrowLeft } from 'lucide-react'
import { useMemoirDetail } from '../hooks/useMemoirs'
import { useAuth } from '../context/AuthContext'
import SecurePDFViewer from '../components/SecurePDFViewer'
import CitationBlock from '../components/memoir/CitationBlock'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'
import { DEGREE_LABELS } from '../utils/constants'
import SEO from '../components/layout/SEO'

export default function MemoirDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { data: memoir, isLoading, isError } = useMemoirDetail(id)
  const [isDownloading, setIsDownloading] = useState(false)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-32 space-y-12 px-6">
        <div className="h-20 bg-[var(--color-obsidian)]/5 animate-pulse w-3/4" />
        <div className="h-6 bg-[var(--color-obsidian)]/5 animate-pulse w-1/4" />
        <div className="h-96 bg-[var(--color-obsidian)]/5 animate-pulse" />
      </div>
    )
  }

  if (isError || !memoir) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-6">
        <SearchX className="w-12 h-12 opacity-10" />
        <p className="font-serif italic text-2xl opacity-40 text-center">Manuscrit introuvable dans l'archive.</p>
        <Link to="/search" className="font-mono text-xs uppercase tracking-widest text-[var(--color-cinnabar)]">Retour au Catalogue</Link>
      </div>
    )
  }

  const handleDownload = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    const toastId = toast.loading('Extraction du document...')
    try {
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/memoirs/${memoir.public_id}/download`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (!res.ok) throw new Error("Erreur");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `MemoHub_${memoir.public_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Archivage local réussi.', { id: toastId });
    } catch (_err) {
      toast.error("Échec de l'extraction.", { id: toastId });
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="relative pb-32">
      <SEO title={memoir.title} description={memoir.abstract} />
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-24 px-6 max-w-6xl mx-auto space-y-20">
        {/* Navigation / Metadata Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-obsidian)] pb-12">
          <div className="space-y-6 flex-1">
            <Link to="/search" className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
               <ArrowLeft className="w-3 h-3" /> Retour au Catalogue
            </Link>
            <h1 className="text-4xl md:text-6xl font-serif text-[var(--color-obsidian)] leading-[1.1] tracking-tight">
              {memoir.title}
            </h1>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
             <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-cinnabar)]">
               Dossier Ref. {memoir.public_id.slice(0,8)}
             </div>
             <div className="font-serif italic text-2xl opacity-40">{DEGREE_LABELS[memoir.degree]}</div>
          </div>
        </div>

        {/* Fiche Technique (Grid Ledger) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-obsidian)]/10 border border-[var(--color-obsidian)]/10">
          {[
            { label: 'Auteur', value: memoir.author_name },
            { label: 'Soutenance', value: memoir.year },
            { label: 'Établissement', value: memoir.university?.name },
            { label: 'Filière', value: memoir.field_of_study?.label },
            { label: 'Langue', value: memoir.language?.toUpperCase() },
            { label: 'Consultations', value: `${memoir.view_count} Vues` },
          ].map((item, i) => (
            <div key={i} className="bg-[var(--color-base)] p-8 space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-30">{item.label}</span>
              <p className="font-serif italic text-lg text-[var(--color-obsidian)]/80 leading-tight">{item.value || 'N/A'}</p>
            </div>
          ))}
        </div>

        {/* Résumé Editorial */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
           <div className="md:col-span-4 space-y-6">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-30">Abstract / Résumé</h2>
              <p className="text-sm font-light opacity-60 leading-relaxed italic border-l-2 border-[var(--color-cinnabar)] pl-6">
                {memoir.field_of_study?.label} · {memoir.university?.name}
              </p>
           </div>
           <div className="md:col-span-8">
              <p className="text-xl font-light text-[var(--color-obsidian)]/70 leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-2">
                {memoir.abstract}
              </p>
           </div>
        </div>

        {/* Bloc Citation */}
        <div className="pt-12">
          <CitationBlock memoir={memoir} />
        </div>

        {/* Consultation du Document */}
        <div className="space-y-12 pt-20 border-t border-[var(--color-obsidian)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
             <h2 className="text-4xl font-serif italic">Lecture du Manuscrit.</h2>
             {isAuthenticated && memoir.allow_download && (
               <Button variant="primary" size="xl" onClick={handleDownload} disabled={isDownloading} className="rounded-none px-12">
                 Archiver le PDF
               </Button>
             )}
          </div>

          {!isAuthenticated ? (
            <div className="bg-[var(--color-obsidian)] text-white p-16 text-center space-y-8 rounded-[var(--radius-premium)]">
               <Lock className="w-12 h-12 mx-auto opacity-20" />
               <p className="font-serif italic text-2xl max-w-sm mx-auto opacity-80">L'accès intégral au manuscrit nécessite une authentification académique.</p>
               <Button variant="outline" size="xl" to="/login" className="rounded-none border-white text-white hover:bg-white hover:text-[var(--color-obsidian)] px-12">
                 S'identifier
               </Button>
            </div>
          ) : (
            <div className="bg-white border border-[var(--color-obsidian)] shadow-2xl">
               {!memoir.allow_download && (
                 <div className="bg-amber-50 p-4 font-mono text-[9px] uppercase tracking-widest text-center border-b border-amber-100 opacity-60">
                   Note : Lecture en ligne uniquement / Téléchargement restreint par l'auteur.
                 </div>
               )}
               <SecurePDFViewer memoirId={memoir.public_id} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}