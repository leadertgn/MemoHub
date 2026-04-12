import { useParams, Link } from 'react-router-dom'
import { SearchX, FileText, Lock, Download } from 'lucide-react'
import { useMemoirDetail } from '../hooks/useMemoirs'
import { useAuth } from '../context/AuthContext'
import SecurePDFViewer from '../components/SecurePDFViewer'
import CitationBlock from '../components/memoir/CitationBlock'

const DEGREE_LABELS = {
  licence: 'Licence', master: 'Master', doctorat: 'Doctorat',
  ingenieur: 'Ingénieur', bts: 'BTS', dut: 'DUT',
}

export default function MemoirDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { data: memoir, isLoading, isError } = useMemoirDetail(id)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-40 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (isError || !memoir) {
    return (
      <div className="text-center py-20 space-y-4">
        <SearchX className="w-16 h-16 text-gray-200 mx-auto" />
        <div>
          <p className="text-gray-500 font-bold text-lg">Mémoire introuvable</p>
          <Link to="/search" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
            Retour à la recherche
          </Link>
        </div>
      </div>
    )
  }

  const handleDownload = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/memoirs/${memoir.public_id}/download`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error("Erreur téléchargement");
      
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      const safeTitle = memoir.title.replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `MemoHub_${safeTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (_err) {
      alert("Impossible de télécharger le document. Il n'est peut-être pas disponible.");
    }
  }

  return (
    <div className="relative pb-24">
      {/* Decors BG */}
      <div className="absolute top-0 left-0 w-full h-75 bg-linear-to-br from-blue-50/80 via-indigo-50/50 to-white -z-10" />

      <div className="max-w-3xl mx-auto space-y-6 pt-6 px-4">
      <nav className="text-sm text-gray-400">
        <Link to="/search" className="hover:text-blue-600">Recherche</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-600">{memoir.title}</span>
      </nav>

      {/* En-tête */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug flex-1 tracking-tight">
            {memoir.title}
          </h1>
          <span className="shrink-0 text-xs font-bold px-4 py-2 rounded-full bg-linear-to-tr from-blue-100 to-indigo-100 text-blue-800 shadow-sm">
            {DEGREE_LABELS[memoir.degree]}
          </span>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            { label: 'Auteur',      value: memoir.author_name },
            { label: 'Année',       value: memoir.year },
            { label: 'Université',  value: memoir.university?.name || 'Non renseignée' },
            { label: 'Filière',     value: memoir.field_of_study?.label || 'Non renseignée' },
            { label: 'Langue',      value: memoir.language?.toUpperCase() },
            { label: 'Vues',        value: memoir.view_count },
          ].map(item => (
            <div key={item.label} className="space-y-0.5">
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <p className="font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Résumé</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{memoir.abstract}</p>
      </div>

      {/* Citation */}
      <CitationBlock memoir={memoir} />

      {/* Accès au document */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          Document Intégral
        </h2>

        {!isAuthenticated ? (
          <div className="text-center py-10 space-y-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-gray-600 font-medium max-w-sm mx-auto">
              Veuillez vous connecter pour lire et télécharger le mémoire complet.
            </p>
            <Link
              to="/login"
              className="inline-block bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-linear-to-r from-gray-800 to-gray-900 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Télécharger (avec filigrane)
              </button>
            </div>
            
            {/* Lecteur PDF */}
            <div className="rounded-xl overflow-hidden shadow-inner border border-gray-200">
                <SecurePDFViewer memoirId={memoir.public_id} />
            </div>
          </div>
        )}
      </div>

      {/* Retour */}
      <div className="pt-4 text-center">
        <Link
            to="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 hover:-translate-x-1 transition-all"
        >
            ← Retour aux recherches
        </Link>
      </div>

    </div>
    </div>
  )
}