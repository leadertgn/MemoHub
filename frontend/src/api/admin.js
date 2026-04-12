// src/api/admin.js
import { apiClient } from './client'

export const adminApi = {
  getStats:             () => apiClient('/admin/stats'),
  getPendingMemoirs:    () => apiClient('/admin/memoirs/pending'),
  getPendingUniversities: async () => apiClient('/admin/universities/pending'),
  getPendingFields: async () => apiClient('/admin/fields/pending'),
  getUsers:             () => apiClient('/users'),
  getModerationHistory: () => apiClient('/admin/moderation-history'),

  updateMemoirStatus: async (id, status, rejection_reason = null) => {
    return apiClient(`/memoirs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason })
    })
  },

  preValidateMemoir: async (publicId) => {
    return apiClient(`/memoirs/${publicId}/pre-validate`, {
      method: 'PATCH'
    })
  },


  updateUniversityStatus: async (id, status, rejection_reason = null) => {
    return apiClient(`/universities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason })
    })
  },

  updateFieldStatus: async (id, status, rejection_reason = null) => {
    return apiClient(`/fields-of-study/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason })
    })
  },

  updateUserRole: (id, payload) =>
    apiClient(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
}