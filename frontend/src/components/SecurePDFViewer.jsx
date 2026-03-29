import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuration du Web Worker pour PDF.js (utilisation du CDN unpkg pour éviter les soucis Vite)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SecurePDFViewer({ memoirId }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Appel de l'API sécurisée avec le bearer token
  const fileInfo = {
    url: `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/memoirs/${memoirId}/stream`,
    httpHeaders: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  };

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
      className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-hidden relative" 
      onContextMenu={handleContextMenu}
    >
      {/* Contrôles de pagination */}
      <div className="flex items-center gap-4 mb-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
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

      {/* Le PDF (rendu en Canvas protégé) */}
      <div className="shadow-2xl border border-gray-300 bg-white select-none">
        <Document
          file={fileInfo}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center p-20 text-gray-400 space-y-4">
              <div className="animate-spin text-3xl">⚙️</div>
              <p>Chargement sécurisé du document...</p>
            </div>
          }
          error={<div className="p-20 text-red-500 font-medium bg-red-50 rounded-lg m-4">⚠️ Erreur ou document inaccessible.</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}       // Empêche la sélection directe du texte (sécurité)
            renderAnnotationLayer={false} 
            width={Math.min(window.innerWidth - 64, 800)} // Responsive max width
            className="pointer-events-none" // Empêche le drag & drop de l'image du canvas
          />
        </Document>
      </div>
      
      {/* Mentions légales / Filigrane UI */}
      <div className="mt-4 text-xs font-semibold text-gray-400 tracking-wider">
        PROPRIÉTÉ MEMOHUB — COPIE INTERDITE
      </div>
    </div>
  );
}
