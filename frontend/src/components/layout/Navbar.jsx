import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Search, Upload, User, LogOut, Menu, X, LayoutDashboard, BookOpen, LogIn } from "lucide-react";
import { Button } from "../ui/Button";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-base)]/80 backdrop-blur-md border-b border-[var(--color-obsidian)]/5 shadow-xs">
      <div className="mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Avant-Garde */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group">
            <span className="text-2xl font-serif tracking-tight text-[var(--color-obsidian)]">
              Memo<span className="italic text-[var(--color-cinnabar)]">Hub</span>
            </span>
          </Link>

          <button 
            className="md:hidden p-2 text-[var(--color-obsidian)] focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-10">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.2em] transition-all ${
                  isActive ? "text-[var(--color-cinnabar)]" : "text-[var(--color-obsidian)]/80 hover:text-[var(--color-obsidian)]"
                }`
              }
            >
              Recherche
            </NavLink>
            
            {isAuthenticated && (
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `font-mono text-[11px] uppercase tracking-[0.2em] transition-all ${
                    isActive ? "text-[var(--color-cinnabar)]" : "text-[var(--color-obsidian)]/80 hover:text-[var(--color-obsidian)]"
                  }`
                }
              >
                Soumission
              </NavLink>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-6 pl-6 border-l border-[var(--color-obsidian)]/10">
                {['admin', 'moderator', 'ambassador'].includes(user?.role) && (
                  <Link to="/admin" className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-obsidian)]/80 hover:text-[var(--color-obsidian)]">
                    Console
                  </Link>
                )}
                
                <Link to="/profile" className="w-8 h-8 rounded-full border border-[var(--color-obsidian)] flex items-center justify-center font-mono text-xs hover:bg-[var(--color-obsidian)] hover:text-white transition-all">
                  {userInitial}
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-red-200 text-red-600 font-mono text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                to="/login"
                className="rounded-none font-mono text-[11px] tracking-widest uppercase"
              >
                Accès Archive
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div 
        className={`md:hidden absolute w-full bg-[var(--color-base)] border-b border-[var(--color-obsidian)]/10 overflow-hidden transition-all duration-500 ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-8 flex flex-col gap-6 font-mono text-xs uppercase tracking-widest">
          <Link to="/search" onClick={closeMenu}>Recherche</Link>
          {isAuthenticated && <Link to="/upload" onClick={closeMenu}>Soumission</Link>}
          {['admin', 'moderator', 'ambassador'].includes(user?.role) && <Link to="/admin" onClick={closeMenu}>Console</Link>}
          <Link to="/profile" onClick={closeMenu}>Profil</Link>
          {!isAuthenticated ? (
            <Link to="/login" onClick={closeMenu} className="text-[var(--color-cinnabar)]">Connexion</Link>
          ) : (
            <button onClick={handleLogout} className="text-left text-red-500">Déconnexion</button>
          )}
        </div>
      </div>
    </nav>
  );
}
