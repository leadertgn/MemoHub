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
    if (response.status === 401) {
      window.dispatchEvent(new Event("auth:logout"));
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  // 204 No Content — pas de body à parser
  if (response.status === 204) return null;

  return response.json();
}
