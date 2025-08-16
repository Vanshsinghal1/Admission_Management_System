import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || 'true') === 'true' || !baseURL

export const api = axios.create({
  baseURL: baseURL || 'http://localhost:5000/api',
  withCredentials: true,
})

export const sleep = (ms) => new Promise(r => setTimeout(r, ms))
