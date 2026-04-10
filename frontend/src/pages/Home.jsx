import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { applicationsApi } from "../api/applications";
import { Search, Upload, FileText, Building2, Scale, Users, Shield, Heart, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCountries, useUniversities } from "../hooks/useFilters";

export default function Home() {
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

    // Pour ambassadeur, universidad obligatoire
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
  const showUniversityField = applicationType === "ambassador";

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Background Decoratif */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white -z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="text-center pt-24 pb-10 px-4 space-y-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          La bibliothèque universelle <br className="hidden md:block" />
          des mémoires{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            académiques
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Accédez librement à des milliers de thèses, licences et masters
          authentifiés. Développez vos idées et trouvez l'inspiration idéale
          pour vos propres travaux de recherche.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link
            to="/search"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold text-shadow-sm hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            Découvrir les travaux
          </Link>
          <Link
            to="/upload"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-800 px-8 py-4 rounded-full font-bold shadow-sm hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 hover:-translate-y-1 transition-all duration-300"
          >
            <Upload className="w-5 h-5" />
            Contribuer
          </Link>
        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto">
        {[
          {
            label: "Mémoires validés et certifiés",
            value: stats?.memoirs?.total ?? "...",
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Grandes Écoles et Universités",
            value: stats?.universities?.total ?? "...",
            icon: Building2,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
          },
          {
            label: "Documents sous revue",
            value: stats?.memoirs?.pending ?? "...",
            icon: Scale,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-white/60 backdrop-blur-xl rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-white hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 transform"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <stat.icon className="w-7 h-7" />
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-500 leading-snug">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Comment ça marche */}
      <section className="space-y-12 px-4 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Le Savoir à portée de clic
          </h2>
          <p className="text-gray-500">
            Un système pensé pour les institutions, par des étudiants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Ligne de connexion visuelle (desktop) */}
          <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-blue-100 via-indigo-200 to-blue-100 -z-10" />

          {[
            {
              step: "1",
              title: "Explorez la base",
              desc: "Parcourez des milliers de sujets avec des filtres ultra-précis par Université, pays et niveau d'étude.",
            },
            {
              step: "2",
              title: "Lisez instantanément",
              desc: "Consultez l'intégralité du mémoire directement depuis votre navigateur avec une liseuse rapide et sécurisée.",
            },
            {
              step: "3",
              title: "Publiez votre œuvre",
              desc: "Protégez vos rédactions sous un filigrane numérique inviolable et transmettez votre héritage.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/50 hover:shadow-lg transition-shadow duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg mb-6 shadow-md group-hover:rotate-6 transition-transform" aria-hidden="true">
                {item.step}
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Devenir Ambassadeur ou Modérateur */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texte explicatif */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">Ensemble pour l'excellence académique</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Rejoignez l'équipe MemoHub
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Vous êtes un étudiant engagé, voulez contribuer à la qualité du contenu 
                académique et représenter votre établissement ?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                  <Users className="w-6 h-6 text-white/90 shrink-0" />
                  <div>
                    <h3 className="font-bold">Ambassadeur</h3>
                    <p className="text-sm text-white/70">Promouvoir et modérer les mémoires de votre université</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                  <Shield className="w-6 h-6 text-white/90 shrink-0" />
                  <div>
                    <h3 className="font-bold">Modérateur</h3>
                    <p className="text-sm text-white/70">Valider les contenus pour un pays entier</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de candidature */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 text-gray-900">
              <h3 className="text-xl font-bold mb-6">Postuler maintenant</h3>
              <form onSubmit={handleAmbassadorSubmit} className="space-y-4">
                {/* Type de candidature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de candidature
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setApplicationType('ambassador')}
                      className={`p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                        applicationType === 'ambassador'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      Ambassadeur
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplicationType('moderator')}
                      className={`p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                        applicationType === 'moderator'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Shield className="w-5 h-5 mx-auto mb-1" />
                      Modérateur
                    </button>
                  </div>
                </div>

                {/* Pays (obligatoire pour les deux) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pays <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={applicationCountry}
                    onChange={(e) => setApplicationCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Sélectionner un pays...</option>
                    {countries?.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Université (obligatoire pour ambassadeur seulement) */}
                {showUniversityField && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Université <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={applicationUniversity}
                      onChange={(e) => setApplicationUniversity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      required={showUniversityField}
                      disabled={!applicationCountry}
                    >
                      <option value="">Sélectionner une université...</option>
                      {universities?.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    {!applicationCountry && (
                      <p className="text-xs text-gray-400 mt-1">Sélectionnez d'abord un pays</p>
                    )}
                  </div>
                )}

                {/* Preuve étudiant (obligatoire pour les deux) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preuve d'inscription <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicationStudentProof}
                    onChange={(e) => setApplicationStudentProof(e.target.value)}
                    placeholder="Numéro étudiant ou email universitaire (ex: john@univ-benin.bj)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Votre numéro d'étudiant ou adresse email universitaire
                  </p>
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={applicationMotivation}
                    onChange={(e) => setApplicationMotivation(e.target.value)}
                    placeholder="Expliquez pourquoi vous voulez rejoindre MemoHub et ce que vous apporterez..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    rows={3}
                    required
                  />
                </div>

                {/* Disponibilité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Disponibilité (heures/semaine)
                  </label>
                  <select
                    value={applicationAvailability}
                    onChange={(e) => setApplicationAvailability(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="2-4">2 à 4 heures</option>
                    <option value="5-8">5 à 8 heures</option>
                    <option value="10+">10 heures et plus</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitApplication.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitApplication.isPending ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Soumettre ma candidature
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  Votre demande sera examinée par notre équipe. Nous vous contacterons sous 48-72h.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
