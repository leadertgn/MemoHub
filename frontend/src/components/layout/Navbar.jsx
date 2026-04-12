import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Search, Upload, User, LogOut, Menu, X, LayoutDashboard, BookOpen, LogIn } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Pour fermer le menu lors d'un clic sur un lien mobile
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Vérifier si un user est défini avant de lire son email
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-linear-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              MemoHub
            </span>
          </Link>

          <button 
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600 hover:-translate-y-0.5"
                }`
              }
            >
              <Search className="w-4 h-4" />
              Rechercher
            </NavLink>
            

            
            {isAuthenticated && (
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
                    isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600 hover:-translate-y-0.5"
                  }`
                }
              >
                <Upload className="w-4 h-4" />
                Soumettre
              </NavLink>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                {['admin', 'moderator', 'ambassador'].includes(user?.role) && (
                  <Link to="/admin" className="flex items-center gap-2 text-gray-600 font-medium hover:text-blue-600 transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    {userInitial}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block group-hover:text-blue-600 transition-colors">
                    Profil
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu Mobile (Dropdown) */}
      <div 
        className={`md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-4">
          <Link to="/search" onClick={closeMenu} className="flex items-center gap-3 text-base font-semibold text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50">
            <Search className="w-5 h-5" />
            Rechercher un mémoire
          </Link>
          
          {(user?.role === "admin" || user?.role === "moderator" || user?.role === "ambassador") && (
            <Link to="/admin" onClick={closeMenu} className="flex items-center gap-3 text-base font-semibold text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50">
              <LayoutDashboard className="w-5 h-5" />
              Administration
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/upload" onClick={closeMenu} className="flex items-center gap-3 text-base font-semibold text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50">
                <Upload className="w-5 h-5" />
                Soumettre un document
              </Link>
              <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 text-base font-semibold text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50">
                <User className="w-5 h-5" />
                Mon Profil
              </Link>
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{user?.full_name}</span>
                </div>
                <button onClick={() => { logout(); closeMenu(); }} className="mt-2 flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 font-semibold py-2.5 rounded-xl hover:bg-red-100">
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-100 pt-4">
              <Link to="/login" onClick={closeMenu} className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md">
                <LogIn className="w-5 h-5" />
                Connexion / Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
