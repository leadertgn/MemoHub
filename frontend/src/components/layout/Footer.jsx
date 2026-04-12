import { BookOpen, Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  "Plateforme": [
    { to: "/about", label: "À propos" },
    { to: "/guide", label: "Guide d'utilisation" },
    { to: "/search", label: "Bibliothèque" },
    { to: "/upload", label: "Soumettre un mémoire" },
  ],
  "Légal": [
    { to: "/terms", label: "Conditions d'utilisation" },
    { to: "/privacy", label: "Politique de confidentialité" },
  ],
};

export default function Footer() {
    const current_year = new Date().getFullYear();
    return (
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 py-12 mt-auto">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-gray-100">

                    {/* Marque */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            <span className="font-black text-gray-900 tracking-tight text-base">MemoHub</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                            La bibliothèque ouverte des mémoires académiques — libre d'accès, pour tous, partout.
                        </p>
                        <a
                            href="mailto:legal@memohub.com"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                        >
                            <Mail className="w-4 h-4" />
                            legal@memohub.com
                        </a>
                    </div>

                    {/* Colonnes de liens */}
                    {Object.entries(FOOTER_LINKS).map(([section, links]) => (
                        <div key={section}>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{section}</h3>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.to}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
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
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
                    <p>© {current_year} MemoHub — Tous droits réservés.</p>
                    <p className="flex items-center gap-1">
                        Fait avec <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> pour les étudiants du monde entier.
                    </p>
                </div>
            </div>
        </footer>
    );
}