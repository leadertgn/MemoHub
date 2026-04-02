// src/hooks/useFilters.js
import { useQuery } from '@tanstack/react-query'
import { filtersApi } from '../api/filters'

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: filtersApi.getDomains,
    staleTime: Infinity, // les domaines changent rarement
  })
}

export function useCountries(search = '') {
  return useQuery({
    queryKey: ['countries', search],
    queryFn: () => search.trim() 
      ? apiClient(`/countries?search=${search}`)
      : filtersApi.getCountries(),
    staleTime: 1000 * 60 * 60 * 24, // 24h
  })
}

export function useUniversities(countryId) {
  return useQuery({
    queryKey: ['universities', countryId],
    queryFn: () => filtersApi.getUniversities(countryId),
    staleTime: 1000 * 60 * 10,
  })
}

export function useFieldsOfStudy(universityId) {
  return useQuery({
    queryKey: ['fields-of-study', universityId],
    queryFn: () => filtersApi.getFieldsOfStudy(universityId),
    enabled: !!universityId, // ne fetch que si une université est sélectionnée
    staleTime: 1000 * 60 * 10,
  })
}