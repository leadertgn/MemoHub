import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { applicationsApi } from "../api/applications";
import { Search, Upload, FileText, Building2, Scale, Users, Shield, Heart, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useCountries, useUniversities } from "../hooks/useFilters";
import { Button } from "../components/ui/Button";
import SEO from '../components/layout/SEO';

// Hook personnalisé : compteur animé qui s'incrémente au scroll (IntersectionObserver)
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  const startAnimation = useCallback(() => {
    if (started || typeof target !== "number") return;
    setStarted(true);
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
  }, [target, duration, started]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startAnimation(); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startAnimation]);

  return { count, ref };
}

// Composant card de statistique avec animation CountUp et sous-texte dynamique
function StatCard({ label, rawValue, icon: Icon, color, bg, gradient, subtitle }) {
  const numericValue = typeof rawValue === "number" ? rawValue : null;
  const { count, ref } = useCountUp(numericValue);
  const displayValue = numericValue !== null ? count.toLocaleString() : "...";

  return (
    <div
      ref={ref}
      className="group relative bg-white/70 backdrop-blur-xl rounded-2xl p-5 sm:p-7 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-white hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300"
    >
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="text-4xl font-black text-gray-900 mb-1 tabular-nums">
          {displayValue}
        </div>
        <div className="text-sm font-bold text-gray-900 leading-snug">{label}</div>
        {subtitle && (
          <div className="mt-3 text-xs text-gray-500 font-semibold italic">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiClient("/public/stats"),
    retry: false,
  });

  // State pour le formulaire de candidature
  const [applicationType, setApplicationType] = useState("ambassador");
  const [applicationCountry, setApplicationCountry] = useState("");
  const [applicationUniversity, setApplicationUniversity] = useState("");
  const [applicationStudentProof, setApplicationStudentProof] = useState("");
  const [applicationMotivation, setApplicationMotivation] = useState("");
  const [applicationAvailability, setApplicationAvailability] = useState("");

  // Hooks pour les selects
  const { data: countries } = useCountries();
  const { data: universities } = useUniversities(applicationCountry);

  // Reset university quand le pays change
  useEffect(() => {
    setApplicationUniversity("");
  }, [applicationCountry]);

  const submitApplication = useMutation({
    mutationFn: (data) => applicationsApi.submitTeamApplication(data),
    onSuccess: () => {
      toast.success("Votre candidature a été soumise avec succès ! Nous vous contacterons sous 48-72h.");
      // Reset du formulaire
      setApplicationStudentProof("");
      setApplicationMotivation("");
      setApplicationAvailability("");
      setApplicationCountry("");
      setApplicationUniversity("");
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la soumission. Veuillez réessayer.");
    },
  });

  const handleAmbassadorSubmit = (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!applicationCountry) {
      toast.error("Veuillez sélectionner votre pays.");
      return;
    }
    if (!applicationStudentProof.trim()) {
      toast.error("Veuillez fournir votre numéro étudiant ou email universitaire.");
      return;
    }
    if (!applicationMotivation.trim()) {
      toast.error("Veuillez décrire vos motivations.");
      return;
    }

    // Pour ambassadeur, université obligatoire
    if (applicationType === "ambassador" && !applicationUniversity) {
      toast.error("Veuillez sélectionner votre université.");
      return;
    }

    submitApplication.mutate({
      role: applicationType,
      country_id: parseInt(applicationCountry),
      university_id: applicationType === "ambassador" ? parseInt(applicationUniversity) : null,
      student_proof: applicationStudentProof.trim(),
      motivation: applicationMotivation,
      availability: applicationAvailability,
    });
  };

  // Déterminer si le champ université doit être affiché
  const showUniversityField = applicationType === 'ambassador';

  return (
    <div className="space-y-32 pb-20 relative">
      {/* Avant-Garde Grid background */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      {/* Hero Section: Asymmetric & Bold */}
      <section className="pt-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 space-y-10">
          <div className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-[var(--color-cinnabar)] mb-4">
            <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
            01 / Archive Universelle
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-editorial leading-[0.85] text-[var(--color-obsidian)]">
            L'Héritage <br /> 
            <span className="italic pl-12 md:pl-24 text-[var(--color-cinnabar)]">Académique</span> <br />
            Sans Limites.
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-obsidian)]/90 max-w-xl font-light leading-relaxed">
            Une bibliothèque souveraine. Des milliers de mémoires certifiés, 
            exposés pour l'inspiration et la préservation du savoir.
          </p>
          <div className="flex flex-wrap gap-6 pt-6">
            <Button 
              variant="primary" 
              size="xl" 
              to="/search"
              className="rounded-none px-12 group"
            >
              Exploration
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              to="/upload"
              className="rounded-none px-12"
            >
              Dépôt d'œuvre
            </Button>
          </div>
        </div>
        
        {/* Floating Abstract Element */}
        <div className="hidden lg:block lg:col-span-4 relative h-[400px]">
          <div className="absolute inset-0 glass-advanced border-[var(--color-obsidian)]/10 rotate-3 translate-x-4 translate-y-4" />
          <div className="absolute inset-0 border border-[var(--color-obsidian)] p-8 flex flex-col justify-between bg-[var(--color-base)]">
            <FileText className="w-12 h-12 text-[var(--color-obsidian)]" />
            <div className="space-y-4">
              <div className="h-px bg-[var(--color-obsidian)]/20 w-full" />
              <p className="font-mono text-xs text-[var(--color-obsidian)]/40 leading-relaxed uppercase">
                Certifié par institutions souveraines. <br />
                Accès libre & permanent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section: Minimalist Ledger */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="border-t border-b border-[var(--color-obsidian)] py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
          {[
            { label: "Travaux Certifiés", val: stats?.memoirs?.total, icon: FileText },
            { label: "Sous Revue", val: stats?.memoirs?.pending, icon: Scale },
            { label: "Institutions", val: stats?.universities?.total, icon: Building2 },
            { label: "Chercheurs", val: stats?.users?.total, icon: Users }
          ].map((s, idx) => (
            <div key={idx} className={`lg:px-8 space-y-6 ${idx !== 3 ? 'lg:border-r lg:border-[var(--color-obsidian)]/10' : ''}`}>
              <div className="flex items-center justify-between">
                <s.icon className="w-5 h-5 opacity-50" />
                <span className="font-mono text-[11px] text-[var(--color-cinnabar)] font-bold">0{idx + 1}</span>
              </div>
              <div>
                <div className="text-5xl font-mono tracking-tighter leading-none mb-2">
                   <CountUp end={s.val} />
                </div>
                <div className="font-serif text-lg italic text-[var(--color-obsidian)]">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche: Editorial Flow */}
      <section className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
        <div className="md:col-span-4 sticky top-32 h-fit space-y-6">
          <h2 className="text-5xl font-serif leading-none text-[var(--color-obsidian)]">
            La Sagesse <br /> <span className="italic opacity-30">Organisée.</span>
          </h2>
          <p className="text-lg opacity-60 font-light">
            Un protocole rigoureux pour transformer le manuscrit en héritage numérique accessible à tous.
          </p>
        </div>

        <div className="md:col-span-8 space-y-24">
          {[
            {
              step: "01",
              title: "Exploration de l'Archive",
              desc: "Parcourez des milliers de sujets avec des filtres ultra-précis par institution, géographie et discipline.",
            },
            {
              step: "02",
              title: "Lecture Instantanée",
              desc: "Accédez à l'intégralité du savoir directement via notre liseuse sécurisée haute performance.",
            },
            {
              step: "03",
              title: "Préservation du Patrimoine",
              desc: "Protégez vos travaux sous un filigrane numérique inviolable et transmettez votre recherche aux générations futures.",
            },
          ].map((item, i) => (
            <div key={i} className="group grid grid-cols-1 md:grid-cols-6 gap-8 items-start">
              <div className="font-mono text-4xl text-[var(--color-stone)] group-hover:text-[var(--color-cinnabar)] transition-colors duration-500">
                {item.step}
              </div>
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-2xl font-bold uppercase tracking-tight">{item.title}</h3>
                <p className="text-xl opacity-60 font-light leading-relaxed">{item.desc}</p>
                <div className="h-px bg-[var(--color-obsidian)]/10 w-0 group-hover:w-full transition-all duration-1000" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join the Team: High Contrast Action */}
      <section className="px-6 max-w-7xl mx-auto pb-32">
        <div className="bg-[var(--color-obsidian)] rounded-[var(--radius-premium)] p-8 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-[var(--color-cinnabar)]/20 to-transparent opacity-50" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-cinnabar)] font-bold">
                Recrutement / Archive {new Date().getFullYear()}
              </div>
              <h2 className="text-5xl md:text-6xl font-serif italic leading-none">
                Rejoignez le <br /> Cercle MemoHub
              </h2>
              <p className="text-xl text-white/90 font-light leading-relaxed">
                Devenez ambassadeur ou modérateur et participez activement à l'excellence académique de votre institution.
              </p>
              <div className="flex items-center gap-12 pt-4">
                <div className="space-y-2">
                  <div className="text-3xl font-mono">01.</div>
                  <div className="text-sm uppercase tracking-widest opacity-50">Ambassadeur</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-mono">02.</div>
                  <div className="text-sm uppercase tracking-widest opacity-50">Modérateur</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-base)] rounded-[var(--radius-soft)] p-8 md:p-12 text-[var(--color-obsidian)]">
              <h3 className="text-2xl font-serif mb-8">Postuler à l'Archive</h3>
              <form onSubmit={handleAmbassadorSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setApplicationType('ambassador')}
                    className={`py-4 border-b-2 font-mono text-xs uppercase tracking-widest transition-all ${
                      applicationType === 'ambassador'
                        ? 'border-[var(--color-cinnabar)] text-[var(--color-cinnabar)]'
                        : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    Ambassadeur
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplicationType('moderator')}
                    className={`py-4 border-b-2 font-mono text-xs uppercase tracking-widest transition-all ${
                      applicationType === 'moderator'
                        ? 'border-[var(--color-cinnabar)] text-[var(--color-cinnabar)]'
                        : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    Modérateur
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="font-mono text-[10px] uppercase opacity-40 mb-2 block">Territoire d'action</label>
                    <select
                      value={applicationCountry}
                      onChange={(e) => setApplicationCountry(e.target.value)}
                      className="w-full bg-transparent border-b border-[var(--color-obsidian)] py-3 focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors text-lg"
                      required
                    >
                      <option value="">Sélectionner Pays...</option>
                      {countries?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {showUniversityField && (
                    <div className="relative">
                      <label className="font-mono text-[10px] uppercase opacity-40 mb-2 block">Institution d'origine</label>
                      <select
                        value={applicationUniversity}
                        onChange={(e) => setApplicationUniversity(e.target.value)}
                        className="w-full bg-transparent border-b border-[var(--color-obsidian)] py-3 focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors text-lg"
                        required={showUniversityField}
                        disabled={!applicationCountry}
                      >
                        <option value="">Institution...</option>
                        {universities?.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="relative">
                    <label className="font-mono text-[10px] uppercase opacity-40 mb-2 block">Preuve d'Appartenance</label>
                    <input
                      type="text"
                      value={applicationStudentProof}
                      onChange={(e) => setApplicationStudentProof(e.target.value)}
                      placeholder="ID étudiant ou Email .edu"
                      className="w-full bg-transparent border-b border-[var(--color-obsidian)] py-3 focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors text-lg"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="font-mono text-[10px] uppercase opacity-40 mb-2 block">Ma Motivation</label>
                    <textarea
                      value={applicationMotivation}
                      onChange={(e) => setApplicationMotivation(e.target.value)}
                      placeholder="Pourquoi souhaitez-vous nous rejoindre ?"
                      className="w-full bg-transparent border-b border-[var(--color-obsidian)] py-3 focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors text-lg resize-none"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="font-mono text-[10px] uppercase opacity-40 mb-2 block">Disponibilité Hebdomadaire</label>
                    <select
                      value={applicationAvailability}
                      onChange={(e) => setApplicationAvailability(e.target.value)}
                      className="w-full bg-transparent border-b border-[var(--color-obsidian)] py-3 focus:outline-none focus:border-[var(--color-cinnabar)] transition-colors text-lg"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="2-4">2 à 4 heures</option>
                      <option value="5-8">5 à 8 heures</option>
                      <option value="10+">10 heures et plus</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  loading={submitApplication.isPending}
                  className="w-full rounded-none mt-8"
                >
                  Envoyer ma candidature
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * (end || 0)));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}
