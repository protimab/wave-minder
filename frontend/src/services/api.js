import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (data) => api.post('/signup', data),
  login: (data) => {
    const formData = new URLSearchParams();
    formData.append('email', data.email);
    formData.append('password', data.password);
    return api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getCurrentUser: () => api.get('/me'),
};

// Marine Sightings API
export const sightingsAPI = {
  getAll: (params) => api.get('/sightings', { params }),
  getById: (id) => api.get(`/sightings/${id}`),
  create: (data) => api.post('/sightings', data),
  delete: (id) => api.delete(`/sightings/${id}`),
};

// Beach Reports API
export const reportsAPI = {
  getAll: (params) => api.get('/beach-reports', { params }),
  getById: (id) => api.get(`/beach-reports/${id}`),
  create: (data) => api.post('/beach-reports', data),
  delete: (id) => api.delete(`/beach-reports/${id}`),
};

// Conservation Actions API
export const actionsAPI = {
  getAll: (params) => api.get('/conservation-actions', { params }),
  getById: (id) => api.get(`/conservation-actions/${id}`),
  create: (data) => api.post('/conservation-actions', data),
  delete: (id) => api.delete(`/conservation-actions/${id}`),
};

// Ocean Data API
export const oceanDataAPI = {
  getTides: (stationId, days) => api.get(`/ocean-data/tides/${stationId}`, { params: { days } }),
  getWeather: (latitude, longitude, days) => api.get('/ocean-data/weather', { params: { latitude, longitude, days } }),
  getTemperature: (latitude, longitude, days) => api.get('/ocean-data/temperature', { params: { latitude, longitude, days } }),
  getConditions: (locationName, latitude, longitude, days) => api.get('/ocean-data/conditions', { params: { location_name: locationName, latitude, longitude, days } }),
};

// Stats API
export const statsAPI = {
  getCommunityStats: () => api.get('/stats/community'),
};

export default api;