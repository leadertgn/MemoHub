import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
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
  User as UserIcon, 
  GraduationCap, 
  CloudUpload,
  Info
} from 'lucide-react';
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

  const { data: countries } = useCountries()
  const { data: universities } = useUniversities(form.country_id)
  const { data: fields } = useFieldsOfStudy(form.university_id)

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
      if (!form.author_name.trim()) newErrors.author_name = "Requis"
      if (!form.author_email.trim()) newErrors.author_email = "Requis"
      if (!form.author_phone.trim()) newErrors.author_phone = "Requis"
      if (!form.country_id) newErrors.country_id = 'Requis'
      if (!form.university_id) newErrors.university_id = "Requis"
      if (!form.field_of_study_id) newErrors.field_of_study_id = 'Requis'
    }
    if (currentStep === 2) {
      if (!form.title.trim()) newErrors.title = 'Requis'
      if (!form.abstract.trim()) newErrors.abstract = 'Requis'
      if (!form.degree) newErrors.degree = 'Requis'
    }
    if (currentStep === 3) {
      if (!file) newErrors.file = 'Fichier PDF obligatoire'
      if (!form.accepted_terms) newErrors.accepted_terms = 'Acceptation requise'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => validateStep(step) ? setStep(s => s + 1) : toast.error("Veuillez compléter tous les champs obligatoires")
  const prevStep = () => setStep(s => s - 1)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateStep(3)) return
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)))
    formData.append('file', file)
    submitMemoir(formData)
  }

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
    if (key === 'country_id') setForm(prev => ({ ...prev, university_id: '', field_of_study_id: '' }))
    if (key === 'university_id') setForm(prev => ({ ...prev, field_of_study_id: '' }))
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-green-600">
             <span className="w-8 h-px bg-green-600" />
             Transmission Réussie
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-[var(--color-obsidian)]">Merci de votre <br /><span className="italic">contribution.</span></h1>
          <p className="text-xl font-light opacity-60 max-w-md mx-auto italic leading-relaxed">
            Votre manuscrit a été déposé avec succès. Il est désormais en cours d'examen par notre conseil de modération.
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="primary" size="xl" onClick={() => navigate('/profile')} className="rounded-none">Mon Espace</Button>
           <Button variant="outline" size="xl" onClick={() => navigate('/search')} className="rounded-none">Bibliothèque</Button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-8">
        <h2 className="text-4xl font-serif italic text-center opacity-40">Accès Restreint.</h2>
        <p className="text-lg font-light text-center opacity-60 max-w-xs">L'authentification est requise pour soumettre un document à l'archive.</p>
        <Button variant="primary" size="xl" onClick={() => navigate('/login')} className="rounded-none px-12">S'identifier</Button>
      </div>
    )
  }

  const steps = [
    { id: 1, label: 'Origine', icon: UserIcon },
    { id: 2, label: 'Dossier', icon: GraduationCap },
    { id: 3, label: 'Dépôt', icon: CloudUpload },
  ]

  return (
    <div className="relative pb-32">
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-24 px-6 max-w-5xl mx-auto space-y-20">
        {/* Header Submission */}
        <div className="space-y-6 text-center">
           <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[var(--color-cinnabar)]">
              <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
              Soumission Académique / Formulaire
           </div>
           <h1 className="text-5xl md:text-7xl font-serif text-[var(--color-obsidian)] leading-none tracking-tighter">
             Dépôt de <br /> <span className="italic opacity-30">Manuscrit.</span>
           </h1>
        </div>

        {/* Stepper Avant-Garde */}
        <div className="flex justify-between max-w-2xl mx-auto border-b border-[var(--color-obsidian)]/10 pb-12">
          {steps.map((s) => (
            <div key={s.id} className={`flex flex-col items-center gap-4 ${step === s.id ? 'opacity-100' : 'opacity-20'}`}>
              <div className="font-mono text-xs uppercase tracking-widest">.{s.id}</div>
              <div className="font-serif italic text-xl">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-[var(--color-obsidian)]/10 p-8 md:p-16 space-y-12">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-700">
                <Field label="Auteur / Identité" error={errors.author_name}>
                  <input type="text" value={form.author_name} onChange={e => handleChange('author_name', e.target.value)} className={inputClass(errors.author_name)} placeholder="Jean AGOSSOU" />
                </Field>
                <Field label="Ligne Téléphonique" error={errors.author_phone}>
                  <input type="tel" value={form.author_phone} onChange={e => handleChange('author_phone', e.target.value)} className={inputClass(errors.author_phone)} placeholder="+229 ..." />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Courrier Électronique" error={errors.author_email}>
                    <input type="email" value={form.author_email} onChange={e => handleChange('author_email', e.target.value)} className={inputClass(errors.author_email)} />
                  </Field>
                </div>
                <Field label="Juridiction / Pays" error={errors.country_id}>
                  <select value={form.country_id} onChange={e => handleChange('country_id', e.target.value)} className={inputClass(errors.country_id)}>
                    <option value="">Sélectionner...</option>
                    {countries?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                {form.country_id && (
                  <Field label="Institution" error={errors.university_id}>
                    <select value={form.university_id} onChange={e => handleChange('university_id', e.target.value)} className={inputClass(errors.university_id)}>
                      <option value="">Sélectionner...</option>
                      {universities?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setIsUniModalOpen(true)} className="text-[9px] font-mono uppercase opacity-40 hover:opacity-100">+ École manquante</button>
                  </Field>
                )}
                {form.university_id && (
                  <div className="md:col-span-2">
                    <Field label="Filière d'Études" error={errors.field_of_study_id}>
                      <select value={form.field_of_study_id} onChange={e => handleChange('field_of_study_id', e.target.value)} className={inputClass(errors.field_of_study_id)}>
                        <option value="">Sélectionner...</option>
                        {fields?.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                      <button type="button" onClick={() => setIsFieldModalOpen(true)} className="text-[9px] font-mono uppercase opacity-40 hover:opacity-100">+ Filière manquante</button>
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Content */}
            {step === 2 && (
              <div className="space-y-10 animate-in fade-in duration-700">
                <Field label="Titre de l'Œuvre" error={errors.title}>
                  <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} className={inputClass(errors.title)} placeholder="Saisir le titre complet..." />
                </Field>
                <Field label="Exposé / Résumé" error={errors.abstract}>
                  <textarea rows={6} value={form.abstract} onChange={e => handleChange('abstract', e.target.value)} className={inputClass(errors.abstract)} placeholder="Rédiger le résumé académique..." />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <Field label="Degré Académique" error={errors.degree}>
                      <select value={form.degree} onChange={e => handleChange('degree', e.target.value)} className={inputClass(errors.degree)}>
                        <option value="">Choisir...</option>
                        {DEGREES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                   </Field>
                   <Field label="Année de Soutenance">
                      <input type="number" value={form.year} onChange={e => handleChange('year', parseInt(e.target.value))} className={inputClass()} />
                   </Field>
                </div>
              </div>
            )}

            {/* Step 3: Files */}
            {step === 3 && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className={`relative border border-dashed border-[var(--color-obsidian)]/20 p-20 text-center space-y-4 group transition-all hover:border-[var(--color-cinnabar)] ${file ? 'bg-green-50/20 border-green-500/30' : ''}`}>
                  <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="space-y-2">
                    <p className="font-serif italic text-2xl">{file ? file.name : "Déposer le manuscrit PDF"}</p>
                    <p className="font-mono text-[10px] opacity-30 uppercase tracking-widest">{file ? `${(file.size/1024/1024).toFixed(2)} MB` : "Limite 20 MB / Format PDF"}</p>
                  </div>
                </div>

                <div className="space-y-6">
                   <label className="flex items-center gap-4 cursor-pointer group">
                      <input type="checkbox" checked={form.allow_download} onChange={e => handleChange('allow_download', e.target.checked)} className="w-4 h-4 accent-[var(--color-cinnabar)]" />
                      <span className="font-mono text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100">Autoriser le téléchargement direct</span>
                   </label>
                   <label className={`flex items-center gap-4 cursor-pointer group p-6 border ${errors.accepted_terms ? 'border-red-500/50 bg-red-50/20' : 'border-[var(--color-obsidian)]/10'}`}>
                      <input type="checkbox" checked={form.accepted_terms} onChange={e => handleChange('accepted_terms', e.target.checked)} className="w-4 h-4 accent-[var(--color-cinnabar)]" />
                      <span className="text-xs font-light opacity-80">Je certifie l'authenticité de ce document et accepte le <Link to="/terms" className="text-[var(--color-cinnabar)]">Contrat Social</Link>.</span>
                   </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-12 border-t border-[var(--color-obsidian)]/10">
               {step > 1 && <Button variant="outline" size="xl" onClick={prevStep} className="rounded-none">Précédent</Button>}
               {step < 3 ? (
                 <Button variant="primary" size="xl" onClick={nextStep} className="flex-1 rounded-none">Continuer</Button>
               ) : (
                 <Button type="submit" variant="primary" size="xl" className="flex-1 rounded-none" loading={isPending}>Finaliser le Dépôt</Button>
               )}
            </div>
          </form>
        </div>
      </section>

      <SuggestUniversityModal isOpen={isUniModalOpen} onClose={() => setIsUniModalOpen(false)} />
      <SuggestFieldModal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} universityId={parseInt(form.university_id)} universityName={universities?.find(u => u.id === parseInt(form.university_id))?.name} />
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-3">
      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-obsidian)]/60 font-bold">{label}</label>
      {children}
      {error && <p className="text-[9px] font-mono text-[var(--color-cinnabar)] uppercase">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full font-light text-lg bg-transparent border-b ${error ? 'border-[var(--color-cinnabar)]' : 'border-[var(--color-obsidian)]/40'} py-3 focus:outline-none focus:border-[var(--color-obsidian)] transition-all placeholder:text-[var(--color-obsidian)]/40 text-[var(--color-obsidian)]`
}