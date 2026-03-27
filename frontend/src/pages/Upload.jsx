import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { memoirsApi } from '../api/memoirs'
import {useUniversities, useFieldsOfStudy } from '../hooks/useFilters'

const DEGREES = [
  { value: 'licence',   label: 'Licence (Bac+3)' },
  { value: 'master',    label: 'Master (Bac+5)' },
  { value: 'doctorat',  label: 'Doctorat (Bac+8)' },
  { value: 'ingenieur', label: 'Diplôme Ingénieur' },
  { value: 'bts',       label: 'BTS' },
  { value: 'dut',       label: 'DUT' },
]

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'es', label: 'Espagnol' },
  { value: 'pt', label: 'Portugais' },
]

export default function Upload() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [form, setForm] = useState({
    title:             '',
    abstract:          '',
    author_name:       '',
    year:              new Date().getFullYear(),
    degree:            '',
    language:          'fr',
    university_id:     '',
    field_of_study_id: '',
    accepted_terms:    false,
    allow_download:    true,
  })
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})

  // Données pour les selects
  const { data: universities } = useUniversities()
  const { data: fields } = useFieldsOfStudy(form.university_id)

  // Mutation React Query pour l'upload
  const { mutate: submitMemoir, isPending, isError, error } = useMutation({
    mutationFn: (formData) => memoirsApi.submit(formData),
    onSuccess: () => {
      navigate('/search', {
        state: { message: 'Mémoire soumis avec succès ! Il sera visible après validation.' }
      })
    }
  })

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim())       newErrors.title = 'Le titre est obligatoire'
    if (!form.abstract.trim())    newErrors.abstract = 'Le résumé est obligatoire'
    if (!form.author_name.trim()) newErrors.author_name = "Le nom de l'auteur est obligatoire"
    if (!form.degree)             newErrors.degree = 'Le niveau est obligatoire'
    if (!form.university_id)      newErrors.university_id = "L'université est obligatoire"
    if (!form.field_of_study_id)  newErrors.field_of_study_id = 'La filière est obligatoire'
    if (!file)                    newErrors.file = 'Le fichier PDF est obligatoire'
    if (!form.accepted_terms)     newErrors.accepted_terms = 'Vous devez accepter les conditions'

    if (file && file.type !== 'application/pdf') {
      newErrors.file = 'Le fichier doit être un PDF'
    }
    if (file && file.size > 20 * 1024 * 1024) {
      newErrors.file = 'Le fichier ne doit pas dépasser 20 MB'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    // Construit le FormData pour l'envoi multipart
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value)
    })
    formData.append('file', file)

    submitMemoir(formData)
  }

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Efface l'erreur du champ modifié
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
    // Reset filière si université change
    if (key === 'university_id') {
      setForm(prev => ({ ...prev, university_id: value, field_of_study_id: '' }))
    }
  }

  // Redirige si non connecté
  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-4xl">🔒</p>
        <p className="text-gray-600 font-medium">Connecte-toi pour soumettre un mémoire</p>
        <a 
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Se connecter
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Soumettre un mémoire</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ton mémoire sera visible après validation par notre équipe.
        </p>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error?.message || 'Une erreur est survenue. Réessaie.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Titre */}
        <Field label="Titre du mémoire *" error={errors.title}>
          <input
            type="text"
            placeholder="ex: Conception d'un système de surveillance IoT..."
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            className={inputClass(errors.title)}
          />
        </Field>

        {/* Nom auteur réel */}
        <Field
          label="Nom de l'auteur réel *"
          error={errors.author_name}
          hint="Le nom de la personne qui a rédigé ce mémoire (peut être différent de vous)"
        >
          <input
            type="text"
            placeholder="ex: Jean AGOSSOU"
            value={form.author_name}
            onChange={e => handleChange('author_name', e.target.value)}
            className={inputClass(errors.author_name)}
          />
        </Field>

        {/* Résumé */}
        <Field label="Résumé *" error={errors.abstract}>
          <textarea
            placeholder="Résumé du mémoire en quelques phrases..."
            value={form.abstract}
            onChange={e => handleChange('abstract', e.target.value)}
            rows={4}
            className={inputClass(errors.abstract)}
          />
        </Field>

        {/* Niveau + Année */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Niveau *" error={errors.degree}>
            <select
              value={form.degree}
              onChange={e => handleChange('degree', e.target.value)}
              className={inputClass(errors.degree)}
            >
              <option value="">Choisir...</option>
              {DEGREES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Année de soutenance *">
            <input
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              value={form.year}
              onChange={e => handleChange('year', parseInt(e.target.value))}
              className={inputClass()}
            />
          </Field>
        </div>

        {/* Langue */}
        <Field label="Langue du document">
          <select
            value={form.language}
            onChange={e => handleChange('language', e.target.value)}
            className={inputClass()}
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>

        {/* Université */}
        <Field label="Université *" error={errors.university_id}>
          <select
            value={form.university_id}
            onChange={e => handleChange('university_id', e.target.value)}
            className={inputClass(errors.university_id)}
          >
            <option value="">Sélectionner une université...</option>
            {universities?.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </Field>

        {/* Filière */}
        {form.university_id && (
          <Field label="Filière *" error={errors.field_of_study_id}>
            <select
              value={form.field_of_study_id}
              onChange={e => handleChange('field_of_study_id', e.target.value)}
              className={inputClass(errors.field_of_study_id)}
            >
              <option value="">Sélectionner une filière...</option>
              {fields?.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </Field>
        )}

        {/* Fichier PDF */}
        <Field label="Fichier PDF *" error={errors.file} hint="Maximum 20 MB">
          <input
            type="file"
            accept=".pdf"
            onChange={e => {
              setFile(e.target.files[0])
              if (errors.file) setErrors(prev => ({ ...prev, file: null }))
            }}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {file && (
            <p className="text-xs text-green-600 mt-1">
              ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </Field>

        {/* Autoriser le téléchargement */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="allow_download"
            checked={form.allow_download}
            onChange={e => handleChange('allow_download', e.target.checked)}
            className="mt-0.5"
          />
          <label htmlFor="allow_download" className="text-sm text-gray-600 cursor-pointer">
            Autoriser le téléchargement de ce mémoire (membres premium uniquement)
          </label>
        </div>

        {/* Consentement — obligatoire */}
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${errors.accepted_terms ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
          <input
            type="checkbox"
            id="accepted_terms"
            checked={form.accepted_terms}
            onChange={e => handleChange('accepted_terms', e.target.checked)}
            className="mt-0.5"
          />
          <label htmlFor="accepted_terms" className="text-sm text-gray-700 cursor-pointer">
            Je certifie être l'auteur de ce mémoire ou avoir l'autorisation explicite
            de l'auteur pour le publier. J'accepte les{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </a>{' '}
            de MemoHub concernant la diffusion de contenu académique. *
          </label>
        </div>
        {errors.accepted_terms && (
          <p className="text-xs text-red-500 -mt-3">{errors.accepted_terms}</p>
        )}

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            'Soumettre le mémoire'
          )}
        </button>

      </form>
    </div>
  )
}

// Composants utilitaires locaux
function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
    error ? 'border-red-300 bg-red-50' : 'border-gray-200'
  }`
}