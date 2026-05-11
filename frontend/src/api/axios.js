/**
 * Axios Instance
 * ---------------
 * Configured axios instance with base URL pointing to the Express API.
 * The Vite dev server proxies /api to localhost:5000.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
