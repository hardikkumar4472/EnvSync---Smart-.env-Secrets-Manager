const axios = require("axios");
const { getToken } = require("./token.store");

const api = axios.create({
  baseURL: process.env.ENVSYNC_API_URL || "http://localhost:4000/api" || "https://envsync-backend.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

module.exports = api;
