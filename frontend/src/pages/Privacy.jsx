import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="relative pb-32">
      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-px bg-[var(--color-stone)]/10 -z-20 pointer-events-none" />

      <section className="pt-32 px-6 max-w-5xl mx-auto space-y-24">
        {/* Header Documentaire */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[var(--color-cinnabar)]">
            <span className="w-8 h-px bg-[var(--color-cinnabar)]" />
            Confidentialité / RGPD 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-[var(--color-obsidian)] leading-none">
            Souveraineté des <br /> <span className="italic opacity-30">Données.</span>
          </h1>
          <p className="text-xl font-light opacity-60 max-w-2xl leading-relaxed">
            Chez MemoHub, la protection de votre identité numérique est un engagement souverain. Nous appliquons le principe de minimisation absolue.
          </p>
        </div>

        {/* Corps du Document */}
        <div className="space-y-20">
          {[
            {
              id: "01",
              title: "Responsabilité du Traitement",
              content: "Le traitement des données est opéré par l'administration centrale de MemoHub. Notre approche repose sur la transparence et le respect strict du consentement utilisateur."
            },
            {
              id: "02",
              title: "Collecte & Finalités",
              content: "Nous collectons exclusivement les données nécessaires à l'authentification (Google OAuth) et au référencement académique (Université, Filière). Vos données ne sont jamais monétisées, elles servent uniquement l'intégrité de l'Archive."
            },
            {
              id: "03",
              title: "Conservation des Actes",
              content: "Vos données de profil sont conservées tant que votre compte est actif. Après 3 ans d'inactivité, vos informations identifiantes sont systématiquement anonymisées pour préserver la base de données sans compromettre votre vie privée."
            },
            {
              id: "04",
              title: "Vos Droits Souverains",
              content: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement total. Toute demande est traitée avec la priorité absolue par notre équipe de modération."
            },
            {
              id: "05",
              title: "Sécurité & Cryptographie",
              content: "Tous les transferts sont protégés par SSL/TLS. L'authentification utilise des tokens JWT signés avec rotation automatique, garantissant qu'aucun mot de passe n'est jamais stocké sur nos infrastructures."
            }
          ].map((section) => (
            <div key={section.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-[var(--color-obsidian)]/10 pt-12">
              <div className="md:col-span-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-cinnabar)]">
                Art. {section.id}
              </div>
              <div className="md:col-span-9 space-y-4">
                <h2 className="text-2xl font-serif italic text-[var(--color-obsidian)]">{section.title}</h2>
                <p className="text-lg font-light text-[var(--color-obsidian)]/70 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Documentaire */}
        <div className="pt-20 border-t border-[var(--color-obsidian)]/10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-30">
            Dernière mise à jour : Mai 2026 / Version 2.0
          </p>
        </div>
      </section>
    </div>
  );
}
