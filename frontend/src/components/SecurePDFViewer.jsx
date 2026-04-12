import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Configuration du Web Worker pour PDF.js (utilisation du CDN unpkg pour éviter les soucis Vite)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SecurePDFViewer({ memoirId }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState(null);
  const [errorLoading, setErrorLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);

  // Mesure dynamique de la largeur du conteneur via ResizeObserver
  // Cela évite tout rognage du PDF sur les bords, quelle que soit la taille d'écran
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(Math.floor(entry.contentRect.width) - 2);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/memoirs/${memoirId}/stream`;
      
      // On passe directement l'URL avec les Headers à react-pdf
      // Cela permet à pdf.js de faire des Range requests (téléchargement par morceaux)
      setPdfData({
        url: url,
        httpHeaders: { 
          Authorization: `Bearer ${token}` 
        }
      });
    } catch (err) {
      console.error(err);
      setErrorLoading(true);
    }
  }, [memoirId]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Désactiver le clic droit
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div 
      className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl p-2 sm:p-4 overflow-hidden relative" 
      onContextMenu={handleContextMenu}
    >
      {/* Contrôles de pagination */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-gray-200 w-full justify-center">
        <button 
          onClick={() => setPageNumber(p => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
          className="text-sm font-medium text-gray-600 hover:text-blue-600 disabled:text-gray-300 transition-colors"
        >
          ← Précédent
        </button>
        <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">
          Page {pageNumber} sur {numPages || '--'}
        </span>
        <button 
          onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
          disabled={pageNumber >= (numPages || 1)}
          className="text-sm font-medium text-gray-600 hover:text-blue-600 disabled:text-gray-300 transition-colors"
        >
          Suivant →
        </button>
      </div>

      {/* Le PDF (rendu en Canvas protégé) avec Overlay Filigrane */}
      <div 
        ref={containerRef} 
        className="w-full shadow-2xl border border-gray-300 bg-white select-none relative overflow-hidden group"
      >
        {errorLoading ? (
           <div className="p-20 text-red-500 font-medium bg-red-50 rounded-lg m-4 flex items-center gap-2">
             <AlertTriangle className="w-6 h-6" /> Erreur ou document inaccessible.
           </div>
        ) : !pdfData ? (
           <div className="flex flex-col items-center justify-center p-20 text-gray-400 space-y-4">
               <Loader2 className="w-8 h-8 animate-spin" />
               <p>Chargement initial du document ...</p>
            </div>
        ) : (
          <>
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                 <div className="flex flex-col items-center justify-center p-20 text-gray-500 space-y-4 font-medium">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p className="animate-pulse">Connexion au proxy de téléchargement sécurisé...</p>
                 </div>
              }
              error={
                <div className="p-20 text-red-500 font-medium bg-red-50 rounded-lg m-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" /> Erreur lors de l'affichage du PDF.
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={false}        // Empêche la sélection directe du texte (sécurité)
                renderAnnotationLayer={false} 
                width={containerWidth || undefined} // Largeur mesurée dynamiquement — plus de rognage sur mobile
                className="pointer-events-none"    // Empêche le drag & drop de l'image du canvas
              />
            </Document>

            {/* Filigrane Anti-Capture d'Écran */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden opacity-[0.06] select-none z-50">
              <div className="transform -rotate-45 font-black text-6xl whitespace-nowrap text-gray-900 tracking-widest uppercase">
                MemoHub Sécurisé
              </div>
              <div className="transform -rotate-45 mt-20 font-bold text-3xl whitespace-nowrap text-gray-900 tracking-widen">
                Lecture Seule - Copie Interdite
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Mentions légales / Filigrane UI */}
      <div className="mt-4 text-xs font-semibold text-gray-400 tracking-wider">
        PROPRIÉTÉ MEMOHUB — COPIE INTERDITE
      </div>
    </div>
  );
}
