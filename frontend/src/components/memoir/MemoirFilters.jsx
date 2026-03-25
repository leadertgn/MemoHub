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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="font-semibold text-gray-900">Filtres</h2>

      {/* Recherche texte */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Recherche
        </label>
        <input
          type="text"
          placeholder="Titre, auteur..."
          value={filters.search || ''}
          onChange={e => handleChange('search', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Niveau */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Niveau
        </label>
        <select
          value={filters.degree || ''}
          onChange={e => handleChange('degree', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DEGREES.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Domaine */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Domaine
        </label>
        <select
          value={filters.domain_id || ''}
          onChange={e => handleChange('domain_id', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les domaines</option>
          {domains?.map(d => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Pays */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Pays
        </label>
        <select
          value={filters.country_id || ''}
          onChange={e => handleChange('country_id', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les pays</option>
          {countries?.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Université — apparaît seulement si un pays est sélectionné */}
      {filters.country_id && (
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Université
          </label>
          <select
            value={filters.university_id || ''}
            onChange={e => handleChange('university_id', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Filière
          </label>
          <select
            value={filters.field_of_study_id || ''}
            onChange={e => handleChange('field_of_study_id', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les filières</option>
            {fields?.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Année */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Année
        </label>
        <input
          type="number"
          placeholder="ex: 2023"
          min="2000"
          max={new Date().getFullYear()}
          value={filters.year || ''}
          onChange={e => handleChange('year', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Réinitialiser */}
      <button
        onClick={() => onChange({})}
        className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors py-1"
      >
        Réinitialiser les filtres
      </button>
    </div>
  )
}