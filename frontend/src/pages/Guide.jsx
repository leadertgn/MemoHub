import { Link } from "react-router-dom";
import { ArrowLeft, Search, BookOpen, Upload, Download, Eye, Filter, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/Button";

const STEPS_SEARCH = [
  {
    step: "1",
    title: "Accédez à la recherche",
    desc: "Depuis la page d'accueil, cliquez sur « EXPLORATION ». Vous arrivez sur la bibliothèque complète avec tous les mémoires validés.",
  },
  {
    step: "2",
    title: "Utilisez les filtres",
    desc: "Affinez par pays, université, filière, niveau d'étude (Licence, Master, Doctorat…) ou par année de soutenance. Tous les filtres peuvent être combinés.",
  },
  {
    step: "3",
    title: "Recherchez par mots-clés",
    desc: "La barre de recherche filtre simultanément par titre et par nom d'auteur. Tapez un thème, un concept ou un nom pour trouver rapidement ce qui vous intéresse.",
  },
  {
    step: "4",
    title: "Consultez la fiche et lisez le mémoire",
    desc: "Cliquez sur un résultat pour accéder à la fiche complète : résumé, université, filière, degré. La lecture intégrale du PDF nécessite une connexion avec votre compte Google.",
  },
];

const STEPS_SUBMIT = [
  {
    step: "1",
    title: "Connectez-vous avec Google",
    desc: "La connexion se fait exclusivement via votre compte Google. C'est rapide : aucun mot de passe à créer ou à retenir.",
  },
  {
    step: "2",
    title: "Remplissez le formulaire",
    desc: "Titre, résumé, nom de l'auteur, université, filière, niveau et année de soutenance. Ces informations permettront au mémoire d'être retrouvé par les autres étudiants.",
  },
  {
    step: "3",
    title: "Téléversez le PDF",
    desc: "Le fichier doit être au format PDF et ne pas dépasser 10 Mo. Seul l'auteur ou une personne autorisée par lui peut soumettre son travail.",
  },
  {
    step: "4",
    title: "Soumettez et attendez la validation",
    desc: "Votre mémoire passe par une vérification par l'équipe de modération. Une fois approuvé, il sera visible publiquement. Vous serez notifié par email.",
  },
];

const FAQS = [
  {
    q: "Faut-il être étudiant pour utiliser MemoHub ?",
    a: "Non. La recherche et la consultation des fiches (titre, résumé, université, filière) sont accessibles à tous sans créer de compte. En revanche, la lecture intégrale du PDF et le téléchargement nécessitent une connexion via Google.",
  },
  {
    q: "Puis-je télécharger un mémoire ?",
    a: "Oui, si l'auteur l'a autorisé lors de la soumission et si vous êtes connecté avec votre compte Google. Le fichier téléchargé ainsi que la version lue en ligne sont tous deux marqués d'un filigrane numérique — cela protège l'auteur contre les captures d'écran et la diffusion non autorisée.",
  },
  {
    q: "Mon mémoire reste-t-il ma propriété ?",
    a: "Absolument. En soumettant sur MemoHub, vous conservez l'intégralité de vos droits d'auteur. Vous accordez seulement à la plateforme le droit de le diffuser.",
  },
  {
    q: "Combien de temps dure la validation ?",
    a: "La modération est effectuée par des bénévoles (ambassadeurs et modérateurs). Le délai varie, mais vous serez notifié par email dès qu'une décision est prise.",
  },
  {
    q: "Comment citer un mémoire de MemoHub dans ma bibliographie ?",
    a: "Sur chaque fiche de mémoire, une section « Citer ce mémoire » propose des citations prêtes à l'emploi en trois formats : APA 7e édition, ISO 690 (norme française) et un format webographie courant. Cliquez sur « Copier » pour l'insérer directement dans votre document.",
  },
  {
    q: "Comment puis-je faire retirer mon mémoire ?",
    a: "Contactez-nous via les canaux officiels pour votre demande. Tout retrait volontaire sera traité dans les meilleurs délais.",
  },
  {
    q: "Mon université n'est pas dans la liste. Que faire ?",
    a: "Lors de la soumission, un bouton « ECOLE MANQUANTE » vous permet de suggérer votre université. Elle sera ajoutée après vérification par l'équipe.",
  },
];

function StepCard({ step, title, desc, icon: Icon }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
          {step}
        </div>
        <div className="w-0.5 flex-1 bg-gray-100 rounded-full" />
      </div>
      <div className="pb-8">
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function Guide() {
  return (
    <div className="relative pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-32 px-6 max-w-7xl mx-auto space-y-32">
        {/* En-tête de Document */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[var(--color-cinnabar)]">
            <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
            Protocole / Documentation 2026
          </div>
          <h1 className="text-6xl md:text-8xl font-serif text-[var(--color-obsidian)] leading-none">
            Guide de <br /> <span className="italic opacity-30">Consultation.</span>
          </h1>
          <p className="text-xl font-light opacity-60 max-w-2xl leading-relaxed">
            Un système pensé pour la rigueur. Apprenez à naviguer, soumettre et préserver le savoir académique sur MemoHub.
          </p>
        </div>

        {/* Section: Recherche - Documentation Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-[var(--color-obsidian)]/10 pt-16">
          <div className="lg:col-span-4 sticky top-32 h-fit">
            <h2 className="text-3xl font-serif italic mb-6">01. Exploration</h2>
            <p className="text-sm font-light opacity-50 leading-relaxed">
              Comment naviguer au sein de la bibliothèque universelle pour trouver l'inspiration.
            </p>
          </div>
          <div className="lg:col-span-8 space-y-12">
            {STEPS_SEARCH.map((s, i) => (
              <div key={i} className="group grid grid-cols-1 md:grid-cols-6 gap-8">
                <div className="font-mono text-2xl text-[var(--color-stone)] group-hover:text-[var(--color-cinnabar)] transition-colors">
                  .{s.step}
                </div>
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{s.title}</h3>
                  <p className="text-lg font-light opacity-60 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Soumission - Documentation Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-[var(--color-obsidian)]/10 pt-16">
          <div className="lg:col-span-4 sticky top-32 h-fit">
            <h2 className="text-3xl font-serif italic mb-6">02. Contribution</h2>
            <p className="text-sm font-light opacity-50 leading-relaxed">
              Le protocole pour immortaliser vos travaux de recherche.
            </p>
          </div>
          <div className="lg:col-span-8 space-y-12">
             {/* Amber Alert Refactored */}
             <div className="border border-[var(--color-cinnabar)]/20 p-8 bg-[var(--color-cinnabar)]/5 space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-cinnabar)]">Vérification de Conformité</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Autorisation de l'auteur requise",
                    "Format PDF uniquement (< 10 Mo)",
                    "Connexion Google authentifiée",
                    "Données institutionnelles exactes"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm opacity-70">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-cinnabar)]" />
                      {item}
                    </li>
                  ))}
                </ul>
             </div>

            {STEPS_SUBMIT.map((s, i) => (
              <div key={i} className="group grid grid-cols-1 md:grid-cols-6 gap-8">
                <div className="font-mono text-2xl text-[var(--color-stone)] group-hover:text-[var(--color-cinnabar)] transition-colors">
                  .{s.step}
                </div>
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{s.title}</h3>
                  <p className="text-lg font-light opacity-60 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ - Ledger Grid */}
        <div className="border-t border-[var(--color-obsidian)]/10 pt-16 space-y-16">
          <h2 className="text-4xl font-serif italic text-center">Questions & Protocoles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-obsidian)]/10 border border-[var(--color-obsidian)]/10">
             {FAQS.map((faq, i) => (
               <div key={i} className="bg-[var(--color-base)] p-12 space-y-6 hover:bg-white transition-colors">
                  <div className="font-mono text-[10px] uppercase opacity-30 tracking-[0.3em]">Question 0{i+1}</div>
                  <h3 className="text-xl font-bold leading-tight">{faq.q}</h3>
                  <p className="text-lg font-light opacity-60 leading-relaxed">{faq.a}</p>
               </div>
             ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center py-20 border-t border-[var(--color-obsidian)]/10">
          <p className="font-serif italic text-2xl opacity-60 mb-8">D'autres interrogations ?</p>
          <div className="flex justify-center gap-6">
            <Button variant="primary" size="xl" to="/search" className="rounded-none px-12">
              Explorer
            </Button>
            <Button variant="outline" size="xl" to="/upload" className="rounded-none px-12">
              Soumettre
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
