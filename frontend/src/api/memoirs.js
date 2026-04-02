// src/api/memoirs.js
import { apiClient } from "./client";

export const memoirsApi = {
  getAll: (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });
    return apiClient(`/memoirs?${params.toString()}`);
  },

  getById: (id) => apiClient(`/memoirs/${id}`),

  submit: (formData) =>
    apiClient("/memoirs", {
      method: "POST",
      body: formData,
    }),
};
