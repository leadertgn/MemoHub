// src/api/filters.js
import { apiClient } from './client'

export const filtersApi = {
  getDomains:       () => apiClient('/domains'),
  getCountries:     () => apiClient('/countries'),
  getUniversities:  (countryId) =>
    apiClient(`/universities${countryId ? `?country_id=${countryId}` : ''}`),
  getFieldsOfStudy: (universityId) =>
    apiClient(`/fields-of-study${universityId ? `?university_id=${universityId}` : ''}`),
}