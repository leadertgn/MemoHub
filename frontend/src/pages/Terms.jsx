import { Link } from "react-router-dom";
import { Scale, ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="relative pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-32 px-6 max-w-5xl mx-auto space-y-24">
        {/* Header Contractuel */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[var(--color-cinnabar)]">
            <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
            Légal / Cadre de Confiance 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-[var(--color-obsidian)] leading-none">
            Contrat Social <br /> <span className="italic opacity-30">Académique.</span>
          </h1>
          <p className="text-xl font-light opacity-60 max-w-2xl leading-relaxed">
            L'utilisation de MemoHub implique l'adhésion stricte à nos principes d'intégrité intellectuelle et de partage souverain du savoir.
          </p>
        </div>

        {/* Corps du Contrat */}
        <div className="space-y-20">
          {[
            {
              id: "01",
              title: "Objet du Service & Engagement",
              content: "MemoHub est un portail décentralisé dédié à la préservation du savoir. En accédant à nos archives, vous vous engagez à respecter le travail de vos pairs et à utiliser les ressources à des fins exclusivement pédagogiques et de recherche."
            },
            {
              id: "02",
              title: "Propriété Intellectuelle & Souveraineté",
              content: "L'auteur conserve l'intégralité de ses droits régaliens sur son œuvre. En soumettant un document, vous accordez à MemoHub une licence de diffusion non-exclusive, incluant le droit d'apposer des marquages techniques (filigranes) pour garantir la traçabilité et protéger l'œuvre contre le plagiat."
            },
            {
              id: "03",
              title: "Code de Conduite & Plagiat",
              content: "L'Utilisateur garantit l'originalité des travaux soumis. Toute violation avérée du droit d'auteur ou signalement de plagiat académique entraîne le retrait immédiat et définitif de l'œuvre, ainsi qu'une possible restriction d'accès à la plateforme."
            },
            {
              id: "04",
              title: "Modération & Rigueur Scientifique",
              content: "Notre système repose sur une validation humaine par les pairs (Ambassadeurs, Modérateurs). L'administration se réserve le droit de refuser toute publication ne répondant pas aux standards de rigueur scientifique et de présentation de l'Archive."
            },
            {
              id: "05",
              title: "Responsabilité & Usage",
              content: "MemoHub agit en tant que dépositaire technique. Bien que nous veillions à la qualité des métadonnées, nous ne saurions être tenus responsables de l'exactitude des thèses soutenues dans les documents archivés."
            }
          ].map((clause) => (
            <div key={clause.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-[var(--color-obsidian)]/10 pt-12">
              <div className="md:col-span-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-stone)]">
                Clause / {clause.id}
              </div>
              <div className="md:col-span-9 space-y-4">
                <h2 className="text-2xl font-serif text-[var(--color-obsidian)]">{clause.title}</h2>
                <p className="text-lg font-light text-[var(--color-obsidian)]/70 leading-relaxed">
                  {clause.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Contractuel */}
        <div className="pt-20 border-t border-[var(--color-obsidian)]/10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-30 italic">
            Approuvé pour diffusion — Version de Référence 1.0.26
          </p>
        </div>
      </section>
    </div>
  );
}
