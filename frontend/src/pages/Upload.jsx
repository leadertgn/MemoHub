import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { memoirsApi } from '../api/memoirs'
import { toast } from 'sonner'
import { useCountries, useUniversities, useFieldsOfStudy } from '../hooks/useFilters'
import { SuggestUniversityModal, SuggestFieldModal } from '../components/upload/SuggestionModals'
import { 
  Lock, 
  CheckCircle, 
  PartyPopper, 
  FileText as FileIcon, 
  ArrowRight, 
  ArrowLeft,
  ListTodo, 
  User as UserIcon, 
  GraduationCap, 
  CloudUpload,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/Button'
import { DEGREE_LABELS, LANGUAGES } from '../utils/constants'

const DEGREES = Object.entries(DEGREE_LABELS).map(([value, label]) => ({ value, label }))

const LANGUAGES_LIST = Object.entries(LANGUAGES).map(([value, label]) => ({ value, label }))

export default function Upload() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title:             '',
    abstract:          '',
    author_name:       user?.full_name || '',
    author_email:      user?.email || '',
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  const validateStep = (currentStep) => {
    const newErrors = {}
    
    if (currentStep === 1) {
      if (!form.author_name.trim()) newErrors.author_name = "Le nom de l'auteur est obligatoire"
      if (!form.author_email.trim()) {
        newErrors.author_email = "L'email est obligatoire"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.author_email)) {
        newErrors.author_email = "Format d'email invalide"
      }

      if (!form.author_phone.trim()) {
        newErrors.author_phone = "Le téléphone est obligatoire"
      } else if (!/^\+?[0-9\s-]{8,20}$/.test(form.author_phone)) {
        newErrors.author_phone = "Format invalide (ex: +229 ...)"
      }
      if (!form.country_id) newErrors.country_id = 'Le pays est obligatoire'
      if (!form.university_id) newErrors.university_id = "L'établissement est obligatoire"
      if (!form.field_of_study_id) newErrors.field_of_study_id = 'La filière est obligatoire'
    }

    if (currentStep === 2) {
      if (!form.title.trim()) newErrors.title = 'Le titre est obligatoire'
      if (!form.abstract.trim()) newErrors.abstract = 'Le résumé est obligatoire'
      if (!form.degree) newErrors.degree = 'Le niveau est obligatoire'
      if (!form.year) newErrors.year = "L'année est obligatoire"
    }

    if (currentStep === 3) {
      if (!file) newErrors.file = 'Le fichier PDF est obligatoire'
      if (file && file.type !== 'application/pdf') newErrors.file = 'Format PDF requis'
      if (file && file.size > 20 * 1024 * 1024) newErrors.file = 'Maximum 20 MB'
      if (!form.accepted_terms) newErrors.accepted_terms = 'Vous devez accepter les conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error("Veuillez corriger les erreurs avant de passer à l'étape suivante")
    }
  }

  const prevStep = () => {
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateStep(3)) {
      toast.error("Veuillez corriger les erreurs avant de soumettre")
      return
    }

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
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
    
    if (key === 'country_id') {
      setForm(prev => ({ ...prev, country_id: value, university_id: '', field_of_study_id: '' }))
    }
    if (key === 'university_id') {
      setForm(prev => ({ ...prev, university_id: value, field_of_study_id: '' }))
    }
  }

  // Écran de succès
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 space-y-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
          <PartyPopper className="w-12 h-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Merci pour votre contribution&nbsp;!</h1>
          <p className="text-gray-500 max-w-md text-base">
            Votre mémoire a bien été soumis. Notre équipe de modération va l'examiner sous peu (généralement 24-48h).
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5 max-w-sm text-sm text-blue-800 space-y-3">
          <p className="font-bold flex items-center gap-2">
            <ListTodo className="w-5 h-5" />
            Et maintenant ?
          </p>
          <ul className="text-left space-y-1 list-disc pl-4 text-xs font-medium">
            <li>Suivez l'état dans votre <strong>profil</strong></li>
            <li>Un email vous sera envoyé lors de la décision</li>
            <li>Le mémoire sera visible publiquement après approbation</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="primary" size="md" onClick={() => navigate('/profile')}>
            Voir mes soumissions
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/search')}>
            <FileIcon className="w-4 h-4" />
            Explorer le catalogue
          </Button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
          <Lock className="w-10 h-10 text-blue-500" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-gray-900 font-bold text-xl">Accès restreint</p>
          <p className="text-gray-500 text-sm max-w-xs">Veuillez vous connecter pour publier un manuscrit académique.</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
          Se connecter maintenant
        </Button>
      </div>
    )
  }

  const steps = [
    { id: 1, label: 'Origine', icon: UserIcon },
    { id: 2, label: 'Détails', icon: GraduationCap },
    { id: 3, label: 'Fichier', icon: CloudUpload },
  ]

  return (
    <div className="relative pb-24">
      <div className="absolute top-0 left-0 w-full h-100 bg-linear-to-br from-blue-50/80 via-indigo-50/50 to-white -z-10" />

      <div className="max-w-3xl mx-auto space-y-8 pt-6 px-4">
        
        {/* Stepper Header */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Publier un document</h1>
            <p className="text-sm text-gray-500 font-medium">Partagez votre savoir avec la communauté académique.</p>
          </div>

          <div className="flex items-center justify-center max-w-md mx-auto relative px-4">
             {/* Progress Line */}
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 -z-0">
               <div 
                 className="h-full bg-blue-600 transition-all duration-500" 
                 style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
               />
            </div>

            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center relative z-10">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' 
                        : isCompleted 
                          ? 'bg-white border-blue-600 text-blue-600' 
                          : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg p-4 shadow-sm animate-in slide-in-from-top-2">
            {error?.message || 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.'}
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: IDENTITÉ ET ACADÉMIQUE */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    Identité & Établissement
                  </h2>
                  <p className="text-xs text-gray-500">Veuillez renseigner les informations sur l'auteur et l'institution.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Nom complet de l'auteur *" error={errors.author_name} hint="Ex: Jean AGOSSOU">
                    <input
                      type="text"
                      value={form.author_name}
                      onChange={e => handleChange('author_name', e.target.value)}
                      className={inputClass(errors.author_name)}
                      placeholder="Jean AGOSSOU"
                    />
                  </Field>
                  <Field label="Téléphone de l'auteur *" error={errors.author_phone} hint="Strictement confidentiel">
                    <input
                      type="tel"
                      value={form.author_phone}
                      onChange={e => handleChange('author_phone', e.target.value)}
                      className={inputClass(errors.author_phone)}
                      placeholder="+229 00 00 00 00"
                    />
                  </Field>
                </div>

                <Field label="Email de l'auteur *" error={errors.author_email}>
                  <input
                    type="email"
                    value={form.author_email}
                    onChange={e => handleChange('author_email', e.target.value)}
                    className={inputClass(errors.author_email)}
                    placeholder="jean.agossou@email.com"
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <Field label="Pays *" error={errors.country_id}>
                    <select
                      value={form.country_id}
                      onChange={e => handleChange('country_id', e.target.value)}
                      className={inputClass(errors.country_id)}
                    >
                      <option value="">Sélectionner...</option>
                      {countries?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>

                  {form.country_id && (
                    <div className="space-y-1">
                      <Field label="École ou Institut *" error={errors.university_id}>
                        <select
                          value={form.university_id}
                          onChange={e => handleChange('university_id', e.target.value)}
                          className={inputClass(errors.university_id)}
                        >
                          <option value="">Sélectionner...</option>
                          {universities?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          {form.country_id && universities?.length === 0 && (
                            <option disabled>Aucun établissement répertorié</option>
                          )}
                        </select>
                      </Field>
                      <button type="button" onClick={() => setIsUniModalOpen(true)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tighter">
                        + Mon école n'y figure pas
                      </button>
                    </div>
                  )}
                </div>

                {form.university_id && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                    <Field label="Filière *" error={errors.field_of_study_id}>
                      <select
                        value={form.field_of_study_id}
                        onChange={e => handleChange('field_of_study_id', e.target.value)}
                        className={inputClass(errors.field_of_study_id)}
                      >
                        <option value="">Sélectionner une filière...</option>
                        {fields?.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                        {form.university_id && fields?.length === 0 && (
                          <option disabled>Aucune filière répertoriée</option>
                        )}
                      </select>
                    </Field>
                    <button type="button" onClick={() => setIsFieldModalOpen(true)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tighter">
                      + Ma filière n'y figure pas
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: DÉTAILS DU DOCUMENT */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Détails Académiques
                  </h2>
                  <p className="text-xs text-gray-500">Informations sur le contenu et le niveau du document.</p>
                </div>

                <Field label="Titre du mémoire *" error={errors.title}>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className={inputClass(errors.title)}
                    placeholder="Conception d'un système..."
                  />
                </Field>

                <Field label="Résumé (Abstract) *" error={errors.abstract}>
                  <textarea
                    value={form.abstract}
                    onChange={e => handleChange('abstract', e.target.value)}
                    rows={5}
                    className={inputClass(errors.abstract)}
                    placeholder="Décrivez brièvement le contenu de vos recherches..."
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Niveau *" error={errors.degree}>
                    <select
                      value={form.degree}
                      onChange={e => handleChange('degree', e.target.value)}
                      className={inputClass(errors.degree)}
                    >
                      <option value="">Choisir...</option>
                      {DEGREES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
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

                <Field label="Langue de rédaction">
                  <select
                    value={form.language}
                    onChange={e => handleChange('language', e.target.value)}
                    className={inputClass()}
                  >
                    {LANGUAGES_LIST.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {/* STEP 3: FICHIER & VALIDATION */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CloudUpload className="w-5 h-5 text-blue-600" />
                    Envoi du Document
                  </h2>
                  <p className="text-xs text-gray-500">Dernière étape : téléversement et conditions.</p>
                </div>

                {/* Upload Zone */}
                <div className={`relative group border-2 border-dashed rounded-3xl p-10 transition-all text-center ${
                  file ? 'border-green-200 bg-green-50/30' : errors.file ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20'
                }`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => {
                      setFile(e.target.files[0])
                      if (errors.file) setErrors(prev => ({ ...prev, file: null }))
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-colors ${
                      file ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'
                    }`}>
                      {file ? <CheckCircle className="w-8 h-8" /> : <FileIcon className="w-8 h-8" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {file ? file.name : "Cliquez ou glissez votre PDF"}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Format PDF uniquement, max 20 MB"}
                      </p>
                    </div>
                  </div>
                </div>
                {errors.file && <p className="text-xs text-red-500 text-center font-bold">{errors.file}</p>}

                {/* Options & Consent */}
                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-5 bg-gray-50/80 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.allow_download}
                      onChange={e => handleChange('allow_download', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Autoriser le téléchargement</p>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Les utilisateurs pourront télécharger une version PDF avec filigrane de votre travail.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                    errors.accepted_terms ? 'bg-red-50 border-red-200' : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={form.accepted_terms}
                      onChange={e => handleChange('accepted_terms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="text-xs font-medium text-gray-700 leading-relaxed">
                      Je certifie être l'auteur ou avoir l'autorisation de publier ce document. 
                      J'accepte les <a href="/terms" className="text-blue-600 font-bold hover:underline">conditions d'utilisation</a> de MemoHub. *
                    </div>
                  </label>
                  {errors.accepted_terms && <p className="text-[10px] text-red-500 font-bold pl-1">{errors.accepted_terms}</p>}
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                    <strong>Vérification :</strong> Votre document passera par une étape de modération humaine pour vérifier son authenticité avant d'être indexé.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              {step > 1 && (
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={prevStep} 
                  className="sm:w-1/3"
                  disabled={isPending}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </Button>
              )}
              
              {step < 3 ? (
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={nextStep} 
                  className="flex-1"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="flex-1"
                  loading={isPending}
                >
                  {isPending ? 'Envoi en cours...' : 'Soumettre le mémoire'}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Crowdsourcing Modals */}
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

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[10px] font-medium text-gray-400">{hint}</p>}
      {children}
      {error && <p className="text-[10px] font-bold text-red-500 animate-in fade-in">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full text-sm border bg-gray-50/30 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 ${
    error ? 'border-red-300 bg-red-50/30 focus:ring-red-500' : 'border-gray-100'
  }`
}