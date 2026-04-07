// src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Wrapper autour de fetch qui :
 * - Ajoute automatiquement le token JWT si présent
 * - Gère les erreurs HTTP
 * - Parse le JSON automatiquement
 */
export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // Ne pas forcer Content-Type si c'est FormData (le browser le gère automatiquement)
  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    // Gestion de l'expiration du Token (Access -> Refresh)
    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken && endpoint !== '/auth/refresh') {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            // Sauvegarde des nouveaux tokens
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            
            // Re-tente la requête initiale avec le NOUVEAU token !
            config.headers.Authorization = `Bearer ${data.access_token}`;
            const retryResponse = await fetch(`${BASE_URL}${endpoint}`, config);
            if (retryResponse.ok) {
              if (retryResponse.status === 204) return null;
              return retryResponse.json();
            }
          }
        } catch (e) {
          // Si le refresh échoue (réseau ou autre), on force la déco en dessous
        }
      }
      
      // Si on arrive ici, le refresh a échoué où il n'y en avait pas = Déconnexion
      window.dispatchEvent(new Event("auth:logout"));
    }
    
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  // 204 No Content — pas de body à parser
  if (response.status === 204) return null;

  return response.json();
}
