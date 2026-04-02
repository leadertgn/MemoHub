// src/api/applications.js
import { apiClient } from './client';

export const applicationsApi = {
  // Soumettre une candidature équipe (ambassadeur ou modérateur)
  submitTeamApplication: (data) => apiClient('/applications/team', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Récupérer mes candidatures
  getMyApplications: () => apiClient('/applications/me'),
};