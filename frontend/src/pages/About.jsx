import { Link } from "react-router-dom";
import { ArrowLeft, Globe, BookOpen, Users, Shield, ArrowRight, Heart, Lightbulb, Network } from "lucide-react";

const VALUES = [
  {
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Accessible à tous",
    desc: "La recherche et la consultation des fiches sont libres et sans inscription. La lecture intégrale du PDF et le téléchargement nécessitent une connexion via Google — simple et rapide, sans mot de passe dédié.",
  },
  {
    icon: Network,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Relier les universités",
    desc: "Chaque université possède son propre système d'archivage — souvent cloisonné. MemoHub crée un pont commun pour regrouper ces ressources en un seul endroit.",
  },
  {
    icon: Lightbulb,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Inspirer la recherche",
    desc: "Trouver un thème de soutenance est souvent l'étape la plus difficile. Accéder à ce qui a déjà été fait permet de mieux orienter ses propres travaux.",
  },
  {
    icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Contribution volontaire",
    desc: "Rien n'est forcé. Les étudiants choisissent librement de partager leurs mémoires. Chaque contribution est un geste pour la communauté académique.",
  },
];

const ROLES = [
  {
    icon: Users,
    title: "Ambassadeur",
    desc: "Rattaché à une école ou un institut, il valide en premier les mémoires soumis depuis son université. Il est la première ligne de modération.",
    badge: "bg-cyan-50 text-cyan-700",
  },
  {
    icon: Shield,
    title: "Modérateur",
    desc: "Actif à l'échelle d'un pays, il assure la cohérence editoriale de l'ensemble du contenu de sa zone géographique.",
    badge: "bg-indigo-50 text-indigo-700",
  },
  {
    icon: BookOpen,
    title: "Administrateur",
    desc: "Garant de l'intégrité globale de la plateforme. Il supervise les équipes, gère les comptes et s'assure du bon fonctionnement du système.",
    badge: "bg-gray-100 text-gray-700",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-8">

        {/* Retour */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-8 py-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-5">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">À propos de MemoHub</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                La bibliothèque académique commune que chaque étudiant mérite
              </h1>
              <p className="mt-4 text-indigo-100 text-lg leading-relaxed">
                MemoHub est une plateforme ouverte qui centralise les mémoires académiques de toutes les universités. 
                Elle existe pour que s'inspirer du travail de ses pairs soit simple, gratuit et accessible depuis n'importe où.
              </p>
            </div>
          </div>

          {/* Problème résolu */}
          <div className="p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pourquoi MemoHub existe</h2>
            <div className="prose prose-slate max-w-none text-gray-600 space-y-4">
              <p>
                Chaque année, des milliers d'étudiants rédigent des mémoires de qualité. Ces travaux sont soumis, évalués, archivés —
                puis souvent oubliés dans un système interne d'université que personne en dehors de l'établissement ne peut consulter.
              </p>
              <p>
                Un étudiant au Sénégal ne peut pas savoir ce qu'un étudiant au Bénin a déjà exploré sur le même sujet.
                Un chercheur indépendant ne sait pas par où chercher. Un futur diplômé passe des semaines à formuler un thème
                qui existe déjà, traité sous un angle différent, dans une autre université.
              </p>
              <p className="font-medium text-gray-900">
                MemoHub veut résoudre ce problème : relier les mémoires des universités africaines et au-delà, 
                sous une interface commune, libre d'accès et sans intermédiaire.
              </p>
            </div>
          </div>
        </div>

        {/* Valeurs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Ce qui guide MemoHub</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className={`w-11 h-11 rounded-xl ${v.bg} ${v.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <v.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Système de modération */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Un système de confiance multi-niveaux</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            La qualité du contenu est garantie par une chaîne de modération humaine. Chaque mémoire est relu 
            et validé avant d'être publié. Cette vérification repose sur une communauté de bénévoles engagés.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROLES.map((r) => (
              <div key={r.title} className="border border-gray-100 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${r.badge} flex items-center justify-center`}>
                    <r.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${r.badge}`}>{r.title}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-indigo-900">Vous voulez contribuer à la communauté ?</p>
              <p className="text-sm text-indigo-700 mt-0.5">Devenez ambassadeur de votre université ou modérateur pour votre pays.</p>
            </div>
            <Link
              to="/#rejoindre"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all shrink-0"
            >
              Postuler
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm mb-4">Prêt à explorer ou à contribuer ?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/search"
              className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Explorer les mémoires
            </Link>
            <Link
              to="/guide"
              className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold text-sm hover:border-indigo-200 hover:text-indigo-700 transition-all"
            >
              Voir le guide d'utilisation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
