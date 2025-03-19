// src/services/api.js
import axios from "axios";

export const api = axios.create({
   baseURL: '/api', 
  withCredentials: true,
});

export const chatAPI = axios.create({
  baseURL: "/",
  withCredentials: true,
});

chatAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
