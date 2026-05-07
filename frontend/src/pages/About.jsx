import { Link } from "react-router-dom";
import { ArrowLeft, Globe, BookOpen, Users, Shield, ArrowRight, Heart, Lightbulb, Network } from "lucide-react";
import { Button } from "../components/ui/Button";

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
    <div className="relative pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-32 px-6 max-w-7xl mx-auto space-y-24">
        {/* Header Manifeste */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <div className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[var(--color-cinnabar)] mb-4">
              <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
              Manifeste / MemoHub 2026
            </div>
            <h1 className="text-6xl md:text-8xl font-serif text-editorial leading-[0.85] text-[var(--color-obsidian)]">
              Le Savoir <br /> 
              <span className="italic pl-12 md:pl-24 text-[var(--color-cinnabar)]">Commun</span> <br />
              est un Droit.
            </h1>
            <p className="text-xl md:text-3xl text-[var(--color-obsidian)]/70 max-w-2xl font-light leading-relaxed">
              MemoHub n'est pas une simple plateforme technique. C'est une institution numérique dédiée à la libération du patrimoine académique africain et mondial.
            </p>
          </div>
          
          <div className="lg:col-span-4 pt-12">
            <div className="border-l-2 border-[var(--color-cinnabar)] pl-8 space-y-6">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40">La Vision</p>
              <p className="text-lg font-serif italic opacity-60">
                "Chaque université possède son propre système d'archivage — souvent cloisonné. Nous créons le pont manquant."
              </p>
            </div>
          </div>
        </div>

        {/* L'Origine - Asymmetric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 py-20 border-t border-[var(--color-obsidian)]/10">
          <div className="md:col-span-5">
            <h2 className="text-4xl font-serif text-[var(--color-obsidian)] leading-tight">
              Pourquoi nous <br /> <span className="italic opacity-30">existons.</span>
            </h2>
          </div>
          <div className="md:col-span-7 space-y-8 text-xl font-light text-[var(--color-obsidian)]/80 leading-relaxed">
            <p>
              Chaque année, des milliers d'étudiants rédigent des mémoires de qualité. Ces travaux sont soumis, évalués, archivés —
              puis souvent oubliés dans un système interne que personne ne peut consulter.
            </p>
            <p>
              Un étudiant au Sénégal ne peut pas savoir ce qu'un chercheur au Bénin a déjà exploré. Un futur diplômé passe des semaines à formuler un thème qui existe déjà, traité sous un angle différent, dans une autre institution.
            </p>
            <p className="font-serif italic text-2xl text-[var(--color-obsidian)]">
              MemoHub relie ces consciences académiques sous une interface commune, libre et souveraine.
            </p>
          </div>
        </div>

        {/* Les Valeurs - Ledger Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-20 border-t border-b border-[var(--color-obsidian)]">
          {VALUES.map((v, i) => (
            <div key={i} className="space-y-6">
              <div className="flex items-center justify-between">
                <v.icon className="w-5 h-5 opacity-30" />
                <span className="font-mono text-[10px] text-[var(--color-cinnabar)]">0{i + 1}</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight">{v.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Modération & Confiance */}
        <div className="space-y-16">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-serif mb-6 italic">Un système de confiance multi-niveaux</h2>
            <p className="text-lg font-light opacity-60 leading-relaxed">
              La qualité du contenu est garantie par une chaîne de modération humaine. Chaque mémoire est relu 
              et validé avant d'être publié. Cette vérification repose sur une communauté de bénévoles engagés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ROLES.map((r, idx) => (
              <div key={idx} className="group border border-[var(--color-obsidian)]/10 p-8 space-y-6 bg-white/50 backdrop-blur-sm transition-all hover:border-[var(--color-cinnabar)]">
                <div className="flex justify-between items-start">
                   <r.icon className="w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:text-[var(--color-cinnabar)] transition-all" />
                   <div className="font-mono text-[10px] uppercase opacity-30 tracking-[0.2em]">{r.title}</div>
                </div>
                <p className="text-sm font-light leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="bg-[var(--color-obsidian)] text-white p-12 md:p-24 rounded-[var(--radius-premium)] text-center space-y-10">
          <h2 className="text-4xl md:text-5xl font-serif italic">Contribuez à l'Archive.</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Button variant="primary" size="xl" to="/search" className="rounded-none px-12">
              Exploration
            </Button>
            <Button variant="outline" size="xl" to="/upload" className="rounded-none px-12 border-white text-white !hover:bg-white !hover:text-[var(--color-obsidian)] transition-colors">
              Dépôt d'œuvre
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
