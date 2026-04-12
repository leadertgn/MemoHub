import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { memoirsApi } from '../api/memoirs'
import { useCountries, useUniversities, useFieldsOfStudy } from '../hooks/useFilters'
import { SuggestUniversityModal, SuggestFieldModal } from '../components/upload/SuggestionModals'
import { Lock, CheckCircle, PartyPopper, FileText as FileIcon, ArrowRight, ListTodo } from 'lucide-react';

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
    author_email:      '',
    author_phone:      '',
    year:              new Date().getFullYear(),
    degree:            '',
    language:          'fr',
    country_id:        '',
    university_id:     '',
    field_of_study_id: '',
    accepted_terms:    false,
    allow_download:    true,
  })
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const [isUniModalOpen, setIsUniModalOpen] = useState(false)
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)

  // Données pour les selects
  const { data: countries } = useCountries()
  const { data: universities } = useUniversities(form.country_id)
  const { data: fields } = useFieldsOfStudy(form.university_id)

  // Mutation React Query pour l'upload
  const { mutate: submitMemoir, isPending, isError, error } = useMutation({
    mutationFn: (formData) => memoirsApi.submit(formData),
    onSuccess: () => {
      setSubmitted(true)
      // Scroll en haut pour voir l'écran de succès
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim())       newErrors.title = 'Le titre est obligatoire'
    if (!form.abstract.trim())    newErrors.abstract = 'Le résumé est obligatoire'
    if (!form.author_name.trim()) newErrors.author_name = "Le nom de l'auteur est obligatoire"
    if (!form.author_email.trim()) newErrors.author_email = "L'email de contact est obligatoire"
    if (!form.author_phone.trim()) {
      newErrors.author_phone = "Le numéro de téléphone est obligatoire"
    } else {
      // Validation format téléphone international : +, chiffres, espaces, tirets, parenthèses — 8 à 15 chiffres
      const phoneDigits = form.author_phone.replace(/\D/g, '')
      if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        newErrors.author_phone = "Numéro invalide (8 à 15 chiffres requis, ex\u00a0: +229 90 00 00 00)"
      }
    }
    if (!form.degree)             newErrors.degree = 'Le niveau est obligatoire'
    if (!form.country_id)         newErrors.country_id = 'Le pays est obligatoire'
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
    // Conversion explicite en String pour chaque champ (FormData n'accepte que string/Blob)
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    })
    formData.append('file', file)

    submitMemoir(formData)
  }

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Efface l'erreur du champ modifié
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
    // Reset university et field of study si country change
    if (key === 'country_id') {
      setForm(prev => ({ ...prev, country_id: value, university_id: '', field_of_study_id: '' }))
    }
    // Reset filière si université change
    if (key === 'university_id') {
      setForm(prev => ({ ...prev, university_id: value, field_of_study_id: '' }))
    }
  }

  // Écran de succès — affiché après soumission réussie
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 space-y-6 text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
          <PartyPopper className="w-12 h-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Merci pour votre contribution&nbsp;!</h1>
          <p className="text-gray-500 max-w-md text-base">
            Votre mémoire a bien été soumis. Notre équipe de modération va l'examiner sous peu.
            Vous serez notifié par email une fois la décision prise.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5 max-w-sm text-sm text-blue-800 space-y-3">
          <p className="font-bold flex items-center gap-2">
            <ListTodo className="w-5 h-5" />
            Et maintenant ?
          </p>
          <ul className="text-left space-y-1 list-disc pl-4">
            <li>Suivez l'état dans votre <strong>profil</strong></li>
            <li>Un email vous sera envoyé lors de la validation</li>
            <li>Le mémoire sera visible publiquement après approbation</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/profile"
            className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Voir mes soumissions
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold text-sm hover:border-blue-200 hover:text-blue-700 transition-all"
          >
            <FileIcon className="w-4 h-4" />
            Explorer les mémoires
          </Link>
        </div>
      </div>
    )
  }

  // Redirection si non connecté
  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-gray-600 font-medium text-lg">Veuillez vous connecter pour publier un manuscrit.</p>
        <a 
          href="/login"
          className="inline-block bg-linear-to-r from-blue-600 to-indigo-600 shadow-md text-white px-8 py-3 rounded-full text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Se connecter
        </a>
      </div>
    )
  }

  return (
    <div className="relative pb-24">
      {/* Decors BG */}
      <div className="absolute top-0 left-0 w-full h-100 bg-linear-to-br from-blue-50/80 via-indigo-50/50 to-white -z-10" />

      <div className="max-w-3xl mx-auto space-y-8 pt-6 px-4">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Publier un document</h1>
          <p className="text-sm text-gray-500 font-medium">
            Votre document sera vérifié par notre comité avant sa publication officielle.
          </p>
        </div>

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg p-4 shadow-sm">
            {error?.message || 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.'}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] p-5 sm:p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Nom complet de l'auteur *"
            error={errors.author_name}
            hint="La personne ayant rédigé le mémoire"
          >
            <input
              type="text"
              placeholder="ex: Jean AGOSSOU"
              value={form.author_name}
              onChange={e => handleChange('author_name', e.target.value)}
              className={inputClass(errors.author_name)}
            />
          </Field>
          <Field
            label="Téléphone de l'auteur (ou le vôtre) *"
            error={errors.author_phone}
            hint="Pour vérification par l'équipe (strictement privé)"
          >
            <input
              type="tel"
              placeholder="ex: +229 00 00 00 00"
              value={form.author_phone}
              onChange={e => handleChange('author_phone', e.target.value)}
              className={inputClass(errors.author_phone)}
            />
          </Field>
        </div>

        <Field
          label="Email de l'auteur *"
          error={errors.author_email}
          hint="Nous pourrons envoyer un mail de confirmation d'abord."
        >
          <input
            type="email"
            placeholder="ex: jean.agossou@email.com"
            value={form.author_email}
            onChange={e => handleChange('author_email', e.target.value)}
            className={inputClass(errors.author_email)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Pays */}
        <div className="space-y-1">
          <Field label="Pays *" error={errors.country_id}>
            <select
              value={form.country_id}
              onChange={e => handleChange('country_id', e.target.value)}
              className={inputClass(errors.country_id)}
            >
              <option value="">Sélectionner un pays...</option>
              {countries?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Université / Institut */}
        {form.country_id && (
        <div className="space-y-1">
          <Field label="École ou Institut *" error={errors.university_id} hint="Ajoutez directement votre école (ex: INSTI, ENEAM) plutôt que l'université parente (ex: UNSTIM, UAC).">
            <select
              value={form.university_id}
              onChange={e => handleChange('university_id', e.target.value)}
              className={inputClass(errors.university_id)}
            >
              <option value="">Sélectionner une école/institut...</option>
              {universities?.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>
          <button type="button" onClick={() => setIsUniModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors pl-1">
            + Mon école/institut n'y figure pas
          </button>
        </div>
        )}

        {/* Filière */}
        {form.university_id && (
          <div className="space-y-1">
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
            <button type="button" onClick={() => setIsFieldModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors pl-1">
              + Ma filière n'y figure pas
            </button>
          </div>
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
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
            Autoriser le téléchargement direct de ce mémoire
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
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Chiffrement et envoi en cours...
              </span>
            ) : (
              'Soumettre le document pour validation'
            )}
          </button>
        </div>

      </form>
        </div>

        {/* Modales de crowdsourcing */}
        <SuggestUniversityModal isOpen={isUniModalOpen} onClose={() => setIsUniModalOpen(false)} />
        <SuggestFieldModal 
            isOpen={isFieldModalOpen} 
            onClose={() => setIsFieldModalOpen(false)} 
            universityId={parseInt(form.university_id)} 
            universityName={universities?.find(u => u.id === parseInt(form.university_id))?.name} 
        />
      </div>
    </div>
  )
}

// Composants utilitaires locaux
function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-gray-800">{label}</label>
      {hint && <p className="text-xs font-medium text-gray-400">{hint}</p>}
      {children}
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full text-sm border bg-gray-50/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
    error ? 'border-red-300 bg-red-50/50 focus:ring-red-500' : 'border-gray-200'
  }`
}