import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL || "http://localhost:8090",
  timeout: 10000 * 30,
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  const token = user ? JSON.parse(user).token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
