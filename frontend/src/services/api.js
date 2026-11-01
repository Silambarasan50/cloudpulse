import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5287'

const http = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
})

export const HUB_URL = `${API_BASE}/hubs/metrics`

export const getEndpoints = () => http.get('/endpoints').then((r) => r.data)

export const getEndpoint = (id) => http.get(`/endpoints/${id}`).then((r) => r.data)

export const createEndpoint = (data) => http.post('/endpoints', data).then((r) => r.data)

export const toggleEndpoint = (id, isActive) =>
  http.put(`/endpoints/${id}`, { isActive })

export const deleteEndpoint = (id) => http.delete(`/endpoints/${id}`)
