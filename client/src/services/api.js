import axios from 'axios';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_KEY = process.env.REACT_APP_API_KEY;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add API key to requests if available (for write operations)
apiClient.interceptors.request.use((config) => {
  // Only add API key for write operations (POST, PUT, DELETE, PATCH)
  if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase()) && API_KEY) {
    config.headers['x-api-key'] = API_KEY;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle authentication errors
      if (error.response.status === 401) {
        console.error('Authentication required. Please check API key configuration.');
      } else if (error.response.status === 403) {
        console.error('Access denied. Invalid API key.');
      } else if (error.response.status === 429) {
        console.error('Rate limit exceeded. Please try again later.');
      }
    }
    return Promise.reject(error);
  }
);

// Contract API
export const contractAPI = {
  getAll: (params) => apiClient.get('/contracts', { params }),
  getById: (id) => apiClient.get(`/contracts/${id}`),
  create: (data) => apiClient.post('/contracts', data),
  update: (id, data) => apiClient.put(`/contracts/${id}`, data),
  delete: (id) => apiClient.delete(`/contracts/${id}`),
  search: (query) => apiClient.get('/contracts/search', { params: { query } }),
  calculate: (data) => apiClient.post('/contracts/calculate', data)
};

// Party API (Buyers/Sellers)
export const partyAPI = {
  getAll: (params) => apiClient.get('/parties', { params }),
  getById: (id) => apiClient.get(`/parties/${id}`),
  create: (data) => apiClient.post('/parties', data),
  update: (id, data) => apiClient.put(`/parties/${id}`, data),
  delete: (id) => apiClient.delete(`/parties/${id}`)
};

// Commodity API
export const commodityAPI = {
  getAll: (params) => apiClient.get('/commodities', { params }),
  getById: (id) => apiClient.get(`/commodities/${id}`),
  create: (data) => apiClient.post('/commodities', data),
  update: (id, data) => apiClient.put(`/commodities/${id}`, data),
  delete: (id) => apiClient.delete(`/commodities/${id}`)
};

// Payment Term API
export const paymentTermAPI = {
  getAll: (params) => apiClient.get('/payment-terms', { params }),
  getById: (id) => apiClient.get(`/payment-terms/${id}`),
  create: (data) => apiClient.post('/payment-terms', data),
  update: (id, data) => apiClient.put(`/payment-terms/${id}`, data),
  delete: (id) => apiClient.delete(`/payment-terms/${id}`)
};

// Bank Details API
export const bankDetailsAPI = {
  getAll: (params) => apiClient.get('/bank-details', { params }),
  getDefault: () => apiClient.get('/bank-details/default'),
  getById: (id) => apiClient.get(`/bank-details/${id}`),
  create: (data) => apiClient.post('/bank-details', data),
  update: (id, data) => apiClient.put(`/bank-details/${id}`, data),
  delete: (id) => apiClient.delete(`/bank-details/${id}`)
};

// Export API
export const exportAPI = {
  downloadPDF: (id) => `${API_URL}/export/pdf/${id}`,
  downloadDOCX: (id) => `${API_URL}/export/docx/${id}`,
  downloadReleaseNote: (id) => `${API_URL}/export/release-note/${id}`
};

const api = {
  contractAPI,
  partyAPI,
  commodityAPI,
  paymentTermAPI,
  bankDetailsAPI,
  exportAPI
};

export default api;
