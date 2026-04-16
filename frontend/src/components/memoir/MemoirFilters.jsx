// src/components/memoir/MemoirFilters.jsx
import { useDomains, useUniversities, useFieldsOfStudy, useCountries } from '../../hooks/useFilters'

const DEGREES = [
  { value: '', label: 'Tous les niveaux' },
  { value: 'licence', label: 'Licence' },
  { value: 'master', label: 'Master' },
  { value: 'doctorat', label: 'Doctorat' },
  { value: 'ingenieur', label: 'Ingénieur' },
  { value: 'bts', label: 'BTS' },
  { value: 'dut', label: 'DUT' },
]

export default function MemoirFilters({ filters, onChange }) {
  const { data: domains } = useDomains()
  const { data: countries } = useCountries()
  const { data: universities } = useUniversities(filters.country_id)
  const { data: fields } = useFieldsOfStudy(filters.university_id)

  const handleChange = (key, value) => {
    // Réinitialise les filtres dépendants en cascade
    if (key === 'country_id') {
      onChange({ ...filters, country_id: value, university_id: '', field_of_study_id: '' })
    } else if (key === 'university_id') {
      onChange({ ...filters, university_id: value, field_of_study_id: '' })
    } else {
      onChange({ ...filters, [key]: value })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h2 className="font-semibold text-gray-900">Filtres</h2>
        <button
          onClick={() => onChange({})}
          className="text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:flex-wrap md:items-end gap-4">
        {/* Recherche texte */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[180px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Recherche</label>
          <input
            type="text"
            placeholder="Titre, auteur..."
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Niveau */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Niveau</label>
          <select
            value={filters.degree || ''}
            onChange={e => handleChange('degree', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          >
            {DEGREES.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Domaine */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[160px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Domaine</label>
          <select
            value={filters.domain_id || ''}
            onChange={e => handleChange('domain_id', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          >
            <option value="">Tous les domaines</option>
            {domains?.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Pays */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[140px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Pays</label>
          <select
            value={filters.country_id || ''}
            onChange={e => handleChange('country_id', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          >
            <option value="">Tous les pays</option>
            {countries?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Université — apparaît seulement si un pays est sélectionné */}
        {filters.country_id && (
          <div className="w-full md:w-auto md:flex-1 md:min-w-[180px]">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Université</label>
            <select
              value={filters.university_id || ''}
              onChange={e => handleChange('university_id', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            >
              <option value="">Toutes les universités</option>
              {universities?.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filière — apparaît seulement si une université est sélectionnée */}
        {filters.university_id && (
          <div className="w-full md:w-auto md:flex-1 md:min-w-[180px]">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Filière</label>
            <select
              value={filters.field_of_study_id || ''}
              onChange={e => handleChange('field_of_study_id', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            >
              <option value="">Toutes les filières</option>
              {fields?.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Année */}
        <div className="w-full md:w-auto md:w-[100px]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Année</label>
          <input
            type="number"
            placeholder="ex: 2023"
            min="2000"
            max={new Date().getFullYear()}
            value={filters.year || ''}
            onChange={e => handleChange('year', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Réinitialiser Desktop */}
        <div className="hidden md:block w-full md:w-auto">
          <button
            onClick={() => onChange({})}
            className="h-[42px] px-4 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-transparent rounded-lg transition-colors flex items-center justify-center whitespace-nowrap"
            title="Réinitialiser tous les filtres"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  )
}