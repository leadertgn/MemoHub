import { BookOpen, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    const current_year = new Date().getFullYear()
    return (
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 py-10 mt-auto">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            <span className="font-bold text-gray-900 tracking-tight text-base">MemoHub</span>
                        </div>
                        <p className="text-gray-400">La bibliothèque académique universelle du futur.</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                        <nav className="flex items-center gap-6" aria-label="Liens légaux">
                            <Link to="/terms" className="hover:text-indigo-600 transition-colors font-medium">Conditions</Link>
                            <Link to="/privacy" className="hover:text-indigo-600 transition-colors font-medium">Confidentialité</Link>
                            <a href="mailto:legal@memohub.com" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                <Mail className="w-4 h-4" />
                                Contact
                            </a>
                        </nav>
                        <p>© {current_year} MemoHub — Tous droits réservés.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}