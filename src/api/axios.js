import axiosClient from "axios";

const axios = axiosClient.create({
  baseURL: "http://192.168.0.103:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data"
  }
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token !== null) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config;
});

export default axios;