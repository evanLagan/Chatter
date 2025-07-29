import axios from 'axios';

/*
const API = axios.create({
    baseURL: 'http://localhost:8000', // Change this to the deployed backend later.
});
*/

/*
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});
*/

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
