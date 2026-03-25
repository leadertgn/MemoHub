// src/hooks/useMemoirs.js
import { useQuery } from '@tanstack/react-query'
import { memoirsApi } from '../api/memoirs'

export function useMemoirs(filters = {}) {
  return useQuery({
    queryKey: ['memoirs', filters],
    queryFn: () => memoirsApi.getAll(filters),
    keepPreviousData: true, // garde les données précédentes pendant le chargement
  })
}

export function useMemoirDetail(id) {
  return useQuery({
    queryKey: ['memoir', id],
    queryFn: () => memoirsApi.getById(id),
    enabled: !!id,
  })
}