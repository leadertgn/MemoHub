import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  "Archive": [
    { to: "/about", label: "À propos" },
    { to: "/guide", label: "Guide d'utilisation" },
    { to: "/search", label: "Bibliothèque" },
    { to: "/upload", label: "Soumission" },
  ],
  "Légal": [
    { to: "/terms", label: "Conditions" },
    { to: "/privacy", label: "Confidentialité" },
  ],
};

export default function Footer() {
    const current_year = new Date().getFullYear();
    return (
        <footer className="bg-[var(--color-base)] border-t border-[var(--color-obsidian)]/10 py-24">
            <div className="mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-20 pb-20 border-b border-[var(--color-obsidian)]/10">

                    {/* Marque Avant-Garde */}
                    <div className="md:col-span-6 space-y-8">
                        <Link to="/" className="text-4xl font-serif tracking-tighter text-[var(--color-obsidian)]">
                          Memo<span className="italic text-[var(--color-cinnabar)]">Hub</span>
                        </Link>
                        <p className="text-xl font-light text-[var(--color-obsidian)]/60 max-w-sm leading-relaxed italic">
                            La bibliothèque souveraine des mémoires académiques — accessible à tous, pour l'éternité.
                        </p>
                    </div>

                    {/* Liens Ledger style */}
                    {Object.entries(FOOTER_LINKS).map(([section, links]) => (
                        <div key={section} className="md:col-span-3 space-y-10">
                            <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--color-obsidian)]/40">{section}</h3>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.to}>
                                        <Link
                                            to={link.to}
                                            className="text-xl font-serif italic hover:text-[var(--color-cinnabar)] transition-all text-[var(--color-obsidian)]/80 hover:opacity-100 hover:pl-2"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bas de footer */}
                <div className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-obsidian)]/80">
                    <p className="font-bold">© {current_year} — Système de Savoir MemoHub</p>
                    <p className="flex items-center gap-4 opacity-100">
                        <span className="w-12 h-px bg-[var(--color-obsidian)]/30" />
                        Excellence Académique
                    </p>
                </div>
            </div>
        </footer>
    );
}