import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useCountries, useDomains } from '../../hooks/useFilters';

function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function SuggestUniversityModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', acronym: '', country_id: null, website: '' });
  const { data: countries } = useCountries();
  const [successMsg, setSuccessMsg] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data) => apiClient('/universities/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    onSuccess: () => {
      setSuccessMsg("Votre suggestion a été envoyée ! Elle sera validée par l'équipe.");
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setForm({ name: '', acronym: '', country_id: null, website: '' });
      }, 3000);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  return (
    <ModalWrapper title="Suggérer une École/Institut" onClose={onClose}>
      {successMsg ? (
        <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <p className="font-bold text-gray-900">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error.message || 'Une erreur est survenue'}</p>}
            
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 mb-4 border border-blue-100">
              💡 <strong>Note :</strong> Ajoutez l'école ou institut direct (ex: INSTI) plutôt que l'université parente (ex: UNSTIM) pour éviter la confusion.
            </div>

            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Nom complet de l'école *</label>
                <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: Institut National Supérieur..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Acronyme/Sigle (Optionnel)</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none uppercase placeholder:normal-case" placeholder="ex: INSTI, ENEAM" value={form.acronym} onChange={e => setForm({...form, acronym: e.target.value.toUpperCase()})} />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Pays *</label>
                <select required className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.country_id} onChange={e => setForm({...form, country_id: parseInt(e.target.value)})}>
                    <option value="" className="text-gray-400">Sélectionner...</option>
                    {countries?.map(c => <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>)}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Site Web officiel (Optionnel)</label>
                <input type="url" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
            </div>

            <button disabled={isPending || !form.name || form.country_id === null} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 mt-4 transition-colors">
                {isPending ? 'Envoi...' : 'Soumettre la suggestion'}
            </button>
        </form>
      )}
    </ModalWrapper>
  );
}

export function SuggestFieldModal({ isOpen, onClose, universityId, universityName }) {
    const [form, setForm] = useState({ label: '', domain_id: null });
    const { data: domains } = useDomains();
    const [successMsg, setSuccessMsg] = useState('');
  
    const { mutate, isPending, error } = useMutation({
      mutationFn: (data) => apiClient('/fields-of-study/suggest', {
          method: 'POST',
          body: JSON.stringify({...data, university_id: universityId}),
      }),
      onSuccess: () => {
        setSuccessMsg("Votre suggestion a été envoyée ! Elle sera validée par l'équipe.");
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
          setForm({ label: '', domain_id: null });
        }, 3000);
      }
    });
  
    if (!isOpen) return null;
  
    const handleSubmit = (e) => {
      e.preventDefault();
      mutate(form);
    };
  
    return (
      <ModalWrapper title="Suggérer une Filière" onClose={onClose}>
        {successMsg ? (
          <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
              <p className="font-bold text-gray-900">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error.message || 'Une erreur est survenue'}</p>}
              
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm mb-4">
                  Pour l'école/institut : <strong>{universityName}</strong>
              </div>
  
              <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Nom de la filière *</label>
                  <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ex: Génie Logiciel" value={form.label} onChange={e => setForm({...form, label: e.target.value})} />
              </div>
  
              <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Domaine de rattachement *</label>
                  <select required className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.domain_id} onChange={e => setForm({...form, domain_id: parseInt(e.target.value)})}>
                      <option value="" className="text-gray-400">Sélectionner un domaine large...</option>
                      {domains?.map(d => <option key={d.id} value={d.id} className="text-gray-900">{d.label}</option>)}
                  </select>
              </div>
  
              <button disabled={isPending || !form.label || form.domain_id === null} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 mt-4 transition-colors">
                  {isPending ? 'Envoi...' : 'Soumettre la suggestion'}
              </button>
          </form>
        )}
      </ModalWrapper>
    );
  }
