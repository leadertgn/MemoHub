// src/api/auth.js
import { apiClient } from './client'

export const authApi = {
  loginWithGoogle: (code, redirect_uri) =>
    apiClient("/auth/google", {
      method: "POST",
      body: JSON.stringify({ code, redirect_uri }),
    })
}
