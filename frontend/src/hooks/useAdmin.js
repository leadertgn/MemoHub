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

export function useUpdateMemoirStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, rejection_reason }) =>
      adminApi.updateMemoirStatus(id, status, rejection_reason),
    onSuccess: () => {
      // Invalide le cache → React Query refetch automatiquement
      queryClient.invalidateQueries({ queryKey: ['pending-memoirs'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }
  })
}

export function useUpdateUniversityStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) =>
      adminApi.updateUniversityStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-universities'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })
}