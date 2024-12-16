// api.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api'  // Production URL
    : '/api', // Development URL (will be proxied)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

export default {
  testConnection() {
    return apiClient.get('/test/')
  },

  getRequest(id) {
    return apiClient.get(`/requests/${id}/`)
  },

  // Extract data from PDFs
  generateReport(formData) {
    return apiClient.post('/travel-requests/generate-report/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Submit the final report after user review
  submitReport(reportData) {
    console.log('API Service - data being sent:', reportData);  // Add this log
    return apiClient.post('/travel-requests/submit-report/', reportData, {
      headers: {
        'Content-Type': 'application/json'  // Make sure this is set
      }
    });
  },

  // Update an existing report
  updateReport(reportId, reportData) {
    return apiClient.put(`/travel-requests/${reportId}/update-report/`, reportData);
  }
}