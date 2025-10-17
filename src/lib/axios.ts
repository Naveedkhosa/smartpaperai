import axios from "axios";
import { API_BASE_URL } from './config';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token automatically if available
api.interceptors.request.use((config: any) => {
    const token = localStorage.getItem("smartpaper_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
    (response: any) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token (optional)
            localStorage.removeItem("smartpaper_token");

            // Redirect to login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
