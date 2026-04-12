// src/hooks/useAdmin.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  })
}

export function usePendingMemoirs() {
  return useQuery({
    queryKey: ['pending-memoirs'],
    queryFn: adminApi.getPendingMemoirs,
  })
}

export function usePendingUniversities() {
  return useQuery({
    queryKey: ['pending-universities'],
    queryFn: adminApi.getPendingUniversities,
  })
}

export function usePendingFields() {
  return useQuery({
    queryKey: ['pending-fields'],
    queryFn: adminApi.getPendingFields,
  })
}

export function useModerationHistory() {
  return useQuery({
    queryKey: ['moderation-history'],
    queryFn: adminApi.getModerationHistory,
  })
}

export function useUpdateMemoirStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, rejection_reason }) =>
      adminApi.updateMemoirStatus(id, status, rejection_reason),
    onSuccess: () => {
      // Invalide le cache → React Query refetch automatiquement
      queryClient.invalidateQueries({ queryKey: ['pending-memoirs'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['moderation-history'] })
    }
  })
}

export function usePreValidateMemoir() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId) => adminApi.preValidateMemoir(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-memoirs'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['moderation-history'] })
    }
  })
}


export function useUpdateUniversityStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, rejection_reason }) =>
      adminApi.updateUniversityStatus(id, status, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-universities'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['moderation-history'] })
    }
  })
}

export function useUpdateFieldStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, rejection_reason }) =>
      adminApi.updateFieldStatus(id, status, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-fields'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      // invalider aussi "fields-of-study" pour la recherche globale
      queryClient.invalidateQueries({ queryKey: ['fields-of-study'] })
      queryClient.invalidateQueries({ queryKey: ['moderation-history'] })
    }
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminApi.updateUserRole(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })
}