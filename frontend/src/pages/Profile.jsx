import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { User, FileText, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Profile() {
  const { user, login } = useAuth();
  const [memoirs, setMemoirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchMyData() {
      try {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return;
        const userData = await apiClient('/users/me');
        if (cancelled) return;
        login(userData, currentToken);
        const memoirsData = await apiClient('/memoirs/me');
        if (cancelled) return;
        setMemoirs(memoirsData);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchMyData();
    return () => { cancelled = true; };
  }, [login]);

  const getStatusInfo = (status) => {
    switch(status) {
      case 'approved':
        return { label: 'Indexé', color: 'text-green-600', dot: 'bg-green-600' };
      case 'rejected':
        return { label: 'Rejeté', color: 'text-[var(--color-cinnabar)]', dot: 'bg-[var(--color-cinnabar)]' };
      default:
        return { label: 'Examen en cours', color: 'text-amber-600', dot: 'bg-amber-600' };
    }
  };

  return (
    <div className="relative pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-24 px-6 max-w-6xl mx-auto space-y-20">
        {/* Header Profil (Ledger Style) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-obsidian)] pb-12">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-cinnabar)]">
                <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
                Console de Chercheur
             </div>
             <h1 className="text-5xl md:text-7xl font-serif text-[var(--color-obsidian)] leading-none tracking-tighter">
               Mon <br /> <span className="italic opacity-30">Espace.</span>
             </h1>
          </div>
          <div className="flex flex-col items-end gap-2 font-mono text-[10px] uppercase tracking-widest">
             <span className="opacity-40">{user?.email}</span>
             <span className="text-[var(--color-cinnabar)]">Rang: {user?.role}</span>
          </div>
        </div>

        {/* Historique des Soumissions */}
        <div className="space-y-12">
          <div className="flex items-center justify-between">
              <h2 className="text-3xl font-serif italic opacity-60">Archive Personnelle</h2>
              <Button variant="primary" size="lg" to="/upload" className="rounded-none px-8">Soumettre</Button>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest opacity-20">Initialisation...</div>
          ) : memoirs.length === 0 ? (
            <div className="border border-[var(--color-obsidian)]/10 p-24 text-center space-y-6 bg-white/40">
              <FileText className="w-12 h-12 opacity-10 mx-auto" />
              <p className="font-serif italic text-2xl opacity-40">Aucun manuscrit n'a encore été déposé.</p>
              <Link to="/upload" className="font-mono text-xs uppercase tracking-widest text-[var(--color-cinnabar)] inline-block">Commencer l'archivage</Link>
            </div>
          ) : (
            <div className="grid gap-px bg-[var(--color-obsidian)]/10 border border-[var(--color-obsidian)]/10">
              {memoirs.map((memoir) => {
                const status = getStatusInfo(memoir.status);
                return (
                  <div key={memoir.public_id || memoir.id} className="bg-[var(--color-base)] p-10 grid grid-cols-1 md:grid-cols-12 gap-8 hover:bg-white transition-colors group">
                    <div className="md:col-span-8 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                           <span className={`font-mono text-[9px] uppercase tracking-widest ${status.color}`}>{status.label}</span>
                        </div>
                        <h3 className="text-2xl font-serif text-[var(--color-obsidian)] group-hover:text-[var(--color-cinnabar)] transition-colors line-clamp-1">{memoir.title}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 italic">
                          Déposé le {memoir.created_at ? new Date(memoir.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Date Inconnue'}
                        </p>
                    </div>
                    
                    <div className="md:col-span-4 flex flex-col justify-end items-end gap-4">
                       {memoir.status === 'rejected' && memoir.rejection_reason && (
                          <div className="text-right space-y-2">
                             <p className="font-mono text-[9px] uppercase text-[var(--color-cinnabar)] tracking-widest">Note du Conseil</p>
                             <p className="text-sm font-light opacity-60 italic max-w-[200px] leading-relaxed">{memoir.rejection_reason}</p>
                          </div>
                       )}
                       {memoir.status === 'approved' && (
                          <Link to={`/memoirs/${memoir.public_id}`} className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-obsidian)] hover:text-[var(--color-cinnabar)]">
                             Consulter <ArrowRight className="w-3 h-3" />
                          </Link>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
