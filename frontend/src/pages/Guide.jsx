import { Link } from "react-router-dom";
import { ArrowLeft, Search, BookOpen, Upload, Download, Eye, Filter, ArrowRight, CheckCircle } from "lucide-react";

const STEPS_SEARCH = [
  {
    step: "1",
    title: "Accédez à la recherche",
    desc: "Depuis la page d'accueil, cliquez sur « Découvrir les travaux ». Vous arrivez sur la bibliothèque complète avec tous les mémoires validés.",
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
    desc: "Le fichier doit être au format PDF et ne pas dépasser 20 Mo. Seul l'auteur ou une personne autorisée par lui peut soumettre son travail.",
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
    a: "Contactez-nous à legal@memohub.com avec votre demande. Tout retrait volontaire sera traité dans les meilleurs délais.",
  },
  {
    q: "Mon université n'est pas dans la liste. Que faire ?",
    a: "Lors de la soumission, un bouton « Mon école n'y figure pas » vous permet de suggérer votre université. Elle sera ajoutée après vérification par l'équipe.",
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

        {/* En-tête */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Guide d'utilisation</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Comment utiliser MemoHub</h1>
              <p className="mt-2 text-indigo-100 opacity-90">
                Tout ce que vous devez savoir pour trouver, lire et partager des mémoires académiques.
              </p>
            </div>
          </div>

          {/* Sommaire rapide */}
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <a href="#rechercher" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors">
                <Search className="w-4 h-4" /> Rechercher
              </a>
              <span className="text-gray-300">·</span>
              <a href="#soumettre" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors">
                <Upload className="w-4 h-4" /> Soumettre
              </a>
              <span className="text-gray-300">·</span>
              <a href="#telecharger" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors">
                <Download className="w-4 h-4" /> Télécharger
              </a>
              <span className="text-gray-300">·</span>
              <a href="#faq" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors">
                <Eye className="w-4 h-4" /> FAQ
              </a>
            </div>
          </div>

          <div className="p-8 sm:p-12 space-y-14">

            {/* Rechercher */}
            <section id="rechercher">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Rechercher un mémoire</h2>
              </div>
              <div>
                {STEPS_SEARCH.map((s) => (
                  <StepCard key={s.step} {...s} />
                ))}
              </div>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <Search className="w-4 h-4" />
                Accéder à la bibliothèque
              </Link>
            </section>

            <div className="border-t border-gray-100" />

            {/* Soumettre */}
            <section id="soumettre">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Soumettre votre mémoire</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6 ml-13 pl-0.5">
                La soumission est entièrement libre et volontaire. Aucune obligation n'est faite à qui que ce soit.
              </p>
              <div>
                {STEPS_SUBMIT.map((s) => (
                  <StepCard key={s.step} {...s} />
                ))}
              </div>
              {/* Prérequis */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
                <p className="text-sm font-semibold text-amber-900 mb-3">Avant de soumettre, assurez-vous que :</p>
                <ul className="space-y-1.5">
                  {[
                    "Vous êtes l'auteur du mémoire ou avez l'autorisation de l'auteur",
                    "Le fichier est en format PDF (maximum 20 Mo)",
                    "Vous disposez d'un compte Google pour vous connecter",
                    "Les informations renseignées (université, filière, année) sont exactes",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-amber-800">
                      <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <Upload className="w-4 h-4" />
                Soumettre un mémoire
              </Link>
            </section>

            <div className="border-t border-gray-100" />

            {/* Télécharger */}
            <section id="telecharger">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Télécharger un mémoire</h2>
              </div>
              <div className="prose prose-slate max-w-none text-gray-500 text-sm space-y-3">
                <p>
                  Certains mémoires autorisent le téléchargement direct — ce choix appartient à l'auteur au moment de la soumission.
                  La lecture intégrale du PDF et le téléchargement nécessitent tous deux une <strong className="text-gray-700">connexion avec votre compte Google</strong>.
                </p>
                <p>
                  Que vous lisiez en ligne ou que vous téléchargiez, le document est systématiquement marqué d'un{" "}
                  <strong className="text-gray-700">filigrane numérique</strong> contenant le nom de l'université, l'année
                  et la référence MemoHub. Ce filigrane est présent pour protéger l'auteur — y compris contre les captures d'écran —
                  et garantir la traçabilité de chaque document.
                </p>
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* FAQ */}
            <section id="faq">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Questions fréquentes</h2>
              </div>
              <div className="space-y-4">
                {FAQS.map((faq) => (
                  <div key={faq.q} className="border border-gray-100 rounded-2xl p-5 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                    <p className="font-semibold text-gray-900 text-sm mb-2">{faq.q}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* CTA bas de page */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-4">Vous avez encore des questions ?</p>
          <a
            href="mailto:legal@memohub.com"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:underline"
          >
            Contactez-nous → legal@memohub.com
          </a>
        </div>
      </div>
    </div>
  );
}
