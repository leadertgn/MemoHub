// src/api/admin.js
import { apiClient } from './client'

export const adminApi = {
  getStats:             () => apiClient('/admin/stats'),
  getPendingMemoirs:    () => apiClient('/admin/memoirs/pending'),
  getPendingUniversities: () => apiClient('/admin/universities/pending'),
  getUsers:             () => apiClient('/users'),

  updateMemoirStatus: (id, status, rejection_reason) =>
    apiClient(`/memoirs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason })
    }),

  updateUniversityStatus: (id, status) =>
    apiClient(`/universities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  updateUserRole: (id, role) =>
    apiClient(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),
}