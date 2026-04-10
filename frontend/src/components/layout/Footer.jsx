import { BookOpen } from "lucide-react";

export default function Footer() {
    const current_year =  new Date().getFullYear()
    return (
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 py-8 mt-auto">
            <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center justify-center text-sm text-gray-500 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-gray-900 tracking-tight">MemoHub</span>
                </div>
                <p>© {current_year} MemoHub — La bibliothèque académique universelle</p>
                <nav className="flex items-center gap-4 pb-1" aria-label="Liens secondaires">
                    <a href="/terms" className="hover:text-gray-700 transition-colors">Conditions d'utilisation</a>
                    <span className="text-gray-300" aria-hidden="true">•</span>
                    <a href="/privacy" className="hover:text-gray-700 transition-colors">Confidentialité</a>
                </nav>
                <p className="text-gray-400">Faciliter l'accès au savoir pour les chercheurs de demain.</p>
            </div>
        </footer>
    )
}