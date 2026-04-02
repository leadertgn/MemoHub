// src/api/universities.js
import { apiClient } from './client'

export const universitiesApi = {
  getAll: (countryId) =>
    apiClient(`/universities${countryId ? `?country_id=${countryId}` : ''}`),
  getById: (id) => apiClient(`/universities/${id}`),
  submit: (data) =>
    apiClient('/universities', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateStatus: (id, status) =>
    apiClient(`/universities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
}
