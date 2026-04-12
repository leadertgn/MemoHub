import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Charge token et user depuis localStorage au démarrage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // Si token existe dans le state mais pas dans localStorage → déconnexion (largage volontaire)
    if (!savedToken) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("user");
      queryClient.clear();
      return;
    }

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Écoute de l'événement global de déconnexion (depuis apiClient)
  useEffect(() => {
    const handleAutoLogout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      queryClient.clear();
    };
    window.addEventListener("auth:logout", handleAutoLogout);
    return () => window.removeEventListener("auth:logout", handleAutoLogout);
  }, [queryClient]);


  const login = useCallback((userData, accessToken, refreshToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("token", accessToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []); // Stable — ne change jamais de référence

const logout = useCallback(async () => {
    // Révoque le refresh token côté serveur avant de vider le localStorage
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
        } catch {
            // Si le serveur est inaccessible, on déconnecte quand même localement
        }
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    queryClient.clear();
}, [queryClient]);
  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
