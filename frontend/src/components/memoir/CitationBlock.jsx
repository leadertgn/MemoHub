import { useState } from 'react';
import { Copy, Check, Quote } from 'lucide-react';

/**
 * Génère les citations dans les 3 formats académiques les plus utilisés.
 * @param {object} memoir - Les données du mémoire (title, author_name, year, degree, university, public_id)
 */

const DEGREE_FULL = {
  licence:   'Mémoire de Licence',
  master:    'Mémoire de Master',
  doctorat:  'Thèse de Doctorat',
  ingenieur: "Mémoire de fin d'études (Ingénieur)",
  bts:       'Rapport de BTS',
  dut:       'Rapport de DUT',
};

function buildCitations(memoir) {
  const url = `${window.location.origin}/memoirs/${memoir.public_id}`;
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const university = memoir.university?.name ?? 'Université inconnue';
  const degreeLabel = DEGREE_FULL[memoir.degree] ?? memoir.degree;

  // Séparation Nom / Prénom pour APA (si possible)
  const nameParts = memoir.author_name.trim().split(/\s+/);
  const lastName = nameParts[0];
  const firstInitials = nameParts
    .slice(1)
    .map((p) => p[0] + '.')
    .join(' ');
  const apaAuthor = firstInitials ? `${lastName}, ${firstInitials}` : lastName;

  return {
    apa: `${apaAuthor} (${memoir.year}). *${memoir.title}* [${degreeLabel}, ${university}]. MemoHub. Consulté le ${today}, sur ${url}`,
    iso: `${memoir.author_name.toUpperCase()}. ${memoir.title}. ${degreeLabel}, ${university}, ${memoir.year}. [En ligne]. Disponible sur : ${url} (Consulté le ${today})`,
    web: `${memoir.author_name} (${memoir.year}). « ${memoir.title} ». MemoHub. [En ligne] Disponible sur : ${url}. Consulté le ${today}.`,
  };
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      // Fallback pour navigateurs anciens
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copier dans le presse-papiers"
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-700'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copié !
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copier
        </>
      )}
    </button>
  );
}

function CitationRow({ label, text, badge }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badge}`}>{label}</span>
        <CopyButton text={text} />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 font-mono select-all">
        {text}
      </p>
    </div>
  );
}

export default function CitationBlock({ memoir }) {
  const [open, setOpen] = useState(false);
  const citations = buildCitations(memoir);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Déclencheur */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">Citer ce mémoire</p>
            <p className="text-xs text-gray-400">APA · ISO 690 · Webographie</p>
          </div>
        </div>
        <span className={`text-gray-400 text-lg transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ›
        </span>
      </button>

      {/* Contenu */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            Choisissez le format correspondant à votre institution ou au style de votre encadreur. Cliquez sur « Copier » pour l'insérer dans votre bibliographie.
          </p>

          <CitationRow
            label="APA 7e édition"
            text={citations.apa}
            badge="bg-blue-50 text-blue-700"
          />
          <CitationRow
            label="ISO 690 (Norme française)"
            text={citations.iso}
            badge="bg-indigo-50 text-indigo-700"
          />
          <CitationRow
            label="Webographie (format courant)"
            text={citations.web}
            badge="bg-violet-50 text-violet-700"
          />

          <p className="text-xs text-gray-400 pt-1">
            * Les citations sont générées automatiquement à partir des métadonnées du mémoire. Vérifiez qu'elles correspondent bien aux exigences de votre établissement.
          </p>
        </div>
      )}
    </div>
  );
}
