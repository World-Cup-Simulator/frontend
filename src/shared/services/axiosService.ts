import axios from "axios";

export const axiosService = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 8000
});