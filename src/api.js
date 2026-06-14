import axios from 'axios';

const api = axios.create({
    baseURL: 'https://meeting-logs-management-production.up.railway.app/api',
});

export default api;