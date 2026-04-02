import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { User, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, token, login } = useAuth();
  const [memoirs, setMemoirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyData() {
      try {
        // 1. Récupérer les infos fraîches de l'utilisateur (pour mettre à jour son rôle si changé)
        const userData = await apiClient('/users/me');
        if (userData && token) {
            login(userData, token); // Met à jour le contexte global et le localStorage
        }

        // 2. Fetch de l'historique des mémoires
        const memoirsData = await apiClient('/memoirs/me');
        setMemoirs(memoirsData);
      } catch (error) {
        console.error("Erreur de récupération du profil:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyData();
  }, [token, login]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold shadow-sm">Publié</span>;
      case 'pending':
      case 'pre_validated':
        return <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-bold shadow-sm">En Révision</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold shadow-sm">Rejeté</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-bold shadow-sm">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Profil */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Espace Étudiant</h1>
            <p className="text-gray-500 font-medium">{user?.email}</p>
            <div className="mt-2 text-sm font-semibold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full">
              Rôle : {user?.role.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Mes Soumissions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Mes publications</h2>
            <Link to="/upload" className="bg-gray-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all">
                + Nouveau
            </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">Chargement de votre historique...</div>
        ) : memoirs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center space-y-4">
            <FileText className="w-16 h-16 text-gray-300 mx-auto" />
            <p className="text-gray-800 font-bold text-xl">Vous n'avez soumis aucun manuscrit.</p>
            <p className="text-gray-500">Valorisez votre travail en partageant votre recherche avec la communauté.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {memoirs.map(memoir => (
              <div key={memoir.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{memoir.title}</h3>
                        <p className="text-sm text-gray-500">Soumis le {new Date().toLocaleDateString('fr-FR')} — Année {memoir.year}</p>
                    </div>
                    {getStatusBadge(memoir.status)}
                </div>
                
                {memoir.status === 'rejected' && memoir.rejection_reason && (
                    <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">
                        <strong className="block mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Motif du rejet :</strong>
                        {memoir.rejection_reason}
                    </div>
                )}
                {memoir.status === 'approved' && (
                    <div className="mt-4">
                        <Link to={`/memoirs/${memoir.id}`} className="text-blue-600 font-medium text-sm hover:underline">
                            Voir la publication publique →
                        </Link>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
