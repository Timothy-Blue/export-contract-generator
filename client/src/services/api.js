import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Contract API
export const contractAPI = {
  getAll: (params) => axios.get(`${API_URL}/contracts`, { params }),
  getById: (id) => axios.get(`${API_URL}/contracts/${id}`),
  create: (data) => axios.post(`${API_URL}/contracts`, data),
  update: (id, data) => axios.put(`${API_URL}/contracts/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/contracts/${id}`),
  search: (query) => axios.get(`${API_URL}/contracts/search`, { params: { query } }),
  calculate: (data) => axios.post(`${API_URL}/contracts/calculate`, data)
};

// Party API (Buyers/Sellers)
export const partyAPI = {
  getAll: (params) => axios.get(`${API_URL}/parties`, { params }),
  getById: (id) => axios.get(`${API_URL}/parties/${id}`),
  create: (data) => axios.post(`${API_URL}/parties`, data),
  update: (id, data) => axios.put(`${API_URL}/parties/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/parties/${id}`)
};

// Commodity API
export const commodityAPI = {
  getAll: (params) => axios.get(`${API_URL}/commodities`, { params }),
  getById: (id) => axios.get(`${API_URL}/commodities/${id}`),
  create: (data) => axios.post(`${API_URL}/commodities`, data),
  update: (id, data) => axios.put(`${API_URL}/commodities/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/commodities/${id}`)
};

// Payment Term API
export const paymentTermAPI = {
  getAll: (params) => axios.get(`${API_URL}/payment-terms`, { params }),
  getById: (id) => axios.get(`${API_URL}/payment-terms/${id}`),
  create: (data) => axios.post(`${API_URL}/payment-terms`, data),
  update: (id, data) => axios.put(`${API_URL}/payment-terms/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/payment-terms/${id}`)
};

// Bank Details API
export const bankDetailsAPI = {
  getAll: (params) => axios.get(`${API_URL}/bank-details`, { params }),
  getDefault: () => axios.get(`${API_URL}/bank-details/default`),
  getById: (id) => axios.get(`${API_URL}/bank-details/${id}`),
  create: (data) => axios.post(`${API_URL}/bank-details`, data),
  update: (id, data) => axios.put(`${API_URL}/bank-details/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/bank-details/${id}`)
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
