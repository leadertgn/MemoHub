// src/components/memoir/MemoirFilters.jsx
import { useDomains, useUniversities, useFieldsOfStudy, useCountries } from '../../hooks/useFilters'
import { DEGREE_LABELS } from '../../utils/constants'
import { X } from 'lucide-react'

const DEGREES = [
  { value: '', label: 'TOUS LES NIVEAUX' },
  ...Object.entries(DEGREE_LABELS).map(([value, label]) => ({ value, label: label.toUpperCase() }))
]

export default function MemoirFilters({ filters, onChange }) {
  const { data: domains } = useDomains()
  const { data: countries } = useCountries()
  const { data: universities } = useUniversities(filters.country_id)
  const { data: fields } = useFieldsOfStudy(filters.university_id)

  const handleChange = (key, value) => {
    if (key === 'country_id') {
      onChange({ ...filters, country_id: value, university_id: '', field_of_study_id: '' })
    } else if (key === 'university_id') {
      onChange({ ...filters, university_id: value, field_of_study_id: '' })
    } else {
      onChange({ ...filters, [key]: value })
    }
  }

  const selectClass = "w-full bg-transparent border-b border-[var(--color-obsidian)]/30 py-2 font-serif italic text-sm focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors appearance-none cursor-pointer text-[var(--color-obsidian)]";
  const labelClass = "font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-obsidian)]/70 font-bold block mb-1";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
      {/* Recherche */}
      <div className="space-y-1">
        <label className={labelClass}>Recherche</label>
        <input
          type="text"
          placeholder="TITRE, AUTEUR..."
          value={filters.search || ''}
          onChange={e => handleChange('search', e.target.value)}
          className="w-full bg-transparent border-b border-[var(--color-obsidian)]/30 py-2 font-mono text-[10px] uppercase tracking-widest focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors placeholder:text-[var(--color-obsidian)]/40 text-[var(--color-obsidian)]"
        />
      </div>

      {/* Niveau */}
      <div className="space-y-1">
        <label className={labelClass}>Niveau</label>
        <div className="relative">
          <select value={filters.degree || ''} onChange={e => handleChange('degree', e.target.value)} className={selectClass}>
            {DEGREES.map(d => <option key={d.value} value={d.value} className="text-black not-italic">{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* Domaine */}
      <div className="space-y-1">
        <label className={labelClass}>Domaine</label>
        <select value={filters.domain_id || ''} onChange={e => handleChange('domain_id', e.target.value)} className={selectClass}>
          <option value="" className="text-black not-italic">TOUS LES DOMAINES</option>
          {domains?.map(d => <option key={d.id} value={d.id} className="text-black not-italic">{d.label.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Pays */}
      <div className="space-y-1">
        <label className={labelClass}>Juridiction</label>
        <select value={filters.country_id || ''} onChange={e => handleChange('country_id', e.target.value)} className={selectClass}>
          <option value="" className="text-black not-italic">TOUS LES PAYS</option>
          {countries?.map(c => <option key={c.id} value={c.id} className="text-black not-italic">{c.name.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Université */}
      <div className={`space-y-1 transition-opacity duration-500 ${filters.country_id ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
        <label className={labelClass}>Institution</label>
        <select 
          value={filters.university_id || ''} 
          onChange={e => handleChange('university_id', e.target.value)} 
          className={selectClass}
          disabled={!filters.country_id}
        >
          <option value="" className="text-black not-italic">TOUTES LES ÉCOLES</option>
          {universities?.map(u => <option key={u.id} value={u.id} className="text-black not-italic">{u.name.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Filière */}
      <div className={`space-y-1 transition-opacity duration-500 ${filters.university_id ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
        <label className={labelClass}>Discipline</label>
        <select 
          value={filters.field_of_study_id || ''} 
          onChange={e => handleChange('field_of_study_id', e.target.value)} 
          className={selectClass}
          disabled={!filters.university_id}
        >
          <option value="" className="text-black not-italic">TOUTES LES FILIÈRES</option>
          {fields?.map(f => <option key={f.id} value={f.id} className="text-black not-italic">{f.label.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Bouton Reset */}
      <div className="flex items-end pb-1">
        <button
          onClick={() => onChange({})}
          className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[var(--color-cinnabar)] hover:opacity-70 transition-opacity"
        >
          <X className="w-3 h-3" /> Réinitialiser l'Index
        </button>
      </div>
    </div>
  )
}